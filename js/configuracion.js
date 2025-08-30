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

// Sección: Dirección del archivo original
document.addEventListener('DOMContentLoaded', () => {
  const btnOriginal = document.getElementById('btn-original');
  btnOriginal?.addEventListener('click', async () => {
    if (window.electronAPI?.selectFile) {
      const filePath = await window.electronAPI.selectFile();
      if (filePath) {
  document.getElementById('original-path').value = filePath;
      }
    }
  });

  // Sección: Dirección de guardado
  const btnDestino = document.getElementById('btn-destino');
  btnDestino?.addEventListener('click', async () => {
    if (window.electronAPI?.selectFolder) {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
  document.getElementById('destino-path').value = folderPath;
      }
    }
  });
});
