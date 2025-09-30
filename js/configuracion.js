// --- TURNOS ---
document.addEventListener('DOMContentLoaded', () => {
  // Cambiar pestañas
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabContents.forEach(tc => tc.classList.add('hidden'));
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  // Guardar turnos hhjhj
  const formTurnos = document.getElementById('form-turnos');
  if (formTurnos) {
    formTurnos.addEventListener('submit', async (e) => {
      e.preventDefault();
      const manana_inicio = document.getElementById('manana_inicio').value;
      const manana_fin = document.getElementById('manana_fin').value;
      const tarde_inicio = document.getElementById('tarde_inicio').value;
      const tarde_fin = document.getElementById('tarde_fin').value;
      const noche_inicio = document.getElementById('noche_inicio').value;
      const noche_fin = document.getElementById('noche_fin').value;
      const turnos = {
        manana: { inicio: manana_inicio, fin: manana_fin },
        tarde: { inicio: tarde_inicio, fin: tarde_fin },
        noche: { inicio: noche_inicio, fin: noche_fin }
      };
      if (window.electronAPI?.saveTurnos) {
        const ok = await window.electronAPI.saveTurnos(turnos);
        document.getElementById('mensaje-turnos').textContent = ok ? 'Turnos guardados correctamente' : 'Error al guardar turnos';
      }
    });
  }

  // Mostrar turnos guardados al cargar
  if (window.electronAPI?.getTurnos) {
    window.electronAPI.getTurnos().then(turnos => {
      if (turnos) {
        document.getElementById('manana_inicio').value = turnos.manana?.inicio || '';
        document.getElementById('manana_fin').value = turnos.manana?.fin || '';
        document.getElementById('tarde_inicio').value = turnos.tarde?.inicio || '';
        document.getElementById('tarde_fin').value = turnos.tarde?.fin || '';
        document.getElementById('noche_inicio').value = turnos.noche?.inicio || '';
        document.getElementById('noche_fin').value = turnos.noche?.fin || '';
      }
    });
  }
});

// Función para validar rutas visualmente
const validarRuta = async (inputId) => {
  const input = document.getElementById(inputId);
  if (!input || !input.value) return;
  
  try {
    // Enviar la ruta al main process para validarla
    const esValida = await window.electronAPI.validarRuta?.(input.value);
    
    if (esValida) {
      input.style.borderColor = '#4caf50';
      input.style.backgroundColor = '#f1f8e9';
    } else {
      input.style.borderColor = '#f44336';
      input.style.backgroundColor = '#ffebee';
    }
  } catch (error) {
    console.error('Error al validar ruta:', error);
    input.style.borderColor = '#f44336';
    input.style.backgroundColor = '#ffebee';
  }
};

// Selección y guardado de rutas de plantilla dotx y carpeta de destino
document.addEventListener('DOMContentLoaded', () => {
  // Selección archivo dotx/docx
  const btnOriginal = document.getElementById('btn-original');
  btnOriginal?.addEventListener('click', async () => {
    try {
      if (window.electronAPI?.openFile) {
        const filePath = await window.electronAPI.openFile();
        if (filePath) {
          document.getElementById('original-path').value = filePath;
          if (window.electronAPI?.saveRutaDotx) {
            await window.electronAPI.saveRutaDotx(filePath);
          }
          // Validar la ruta después de seleccionarla
          await validarRuta('original-path');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
    }
  });
  
  // Selección carpeta destino
  const btnDestino = document.getElementById('btn-destino');
  btnDestino?.addEventListener('click', async () => {
    try {
      if (window.electronAPI?.openFolder) {
        const folderPath = await window.electronAPI.openFolder();
        if (folderPath) {
          document.getElementById('destino-path').value = folderPath;
          if (window.electronAPI?.saveRutaDestino) {
            await window.electronAPI.saveRutaDestino(folderPath);
          }
          // Validar la ruta después de seleccionarla
          await validarRuta('destino-path');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar carpeta:', error);
    }
  });

  // Selección carpeta DOCX
  const btnDocx = document.getElementById('btn-docx');
  btnDocx?.addEventListener('click', async () => {
    try {
      if (window.electronAPI?.openFolder) {
        const folderPath = await window.electronAPI.openFolder();
        if (folderPath) {
          document.getElementById('docx-path').value = folderPath;
          if (window.electronAPI?.saveRutaDocx) {
            await window.electronAPI.saveRutaDocx(folderPath);
          }
          // Validar la ruta después de seleccionarla
          await validarRuta('docx-path');
        }
      }
    } catch (error) {
      console.error('Error al seleccionar carpeta DOCX:', error);
    }
  });

  // Mostrar rutas guardadas al cargar
  (async () => {
    if (window.electronAPI?.getRutaDotx) {
      const rutaDotx = await window.electronAPI.getRutaDotx();
      if (rutaDotx) {
        document.getElementById('original-path').value = rutaDotx;
        // Validar la ruta cargada
        setTimeout(() => validarRuta('original-path'), 100);
      }
    }
    if (window.electronAPI?.getRutaDestino) {
      const rutaDestino = await window.electronAPI.getRutaDestino();
      if (rutaDestino) {
        document.getElementById('destino-path').value = rutaDestino;
        // Validar la ruta cargada
        setTimeout(() => validarRuta('destino-path'), 100);
      }
    }
    if (window.electronAPI?.getRutaDocx) {
      const rutaDocx = await window.electronAPI.getRutaDocx();
      if (rutaDocx) {
        document.getElementById('docx-path').value = rutaDocx;
        // Validar la ruta cargada
        setTimeout(() => validarRuta('docx-path'), 100);
      }
    }
  })();
});
// Al cargar la pestaña kilometraje, mostrar el valor guardado
document.addEventListener('DOMContentLoaded', async () => {
  if (window.electronAPI?.getUnidadPorKm) {
    const unidadInput = document.getElementById('unidad-km');
    const valor = await window.electronAPI.getUnidadPorKm();
    if (unidadInput && valor) {
      unidadInput.value = valor;
    }
  }
});
// Guardar UNIDAD POR KM al pulsar el botón
document.addEventListener('DOMContentLoaded', () => {
  const btnGuardarKm = document.getElementById('btn-guardar-km');
  const unidadInput = document.getElementById('unidad-km');
  if (btnGuardarKm && unidadInput) {
    btnGuardarKm.addEventListener('click', () => {
      const valor = unidadInput.value;
      if (window.electronAPI?.saveUnidadPorKm) {
        window.electronAPI.saveUnidadPorKm(valor);
        btnGuardarKm.textContent = 'Guardado';
        setTimeout(() => { btnGuardarKm.textContent = 'Guardar'; }, 1200);
      }
    });
  }
});
// Guardar UNIDAD POR KM en archivo JSON
document.addEventListener('DOMContentLoaded', () => {
  const unidadInput = document.getElementById('unidad-km');
  if (unidadInput) {
    unidadInput.addEventListener('change', () => {
      const valor = unidadInput.value;
      if (window.electronAPI?.saveUnidadPorKm) {
        window.electronAPI.saveUnidadPorKm(valor);
      }
    });
  }
});
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const tab = this.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(tc => {
      tc.classList.add('hidden');
    });
    document.getElementById(tab)?.classList.remove('hidden');
  });
});

// Manejar botón cerrar
document.getElementById('btn-cerrar').addEventListener('click', () => {
  window.close();
});


