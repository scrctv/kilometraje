
import * as fs from 'fs';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';

ipcMain.on('open-datosusuario-window', () => {
  const datosWin = new BrowserWindow({
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

ipcMain.handle('get-unidad-por-km', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const filePath = path.join(configDir, 'unidad-por-km.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(data);
      return json.unidadPorKm || '';
    }
    return '';
  } catch (e) {
    return '';
  }
});

// Handler para obtener la ruta de plantilla guardada
ipcMain.handle('get-ruta-dotx', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const filePath = path.join(configDir, 'ruta-dotx.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(data);
      return json.rutaDotx || '';
    }
    return '';
  } catch (e) {
    return '';
  }
});

// Handler para obtener la ruta de destino guardada
ipcMain.handle('get-ruta-destino', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const filePath = path.join(configDir, 'ruta-destino.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(data);
      return json.rutaDestino || '';
    }
    return '';
  } catch (e) {
    return '';
  }
});


function createWindow() {
  const win = new BrowserWindow({
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
  const configWin = new BrowserWindow({
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

ipcMain.on('open-config-window', () => {
  createConfigWindow();
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Plantillas Word', extensions: ['dotx', 'docx'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

  ipcMain.handle('save-unidad-por-km', async (event, valor) => {
    try {
      const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const filePath = path.join(configDir, 'unidad-por-km.json');
      fs.writeFileSync(filePath, JSON.stringify({ unidadPorKm: valor }, null, 2), 'utf-8');
      return true;
    } catch (e) {
      return false;
    }
  });
  
    ipcMain.handle('save-ruta-dotx', async (event, ruta) => {
      try {
        const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'ruta-dotx.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDotx: ruta }, null, 2), 'utf-8');
        return true;
      } catch (e) {
        return false;
      }
    });
  
    ipcMain.handle('save-ruta-destino', async (event, ruta) => {
      try {
        const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'ruta-destino.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDestino: ruta }, null, 2), 'utf-8');
        return true;
      } catch (e) {
        return false;
      }
    });

  ipcMain.handle('save-datos-usuario', async (event, data) => {
    try {
      const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const filePath = path.join(configDir, 'datosusuario.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle('get-datos-usuario', async () => {
    try {
      const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
      const filePath = path.join(configDir, 'datosusuario.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  });

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
