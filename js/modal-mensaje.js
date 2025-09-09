// Modal de mensajes reutilizable para éxito y error
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
window.mostrarModalMensaje = mostrarModalMensaje;
