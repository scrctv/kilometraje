// Lógica de selección de archivos y generación de DOCX (estructura base)
document.addEventListener('DOMContentLoaded', () => {
  const inputTurnos = document.getElementById('input-turnos');
  const btnTurnos = document.getElementById('btn-turnos');
  const inputUsuario = document.getElementById('input-usuario');
  const btnUsuario = document.getElementById('btn-usuario');
  const inputPlantilla = document.getElementById('input-plantilla');
  const btnPlantilla = document.getElementById('btn-plantilla');
  const btnCerrar = document.getElementById('btn-cerrar');
  const form = document.getElementById('form-generar-docx');
  const mensaje = document.getElementById('mensaje-resultado');

  // Selección de archivo de turnos
  btnTurnos.addEventListener('click', async () => {
    if (window.electronAPI?.openFileWithFilter) {
      const filePath = await window.electronAPI.openFileWithFilter([
        { name: 'Archivos JSON', extensions: ['json'] }
      ]);
      if (filePath) inputTurnos.value = filePath;
    }
  });
  // Selección de archivo de usuario
  btnUsuario.addEventListener('click', async () => {
    if (window.electronAPI?.openFileWithFilter) {
      const filePath = await window.electronAPI.openFileWithFilter([
        { name: 'Archivos JSON', extensions: ['json'] }
      ]);
      if (filePath) {
        inputUsuario.value = filePath;
      }
    }
  });
  // Mostrar ruta de plantilla (por defecto)
  (async () => {
    if (window.electronAPI?.getRutaDotx) {
      const ruta = await window.electronAPI.getRutaDotx();
      inputPlantilla.value = ruta || '';
    }
  })();
  // Seleccionar plantilla DOCX/DOTX
  const btnPlantillaSeleccionar = document.getElementById('btn-plantilla-seleccionar');
  btnPlantillaSeleccionar.addEventListener('click', async () => {
    if (window.electronAPI?.openFileWithFilter) {
      const filePath = await window.electronAPI.openFileWithFilter([
        { name: 'Plantillas Word', extensions: ['docx', 'dotx'] }
      ]);
      if (filePath) inputPlantilla.value = filePath;
    }
  });
  // Botón ver plantilla (abrir ubicación)
  btnPlantilla.addEventListener('click', () => {
    if (inputPlantilla.value) {
      window.electronAPI?.abrirEnFinder?.(inputPlantilla.value);
    }
  });
  // Botón cerrar
  btnCerrar.addEventListener('click', () => {
    window.electronAPI.cerrarVentanaGenerar?.();
  });
  // Enviar formulario para generar DOCX
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensaje.textContent = '';
    const rutaTurnos = inputTurnos.value;
    const rutaUsuario = inputUsuario.value;
    const rutaPlantilla = inputPlantilla.value;
    if (!rutaTurnos || !rutaUsuario || !rutaPlantilla) {
      mensaje.textContent = 'Selecciona todos los archivos necesarios.';
      return;
    }
    mensaje.textContent = 'Generando documento...';
    const resultado = await window.electronAPI.generarDocx({
      rutaTurnos,
      rutaUsuario,
      rutaPlantilla
    });
    if (resultado.ok) {
      mensaje.textContent = 'Documento generado correctamente: ' + resultado.nombre;
    } else {
      mensaje.textContent = 'Error: ' + resultado.msg;
    }
  });
});
