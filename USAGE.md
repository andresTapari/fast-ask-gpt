# Guía de Uso de FastAskGPT

## ✅ Instalación Completada

La aplicación está lista para usar. Aquí está todo lo que necesitas saber:

## 🚀 Inicio Rápido

### 1. Ejecutar la aplicación

```bash
npm start
```

### 2. Configuración Inicial

1. **Obtener API Key de OpenAI:**
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API Key
   - Cópiala

2. **En la ventana de configuración:**
   - Pega tu API Key en el campo correspondiente
   - Haz clic en "Probar" para verificar que funciona
   - Haz clic en "Guardar"

3. **Seleccionar un prompt:**
   - Elige uno de los prompts prediseñados
   - O crea tus propios prompts personalizados

### 3. Usar la aplicación

1. Minimiza la ventana de configuración (la app queda en la bandeja del sistema)
2. Abre cualquier aplicación (navegador, editor de texto, etc.)
3. **Selecciona texto** con el mouse o teclado
4. Presiona **`Ctrl+Shift+G`**
5. ¡El texto será procesado y reemplazado automáticamente!

## 📝 Prompts Prediseñados

Por defecto incluye:
- **Corregir texto**: Corrige ortografía y gramática
- **Mejorar redacción**: Hace el texto más claro y conciso
- **Hacer más formal**: Texto profesional
- **Hacer más casual**: Texto amigable
- **Traducir al inglés**: Traduce manteniendo el tono

## ⚙️ Personalización

### Cambiar el Atajo de Teclado

En la sección "Atajo de Teclado", puedes usar combinaciones como:
- `CommandOrControl+Shift+G` (predeterminado)
- `CommandOrControl+Alt+G`
- `CommandOrControl+Shift+A`

### Crear Prompts Personalizados

1. Haz clic en "+ Agregar Prompt"
2. Dale un nombre descriptivo
3. Escribe la instrucción (ej: "Resume el siguiente texto en 3 puntos:")
4. Guarda

### Cambiar el Modelo

Puedes elegir entre:
- **GPT-3.5 Turbo**: Más rápido y económico
- **GPT-4**: Más preciso
- **GPT-4 Turbo**: Balance entre velocidad y calidad

## 🐛 Solución de Problemas

### La aplicación no copia/pega el texto

**Causa**: Permisos de accesibilidad en Linux

**Solución**: 
```bash
# En algunas distribuciones de Linux, puede necesitar permisos adicionales
sudo apt-get install xdotool xclip
```

### El hotkey no funciona

1. Verifica que no esté siendo usado por otra aplicación
2. Prueba con una combinación diferente
3. Reinicia la aplicación después de cambiar el hotkey

### Error de API Key

1. Verifica que la API Key sea correcta
2. Asegúrate de tener créditos en tu cuenta de OpenAI
3. Prueba la conexión con el botón "Probar"

### La aplicación no aparece en la bandeja del sistema

- En algunas distribuciones de Linux, la bandeja puede no mostrarse
- Puedes mantener la ventana abierta o configurar tu sistema para mostrar iconos de bandeja

## 📦 Compilar para Distribución

### Para Linux:

```bash
npm run build:linux
```

Esto genera:
- `dist/FastAskGPT-1.0.0.AppImage` (ejecutable universal)
- `dist/fast-ask-gpt_1.0.0_amd64.deb` (instalador para Ubuntu/Debian)

### Para Windows (desde Linux con Wine):

```bash
npm run build:win
```

## 🔒 Seguridad

- Tu API Key se guarda localmente en tu computadora
- No se envía a ningún servidor excepto a OpenAI
- Los datos se almacenan en: `~/.config/fast-ask-gpt/`

## 💡 Consejos de Uso

1. **Selecciona texto completo**: Funciona mejor con párrafos completos
2. **Espera unos segundos**: Dependiendo del modelo y longitud del texto
3. **Prompts claros**: Sé específico en tus instrucciones personalizadas
4. **Revisa el resultado**: Siempre verifica el texto procesado

## 🛠️ Desarrollo

Si quieres contribuir o modificar el código:

```bash
# Instalar dependencias
npm install

# Después de cambios en módulos nativos
npx electron-rebuild

# Ejecutar en modo desarrollo
npm start
```

## 📊 Consumo de API

Ten en cuenta el consumo de tu API:
- GPT-3.5 Turbo: ~$0.002 por ~1000 palabras
- GPT-4: ~$0.03 por ~1000 palabras

Puedes ver tu uso en: https://platform.openai.com/usage

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola (Ctrl+Shift+I en la ventana de Electron)
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que robotjs esté compilado correctamente

---

**¡Disfruta de FastAskGPT!** ⚡
