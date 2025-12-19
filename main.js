const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, clipboard, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const robot = require('robotjs');

// Configuración persistente
const store = new Store();

let mainWindow = null;
let tray = null;
let isProcessing = false;

// Función para mostrar notificaciones
function showNotification(title, body, type = 'info') {
  // Usar notificaciones nativas del sistema
  const notification = new Notification({
    title: title,
    body: body,
    icon: type === 'error' ? null : path.join(__dirname, 'assets', 'icon.png'),
    silent: false
  });
  
  notification.show();
}

// Prompts prediseñados por defecto
const defaultPrompts = [
  { id: 1, name: 'Corregir texto', prompt: 'Corrige la ortografía y gramática del siguiente texto, mantén el mismo tono y estilo:' },
  { id: 2, name: 'Mejorar redacción', prompt: 'Mejora la redacción del siguiente texto haciéndolo más claro y conciso:' },
  { id: 3, name: 'Hacer más formal', prompt: 'Reescribe el siguiente texto de manera más formal y profesional:' },
  { id: 4, name: 'Hacer más casual', prompt: 'Reescribe el siguiente texto de manera más casual y amigable:' },
  { id: 5, name: 'Traducir al inglés', prompt: 'Traduce el siguiente texto al inglés manteniendo el tono original:' }
];

// Inicializar configuración por defecto
if (!store.get('prompts')) {
  store.set('prompts', defaultPrompts);
}
if (!store.get('selectedPromptId')) {
  store.set('selectedPromptId', 1);
}
if (!store.get('hotkey')) {
  store.set('hotkey', 'CommandOrControl+Shift+G');
}
if (!store.get('model')) {
  store.set('model', 'gemini-2.5-flash');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('renderer/index.html');

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Crear un icono simple para el tray
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir configuración',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Salir',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('FastAskGPT');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

function registerGlobalShortcut() {
  const hotkey = store.get('hotkey', 'CommandOrControl+Shift+G');
  
  // Desregistrar todos los atajos anteriores
  globalShortcut.unregisterAll();
  
  // Intentar registrar el atajo
  try {
    const success = globalShortcut.register(hotkey, async () => {
      if (isProcessing) {
        console.log('Ya hay un proceso en ejecución');
        return;
      }
      
      await processSelectedText();
    });

    if (success) {
      console.log(`✓ Atajo global registrado: ${hotkey}`);
    } else {
      console.error(`✗ No se pudo registrar el atajo: ${hotkey}`);
      console.error('Posibles causas:');
      console.error('- Otra aplicación está usando este atajo');
      console.error('- Permisos insuficientes');
      console.error('- Intenta cambiar el atajo en la configuración');
      
      // Intentar con un atajo alternativo
      const alternativeHotkey = 'CommandOrControl+Alt+G';
      const altSuccess = globalShortcut.register(alternativeHotkey, async () => {
        if (isProcessing) return;
        await processSelectedText();
      });
      
      if (altSuccess) {
        console.log(`✓ Atajo alternativo registrado: ${alternativeHotkey}`);
        store.set('hotkey', alternativeHotkey);
      }
    }
  } catch (error) {
    console.error('Error al intentar registrar atajo global:', error.message);
  }
}

async function processSelectedText() {
  isProcessing = true;
  
  try {
    // 1. Guardar contenido actual del portapapeles
    const originalClipboard = clipboard.readText();
    
    // 2. Simular Ctrl+C para copiar el texto seleccionado
    robot.keyTap('c', ['control']);
    await new Promise(resolve => setTimeout(resolve, 200)); // Esperar a que se copie
    
    // 3. Obtener el texto del portapapeles
    let selectedText = clipboard.readText();
    let useClipboardMode = false;
    
    // Si el clipboard no cambió (no había selección), usar el clipboard original
    if (!selectedText || selectedText === originalClipboard) {
      selectedText = originalClipboard;
      useClipboardMode = true;
      
      if (!selectedText || selectedText.trim() === '') {
        showNotification('⚠️ Sin texto', 'No hay texto seleccionado ni en el portapapeles. Selecciona texto o copia texto al portapapeles.', 'warning');
        isProcessing = false;
        return;
      }
      
      console.log('Usando texto del portapapeles (no había selección)');
    }
    
    // 3. Obtener configuración
    const apiKey = store.get('apiKey');
    if (!apiKey) {
      showNotification('❌ Error de configuración', 'No hay API Key configurada. Abre la aplicación para configurarla.', 'error');
      mainWindow.show();
      isProcessing = false;
      return;
    }
    
    const selectedPromptId = store.get('selectedPromptId');
    const prompts = store.get('prompts');
    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    
    if (!selectedPrompt) {
      showNotification('❌ Error', 'No hay prompt seleccionado. Configura un prompt en la aplicación.', 'error');
      isProcessing = false;
      return;
    }
    
    // Mostrar notificación de procesamiento
    const mode = useClipboardMode ? 'portapapeles' : 'texto seleccionado';
    showNotification('⏳ Procesando...', `Usando ${selectedPrompt.name} - ${mode}`, 'info');
    
    // 4. Llamar a la API de Google Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = store.get('model', 'gemini-2.5-flash');
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `${selectedPrompt.prompt}\n\nImportante: Devuelve SOLO el texto editado sin explicaciones adicionales, prefacios o introducciones. No agregues texto antes o después del resultado.\n\nTexto a procesar:\n${selectedText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const processedText = response.text().trim();
    
    // 5. Si había texto seleccionado, borrarlo. Si era del clipboard, solo pegar
    if (!useClipboardMode) {
      // Había texto seleccionado: borrarlo antes de pegar
      robot.keyTap('delete');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Si useClipboardMode=true, no borramos nada, solo pegaremos en la posición del cursor
    
    // 6. Copiar el texto procesado al portapapeles
    clipboard.writeText(processedText);
    
    // 7. Simular Ctrl+V para pegar el texto procesado en la posición del cursor
    await new Promise(resolve => setTimeout(resolve, 100));
    robot.keyTap('v', ['control']);
    
    // 8. Restaurar portapapeles original después de un tiempo (solo si no era modo clipboard)
    if (!useClipboardMode) {
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 1000);
    } else {
      // En modo clipboard, guardar el resultado procesado en el clipboard
      setTimeout(() => {
        clipboard.writeText(processedText);
      }, 1000);
    }
    
    console.log('Texto procesado exitosamente');
    showNotification('✅ Completado', 'Texto procesado exitosamente', 'success');
    
  } catch (error) {
    // Sanitizar mensaje de error
    let errorMessage = error.message || 'Error desconocido';
    
    // No mostrar API keys en errores
    if (errorMessage.includes('AIza')) {
      errorMessage = errorMessage.replace(/AIza[a-zA-Z0-9_-]+/g, 'AIza***HIDDEN***');
    }
    
    // Mensajes de error más amigables
    let userMessage = errorMessage;
    let notificationTitle = '❌ Error';
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      userMessage = 'Modelo no disponible. Verifica el modelo en la configuración.';
      notificationTitle = '❌ Modelo no encontrado';
    } else if (errorMessage.includes('401') || errorMessage.includes('Incorrect API key')) {
      userMessage = 'API Key incorrecta. Verifica tu clave en la configuración.';
      notificationTitle = '🔒 Error de autenticación';
    } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      userMessage = 'Límite de uso excedido. Espera un momento e intenta de nuevo.';
      notificationTitle = '⏸️ Límite excedido';
    } else if (errorMessage.includes('403')) {
      userMessage = 'Acceso denegado. Verifica los permisos de tu API Key.';
      notificationTitle = '🚫 Acceso denegado';
    } else if (errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
      notificationTitle = '🌐 Error de red';
    }
    
    console.error('Error al procesar el texto:', errorMessage);
    showNotification(notificationTitle, userMessage, 'error');
    
  } finally {
    isProcessing = false;
  }
}

// IPC Handlers
ipcMain.handle('get-config', () => {
  return {
    apiKey: store.get('apiKey', ''),
    prompts: store.get('prompts', defaultPrompts),
    selectedPromptId: store.get('selectedPromptId', 1),
    hotkey: store.get('hotkey', 'CommandOrControl+Shift+G'),
    model: store.get('model', 'gpt-3.5-turbo')
  };
});

ipcMain.handle('save-api-key', (event, apiKey) => {
  store.set('apiKey', apiKey);
  return { success: true };
});

ipcMain.handle('save-prompts', (event, prompts) => {
  store.set('prompts', prompts);
  return { success: true };
});

ipcMain.handle('save-selected-prompt', (event, promptId) => {
  store.set('selectedPromptId', promptId);
  return { success: true };
});

ipcMain.handle('save-hotkey', (event, hotkey) => {
  store.set('hotkey', hotkey);
  registerGlobalShortcut();
  return { success: true };
});

ipcMain.handle('save-model', (event, model) => {
  store.set('model', model);
  return { success: true };
});

ipcMain.handle('test-api', async (event, apiKey) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // Hacer una prueba simple
    await model.generateContent('Hi');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Eventos de la aplicación
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcut();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // No cerrar la app, mantenerla en el tray
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
