document.getElementById('btn-generar')?.addEventListener('click', () => {
  if (window.electronAPI?.openGenerarWindow) {
    window.electronAPI.openGenerarWindow();
  }
});
document.getElementById('btn-crear')?.addEventListener('click', () => {
  // Lógica para abrir ventana de creación
  if (window.electronAPI?.openCrearWindow) {
    window.electronAPI.openCrearWindow();
  }
});

document.getElementById('btn-configuracion')?.addEventListener('click', () => {
  // Abrir ventana de configuración usando Electron API
  if (window.electronAPI && window.electronAPI.openConfigWindow) {
    window.electronAPI.openConfigWindow();
  } else {
    mostrarModalMensaje('No se pudo abrir la ventana de configuración.', 'error');
  }
});

document.getElementById('btn-historial')?.addEventListener('click', () => {
  if (window.electronAPI?.openHistorialWindow) {
    window.electronAPI.openHistorialWindow();
  } else {
    mostrarModalMensaje('No se pudo abrir la ventana de historial.', 'error');
  }
});

document.getElementById('btn-datosusuario')?.addEventListener('click', () => {
  if (window.electronAPI?.openDatosUsuarioWindow) {
    window.electronAPI.openDatosUsuarioWindow();
  } else {
    mostrarModalMensaje('No se pudo abrir la ventana de datos de usuario.', 'error');
  }
});

document.getElementById('btn-cerrar')?.addEventListener('click', () => {
  window.close();
});
