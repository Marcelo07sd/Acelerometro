function leerArchivoCSV(input) {
    const archivo = input.files[0];
    if (!archivo) return;
  
    const lector = new FileReader();
    lector.onload = function (e) {
      const contenido = e.target.result;
      const lineas = contenido.trim().split("\n");
  
      const nuevoCSV = [];
      for (let i = 0; i < lineas.length; i++) {
        const fila = lineas[i].split(",").map(valor => valor.trim());
        nuevoCSV.push(fila);
      }
  
      datosCSV = nuevoCSV;
  
      document.getElementById("resultadoFrecuencia").textContent = "📥 Archivo cargado correctamente. Calculando...";
      iniciarAnalisisFrecuencia();
    };
  
    lector.readAsText(archivo);
  }
  
function iniciarAnalisisFrecuencia() {
  if (!Array.isArray(datosCSV) || datosCSV.length < 2) {
    document.getElementById("resultadoFrecuencia").textContent = "⚠️ No hay datos suficientes para analizar.";
    return;
  }

  // Obtener los encabezados y buscar los índices de columnas
  const encabezados = datosCSV[0].map(h => h.trim().toLowerCase());
  const indiceTiempo = encabezados.findIndex(h => h.includes("tiempo"));
  const indiceModulo = encabezados.findIndex(h => h.includes("modulo"));

  if (indiceTiempo === -1 || indiceModulo === -1) {
    document.getElementById("resultadoFrecuencia").textContent = "⚠️ No se encontraron columnas de 'Tiempo' o 'Módulo'.";
    return;
  }

  const tiempos = [];
  const modulos = [];

  for (let i = 1; i < datosCSV.length; i++) {
    const fila = datosCSV[i];
    const t = parseFloat(fila[indiceTiempo]);
    const m = parseFloat(fila[indiceModulo]);
    if (!isNaN(t) && !isNaN(m)) {
      tiempos.push(t);
      modulos.push(m);
    }
  }

  if (tiempos.length < 20) {
    document.getElementById("resultadoFrecuencia").textContent = "⚠️ Se necesitan al menos 20 datos para un análisis válido.";
    return;
  }

  const intervaloSegundos = 5;
  const tiempoTotal = tiempos[tiempos.length - 1];
  const nIntervalos = Math.floor(tiempoTotal / intervaloSegundos);

  const frecuenciasValidas = [];

  for (let i = 0; i < nIntervalos; i++) {
    const inicio = i * intervaloSegundos;
    const fin = (i + 1) * intervaloSegundos;

    const tiemposSegmento = [];
    const modulosSegmento = [];

    for (let j = 0; j < tiempos.length; j++) {
      if (tiempos[j] >= inicio && tiempos[j] < fin) {
        tiemposSegmento.push(tiempos[j]);
        modulosSegmento.push(modulos[j]);
      }
    }

    if (tiemposSegmento.length >= 20) {
      const f = calcularFrecuenciaDominante(tiemposSegmento, modulosSegmento);
      frecuenciasValidas.push({
        intervalo: i + 1,
        inicio: inicio.toFixed(1),
        fin: fin.toFixed(1),
        frecuencia: parseFloat(f.toFixed(2))
      });
    }
  }

  if (frecuenciasValidas.length === 0) {
    document.getElementById("resultadoFrecuencia").textContent = "⚠️ No se detectaron frecuencias válidas.";
    return;
  }

  const suma = frecuenciasValidas.reduce((acc, obj) => acc + obj.frecuencia, 0);
  const promedio = parseFloat((suma / frecuenciasValidas.length).toFixed(2));

  localStorage.setItem("frecuenciasIntervalos", JSON.stringify(frecuenciasValidas));
  localStorage.setItem("frecuenciaPromedio", promedio);

  document.getElementById("resultadoFrecuencia").textContent = "✅ Análisis completado. Puedes ver los resultados.";
  document.getElementById("btnVerResultados").disabled = false;
}


    function verResultados() {
      window.location.href = "resultados.html";
}
  
  function calcularFrecuenciaDominante(tiempos, valores) {
    const fMin = 5;
    const fMax = 50;
    const pasos = 1000;
    let maxPotencia = 0;
    let mejorFrecuencia = 0;
  
    for (let i = 0; i <= pasos; i++) {
      const f = fMin + (fMax - fMin) * i / pasos;
      const omega = 2 * Math.PI * f;
  
      let sumCos = 0, sumSin = 0;
      let sumCos2 = 0, sumSin2 = 0;
  
      for (let j = 0; j < tiempos.length; j++) {
        const t = tiempos[j];
        const y = valores[j];
        const wt = omega * t;
  
        const coswt = Math.cos(wt);
        const sinwt = Math.sin(wt);
  
        sumCos += y * coswt;
        sumSin += y * sinwt;
        sumCos2 += coswt * coswt;
        sumSin2 += sinwt * sinwt;
      }
  
      const potencia = 0.5 * ((sumCos * sumCos) / sumCos2 + (sumSin * sumSin) / sumSin2);
  
      if (potencia > maxPotencia) {
        maxPotencia = potencia;
        mejorFrecuencia = f;
      }
    }
  
    return mejorFrecuencia;
  }
  
