const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  savePrompts: (prompts) => ipcRenderer.invoke('save-prompts', prompts),
  saveSelectedPrompt: (promptId) => ipcRenderer.invoke('save-selected-prompt', promptId),
  saveHotkey: (hotkey) => ipcRenderer.invoke('save-hotkey', hotkey),
  saveModel: (model) => ipcRenderer.invoke('save-model', model),
  testAPI: (apiKey) => ipcRenderer.invoke('test-api', apiKey)
});
