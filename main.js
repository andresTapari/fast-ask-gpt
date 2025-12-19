const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, clipboard } = require('electron');
const path = require('path');
const Store = require('electron-store');
const OpenAI = require('openai');
const robot = require('robotjs');

// Configuración persistente
const store = new Store();

let mainWindow = null;
let tray = null;
let isProcessing = false;

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
  store.set('model', 'gpt-3.5-turbo');
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
  
  // Registrar nuevo atajo
  const success = globalShortcut.register(hotkey, async () => {
    if (isProcessing) {
      console.log('Ya hay un proceso en ejecución');
      return;
    }
    
    await processSelectedText();
  });

  if (!success) {
    console.error('Error al registrar el atajo global');
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
    const selectedText = clipboard.readText();
    
    if (!selectedText || selectedText.trim() === '') {
      console.log('No hay texto seleccionado');
      isProcessing = false;
      return;
    }
    
    // 3. Obtener configuración
    const apiKey = store.get('apiKey');
    if (!apiKey) {
      console.error('No hay API Key configurada');
      mainWindow.show();
      isProcessing = false;
      return;
    }
    
    const selectedPromptId = store.get('selectedPromptId');
    const prompts = store.get('prompts');
    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    
    if (!selectedPrompt) {
      console.error('No hay prompt seleccionado');
      isProcessing = false;
      return;
    }
    
    // 4. Llamar a la API de OpenAI
    const openai = new OpenAI({ apiKey });
    const model = store.get('model', 'gpt-3.5-turbo');
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que ayuda a editar texto. Devuelve SOLO el texto editado sin explicaciones adicionales.'
        },
        {
          role: 'user',
          content: `${selectedPrompt.prompt}\n\n${selectedText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const processedText = completion.choices[0].message.content.trim();
    
    // 5. Copiar el texto procesado al portapapeles
    clipboard.writeText(processedText);
    
    // 6. Simular Ctrl+V para pegar el texto procesado
    await new Promise(resolve => setTimeout(resolve, 200));
    robot.keyTap('v', ['control']);
    
    // 7. Restaurar portapapeles original después de un tiempo
    setTimeout(() => {
      clipboard.writeText(originalClipboard);
    }, 1000);
    
    console.log('Texto procesado exitosamente');
    
    console.log('Texto procesado exitosamente');
    
  } catch (error) {
    console.error('Error al procesar el texto:', error);
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
    const openai = new OpenAI({ apiKey });
    await openai.models.list();
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
