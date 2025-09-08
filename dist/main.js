"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// ¡¡¡NO TOCAR!!!
// TODOS LOS IMPORTS DEBEN IR AL PRINCIPIO DE ESTE ARCHIVO.
// NO PONGAS NINGÚN CÓDIGO, HANDLER NI COMENTARIO ANTES DE LOS IMPORTS.
// SI VES 'Cannot access ... before initialization', ES PORQUE HAY ALGO ANTES DE LOS IMPORTS.
//
// ⚠️ SCRCTV: ¡REVISA SIEMPRE ESTO ANTES DE GUARDAR! ⚠️
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
const path = __importStar(require("path"));
// Guardar y recuperar la última ruta de datosusuario.json
electron_1.ipcMain.handle('save-ruta-datosusuario', async (event, ruta) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir))
            fs.mkdirSync(configDir, { recursive: true });
        const rutaFile = path.join(configDir, 'ruta-datosusuario.json');
        fs.writeFileSync(rutaFile, JSON.stringify({ ruta }, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
electron_1.ipcMain.handle('get-ruta-datosusuario', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const rutaFile = path.join(configDir, 'ruta-datosusuario.json');
        if (!fs.existsSync(rutaFile))
            return null;
        return JSON.parse(fs.readFileSync(rutaFile, 'utf-8')).ruta;
    }
    catch (e) {
        return null;
    }
});
// Guardar turnos.json
electron_1.ipcMain.handle('save-turnos', async (event, turnos) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir))
            fs.mkdirSync(configDir, { recursive: true });
        const ruta = path.join(configDir, 'turnos.json');
        fs.writeFileSync(ruta, JSON.stringify(turnos, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
// Leer turnos.json
electron_1.ipcMain.handle('get-turnos', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const ruta = path.join(configDir, 'turnos.json');
        if (!fs.existsSync(ruta))
            return null;
        return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
    }
    catch (e) {
        return null;
    }
});
// Handler para generar DOCX usando docxtemplater
electron_1.ipcMain.handle('generar-docx', async (event, { rutaTurnos, rutaUsuario, rutaPlantilla }) => {
    try {
        // Cargar datos de usuario y turnos
        const datosUsuario = JSON.parse(fs.readFileSync(rutaUsuario, 'utf-8'));
        const apuntes = JSON.parse(fs.readFileSync(rutaTurnos, 'utf-8'));
        // Leer horarios de turnos
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const turnosPath = path.join(configDir, 'turnos.json');
        const turnos = fs.existsSync(turnosPath) ? JSON.parse(fs.readFileSync(turnosPath, 'utf-8')) : {};
        // Preparar campos para la plantilla (máximo 18 filas)
        const datosPlantilla = {};
        const maxFilas = 18;
        for (let i = 0; i < maxFilas; i++) {
            if (i < apuntes.length) {
                const apunte = apuntes[i];
                // apunte.fecha ya está en formato dd-mm-aaaa
                const [dia, mesStr, anioStr] = apunte.fecha.split('-');
                const fechaI = `${dia}-${mesStr}-${anioStr}`;
                let fechaF = fechaI;
                let horaI = '';
                let horaF = '';
                // Normalizar turno para aceptar tanto "mañana" como "manana"
                const turnoNormalizado = apunte.turno.replace('ñ', 'n');
                if (turnoNormalizado === 'manana' || apunte.turno === 'tarde') {
                    const tipoTurno = turnoNormalizado === 'manana' ? 'manana' : 'tarde';
                    horaI = turnos[tipoTurno]?.inicio || turnos['mañana']?.inicio || '';
                    horaF = turnos[tipoTurno]?.fin || turnos['mañana']?.fin || '';
                }
                else if (apunte.turno === 'noche') {
                    horaI = turnos.noche?.inicio || '';
                    horaF = turnos.noche?.fin || '';
                    // Calcular fecha final (día siguiente)
                    const d = new Date(`${anioStr}-${mesStr}-${dia}`);
                    d.setDate(d.getDate() + 1);
                    const ddF = String(d.getDate()).padStart(2, '0');
                    const mmF = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyyF = d.getFullYear();
                    fechaF = `${ddF}-${mmF}-${yyyyF}`;
                }
                datosPlantilla[`DIA${i + 1}I`] = fechaI;
                datosPlantilla[`DIA${i + 1}F`] = fechaF;
                datosPlantilla[`HID${i + 1}`] = horaI;
                datosPlantilla[`HFD${i + 1}`] = horaF;
            }
            else {
                datosPlantilla[`DIA${i + 1}I`] = '';
                datosPlantilla[`DIA${i + 1}F`] = '';
                datosPlantilla[`HID${i + 1}`] = '';
                datosPlantilla[`HFD${i + 1}`] = '';
            }
        }
        // Leer plantilla DOTX/DOCX como Buffer (sin encoding)
        const content = fs.readFileSync(rutaPlantilla);
        // Cargar docxtemplater y pizzip
        const PizZip = require('pizzip');
        const Docxtemplater = require('docxtemplater');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        // Unir datos
        const datos = { ...datosUsuario, ...datosPlantilla };
        doc.setData(datos);
        try {
            doc.render();
        }
        catch (error) {
            return { ok: false, msg: 'Error al procesar la plantilla: ' + (error?.message || error) };
        }
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        // Guardar en la misma carpeta que el JSON de turnos
        const carpeta = path.dirname(rutaTurnos);
        const nombre = 'resultado-' + Date.now() + '.docx';
        const rutaSalida = path.join(carpeta, nombre);
        fs.writeFileSync(rutaSalida, buf);
        return { ok: true, nombre: rutaSalida };
    }
    catch (err) {
        return { ok: false, msg: err?.message || err };
    }
});
// Handler para seleccionar archivo con filtro personalizado
electron_1.ipcMain.handle('dialog:openFileWithFilter', async (event, filters) => {
    const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || []
    });
    if (canceled || filePaths.length === 0)
        return null;
    return filePaths[0];
});
// Handler para abrir la ventana GENERAR DOCX
electron_1.ipcMain.on('open-generar-window', () => {
    const genWin = new electron_1.BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    genWin.loadFile(path.join(__dirname, '../html/generar.html'));
});
// Handler para cerrar la ventana GENERAR DOCX
electron_1.ipcMain.on('cerrar-ventana-generar', () => {
    const win = electron_1.BrowserWindow.getFocusedWindow();
    if (win)
        win.close();
});
// Handler para abrir ubicación de archivo en Finder/Explorer
electron_1.ipcMain.handle('abrir-en-finder', async (event, filePath) => {
    const { shell } = require('electron');
    if (filePath)
        shell.showItemInFolder(filePath);
});
// Leer archivo de turnos para un mes y año
electron_1.ipcMain.handle('leer-turnos-mes', async (event, mes, anio) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
        if (!fs.existsSync(rutaDestinoPath))
            return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
        const rutaDestino = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8')).rutaDestino;
        if (!rutaDestino)
            return { ok: false, msg: 'Ruta de destino no válida.' };
        const mesNombre = mes.toLowerCase();
        const carpetaAnio = path.join(rutaDestino, anio.toString());
        const nombreBase = `${mesNombre}-${anio}-km.json`;
        const archivoFinal = path.join(carpetaAnio, nombreBase);
        if (!fs.existsSync(archivoFinal))
            return { ok: false, msg: 'No hay datos para este mes.' };
        const datos = JSON.parse(fs.readFileSync(archivoFinal, 'utf-8'));
        return { ok: true, datos };
    }
    catch (e) {
        return { ok: false, msg: 'Error al leer: ' + e.message };
    }
});
// Guardar turnos seleccionados como JSON
electron_1.ipcMain.handle('guardar-turnos', async (event, data, mes, anio) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
        if (!fs.existsSync(rutaDestinoPath))
            return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
        const rutaDestino = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8')).rutaDestino;
        if (!rutaDestino)
            return { ok: false, msg: 'Ruta de destino no válida.' };
        const mesNombre = mes.toLowerCase();
        const carpetaAnio = path.join(rutaDestino, anio.toString());
        if (!fs.existsSync(carpetaAnio))
            fs.mkdirSync(carpetaAnio, { recursive: true });
        let nombreBase = `${mesNombre}-${anio}-km.json`;
        let archivoFinal = path.join(carpetaAnio, nombreBase);
        let variante = 1;
        while (fs.existsSync(archivoFinal)) {
            // Preguntar solo si sobrescribir o cancelar
            const { response } = await electron_1.dialog.showMessageBox({
                type: 'question',
                buttons: ['Sobrescribir', 'Cancelar'],
                defaultId: 0,
                cancelId: 1,
                message: `El archivo ${nombreBase} ya existe. ¿Desea sobrescribirlo?`
            });
            if (response === 0)
                break; // Sobrescribir
            else {
                return { ok: false, msg: 'Cancelado por el usuario.' };
            }
        }
        fs.writeFileSync(archivoFinal, JSON.stringify(data, null, 2), 'utf-8');
        return { ok: true, msg: `Guardado en ${archivoFinal}` };
    }
    catch (e) {
        return { ok: false, msg: 'Error al guardar: ' + e.message };
    }
});
// Mostrar diálogo de confirmación simple
electron_1.ipcMain.handle('show-confirm', async (event, mensaje) => {
    const { response } = await electron_1.dialog.showMessageBox({
        type: 'question',
        buttons: ['Sí', 'No'],
        defaultId: 0,
        cancelId: 1,
        message: mensaje
    });
    return response === 0;
});
// Cerrar ventana CREAR
electron_1.ipcMain.on('cerrar-ventana-crear', () => {
    const win = electron_1.BrowserWindow.getFocusedWindow();
    if (win)
        win.close();
});
// Handler para abrir la ventana CREAR
electron_1.ipcMain.on('open-crear-window', () => {
    const crearWin = new electron_1.BrowserWindow({
        width: 1470,
        height: 956,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    crearWin.loadFile(path.join(__dirname, '../html/crear.html'));
});
electron_1.ipcMain.on('open-datosusuario-window', () => {
    const datosWin = new electron_1.BrowserWindow({
        width: 665,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    datosWin.loadFile(path.join(__dirname, '../html/datosusuario.html'));
});
electron_1.ipcMain.handle('get-unidad-por-km', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const filePath = path.join(configDir, 'unidad-por-km.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(data);
            return json.unidadPorKm || '';
        }
        return '';
    }
    catch (e) {
        return '';
    }
});
// Handler para obtener la ruta de plantilla guardada
electron_1.ipcMain.handle('get-ruta-dotx', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const filePath = path.join(configDir, 'ruta-dotx.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(data);
            return json.rutaDotx || '';
        }
        return '';
    }
    catch (e) {
        return '';
    }
});
// Handler para obtener la ruta de destino guardada
electron_1.ipcMain.handle('get-ruta-destino', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const filePath = path.join(configDir, 'ruta-destino.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(data);
            return json.rutaDestino || '';
        }
        return '';
    }
    catch (e) {
        return '';
    }
});
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    win.loadFile(path.join(__dirname, '../html/inicio.html'));
}
function createConfigWindow() {
    const configWin = new electron_1.BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    configWin.loadFile(path.join(__dirname, '../html/configuracion.html'));
}
electron_1.ipcMain.on('open-config-window', () => {
    createConfigWindow();
});
electron_1.ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Plantillas Word', extensions: ['dotx', 'docx'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ]
    });
    if (canceled || filePaths.length === 0)
        return null;
    return filePaths[0];
});
electron_1.ipcMain.handle('dialog:openFolder', async () => {
    const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0)
        return null;
    return filePaths[0];
});
electron_1.ipcMain.handle('save-unidad-por-km', async (event, valor) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'unidad-por-km.json');
        fs.writeFileSync(filePath, JSON.stringify({ unidadPorKm: valor }, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
electron_1.ipcMain.handle('save-ruta-dotx', async (event, ruta) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'ruta-dotx.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDotx: ruta }, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
electron_1.ipcMain.handle('save-ruta-destino', async (event, ruta) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'ruta-destino.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDestino: ruta }, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
electron_1.ipcMain.handle('save-datos-usuario', async (event, data) => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'datosusuario.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    }
    catch (e) {
        return false;
    }
});
electron_1.ipcMain.handle('get-datos-usuario', async () => {
    try {
        const configDir = path.join(electron_1.app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        const filePath = path.join(configDir, 'datosusuario.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        }
        return null;
    }
    catch (e) {
        return null;
    }
});
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
