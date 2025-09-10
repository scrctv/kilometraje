// Cargar datos guardados al abrir el formulario
document.addEventListener('DOMContentLoaded', async function() {
  // Inicializar todos los checks deseleccionados por defecto
  [
    'comissio', 'curs', 'trasllat', 'sessions', 'altres',
  'vehicleoficial', 'avio', 'tren', 'vehicleparticular', 'altre', 'alojamiento', 'restauracion', 'otros_tipos'
  ].forEach(id => {
    document.getElementById(id).checked = false;
  });
  // Inicializar radios pagament deseleccionados
  document.getElementById('pagament_si').checked = false;
  document.getElementById('pagament_no').checked = false;

  if (window.electronAPI?.getDatosUsuario) {
    const datos = await window.electronAPI.getDatosUsuario();
    if (datos) {
      document.getElementById('nif').value = datos.nif || '';
      document.getElementById('nom').value = datos.nom || '';
      document.getElementById('cognoms').value = datos.cognoms || '';
      document.getElementById('grup').value = datos.grup || '';
      document.getElementById('nivell').value = datos.nivell || '';
      document.getElementById('departament').value = datos.departament || '';
      document.getElementById('conselleria').value = datos.conselleria || '';
      // Checks B
      document.getElementById('comissio').checked = datos.comissio === '☒';
      document.getElementById('curs').checked = datos.curs === '☒';
      document.getElementById('trasllat').checked = datos.trasllat === '☒';
      document.getElementById('sessions').checked = datos.sessions === '☒';
      document.getElementById('altres').checked = datos.altres === '☒';
      document.getElementById('detall').value = datos.detall || '';
      // Checks C
  document.getElementById('vehicleoficial').checked = datos.vehicleoficial === '☒';
  document.getElementById('avio').checked = datos.avio === '☒';
  document.getElementById('tren').checked = datos.tren === '☒';
  document.getElementById('vehicleparticular').checked = datos.vehicleparticular === '☒';
  document.getElementById('altre').checked = datos.altre === '☒';
  document.getElementById('alojamiento').checked = datos.alojamiento === '☒';
  document.getElementById('restauracion').checked = datos.restauracion === '☒';
  document.getElementById('otros_tipos').checked = datos.otros_tipos === '☒';
      document.getElementById('otro').value = datos.otro || '';
      document.getElementById('marca').value = datos.marca || '';
      document.getElementById('matricula').value = datos.matricula || '';
      document.getElementById('peatge').value = datos.peatge || '';
      // Radios
      document.getElementById('pagament_si').checked = datos.pagament_si === '☒';
      document.getElementById('pagament_no').checked = datos.pagament_no === '☒';
      // Cargos
      document.getElementById('cargo1').value = datos.cargo1 || '';
      document.getElementById('nifcargo1').value = datos.nifcargo1 || '';
      document.getElementById('nombrecargo1').value = datos.nombrecargo1 || '';
      document.getElementById('cargo2').value = datos.cargo2 || '';
      document.getElementById('nifcargo2').value = datos.nifcargo2 || '';
      document.getElementById('nombrecargo2').value = datos.nombrecargo2 || '';
  document.getElementById('mitja').value = datos.mitja || '';
  document.getElementById('km').value = datos.km || '';
  document.getElementById('itinerario').value = datos.itinerario || '';
    }
  }
});

document.getElementById('form-usuario')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  // Validación apartado B: al menos un check y detalle obligatorio
  const checksB = [
    document.getElementById('comissio'),
    document.getElementById('curs'),
    document.getElementById('trasllat'),
    document.getElementById('sessions'),
    document.getElementById('altres')
  ];
  const algunoMarcadoB = checksB.some(chk => chk.checked);
  const detalle = document.getElementById('detall').value.trim();
  if (!algunoMarcadoB) {
    alert('Debes marcar al menos un motivo en el apartado B.');
    return;
  }
  if (!detalle) {
    alert('El campo DETALL DELS MOTIUS es obligatorio.');
    document.getElementById('detall').focus();
    return;
  }
  // Validación apartado C: uno de los checks y pagament obligatorio
  const checksC = [
    document.getElementById('vehicleoficial'),
    document.getElementById('avio'),
    document.getElementById('tren'),
    document.getElementById('vehicleparticular'),
    document.getElementById('altre'),
    document.getElementById('alojamiento'),
    document.getElementById('restauracion'),
    document.getElementById('otros_tipos')
  ];
  const algunoMarcadoC = checksC.some(chk => chk.checked);
  const pagamentSi = document.getElementById('pagament_si').checked;
  const pagamentNo = document.getElementById('pagament_no').checked;
  if (!algunoMarcadoC) {
    alert('Debes marcar al menos un medio de transporte en el apartado C.');
    return;
  }
  if (!pagamentSi && !pagamentNo) {
    alert('Debes seleccionar SI o NO en PAGAMENT ANTICIPAR.');
    return;
  }
  // Validación campos obligatorios de cargos y marca/matricula si vehicle particular
  const obligatorios = [
    { id: 'cargo1', label: 'CARGO 1' },
    { id: 'nifcargo1', label: 'NIF CARGO 1' },
    { id: 'nombrecargo1', label: 'NOMBRE CARGO 1' },
    { id: 'cargo2', label: 'CARGO 2' },
    { id: 'nifcargo2', label: 'NIF CARGO 2' },
    { id: 'nombrecargo2', label: 'NOMBRE CARGO 2' }
  ];
  // Si vehicle particular está marcado, marca y matrícula obligatorios
  if (document.getElementById('vehicleparticular').checked) {
    obligatorios.push({ id: 'marca', label: 'MARCA' });
    obligatorios.push({ id: 'matricula', label: 'MATRÍCULA' });
  }
  for (const campo of obligatorios) {
    if (!document.getElementById(campo.id).value.trim()) {
      alert(`El campo ${campo.label} es obligatorio.`);
      document.getElementById(campo.id).focus();
      return;
    }
  }
  // Guardar datos
  // Validación departament y conselleria/organisme obligatorios
  const departament = document.getElementById('departament').value.trim();
  const conselleria = document.getElementById('conselleria').value.trim();
  if (!departament) {
    alert('El campo DEPARTAMENT es obligatorio.');
    document.getElementById('departament').focus();
    return;
  }
  if (!conselleria) {
    alert('El campo CONSELLERIA/ORGANISME es obligatorio.');
    document.getElementById('conselleria').focus();
    return;
  }
  const data = {
    nif: document.getElementById('nif').value,
    nom: document.getElementById('nom').value,
    cognoms: document.getElementById('cognoms').value,
    grup: document.getElementById('grup').value,
    nivell: document.getElementById('nivell').value,
    departament,
    conselleria,
    // Checks B
  comissio: document.getElementById('comissio').checked ? '☒' : '☐',
  curs: document.getElementById('curs').checked ? '☒' : '☐',
  trasllat: document.getElementById('trasllat').checked ? '☒' : '☐',
  sessions: document.getElementById('sessions').checked ? '☒' : '☐',
  altres: document.getElementById('altres').checked ? '☒' : '☐',
    detall: detalle,
    // Checks C
  vehicleoficial: document.getElementById('vehicleoficial').checked ? '☒' : '☐',
  avio: document.getElementById('avio').checked ? '☒' : '☐',
  tren: document.getElementById('tren').checked ? '☒' : '☐',
  vehicleparticular: document.getElementById('vehicleparticular').checked ? '☒' : '☐',
  altre: document.getElementById('altre').checked ? '☒' : '☐',
  alojamiento: document.getElementById('alojamiento').checked ? '☒' : '☐',
  restauracion: document.getElementById('restauracion').checked ? '☒' : '☐',
  otros_tipos: document.getElementById('otros_tipos').checked ? '☒' : '☐',
    otro: document.getElementById('otro').value,
    marca: document.getElementById('marca').value,
    matricula: document.getElementById('matricula').value,
    peatge: document.getElementById('peatge').value,
  pagament_si: pagamentSi ? '☒' : '☐',
  pagament_no: pagamentNo ? '☒' : '☐',
  cargo1: document.getElementById('cargo1').value,
  nifcargo1: document.getElementById('nifcargo1').value,
  nombrecargo1: document.getElementById('nombrecargo1').value,
  cargo2: document.getElementById('cargo2').value,
  nifcargo2: document.getElementById('nifcargo2').value,
  nombrecargo2: document.getElementById('nombrecargo2').value,
  itinerario: document.getElementById('itinerario').value,
  mitja: document.getElementById('mitja').value,
  km: document.getElementById('km').value
  };
  if (window.electronAPI?.saveDatosUsuario) {
    await window.electronAPI.saveDatosUsuario(data);
    const cerrarVentana = () => {
      if (window.electronAPI?.cerrarVentanaDatosUsuario) {
        window.electronAPI.cerrarVentanaDatosUsuario();
      }
    };
    const handler = function(e) {
      if (e.target && e.target.classList.contains('modal-mensaje-km-btn')) {
        cerrarVentana();
        document.removeEventListener('click', handler);
      }
    };
    if (typeof mostrarModalMensaje === 'function') {
      mostrarModalMensaje('Datos guardados correctamente', 'success');
      document.addEventListener('click', handler);
    } else if (window.mostrarModalMensaje) {
      window.mostrarModalMensaje('Datos guardados correctamente', 'success');
      document.addEventListener('click', handler);
    } else {
      alert('Datos guardados correctamente');
      cerrarVentana();
    }
  }
});

// Botón cerrar ventana
if (document.getElementById('btn-cerrar')) {
  document.getElementById('btn-cerrar').addEventListener('click', () => {
    window.close();
  });
}
