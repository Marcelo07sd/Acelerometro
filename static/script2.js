// Variables globales
let activo = false;
let tiempo = 0;
let intervalo;
let valoresX = [], valoresY = [], valoresZ = [];
let datosCSV = [];
let umbrales = {
  lavadora: 8,
  licuadora: 12
};
const intervaloMuestreo = 10; // 10 ms
let tiempoInicio = 0;
let posX = 0, posY = 0, posZ = 0;

// Elementos UI
const xSpan = document.getElementById('xVal');
const ySpan = document.getElementById('yVal');
const zSpan = document.getElementById('zVal');
const tiempoSpan = document.getElementById('tiempo');
const alerta = document.getElementById('alerta');
const nivel = document.getElementById('nivel');
const sonidoAlerta = document.getElementById('sonidoAlerta');

// Configuración de gráficas
const configGrafica = {
  type: 'line',
  options: {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: -20, max: 20, ticks: { stepSize: 5 } },
      x: { display: false }
    },
    plugins: { legend: { display: false } },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.1, borderWidth: 1 }
    }
  }
};

// Crear gráficas
const chartX = new Chart(document.getElementById('graficaX'), { ...configGrafica, data: { labels: [], datasets: [{ data: [], borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.1)' }] } });
const chartY = new Chart(document.getElementById('graficaY'), { ...configGrafica, data: { labels: [], datasets: [{ data: [], borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.1)' }] } });
const chartZ = new Chart(document.getElementById('graficaZ'), { ...configGrafica, data: { labels: [], datasets: [{ data: [], borderColor: 'rgba(54,162,235,1)', backgroundColor: 'rgba(54,162,235,0.1)' }] } });

function iniciarMonitoreo() {
  if (activo) return;
  activo = true;
  tiempoInicio = Date.now();
  datosCSV = [['Tiempo_s', 'Aceleracion_X', 'Aceleracion_Y', 'Aceleracion_Z', 'Modulo']];
  posX = posY = posZ = 0;
  intervalo = setInterval(() => {
    tiempo = (Date.now() - tiempoInicio) / 1000;
    tiempoSpan.textContent = tiempo.toFixed(3);
  }, intervaloMuestreo);
}

function detenerMonitoreo() {
  if (!activo) return;
  activo = false;
  clearInterval(intervalo);
}

function reiniciar() {
  detenerMonitoreo();
  tiempo = tiempoInicio = 0;
  tiempoSpan.textContent = '0.000';
  valoresX = valoresY = valoresZ = [];
  datosCSV = [];
  posX = posY = posZ = 0;
  alerta.textContent = '';
  nivel.textContent = '-';
  xSpan.textContent = ySpan.textContent = zSpan.textContent = '0.00';
  
  // Limpiar gráficas
  [chartX, chartY, chartZ].forEach(chart => {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
  });

  // Limpiar estadísticas mostradas
  ['maxX','maxY','maxZ','minX','minY','minZ','avgX','avgY','avgZ'].forEach(id => {
    document.getElementById(id).textContent = '0.00';
  });

  // 🔁 Limpiar también el resultado de frecuencia dominante
  document.getElementById("resultadoFrecuencia").textContent = '';
  document.getElementById("frecuenciasIntervalos").textContent = '';
}


function descargarCSV() {
  if (datosCSV.length === 0) return alert('No hay datos para descargar');
  const csvContent = datosCSV.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `datos_vibracion_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function calcularEstadisticas(arr) {
  if (arr.length === 0) return { max: 0, min: 0, avg: 0 };
  return { max: Math.max(...arr), min: Math.min(...arr), avg: arr.reduce((a,b) => a + b, 0) / arr.length };
}

function detectarActividad(nivelVib) {
  if (nivelVib > 10) return "Alta";
  if (nivelVib > 5) return "Media";
  return "Baja";
}

function actualizarGrafica(chart, valor) {
  if (chart.data.labels.length > 200) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push('');
  chart.data.datasets[0].data.push(valor);
  chart.update();
}

window.addEventListener('devicemotion', (event) => {
  if (!activo) return;

  const x = event.acceleration.x || 0;
  const y = event.acceleration.y || 0;
  const z = event.acceleration.z || 0;
  const modulo = Math.sqrt(x * x + y * y + z * z);

  const tiempoActual = (Date.now() - tiempoInicio) / 1000;

  xSpan.textContent = x.toFixed(2);
  ySpan.textContent = y.toFixed(2);
  zSpan.textContent = z.toFixed(2);

  datosCSV.push([
    tiempoActual.toFixed(3),
    x.toFixed(4),
    y.toFixed(4),
    z.toFixed(4),
    modulo.toFixed(4)
  ]);

  actualizarGrafica(chartX, x);
  actualizarGrafica(chartY, y);
  actualizarGrafica(chartZ, z);

  valoresX.push(x);
  valoresY.push(y);
  valoresZ.push(z);

  const estX = calcularEstadisticas(valoresX);
  const estY = calcularEstadisticas(valoresY);
  const estZ = calcularEstadisticas(valoresZ);

  document.getElementById("maxX").textContent = estX.max.toFixed(2);
  document.getElementById("maxY").textContent = estY.max.toFixed(2);
  document.getElementById("maxZ").textContent = estZ.max.toFixed(2);
  document.getElementById("minX").textContent = estX.min.toFixed(2);
  document.getElementById("minY").textContent = estY.min.toFixed(2);
  document.getElementById("minZ").textContent = estZ.min.toFixed(2);
  document.getElementById("avgX").textContent = estX.avg.toFixed(2);
  document.getElementById("avgY").textContent = estY.avg.toFixed(2);
  document.getElementById("avgZ").textContent = estZ.avg.toFixed(2);

  const tipo = document.getElementById('dispositivo').value;
  const umbral = umbrales[tipo];
  const nivelVib = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

  alerta.textContent = nivelVib > umbral ? "⚠️ ¡Vibración anómala detectada!" : "";
  if (nivelVib > umbral) sonidoAlerta.play();

  nivel.textContent = detectarActividad(nivelVib);
});
