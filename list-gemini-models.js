const { GoogleGenerativeAI } = require('@google/generative-ai');

// Obtener API key del argumento
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ Proporciona tu API Key como argumento');
  console.log('\nUso:');
  console.log('  node list-gemini-models.js TU_API_KEY');
  console.log('\nObtén tu API key en: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

console.log('🔍 Consultando modelos disponibles en Gemini API...');
console.log('🔑 API Key: ' + apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
console.log();

const genAI = new GoogleGenerativeAI(apiKey);

async function listAllModels() {
  try {
    // Método 1: Llamada directa a la API REST
    console.log('📋 Método 1: Consultando vía API REST...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Modelos disponibles:\n');
      console.log('─'.repeat(80));
      
      data.models.forEach((model, index) => {
        console.log(`\n${index + 1}. Nombre: ${model.name}`);
        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
        console.log(`   Descripción: ${model.description || 'N/A'}`);
        
        if (model.supportedGenerationMethods) {
          console.log(`   Métodos soportados: ${model.supportedGenerationMethods.join(', ')}`);
        }
        
        if (model.inputTokenLimit) {
          console.log(`   Límite de tokens entrada: ${model.inputTokenLimit}`);
        }
        
        if (model.outputTokenLimit) {
          console.log(`   Límite de tokens salida: ${model.outputTokenLimit}`);
        }
      });
      
      console.log('\n' + '─'.repeat(80));
      console.log('\n💡 Para usar un modelo en la app:');
      console.log('   - Copia el nombre después de "models/" (ejemplo: gemini-1.5-flash)');
      console.log('   - Configúralo en la aplicación FastAskGPT');
      
      // Filtrar modelos para generateContent
      console.log('\n📝 Modelos recomendados para texto (generateContent):\n');
      
      const textModels = data.models.filter(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes('generateContent')
      );
      
      textModels.forEach(model => {
        const modelName = model.name.replace('models/', '');
        console.log(`   ✅ ${modelName.padEnd(25)} - ${model.displayName || modelName}`);
      });
      
    } else {
      console.log('⚠️  No se encontraron modelos');
    }
    
  } catch (error) {
    console.error('\n❌ Error al listar modelos:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔒 Error de autenticación:');
      console.log('   - Verifica que tu API key sea correcta');
      console.log('   - Obtén una nueva en: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('403')) {
      console.log('\n🚫 Error de permisos:');
      console.log('   - Verifica que tu proyecto tenga acceso a la API de Gemini');
      console.log('   - Habilita la API en: https://console.cloud.google.com/');
    } else if (error.message.includes('404')) {
      console.log('\n❓ Endpoint no encontrado:');
      console.log('   - La API de Gemini podría haber cambiado');
      console.log('   - Verifica la documentación en: https://ai.google.dev/');
    }
  }
}

// También probar modelos comunes directamente
async function testCommonModels() {
  console.log('\n\n🧪 Probando modelos comunes directamente...\n');
  console.log('─'.repeat(80));
  
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest'
  ];
  
  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Test');
      await result.response;
      console.log(`✅ ${modelName.padEnd(30)} - FUNCIONA`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`❌ ${modelName.padEnd(30)} - No encontrado`);
      } else if (error.message.includes('401')) {
        console.log(`🔒 ${modelName.padEnd(30)} - No autorizado`);
      } else if (error.message.includes('429')) {
        console.log(`⏸️  ${modelName.padEnd(30)} - Límite excedido (prueba más tarde)`);
      } else {
        console.log(`⚠️  ${modelName.padEnd(30)} - Error: ${error.message.substring(0, 50)}...`);
      }
    }
  }
  
  console.log('─'.repeat(80));
}

// Ejecutar ambos métodos
(async () => {
  await listAllModels();
  await testCommonModels();
})();
