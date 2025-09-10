// Modal de mensajes reutilizable para éxito, error, info y confirmación
function mostrarModalMensaje(texto, tipo = 'info', tiempo = 15000) {
  let modal = document.getElementById('modal-mensaje-km');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'modal-mensaje-km';
  modal.className = 'modal-mensaje-km ' + tipo;
  modal.innerHTML = `
    <div class="modal-mensaje-km-content">
      <span class="modal-mensaje-km-text">${texto}</span>
      <button class="modal-mensaje-km-btn">Aceptar</button>
    </div>
  `;
  document.body.appendChild(modal);
  const btn = modal.querySelector('.modal-mensaje-km-btn');
  let timeout = setTimeout(() => {
    modal.remove();
  }, tiempo);
  btn.addEventListener('click', () => {
    clearTimeout(timeout);
    modal.remove();
  });
}

// Modal de confirmación con botones Sí/No
function mostrarModalConfirmacion(texto, onConfirm, onCancel) {
  let modal = document.getElementById('modal-mensaje-km');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'modal-mensaje-km';
  modal.className = 'modal-mensaje-km info';
  modal.innerHTML = `
    <div class="modal-mensaje-km-content">
      <span class="modal-mensaje-km-text">${texto}</span>
      <div class="modal-mensaje-km-buttons">
        <button class="modal-mensaje-km-btn btn-confirm">Sí</button>
        <button class="modal-mensaje-km-btn btn-cancel">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const btnConfirm = modal.querySelector('.btn-confirm');
  const btnCancel = modal.querySelector('.btn-cancel');
  
  btnConfirm.addEventListener('click', () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });
  
  btnCancel.addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });
}

window.mostrarModalMensaje = mostrarModalMensaje;
window.mostrarModalConfirmacion = mostrarModalConfirmacion;
