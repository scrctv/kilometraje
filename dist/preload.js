"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    openConfigWindow: () => electron_1.ipcRenderer.send('open-config-window'),
    openCrearWindow: () => electron_1.ipcRenderer.send('open-crear-window'),
    openFile: () => electron_1.ipcRenderer.invoke('dialog:openFile'),
    openFolder: () => electron_1.ipcRenderer.invoke('dialog:openFolder'),
    saveUnidadPorKm: (valor) => electron_1.ipcRenderer.invoke('save-unidad-por-km', valor),
    getUnidadPorKm: () => electron_1.ipcRenderer.invoke('get-unidad-por-km'),
    saveDatosUsuario: (data) => electron_1.ipcRenderer.invoke('save-datos-usuario', data),
    openDatosUsuarioWindow: () => electron_1.ipcRenderer.send('open-datosusuario-window'),
    getDatosUsuario: () => electron_1.ipcRenderer.invoke('get-datos-usuario'),
    saveRutaDotx: (ruta) => electron_1.ipcRenderer.invoke('save-ruta-dotx', ruta),
    saveRutaDestino: (ruta) => electron_1.ipcRenderer.invoke('save-ruta-destino', ruta),
    saveRutaDocx: (ruta) => electron_1.ipcRenderer.invoke('saveRutaDocx', ruta),
    getRutaDotx: () => electron_1.ipcRenderer.invoke('get-ruta-dotx'),
    getRutaDestino: () => electron_1.ipcRenderer.invoke('get-ruta-destino'),
    getRutaDocx: () => electron_1.ipcRenderer.invoke('getRutaDocx'),
    guardarTurnos: (data, mes, anio) => electron_1.ipcRenderer.invoke('guardar-turnos', data, mes, anio),
    showConfirm: (mensaje) => electron_1.ipcRenderer.invoke('show-confirm', mensaje),
    cerrarVentana: () => electron_1.ipcRenderer.send('cerrar-ventana-crear'),
    openGenerarWindow: () => electron_1.ipcRenderer.send('open-generar-window'),
    cerrarVentanaGenerar: () => electron_1.ipcRenderer.send('cerrar-ventana-generar'),
    abrirEnFinder: (filePath) => electron_1.ipcRenderer.invoke('abrir-en-finder', filePath),
    openFileWithFilter: (filters) => electron_1.ipcRenderer.invoke('dialog:openFileWithFilter', filters),
    leerTurnosMes: (mes, anio) => electron_1.ipcRenderer.invoke('leer-turnos-mes', mes, anio),
    generarDocx: (params) => electron_1.ipcRenderer.invoke('generar-docx', params),
    saveTurnos: (turnos) => electron_1.ipcRenderer.invoke('save-turnos', turnos),
    getTurnos: () => electron_1.ipcRenderer.invoke('get-turnos'),
    saveRutaDatosUsuario: (ruta) => electron_1.ipcRenderer.invoke('save-ruta-datosusuario', ruta),
    getRutaDatosUsuario: () => electron_1.ipcRenderer.invoke('get-ruta-datosusuario'),
    cerrarVentanaDatosUsuario: () => electron_1.ipcRenderer.send('cerrar-ventana-datosusuario'),
    // Funciones del historial
    openHistorialWindow: () => electron_1.ipcRenderer.send('open-historial-window'),
    cerrarVentanaHistorial: () => electron_1.ipcRenderer.send('cerrar-ventana-historial'),
    getArchivosDocxPorAnio: (anio) => electron_1.ipcRenderer.invoke('get-archivos-docx-por-anio', anio),
    abrirArchivoDocx: (nombreArchivo, anio) => electron_1.ipcRenderer.invoke('abrir-archivo-docx', nombreArchivo, anio),
    // Función para validar rutas
    validarRuta: (ruta) => electron_1.ipcRenderer.invoke('validar-ruta', ruta)
});
