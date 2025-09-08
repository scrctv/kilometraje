
// ¡¡¡NO TOCAR!!!
// TODOS LOS IMPORTS DEBEN IR AL PRINCIPIO DE ESTE ARCHIVO.
// NO PONGAS NINGÚN CÓDIGO, HANDLER NI COMENTARIO ANTES DE LOS IMPORTS.
// SI VES 'Cannot access ... before initialization', ES PORQUE HAY ALGO ANTES DE LOS IMPORTS.
//
// ⚠️ SCRCTV: ¡REVISA SIEMPRE ESTO ANTES DE GUARDAR! ⚠️
import * as fs from 'fs';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';

// Guardar turnos.json
ipcMain.handle('save-turnos', async (event, turnos) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    const ruta = path.join(configDir, 'turnos.json');
    fs.writeFileSync(ruta, JSON.stringify(turnos, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
});

// Leer turnos.json
ipcMain.handle('get-turnos', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const ruta = path.join(configDir, 'turnos.json');
    if (!fs.existsSync(ruta)) return null;
    return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
  } catch (e) {
    return null;
  }
});

// Handler para generar DOCX usando docxtemplater
ipcMain.handle('generar-docx', async (event, { rutaTurnos, rutaUsuario, rutaPlantilla }) => {
  try {
    // Cargar datos de usuario y turnos
    const datosUsuario = JSON.parse(fs.readFileSync(rutaUsuario, 'utf-8'));
    const apuntes = JSON.parse(fs.readFileSync(rutaTurnos, 'utf-8'));
    // Leer horarios de turnos
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const turnosPath = path.join(configDir, 'turnos.json');
    const turnos = fs.existsSync(turnosPath) ? JSON.parse(fs.readFileSync(turnosPath, 'utf-8')) : {};
    // Preparar campos para la plantilla (máximo 18 filas)
    const datosPlantilla: any = {};
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
        } else if (apunte.turno === 'noche') {
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
        datosPlantilla[`DIA${i+1}I`] = fechaI;
        datosPlantilla[`DIA${i+1}F`] = fechaF;
        datosPlantilla[`HID${i+1}`] = horaI;
        datosPlantilla[`HFD${i+1}`] = horaF;
      } else {
        datosPlantilla[`DIA${i+1}I`] = '';
        datosPlantilla[`DIA${i+1}F`] = '';
        datosPlantilla[`HID${i+1}`] = '';
        datosPlantilla[`HFD${i+1}`] = '';
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
    } catch (error: any) {
      return { ok: false, msg: 'Error al procesar la plantilla: ' + (error?.message || error) };
    }
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    // Guardar en la misma carpeta que el JSON de turnos
    const carpeta = path.dirname(rutaTurnos);
    const nombre = 'resultado-' + Date.now() + '.docx';
    const rutaSalida = path.join(carpeta, nombre);
    fs.writeFileSync(rutaSalida, buf);
    return { ok: true, nombre: rutaSalida };
  } catch (err: any) {
    return { ok: false, msg: err?.message || err };
  }
});

// Handler para seleccionar archivo con filtro personalizado
ipcMain.handle('dialog:openFileWithFilter', async (event, filters) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || []
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

// Handler para abrir la ventana GENERAR DOCX
ipcMain.on('open-generar-window', () => {
  const genWin = new BrowserWindow({
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
ipcMain.on('cerrar-ventana-generar', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

// Handler para abrir ubicación de archivo en Finder/Explorer
ipcMain.handle('abrir-en-finder', async (event, filePath) => {
  const { shell } = require('electron');
  if (filePath) shell.showItemInFolder(filePath);
});

// Leer archivo de turnos para un mes y año
ipcMain.handle('leer-turnos-mes', async (event, mes, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
    if (!fs.existsSync(rutaDestinoPath)) return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
    const rutaDestino = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8')).rutaDestino;
    if (!rutaDestino) return { ok: false, msg: 'Ruta de destino no válida.' };
    const mesNombre = mes.toLowerCase();
    const carpetaAnio = path.join(rutaDestino, anio.toString());
    const nombreBase = `${mesNombre}-${anio}-km.json`;
    const archivoFinal = path.join(carpetaAnio, nombreBase);
    if (!fs.existsSync(archivoFinal)) return { ok: false, msg: 'No hay datos para este mes.' };
    const datos = JSON.parse(fs.readFileSync(archivoFinal, 'utf-8'));
    return { ok: true, datos };
  } catch (e: any) {
    return { ok: false, msg: 'Error al leer: ' + e.message };
  }
});

// Guardar turnos seleccionados como JSON
ipcMain.handle('guardar-turnos', async (event, data, mes, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
    if (!fs.existsSync(rutaDestinoPath)) return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
    const rutaDestino = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8')).rutaDestino;
    if (!rutaDestino) return { ok: false, msg: 'Ruta de destino no válida.' };
    const mesNombre = mes.toLowerCase();
    const carpetaAnio = path.join(rutaDestino, anio.toString());
    if (!fs.existsSync(carpetaAnio)) fs.mkdirSync(carpetaAnio, { recursive: true });
    let nombreBase = `${mesNombre}-${anio}-km.json`;
    let archivoFinal = path.join(carpetaAnio, nombreBase);
    let variante = 1;
    while (fs.existsSync(archivoFinal)) {
      // Preguntar solo si sobrescribir o cancelar
      const { response } = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Sobrescribir', 'Cancelar'],
        defaultId: 0,
        cancelId: 1,
        message: `El archivo ${nombreBase} ya existe. ¿Desea sobrescribirlo?`
      });
      if (response === 0) break; // Sobrescribir
      else {
        return { ok: false, msg: 'Cancelado por el usuario.' };
      }
    }
    fs.writeFileSync(archivoFinal, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true, msg: `Guardado en ${archivoFinal}` };
  } catch (e: any) {
    return { ok: false, msg: 'Error al guardar: ' + e.message };
  }
});

// Mostrar diálogo de confirmación simple
ipcMain.handle('show-confirm', async (event, mensaje) => {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Sí', 'No'],
    defaultId: 0,
    cancelId: 1,
    message: mensaje
  });
  return response === 0;
});

// Cerrar ventana CREAR
ipcMain.on('cerrar-ventana-crear', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

// Handler para abrir la ventana CREAR
ipcMain.on('open-crear-window', () => {
  const crearWin = new BrowserWindow({
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
