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
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
const path = __importStar(require("path"));
electron_1.ipcMain.on('open-datosusuario-window', () => {
    const datosWin = new electron_1.BrowserWindow({
        width: 500,
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
            { name: 'Excel', extensions: ['xlsx', 'xls'] },
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
