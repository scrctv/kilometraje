"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    openConfigWindow: () => electron_1.ipcRenderer.send('open-config-window'),
    selectFile: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
    selectFolder: () => electron_1.ipcRenderer.invoke('dialog:openFolder'),
    saveUnidadPorKm: (valor) => electron_1.ipcRenderer.invoke('save-unidad-por-km', valor),
    getUnidadPorKm: () => electron_1.ipcRenderer.invoke('get-unidad-por-km'),
    saveDatosUsuario: (data) => electron_1.ipcRenderer.invoke('save-datos-usuario', data),
    openDatosUsuarioWindow: () => electron_1.ipcRenderer.send('open-datosusuario-window'),
    getDatosUsuario: () => electron_1.ipcRenderer.invoke('get-datos-usuario')
});
