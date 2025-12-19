let config = {};
let editingPromptId = null;

// Elementos del DOM
const apiKeyInput = document.getElementById('apiKey');
const testApiBtn = document.getElementById('testApiBtn');
const saveApiBtn = document.getElementById('saveApiBtn');
const apiStatus = document.getElementById('apiStatus');
const modelSelect = document.getElementById('modelSelect');
const hotkeyInput = document.getElementById('hotkeyInput');
const saveHotkeyBtn = document.getElementById('saveHotkeyBtn');
const promptSelect = document.getElementById('promptSelect');
const promptsList = document.getElementById('promptsList');
const addPromptBtn = document.getElementById('addPromptBtn');
const promptModal = document.getElementById('promptModal');
const modalTitle = document.getElementById('modalTitle');
const promptName = document.getElementById('promptName');
const promptText = document.getElementById('promptText');
const savePromptBtn = document.getElementById('savePromptBtn');
const cancelPromptBtn = document.getElementById('cancelPromptBtn');

// Cargar configuración al iniciar
async function loadConfig() {
    config = await window.electronAPI.getConfig();
    
    // Cargar API Key (mostrar solo los últimos 4 caracteres)
    if (config.apiKey) {
        const maskedKey = '••••••••••••••••' + config.apiKey.slice(-4);
        apiKeyInput.value = maskedKey;
        apiKeyInput.dataset.original = config.apiKey;
    }
    
    // Cargar modelo
    modelSelect.value = config.model;
    
    // Cargar hotkey
    hotkeyInput.value = config.hotkey;
    
    // Cargar prompts
    renderPrompts();
}

// Renderizar lista de prompts
function renderPrompts() {
    // Limpiar selector
    promptSelect.innerHTML = '';
    
    // Llenar selector
    config.prompts.forEach(prompt => {
        const option = document.createElement('option');
        option.value = prompt.id;
        option.textContent = prompt.name;
        if (prompt.id === config.selectedPromptId) {
            option.selected = true;
        }
        promptSelect.appendChild(option);
    });
    
    // Limpiar lista
    promptsList.innerHTML = '';
    
    // Llenar lista
    config.prompts.forEach(prompt => {
        const promptItem = document.createElement('div');
        promptItem.className = 'prompt-item';
        promptItem.innerHTML = `
            <div class="prompt-info">
                <div class="prompt-name">${prompt.name}</div>
                <div class="prompt-text">${prompt.prompt}</div>
            </div>
            <div class="prompt-actions">
                <button class="btn btn-secondary btn-small edit-prompt" data-id="${prompt.id}">Editar</button>
                <button class="btn btn-danger btn-small delete-prompt" data-id="${prompt.id}">Eliminar</button>
            </div>
        `;
        promptsList.appendChild(promptItem);
    });
    
    // Agregar event listeners
    document.querySelectorAll('.edit-prompt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            editPrompt(id);
        });
    });
    
    document.querySelectorAll('.delete-prompt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deletePrompt(id);
        });
    });
}

// Probar API Key
testApiBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.dataset.original || apiKeyInput.value;
    
    if (!apiKey || apiKey.startsWith('••••')) {
        showStatus('Por favor ingresa una API Key válida', 'error');
        return;
    }
    
    testApiBtn.disabled = true;
    testApiBtn.textContent = 'Probando...';
    
    const result = await window.electronAPI.testAPI(apiKey);
    
    if (result.success) {
        showStatus('✓ API Key válida', 'success');
    } else {
        showStatus('✗ API Key inválida: ' + result.error, 'error');
    }
    
    testApiBtn.disabled = false;
    testApiBtn.textContent = 'Probar';
});

// Guardar API Key
saveApiBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    
    if (!apiKey || apiKey.startsWith('••••')) {
        // Si no ha cambiado, no hacer nada
        if (apiKeyInput.dataset.original) {
            showStatus('✓ API Key guardada', 'success');
            return;
        }
        showStatus('Por favor ingresa una API Key', 'error');
        return;
    }
    
    await window.electronAPI.saveApiKey(apiKey);
    apiKeyInput.dataset.original = apiKey;
    const maskedKey = '••••••••••••••••' + apiKey.slice(-4);
    apiKeyInput.value = maskedKey;
    
    showStatus('✓ API Key guardada correctamente', 'success');
});

// Permitir editar API Key al hacer clic
apiKeyInput.addEventListener('focus', () => {
    if (apiKeyInput.value.startsWith('••••')) {
        apiKeyInput.value = apiKeyInput.dataset.original || '';
    }
});

apiKeyInput.addEventListener('blur', () => {
    if (apiKeyInput.dataset.original && apiKeyInput.value === apiKeyInput.dataset.original) {
        const maskedKey = '••••••••••••••••' + apiKeyInput.value.slice(-4);
        apiKeyInput.value = maskedKey;
    }
});

// Guardar modelo
modelSelect.addEventListener('change', async () => {
    await window.electronAPI.saveModel(modelSelect.value);
    config.model = modelSelect.value;
    showStatus('✓ Modelo actualizado', 'success');
});

// Guardar hotkey
saveHotkeyBtn.addEventListener('click', async () => {
    const hotkey = hotkeyInput.value;
    await window.electronAPI.saveHotkey(hotkey);
    config.hotkey = hotkey;
    showStatus('✓ Atajo de teclado actualizado', 'success');
});

// Cambiar prompt seleccionado
promptSelect.addEventListener('change', async () => {
    const promptId = parseInt(promptSelect.value);
    await window.electronAPI.saveSelectedPrompt(promptId);
    config.selectedPromptId = promptId;
});

// Agregar nuevo prompt
addPromptBtn.addEventListener('click', () => {
    editingPromptId = null;
    modalTitle.textContent = 'Nuevo Prompt';
    promptName.value = '';
    promptText.value = '';
    promptModal.classList.add('active');
});

// Editar prompt
function editPrompt(id) {
    const prompt = config.prompts.find(p => p.id === id);
    if (!prompt) return;
    
    editingPromptId = id;
    modalTitle.textContent = 'Editar Prompt';
    promptName.value = prompt.name;
    promptText.value = prompt.prompt;
    promptModal.classList.add('active');
}

// Eliminar prompt
async function deletePrompt(id) {
    if (!confirm('¿Estás seguro de eliminar este prompt?')) return;
    
    config.prompts = config.prompts.filter(p => p.id !== id);
    await window.electronAPI.savePrompts(config.prompts);
    
    // Si se eliminó el prompt seleccionado, seleccionar el primero
    if (config.selectedPromptId === id && config.prompts.length > 0) {
        config.selectedPromptId = config.prompts[0].id;
        await window.electronAPI.saveSelectedPrompt(config.selectedPromptId);
    }
    
    renderPrompts();
}

// Guardar prompt
savePromptBtn.addEventListener('click', async () => {
    const name = promptName.value.trim();
    const text = promptText.value.trim();
    
    if (!name || !text) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (editingPromptId) {
        // Editar existente
        const prompt = config.prompts.find(p => p.id === editingPromptId);
        if (prompt) {
            prompt.name = name;
            prompt.prompt = text;
        }
    } else {
        // Crear nuevo
        const newId = Math.max(...config.prompts.map(p => p.id), 0) + 1;
        config.prompts.push({
            id: newId,
            name: name,
            prompt: text
        });
    }
    
    await window.electronAPI.savePrompts(config.prompts);
    renderPrompts();
    promptModal.classList.remove('active');
});

// Cancelar modal
cancelPromptBtn.addEventListener('click', () => {
    promptModal.classList.remove('active');
});

// Cerrar modal al hacer clic fuera
promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) {
        promptModal.classList.remove('active');
    }
});

// Mostrar mensaje de estado
function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `status-message ${type}`;
    
    setTimeout(() => {
        apiStatus.style.display = 'none';
    }, 5000);
}

// Cargar configuración al iniciar
loadConfig();
