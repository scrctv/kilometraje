// Cargar años disponibles al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  const yearSelect = document.getElementById('year-select');
  
  // Generar años desde 2020 hasta el año actual + 2
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const endYear = currentYear + 2;
  
  // Agregar opción por defecto
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Seleccionar año...';
  yearSelect.appendChild(defaultOption);
  
  // Agregar años
  for (let year = endYear; year >= startYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  // Seleccionar el año actual por defecto
  yearSelect.value = currentYear;
  await cargarArchivos(currentYear);
});

// Manejar cambio de año
document.getElementById('year-select').addEventListener('change', async (e) => {
  const anio = parseInt(e.target.value);
  if (anio) {
    await cargarArchivos(anio);
  } else {
    mostrarMensaje('Selecciona un año para ver los archivos');
  }
});

// Función para cargar archivos por año
async function cargarArchivos(anio) {
  try {
    const archivos = await window.electronAPI.getArchivosDocxPorAnio(anio);
    mostrarArchivos(archivos, anio);
  } catch (error) {
    console.error('Error al cargar archivos:', error);
    mostrarMensaje('Error al cargar los archivos');
  }
}

// Función para mostrar archivos
function mostrarArchivos(archivos, anio) {
  const container = document.getElementById('archivos-lista');
  
  if (!archivos || archivos.length === 0) {
    mostrarMensaje(`No se encontraron archivos para el año ${anio}`);
    return;
  }
  
  container.innerHTML = '';
  
  archivos.forEach(archivo => {
    const item = document.createElement('div');
    item.className = 'archivo-item';
    
    // Extraer el mes del nombre del archivo (formato: 2025-enero.docx)
    const nombreSinExtension = archivo.replace('.docx', '');
    const partes = nombreSinExtension.split('-');
    const mes = partes.length > 1 ? partes[1] : 'Desconocido';
    
    item.innerHTML = `
      <div class="archivo-nombre">${archivo}</div>
      <div class="archivo-info">Mes: ${capitalize(mes)}</div>
    `;
    
    // Agregar evento click para abrir el archivo
    item.addEventListener('click', async () => {
      try {
        const exito = await window.electronAPI.abrirArchivoDocx(archivo, anio);
        if (!exito) {
          mostrarModalMensaje('No se pudo abrir el archivo', 'error');
        }
      } catch (error) {
        console.error('Error al abrir archivo:', error);
        mostrarModalMensaje('Error al abrir el archivo', 'error');
      }
    });
    
    container.appendChild(item);
  });
}

// Función para mostrar mensaje
function mostrarMensaje(mensaje) {
  const container = document.getElementById('archivos-lista');
  container.innerHTML = `<p class="mensaje-info">${mensaje}</p>`;
}

// Función auxiliar para capitalizar texto
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Manejar botón cerrar
document.getElementById('btn-cerrar').addEventListener('click', () => {
  window.electronAPI.cerrarVentanaHistorial();
});
