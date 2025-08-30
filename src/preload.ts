import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openConfigWindow: () => ipcRenderer.send('open-config-window'),
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveUnidadPorKm: (valor: string) => ipcRenderer.invoke('save-unidad-por-km', valor),
  getUnidadPorKm: () => ipcRenderer.invoke('get-unidad-por-km'),
  saveDatosUsuario: (data: any) => ipcRenderer.invoke('save-datos-usuario', data),
  openDatosUsuarioWindow: () => ipcRenderer.send('open-datosusuario-window'),
  getDatosUsuario: () => ipcRenderer.invoke('get-datos-usuario')
});
