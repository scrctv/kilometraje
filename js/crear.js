// Lógica para el selector de mes y renderizado de días

document.addEventListener('DOMContentLoaded', () => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  let fechaActual = new Date();
  let mes = fechaActual.getMonth();
  let anio = fechaActual.getFullYear();

  const mesActualSpan = document.getElementById('mes-actual');
  const diasMesDiv = document.getElementById('dias-mes');
  const btnPrev = document.getElementById('mes-prev');
  const btnNext = document.getElementById('mes-next');

  async function cargarDatosMes() {
    const resultado = await window.electronAPI.leerTurnosMes(meses[mes], anio);
    selecciones = {};
    if (resultado.ok && Array.isArray(resultado.datos)) {
      resultado.datos.forEach(item => {
        if (!selecciones[item.fecha]) selecciones[item.fecha] = { manana: false, tarde: false, noche: false };
        selecciones[item.fecha][item.turno] = true;
      });
      document.getElementById('turnos-listado-msg')?.remove();
    } else {
      // Mostrar mensaje en el listado
      selecciones = {};
      renderListado();
      if (!document.getElementById('turnos-listado-msg')) {
        const msg = document.createElement('div');
        msg.id = 'turnos-listado-msg';
        msg.style = 'color:#b71c1c;text-align:center;margin:10px 0 0 0;font-size:1em;';
        msg.textContent = 'No hay datos guardados para este mes.';
        document.querySelector('.crear-left-container').appendChild(msg);
      }
    }
  }

  async function renderMes() {
    mesActualSpan.textContent = `${meses[mes]} ${anio}`;
    await cargarDatosMes();
    renderDias();
    renderListado();
  }

  // Estado de selecciones: { 'YYYY-MM-DD': { manana: true, tarde: false, noche: true } }
  let selecciones = {};
  const turnos = ['mañana', 'tarde', 'noche'];

  function renderDias() {
    diasMesDiv.innerHTML = '';
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1);
    let diaSemana = primerDia.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana; // 1=lunes, 7=domingo
    let semana = document.createElement('div');
    semana.className = 'semana-row';
    for (let i = 1; i < diaSemana; i++) {
      const empty = document.createElement('div');
      empty.className = 'dia-container empty';
      semana.appendChild(empty);
    }
    for (let d = 1; d <= diasEnMes; d++) {
      // Crear fecha directamente en formato DD-MM-AAAA
      const yyyy = anio;
      const mm = String(mes + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const fechaKey = `${dd}-${mm}-${yyyy}`;
      // Crear Date solo para obtener el día de la semana
      const fecha = new Date(anio, mes, d);
      let diaCont = document.createElement('div');
      diaCont.className = 'dia-container';
      const diaSemanaNombre = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
      // Renderizar celdas de turnos
      let row = document.createElement('div');
      row.className = 'dia-content-row';
      turnos.forEach((turno, idx) => {
        let cell = document.createElement('div');
        cell.className = 'dia-content-cell';
        cell.textContent = turno.charAt(0).toUpperCase();
        if (selecciones[fechaKey] && selecciones[fechaKey][turno]) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', () => {
          if (!selecciones[fechaKey]) selecciones[fechaKey] = { manana: false, tarde: false, noche: false };
          // Si ya hay otro turno seleccionado para ese día y se intenta seleccionar otro
          const yaSeleccionado = Object.entries(selecciones[fechaKey]).find(([t, v]) => v && t !== turno);
          if (!selecciones[fechaKey][turno] && yaSeleccionado) {
            alert('Solo se puede seleccionar un turno por día. Elimine el turno ya seleccionado para poder marcar otro.');
            return;
          }
          selecciones[fechaKey][turno] = !selecciones[fechaKey][turno];
          renderDias();
          renderListado();
        });
        row.appendChild(cell);
      });
      diaCont.innerHTML = `<div class="dia-header">${d} <span style="font-size:0.9em;color:#cce;">${diaSemanaNombre}</span></div>`;
      diaCont.appendChild(row);
      semana.appendChild(diaCont);
      if (fecha.getDay() === 0 || d === diasEnMes) {
        if (d === diasEnMes && fecha.getDay() !== 0) {
          for (let j = fecha.getDay() + 1; j <= 7; j++) {
            const empty = document.createElement('div');
            empty.className = 'dia-container empty';
            semana.appendChild(empty);
          }
        }
        diasMesDiv.appendChild(semana);
        semana = document.createElement('div');
        semana.className = 'semana-row';
      }
    }
  }

  async function renderResumenKM() {
    // Contar días únicos trabajados
    const diasUnicos = new Set();
    Object.keys(selecciones).forEach(fechaKey => {
      if (Object.values(selecciones[fechaKey]).some(v => v)) {
        diasUnicos.add(fechaKey);
      }
    });
    const diasTrabajados = diasUnicos.size;
    // Leer unidad por km
    let euros = 0;
    if (window.electronAPI.getUnidadPorKm) {
      const valor = await window.electronAPI.getUnidadPorKm();
      euros = Number(valor) * diasTrabajados;
    }
    const resumenDiv = document.getElementById('resumen-km');
    resumenDiv.innerHTML = `<span>Días trabajados: <b>${diasTrabajados}</b></span> <span>EUROS: <b>${euros.toFixed(2)}</b></span>`;
  }

  function renderListado() {
    // Eliminar mensaje de "no hay datos" si existe y hay algún apunte
    const msg = document.getElementById('turnos-listado-msg');
    // Ordenar por fecha
    const multicol = document.getElementById('turnos-listado-multicol');
    if (!multicol) return;
    const cols = multicol.querySelectorAll('ul.turnos-listado');
    cols.forEach(col => col.innerHTML = '');
    const apuntes = [];
    const fechas = Object.keys(selecciones).sort();
    fechas.forEach(fechaKey => {
      turnos.forEach(turno => {
        if (selecciones[fechaKey][turno]) {
          // Parsear fecha en formato DD-MM-YYYY
          const [dia, mesNum, anio] = fechaKey.split('-');
          const mesNombre = meses[parseInt(mesNum) - 1];
          const texto = `${dia} ${mesNombre} (${turno})`;
          apuntes.push(texto);
        }
      });
    });
    if (apuntes.length > 0 && msg) msg.remove();
    // Repartir en columnas
    for (let i = 0; i < apuntes.length; i++) {
      const colIdx = Math.floor(i / 12);
      if (colIdx < cols.length) {
        const li = document.createElement('li');
        li.textContent = apuntes[i];
        cols[colIdx].appendChild(li);
      }
    }
    renderResumenKM();
  }

  btnPrev.addEventListener('click', () => {
    mes--;
    if (mes < 0) {
      mes = 11;
      anio--;
    }
    renderMes();
  });
  btnNext.addEventListener('click', () => {
    mes++;
    if (mes > 11) {
      mes = 0;
      anio++;
    }
    renderMes();
  });

  renderMes();

  // Botón Guardar
  document.getElementById('btn-guardar').addEventListener('click', async () => {
    // Generar estructura de datos para guardar
    const datos = [];
    const fechas = Object.keys(selecciones).sort();
    fechas.forEach(fechaKey => {
      // Solo guardar si hay algún turno seleccionado para esa fecha
      if (Object.values(selecciones[fechaKey]).some(v => v)) {
        turnos.forEach(turno => {
          if (selecciones[fechaKey][turno]) {
            datos.push({ fecha: fechaKey, turno });
          }
        });
      }
    });
    if (datos.length === 0) {
      alert('No hay turnos seleccionados para guardar.');
      return;
    }
    const resultado = await window.electronAPI.guardarTurnos(datos, meses[mes], anio);
    if (resultado.ok) {
      alert('Guardado correctamente.');
    } else {
      alert('No se pudo guardar: ' + resultado.msg);
    }
  });

  // Botón Salir
  document.getElementById('btn-salir').addEventListener('click', () => {
    window.electronAPI.cerrarVentana();
  });
});
