// Lógica de selección de archivos y generación de DOCX (estructura base)
document.addEventListener('DOMContentLoaded', () => {
  const inputTurnos = document.getElementById('input-turnos');
  const btnTurnos = document.getElementById('btn-turnos');
  const inputUsuario = document.getElementById('input-usuario');
  const btnUsuario = document.getElementById('btn-usuario');
  const inputPlantilla = document.getElementById('input-plantilla');
  const btnPlantilla = document.getElementById('btn-plantilla');
  const btnCerrar = document.getElementById('btn-cerrar');
  const mensaje = document.getElementById('mensaje-resultado');
  const btnPlantillaSeleccionar = document.getElementById('btn-plantilla-seleccionar');
  const btnGenerar = document.getElementById('btn-generar');
  const btnAbrirCarpeta = document.getElementById('btn-abrir-carpeta');
  // Año y meses
  const anioActualSpan = document.getElementById('anio-actual');
  const btnAnioPrev = document.getElementById('btn-anio-prev');
  const btnAnioNext = document.getElementById('btn-anio-next');
  const listaMeses = document.getElementById('lista-meses');

  // Estado de año y meses
  let anioActual = new Date().getFullYear();
  let mesesSeleccionados = [];
  const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  function renderMeses() {
    listaMeses.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const mesDiv = document.createElement('div');
      mesDiv.className = 'generar-mes-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `mes-${i}`;
      checkbox.value = i + 1;
      checkbox.checked = mesesSeleccionados.includes(i + 1);
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          mesesSeleccionados.push(i + 1);
        } else {
          mesesSeleccionados = mesesSeleccionados.filter(m => m !== (i + 1));
        }
      });
      const label = document.createElement('label');
      label.htmlFor = `mes-${i}`;
      label.textContent = NOMBRES_MESES[i];
      mesDiv.appendChild(checkbox);
      mesDiv.appendChild(label);
      listaMeses.appendChild(mesDiv);
    }
  }

  function actualizarAnio(delta) {
    anioActual += delta;
    anioActualSpan.textContent = anioActual;
    // Opcional: resetear meses seleccionados al cambiar de año
    // mesesSeleccionados = [];
    renderMeses();
  }

  btnAnioPrev.addEventListener('click', () => actualizarAnio(-1));
  btnAnioNext.addEventListener('click', () => actualizarAnio(1));
  anioActualSpan.textContent = anioActual;
  renderMeses();

  // Selección de archivo de usuario
  btnUsuario.addEventListener('click', async () => {
    if (window.electronAPI?.openFileWithFilter) {
      const filePath = await window.electronAPI.openFileWithFilter([
        { name: 'Archivos JSON', extensions: ['json'] }
      ]);
      if (filePath) {
        inputUsuario.value = filePath;
        // Guardar la ruta seleccionada
        if (window.electronAPI?.saveRutaDatosUsuario) {
          await window.electronAPI.saveRutaDatosUsuario(filePath);
        }
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

  // Al cargar, intentar recuperar la última ruta de datosusuario.json
  (async () => {
    if (window.electronAPI?.getRutaDatosUsuario) {
      const ruta = await window.electronAPI.getRutaDatosUsuario();
      if (ruta) inputUsuario.value = ruta;
    }
  })();

  // Botón abrir carpeta destino
  btnAbrirCarpeta.addEventListener('click', async () => {
    if (window.electronAPI?.getRutaDestino) {
      const ruta = await window.electronAPI.getRutaDestino();
      if (ruta) {
        window.electronAPI?.abrirEnFinder?.(ruta);
      }
    }
  });

  // Generar DOCX con año y meses seleccionados
  btnGenerar.addEventListener('click', async () => {
    mensaje.textContent = '';
    const rutaUsuario = inputUsuario.value;
    const rutaPlantilla = inputPlantilla.value;
    if (!rutaUsuario || !rutaPlantilla) {
      mensaje.textContent = 'Selecciona archivo de usuario y plantilla.';
      return;
    }
    if (mesesSeleccionados.length === 0) {
      mensaje.textContent = 'Selecciona al menos un mes.';
      return;
    }
    mensaje.textContent = 'Generando documento...';
    
    // Cargar datos de turnos desde los archivos JSON generados por mes/año
    try {
      let todosLosTurnos = [];
      for (const mes of mesesSeleccionados) {
        const nombreMes = NOMBRES_MESES[mes - 1].toLowerCase();
        const datosMes = await window.electronAPI.leerTurnosMes(nombreMes, anioActual);
        if (datosMes && datosMes.ok && datosMes.datos) {
          todosLosTurnos = todosLosTurnos.concat(datosMes.datos);
        }
      }
      
      if (todosLosTurnos.length === 0) {
        mensaje.textContent = 'No hay datos CREADO un arcchivo para los meses seleccionados.';
        return;
      }

      // Crear archivo temporal con todos los turnos
      const tempPath = await window.electronAPI.guardarTurnos(todosLosTurnos, 'temp', anioActual);
      const rutaTurnos = typeof tempPath === 'string' ? tempPath : (tempPath?.ruta || '');
      if (!rutaTurnos) {
        mensaje.textContent = 'No se pudo guardar el archivo temporal de turnos.';
        return;
      }
      const resultado = await window.electronAPI.generarDocx({
        rutaTurnos,
        rutaUsuario,
        rutaPlantilla,
        anio: anioActual,
        meses: mesesSeleccionados
      });
      
      if (resultado.ok) {
        mensaje.textContent = 'Documento generado correctamente: ' + resultado.nombre;
      } else {
        mensaje.textContent = 'Error: ' + resultado.msg;
      }
    } catch (error) {
      mensaje.textContent = 'Error al cargar datos de turnos: ' + error.message;
    }
  });
});
