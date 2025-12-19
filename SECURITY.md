# Seguridad

## 🔐 Almacenamiento de Datos Sensibles

### API Key de Google Gemini

La API Key de Google Gemini se almacena de forma **local y segura** en el sistema del usuario utilizando `electron-store`, que guarda los datos en:

- **Linux**: `~/.config/fast-ask-gpt/config.json`
- **Windows**: `%APPDATA%\fast-ask-gpt\config.json`
- **macOS**: `~/Library/Application Support/fast-ask-gpt/config.json`

**Importante:**
- ✅ La API Key **NUNCA** se guarda en el repositorio del código
- ✅ Los datos se almacenan **fuera** del directorio del proyecto
- ✅ La API Key solo se envía a los servidores oficiales de Google AI
- ✅ Los logs sanitizan automáticamente las API keys para evitar su exposición
- ✅ **GRATIS**: No necesitas tarjeta de crédito ni información de pago

## 🛡️ Protección de Datos

### Datos que se guardan localmente:
- API Key de OpenAI (encriptada por el sistema operativo)
- Prompts personalizados creados por el usuario
- Configuración de preferencias (modelo, hotkey, etc.)

### Datos que NO se guardan ni comparten:
- ❌ Texto procesado
- ❌ Historial de uso
- ❌ Contenido del portapapeles
- ❌ Telemetría o analytics

## 🔍 Auditoría de Código

El código es 100% open source y puede ser auditado en:
https://github.com/andresTapari/fast-ask-gpt

### Verificación de seguridad:
```bash
# Buscar referencias a API key en el código
grep -r "apiKey" main.js preload.js renderer/

# Verificar que no hay archivos de configuración en el repo
git ls-files | grep -E "config.json|.env"
```

## 📋 Mejores Prácticas

### Para Usuarios:

1. **Protege tu API Key**:
   - Nunca compartas tu API Key públicamente
   - Genera una nueva key si crees que fue comprometida en [Google AI Studio](https://makersuite.google.com/app/apikey)
   - No te preocupes por límites de gasto - Gemini es gratuito

2. **Permisos de archivos**:
   ```bash
   # En Linux/macOS, asegúrate de que solo tú puedas leer el archivo de configuración
   chmod 600 ~/.config/fast-ask-gpt/config.json
   ```

3. **Monitorea tu uso**:
   - Revisa tu uso en: https://makersuite.google.com/app/apikey
   - Los límites gratuitos son muy generosos (60 req/min, 1,500 req/día)

### Para Desarrolladores:

1. **No hardcodear credenciales**:
   - Nunca incluyas API keys en el código
   - Usa `electron-store` para datos sensibles

2. **Sanitizar logs**:
   - Siempre oculta credenciales en mensajes de error
   - El código ya incluye sanitización automática

3. **Antes de hacer commit**:
   ```bash
   # Verificar que no hay datos sensibles
   git status
   git diff
   
   # Verificar .gitignore
   cat .gitignore
   ```

## 🚨 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** la reportes públicamente en Issues
2. Envía un email a: [TU EMAIL]
3. Incluye detalles de la vulnerabilidad y pasos para reproducirla
4. Te responderemos en 48 horas

## 📜 Licencia y Responsabilidad

- Esta aplicación se proporciona "tal cual" sin garantías
- El usuario es responsable del uso de su API Key de OpenAI
- Revisa los términos de servicio de OpenAI: https://openai.com/policies

## 🔄 Actualizaciones de Seguridad

Para mantenerte seguro:
- Mantén la aplicación actualizada
- Revisa el changelog de cada versión
- Sigue las noticias de seguridad de Electron y OpenAI

---

**Última actualización**: 19 de diciembre de 2025
