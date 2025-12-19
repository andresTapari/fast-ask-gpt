# FastAskGPT

Aplicación multiplataforma que permite seleccionar texto de cualquier lugar, aplicar prompts prediseñados y reemplazarlo automáticamente con la respuesta de Google Gemini.

## ✨ ¿Por qué Google Gemini?

- 🆓 **100% GRATUITO** - API gratuita con límites generosos
- ⚡ **Rápido** - Respuestas casi instantáneas
- 🧠 **Inteligente** - Modelos de última generación de Google
- 🚀 **Sin tarjeta de crédito** - Solo necesitas una cuenta de Google

## Características

- 🚀 Hotkey global (Ctrl+Shift+G) para procesar texto seleccionado
- 📝 Prompts prediseñados personalizables
- 🔄 Reemplazo automático del texto
- 💾 Configuración persistente
- 🖥️ Compatible con Windows y Linux

## Instalación

```bash
npm install
```

## Configuración

1. Ejecuta la aplicación: `npm start`
2. Obtén tu API Key GRATUITA de Google Gemini:
   - Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Inicia sesión con tu cuenta de Google
   - Haz clic en "Create API Key"
   - Copia la API Key generada
3. Ingresa tu API Key en la configuración
4. Personaliza los prompts prediseñados
5. Configura el hotkey si deseas cambiarlo

## Uso

1. Selecciona texto en cualquier aplicación
2. Presiona `Ctrl+Shift+G`
3. El texto seleccionado será procesado por ChatGPT y reemplazado automáticamente

## Desarrollo

```bash
# Iniciar en modo desarrollo
npm start

# Construir para Windows
npm run build:win

# Construir para Linux
npm run build:linux
```

## Prompts Prediseñados

Por defecto incluye:
- Corregir ortografía y gramática
- Mejorar redacción
- Hacer más formal
- Hacer más casual
- Traducir al inglés

Puedes personalizar estos prompts desde la interfaz de configuración.

## Modelos Disponibles (TODOS GRATIS)

- **Gemini 1.5 Flash**: Modelo optimizado para velocidad (Recomendado)
- **Gemini 1.5 Pro**: Modelo más avanzado con mayor contexto

### Límites Gratuitos de Gemini

- 15 solicitudes por minuto (Gemini 1.5 Flash)
- 2 solicitudes por minuto (Gemini 1.5 Pro)
- Millones de tokens gratuitos al mes

¡Más que suficiente para uso diario!
