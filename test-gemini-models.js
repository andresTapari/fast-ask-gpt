const { GoogleGenerativeAI } = require('@google/generative-ai');
const Store = require('electron-store');

// Intentar obtener API key de argumentos o configuración
let apiKey = process.argv[2];

if (!apiKey) {
  // Intentar obtener de la configuración
  try {
    const store = new Store();
    apiKey = store.get('apiKey');
  } catch (e) {
    // Ignorar error si no existe configuración
  }
}

if (!apiKey) {
  console.error('❌ No hay API Key configurada.');
  console.log('\nUso:');
  console.log('  node test-gemini-models.js TU_API_KEY');
  console.log('\nO ejecuta la aplicación primero y configura tu API Key de Gemini.');
  console.log('Obtén tu API key en: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

console.log('🔍 Listando modelos disponibles de Google Gemini...');
console.log('🔑 API Key: ' + apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
console.log();

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Intentar listar modelos usando el método interno
    console.log('Modelos comúnmente disponibles en Gemini API:');
    console.log('─'.repeat(60));
    
    const commonModels = [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'models/gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ];
    
    console.log('\n📋 Probando cada modelo:\n');
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        console.log(`✅ ${modelName.padEnd(30)} - FUNCIONA`);
      } catch (error) {
        const status = error.message.includes('404') ? '❌ No encontrado' : 
                      error.message.includes('401') ? '🔒 No autorizado' :
                      error.message.includes('429') ? '⏸️  Límite excedido' : 
                      '❌ Error';
        console.log(`${status.padEnd(20)} ${modelName}`);
        
        if (error.message.includes('404')) {
          // Extraer el mensaje de error para ver qué modelos sugiere
          const match = error.message.match(/Call ListModels to see/);
          if (match) {
            console.log(`   ℹ️  ${error.message.substring(0, 150)}...`);
          }
        }
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 Recomendaciones:');
    console.log('   - Si ves ✅, ese modelo funciona con tu API key');
    console.log('   - Los modelos "latest" siempre apuntan a la última versión');
    console.log('   - Para uso de texto, usa gemini-1.5-flash o gemini-1.5-pro');
    console.log('   - Para imágenes, usa gemini-pro-vision o gemini-1.5-pro');
    
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  }
}

listModels();
