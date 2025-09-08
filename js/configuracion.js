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
        }
      }
    } catch (error) {
      console.error('Error al seleccionar carpeta:', error);
    }
  });

  // Mostrar rutas guardadas al cargar
  (async () => {
    if (window.electronAPI?.getRutaDotx) {
      const rutaDotx = await window.electronAPI.getRutaDotx();
      if (rutaDotx) {
        document.getElementById('original-path').value = rutaDotx;
      }
    }
    if (window.electronAPI?.getRutaDestino) {
      const rutaDestino = await window.electronAPI.getRutaDestino();
      if (rutaDestino) {
        document.getElementById('destino-path').value = rutaDestino;
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


