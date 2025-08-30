// Cargar datos guardados al abrir el formulario
document.addEventListener('DOMContentLoaded', async function() {
  if (window.electronAPI?.getDatosUsuario) {
    const datos = await window.electronAPI.getDatosUsuario();
    if (datos) {
      document.getElementById('nif').value = datos.nif || '';
      document.getElementById('cognom').value = datos.cognom || '';
      document.getElementById('nom').value = datos.nom || '';
      document.getElementById('vehiculo').value = datos.vehiculo || '';
      document.getElementById('matricula').value = datos.matricula || '';
      document.getElementById('mitja').value = datos.mitja || '';
      document.getElementById('km').value = datos.km || '';
    }
  }
});
document.getElementById('form-usuario')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const data = {
    nif: document.getElementById('nif').value,
    cognom: document.getElementById('cognom').value,
    nom: document.getElementById('nom').value,
    vehiculo: document.getElementById('vehiculo').value,
    matricula: document.getElementById('matricula').value,
    mitja: document.getElementById('mitja').value,
    km: document.getElementById('km').value
  };
  if (window.electronAPI?.saveDatosUsuario) {
    await window.electronAPI.saveDatosUsuario(data);
    alert('Datos guardados correctamente');
  }
});
