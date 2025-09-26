
import * as fs from 'fs';
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
// ¡¡¡NO TOCAR!!!
// TODOS LOS IMPORTS DEBEN IR AL PRINCIPIO DE ESTE ARCHIVO.
// NO PONGAS NINGÚN CÓDIGO, HANDLER NI COMENTARIO ANTES DE LOS IMPORTS.
// SI VES 'Cannot access ... before initialization', ES PORQUE HAY ALGO ANTES DE LOS IMPORTS.
//
// ⚠️ SCRCTV: ¡REVISA SIEMPRE ESTO ANTES DE GUARDAR! ⚠️

// Función helper para normalizar rutas
function normalizarRuta(ruta: string): string {
  if (!ruta) return '';
  // Convertir separadores a los del SO actual
  return path.normalize(ruta.replace(/[\/\\]/g, path.sep));
}

// ==================== HANDLERS DEL HISTORIAL ====================

// Abrir ventana historial
ipcMain.on('open-historial-window', () => {
  // Verificar si ya existe una ventana de historial
  const existingWindow = BrowserWindow.getAllWindows().find(win => 
    win.getTitle && win.getTitle() === 'Historial'
  );
  if (existingWindow) {
    existingWindow.focus();
    return;
  }
  
  const win = new BrowserWindow({
    width: 840,
    height: 760,
    resizable: false,
    title: 'Historial',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, '../html/historial.html'));
});

// Cerrar ventana historial
ipcMain.on('cerrar-ventana-historial', () => {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (win.getTitle && win.getTitle() === 'Historial') {
      win.close();
      return;
    }
  }
});

// Listar archivos DOCX por año
ipcMain.handle('get-archivos-docx-por-anio', async (event, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaFile = path.join(configDir, 'ruta-meses-guardatos.json');
    
    if (!fs.existsSync(rutaFile)) {
      return [];
    }
    
    const rutaData = JSON.parse(fs.readFileSync(rutaFile, 'utf-8'));
    const rutaDocx = rutaData.ruta;
    
    if (!rutaDocx || !fs.existsSync(rutaDocx)) {
      return [];
    }
    
    const archivos = fs.readdirSync(rutaDocx);
    const archivosDocx = archivos.filter(archivo => archivo.endsWith('.docx'));
    
    // Filtrar por año en el nombre del archivo (formato: 2025-enero.docx)
    const archivosDelAnio = archivosDocx.filter(nombre => {
      return nombre.startsWith(String(anio) + '-');
    });
    
    // Definir orden cronológico de meses
    const ordenMeses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Ordenar archivos por mes cronológico
    const archivosOrdenados = archivosDelAnio.sort((a, b) => {
      // Extraer el mes del nombre del archivo
      const mesA = a.replace('.docx', '').split('-')[1]?.toLowerCase() || '';
      const mesB = b.replace('.docx', '').split('-')[1]?.toLowerCase() || '';
      
      const indexA = ordenMeses.indexOf(mesA);
      const indexB = ordenMeses.indexOf(mesB);
      
      // Si algún mes no se encuentra en el array, ponerlo al final
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
    
    return archivosOrdenados;
  } catch (error) {
    console.error('Error al obtener archivos DOCX:', error);
    return [];
  }
});

// Abrir archivo DOCX
ipcMain.handle('abrir-archivo-docx', async (event, nombreArchivo, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaFile = path.join(configDir, 'ruta-meses-guardatos.json');
    
    if (!fs.existsSync(rutaFile)) {
      return false;
    }
    
    const rutaData = JSON.parse(fs.readFileSync(rutaFile, 'utf-8'));
    const rutaDocx = rutaData.ruta;
    
    if (!rutaDocx) {
      return false;
    }
    
    const rutaCompleta = path.join(rutaDocx, nombreArchivo);
    
    if (!fs.existsSync(rutaCompleta)) {
      return false;
    }
    
    await shell.openPath(rutaCompleta);
    return true;
  } catch (error) {
    console.error('Error al abrir archivo DOCX:', error);
    return false;
  }
});

// ==================== FIN HANDLERS DEL HISTORIAL ====================

// Guardar y recuperar la ruta de los DOCX (ahora 'ruta-meses-guardatos.json')
ipcMain.handle('saveRutaDocx', async (event, ruta) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    
    const rutaNormalizada = normalizarRuta(ruta);
    const rutaFile = path.join(configDir, 'ruta-meses-guardatos.json');
    fs.writeFileSync(rutaFile, JSON.stringify({ ruta: rutaNormalizada }, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle('getRutaDocx', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaFile = path.join(configDir, 'ruta-meses-guardatos.json');
    if (!fs.existsSync(rutaFile)) return null;
    return JSON.parse(fs.readFileSync(rutaFile, 'utf-8')).ruta;
  } catch (e) {
    return null;
  }
});

// Cerrar ventana datosusuario
ipcMain.on('cerrar-ventana-datosusuario', () => {
  const allWindows = BrowserWindow.getAllWindows();
  for (const win of allWindows) {
    if (win.getTitle && win.getTitle() === 'Datos de Usuario') {
      win.close();
      return;
    }
    // Alternativamente, si usas un identificador personalizado:
    // if (win.webContents.getURL().includes('datosusuario.html')) { win.close(); return; }
  }
});

// Guardar y recuperar la última ruta de datosusuario.json
ipcMain.handle('save-ruta-datosusuario', async (event, ruta) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    
    const rutaNormalizada = normalizarRuta(ruta);
    const rutaFile = path.join(configDir, 'ruta-datosusuario.json');
    fs.writeFileSync(rutaFile, JSON.stringify({ ruta: rutaNormalizada }, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle('get-ruta-datosusuario', async () => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaFile = path.join(configDir, 'ruta-datosusuario.json');
    if (!fs.existsSync(rutaFile)) return null;
    return JSON.parse(fs.readFileSync(rutaFile, 'utf-8')).ruta;
  } catch (e) {
    return null;
  }
});

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
// Eliminado handler duplicado de 'generar-docx' (solo debe haber uno)
ipcMain.handle('generar-docx', async (event, { rutaTurnos, rutaUsuario, rutaPlantilla, anio, meses }) => {
  try {
    // Normalizar todas las rutas
    rutaUsuario = normalizarRuta(rutaUsuario);
    rutaPlantilla = normalizarRuta(rutaPlantilla);
    rutaTurnos = normalizarRuta(rutaTurnos);
    
    // Verificar que los archivos existen
    if (!fs.existsSync(rutaUsuario)) {
      return { ok: false, msg: 'NO EXISTE, el archivo con los datos de Usuario, rellena el formulario en la ventana DATOS DE USUARIO, y guardalo.' };
    }
    
    if (!fs.existsSync(rutaPlantilla)) {
      return { ok: false, msg: `El archivo de plantilla no existe: ${rutaPlantilla}` };
    }
    
    if (!fs.existsSync(rutaTurnos)) {
      return { ok: false, msg: `El archivo de turnos no existe: ${rutaTurnos}` };
    }
    
    // Cargar datos de usuario y turnos
    const datosUsuario = JSON.parse(fs.readFileSync(rutaUsuario, 'utf-8'));
    let apuntes: { fecha: string; turno: string }[] = JSON.parse(fs.readFileSync(rutaTurnos, 'utf-8'));
    // Filtrar por año y meses si se reciben
    if (anio && Array.isArray(meses) && meses.length > 0) {
      apuntes = apuntes.filter((apunte: { fecha: string; turno: string }) => {
        const [dia, mes, anioStr] = apunte.fecha.split('-');
        return parseInt(anioStr) === anio && meses.includes(parseInt(mes));
      });
    }
    // --- Lógica para {fecha1}, {fecha2}, {fecha3} ---
    // Calcular mes y año anterior
    const fechaActual = new Date();
    let mesActual = meses && meses.length > 0 ? meses[0] : (fechaActual.getMonth() + 1);
    let anioActual = anio || fechaActual.getFullYear();
    let mesAnterior = mesActual - 1;
    let anioAnterior = anioActual;
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anioAnterior = anioActual - 1;
    }
    // Buscar archivo de turnos del mes anterior
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
    const fechasHabiles: Date[] = [];
    
    // SIEMPRE calcular desde calendario para garantizar fechas correctas
    // independientemente de si existe archivo del mes anterior
    const diasEnMes = new Date(anioAnterior, mesAnterior, 0).getDate();
    for (let d = diasEnMes; d >= 1 && fechasHabiles.length < 3; d--) {
      const fecha = new Date(anioAnterior, mesAnterior-1, d);
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        fechasHabiles.push(fecha);
      }
    }
    // Leer horarios de turnos
    const turnosPath = path.join(configDir, 'turnos.json');
    const turnos = fs.existsSync(turnosPath) ? JSON.parse(fs.readFileSync(turnosPath, 'utf-8')) : {};
    // Preparar campos para la plantilla (máximo 18 filas)
    const datosPlantilla: Record<string, string> = {};
    const maxFilas = 18;
    // Tomar los 3 últimos días hábiles (orden ascendente)
    const ultimos3 = fechasHabiles.slice(0,3).sort((a,b)=>a.getTime()-b.getTime());
    const mesesNombresLargos = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const diasNombres = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    ultimos3.forEach((fecha, idx) => {
      const diaNombre = diasNombres[fecha.getDay()];
      const diaNum = fecha.getDate();
      const mesNombre = mesesNombresLargos[fecha.getMonth()];
      const anioNum = fecha.getFullYear();
      datosPlantilla[`fecha${idx+1}`] = `${diaNombre} ${diaNum} de ${mesNombre} de ${anioNum}`;
    });
    for (let i = 0; i < maxFilas; i++) {
      if (i < apuntes.length) {
        const apunte = apuntes[i];
        const [dia, mesStr, anioStr] = apunte.fecha.split('-');
        const fechaI = `${dia}-${mesStr}-${anioStr}`;
        let fechaF = fechaI;
        let horaI = '';
        let horaF = '';
        const turnoNormalizado = apunte.turno.replace('ñ', 'n');
        if (turnoNormalizado === 'manana' || apunte.turno === 'tarde') {
          const tipoTurno = turnoNormalizado === 'manana' ? 'manana' : 'tarde';
          horaI = turnos[tipoTurno]?.inicio || turnos['mañana']?.inicio || '';
          horaF = turnos[tipoTurno]?.fin || turnos['mañana']?.fin || '';
        } else if (apunte.turno === 'noche') {
          horaI = turnos.noche?.inicio || '';
          horaF = turnos.noche?.fin || '';
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
        // Añadir los campos fijos de usuario
        datosPlantilla[`itinerario${i+1}`] = datosUsuario.itinerario || '';
        datosPlantilla[`mitja${i+1}`] = datosUsuario.mitja || '';
        datosPlantilla[`km${i+1}`] = datosUsuario.km || '';
      } else {
        datosPlantilla[`DIA${i+1}I`] = '';
        datosPlantilla[`DIA${i+1}F`] = '';
        datosPlantilla[`HID${i+1}`] = '';
        datosPlantilla[`HFD${i+1}`] = '';
        datosPlantilla[`itinerario${i+1}`] = '';
        datosPlantilla[`mitja${i+1}`] = '';
        datosPlantilla[`km${i+1}`] = '';
      }
    }
    // Leer plantilla DOTX/DOCX como Buffer (sin encoding)
    if (!rutaPlantilla) {
      return { ok: false, msg: 'No se ha especificado una ruta de plantilla.' };
    }
    if (!fs.existsSync(rutaPlantilla)) {
      return { ok: false, msg: `El archivo de plantilla no existe: ${rutaPlantilla}` };
    }
    const content = fs.readFileSync(rutaPlantilla);
    const PizZip = require('pizzip');
    const Docxtemplater = require('docxtemplater');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    const datos = { ...datosUsuario, ...datosPlantilla };
    try {
      doc.render(datos);
    } catch (error: any) {
      return { ok: false, msg: 'Error al procesar la plantilla: ' + (error && error.message ? error.message : String(error)) };
    }
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    // Usar la ruta de DOCX si existe, si no, usar la carpeta de los turnos
    let carpeta = path.dirname(rutaTurnos);
    
    try {
      const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
      const rutaDocxFile = path.join(configDir, 'ruta-meses-guardatos.json');
      
      if (fs.existsSync(rutaDocxFile)) {
        const rutaDocxData = JSON.parse(fs.readFileSync(rutaDocxFile, 'utf-8'));
        const rutaDocx = normalizarRuta(rutaDocxData.ruta);
        
        if (rutaDocx && fs.existsSync(rutaDocx)) {
          carpeta = rutaDocx;
        }
      }
    } catch (e) { 
      /* Si falla, usa carpeta por defecto */ 
    }
    // Obtener año y mes para el nombre del archivo
    let nombreMes = '';
    if (Array.isArray(meses) && meses.length > 0) {
      const NOMBRES_MESES = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const mesNum = meses[0];
      nombreMes = NOMBRES_MESES[mesNum - 1] || '';
    }
    const nombre = anio && nombreMes ? `${anio}-${nombreMes}.docx` : 'resultado-' + Date.now() + '.docx';
    const rutaSalida = path.join(carpeta, nombre);
    fs.writeFileSync(rutaSalida, buf);
    return { ok: true, nombre: rutaSalida };
  } catch (err: any) {
    // Si el error es ENOENT y la ruta es datosusuario.json, mostrar mensaje personalizado
    if (err && err.code === 'ENOENT' && String(err.message).toLowerCase().includes('datosusuario')) {
      return { ok: false, msg: 'NO EXISTE, el archivo con los datos de Usuario, rellena el formulario en la ventana DATOS DE USUARIO, y guardalo.' };
    }
    return { ok: false, msg: err && err.message ? err.message : String(err) };
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

// Handler para abrir la ventana CONFIGURACION con tamaño igual a datosusuario/crear
ipcMain.on('open-configuracion-window', () => {
  // Verificar si ya existe una ventana de configuración
  const existingWindow = BrowserWindow.getAllWindows().find(win => 
    win.getTitle && win.getTitle() === 'Configuración'
  );
  if (existingWindow) {
    existingWindow.focus();
    return;
  }
  
  const configWin = new BrowserWindow({
    width: 840,
    height: 760,
    resizable: false,
    title: 'Configuración',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  configWin.loadFile(path.join(__dirname, '../html/configuracion.html'));
});

// Handler para cerrar la ventana GENERAR DOCX
ipcMain.on('cerrar-ventana-generar', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

// Handler para abrir ubicación de archivo en Finder/Explorer
ipcMain.handle('abrir-en-finder', async (event, filePath) => {
  const { shell } = require('electron');
  const fs = require('fs');
  if (filePath) {
    try {
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        // Es una carpeta, abrirla directamente
        shell.openPath(filePath);
      } else {
        // Es un archivo, mostrarlo en su carpeta
        shell.showItemInFolder(filePath);
      }
    } catch (e) {
      // fallback
      shell.showItemInFolder(filePath);
    }
  }
});

// Leer archivo de turnos para un mes y año
ipcMain.handle('leer-turnos-mes', async (event, mes, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
    
    if (!fs.existsSync(rutaDestinoPath)) {
      return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
    }
    
    const rutaDestinoData = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8'));
    const rutaDestino = normalizarRuta(rutaDestinoData.rutaDestino);
    
    if (!rutaDestino) return { ok: false, msg: 'Ruta de destino no válida.' };
    
    const mesNombre = mes.toLowerCase();
    const carpetaAnio = path.join(rutaDestino, anio.toString());
    
    if (!fs.existsSync(carpetaAnio)) {
      return { ok: false, msg: 'No existe la carpeta del año.' };
    }
    
    // Buscar cualquier archivo que contenga el nombre del mes y termine en .json
    const archivos = fs.readdirSync(carpetaAnio).filter(f => 
      f.toLowerCase().includes(mesNombre) && f.endsWith('.json')
    );
    
    if (archivos.length === 0) {
      return { ok: false, msg: 'No hay datos para este mes.' };
    }
    
    // Tomar el primero que coincida
    const archivoFinal = path.join(carpetaAnio, archivos[0]);
    const datos = JSON.parse(fs.readFileSync(archivoFinal, 'utf-8'));
    
    return { ok: true, datos };
  } catch (e: any) {
    return { ok: false, msg: 'Error al leer: ' + (e.message || e) };
  }
});

// Guardar turnos seleccionados como JSON
ipcMain.handle('guardar-turnos', async (event, data, mes, anio) => {
  try {
    const configDir = path.join(app.getAppPath(), 'ARCHIVOS DE CONFIGURACION');
    const rutaDestinoPath = path.join(configDir, 'ruta-destino.json');
    
    if (!fs.existsSync(rutaDestinoPath)) {
      return { ok: false, msg: 'No se ha configurado la ruta de destino.' };
    }
    
    const rutaDestinoData = JSON.parse(fs.readFileSync(rutaDestinoPath, 'utf-8'));
    const rutaDestino = normalizarRuta(rutaDestinoData.rutaDestino);
    
    if (!rutaDestino) {
      return { ok: false, msg: 'Ruta de destino no válida.' };
    }
    
    // Verificar que la ruta existe
    if (!fs.existsSync(rutaDestino)) {
      return { ok: false, msg: `La ruta de destino no existe: ${rutaDestino}` };
    }
    
    const mesNombre = mes.toLowerCase();
    const carpetaAnio = path.join(rutaDestino, anio.toString());
    
    if (!fs.existsSync(carpetaAnio)) {
      fs.mkdirSync(carpetaAnio, { recursive: true });
    }
    
    let nombreBase = `${mesNombre}-${anio}-km.json`;
    let archivoFinal = path.join(carpetaAnio, nombreBase);
    
    fs.writeFileSync(archivoFinal, JSON.stringify(data, null, 2), 'utf-8');
    
    return { ok: true, msg: `Guardado en ${archivoFinal}`, ruta: archivoFinal };
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
    height: 950,
    minWidth: 1470,
    minHeight: 950,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  crearWin.loadFile(path.join(__dirname, '../html/crear.html'));
});

ipcMain.on('open-datosusuario-window', () => {
  // Verificar si ya existe una ventana de datosusuario
  const existingWindow = BrowserWindow.getAllWindows().find(win => 
    win.getTitle && win.getTitle() === 'Datos de Usuario'
  );
  if (existingWindow) {
    existingWindow.focus();
    return;
  }
  const datosWin = new BrowserWindow({
    width: 840,
    height: 760,
    resizable: false,
    title: 'Datos de Usuario',
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
    width: 840,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '../html/inicio.html'));
}

function createConfigWindow() {
  // Verificar si ya existe una ventana de configuración
  const existingWindow = BrowserWindow.getAllWindows().find(win => 
    win.getTitle && win.getTitle() === 'Configuración'
  );
  if (existingWindow) {
    existingWindow.focus();
    return;
  }
  
  const configWin = new BrowserWindow({
    width: 840,
    height: 760,
    resizable: false,
    title: 'Configuración',
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
        
        const rutaNormalizada = normalizarRuta(ruta);
        const filePath = path.join(configDir, 'ruta-dotx.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDotx: rutaNormalizada }, null, 2), 'utf-8');
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
        
        const rutaNormalizada = normalizarRuta(ruta);
        const filePath = path.join(configDir, 'ruta-destino.json');
        fs.writeFileSync(filePath, JSON.stringify({ rutaDestino: rutaNormalizada }, null, 2), 'utf-8');
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

// Handler para validar rutas
ipcMain.handle('validar-ruta', async (event, ruta) => {
  try {
    if (!ruta) return false;
    const rutaNormalizada = normalizarRuta(ruta);
    return fs.existsSync(rutaNormalizada);
  } catch (e) {
    return false;
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
