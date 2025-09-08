import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openConfigWindow: () => ipcRenderer.send('open-config-window'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveUnidadPorKm: (valor: string) => ipcRenderer.invoke('save-unidad-por-km', valor),
  getUnidadPorKm: () => ipcRenderer.invoke('get-unidad-por-km'),
  saveDatosUsuario: (data: any) => ipcRenderer.invoke('save-datos-usuario', data),
  openDatosUsuarioWindow: () => ipcRenderer.send('open-datosusuario-window'),
  getDatosUsuario: () => ipcRenderer.invoke('get-datos-usuario'),
  saveRutaDotx: (ruta: string) => ipcRenderer.invoke('save-ruta-dotx', ruta),
  saveRutaDestino: (ruta: string) => ipcRenderer.invoke('save-ruta-destino', ruta),
  getRutaDotx: () => ipcRenderer.invoke('get-ruta-dotx'),
  getRutaDestino: () => ipcRenderer.invoke('get-ruta-destino')
});
