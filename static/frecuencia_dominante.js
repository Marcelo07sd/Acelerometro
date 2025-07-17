let datosCSV = [];

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

    document.getElementById("resultadoFrecuencia").textContent =
      "📥 Archivo cargado correctamente. Calculando...";
    iniciarAnalisisFrecuencia();
  };

  lector.readAsText(archivo);
}

function iniciarAnalisisFrecuencia() {
  if (!Array.isArray(datosCSV) || datosCSV.length < 2) {
    document.getElementById("resultadoFrecuencia").textContent =
      "⚠️ No hay datos suficientes para analizar.";
    return;
  }

  const encabezados = datosCSV[0].map(h => h.trim().toLowerCase());
  const indiceTiempo = encabezados.findIndex(h => h.includes("tiempo"));
  const indiceModulo = encabezados.findIndex(h => h.includes("modulo"));

  if (indiceTiempo === -1 || indiceModulo === -1) {
    document.getElementById("resultadoFrecuencia").textContent =
      "⚠️ No se encontraron columnas de 'Tiempo' o 'Módulo'.";
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
    document.getElementById("resultadoFrecuencia").textContent =
      "⚠️ Se necesitan al menos 20 datos para un análisis válido.";
    return;
  }

  const intervaloSegundos = 5;
  const tiempoTotal = tiempos[tiempos.length - 1];
  const nIntervalos = Math.floor(tiempoTotal / intervaloSegundos);

  const resultados = [];

  for (let i = 0; i < nIntervalos; i++) {
    const inicio = i * intervaloSegundos;
    const fin = (i + 1) * intervaloSegundos;

    const tiemposSegmento = [];
    const modulosSegmento = [];
    const filasSegmento = [];

    for (let j = 1; j < datosCSV.length; j++) {
      const t = parseFloat(datosCSV[j][indiceTiempo]);
      if (t >= inicio && t < fin) {
        tiemposSegmento.push(t);
        modulosSegmento.push(parseFloat(datosCSV[j][indiceModulo]));
        filasSegmento.push(j);
      }
    }

    if (tiemposSegmento.length >= 20) {
      const { frecuencia, potencia } = calcularFrecuenciaYPotencia(
        tiemposSegmento,
        modulosSegmento
      );
      resultados.push({
        intervalo: i + 1,
        inicio: inicio.toFixed(1),
        fin: fin.toFixed(1),
        frecuencia: parseFloat(frecuencia.toFixed(2)),
        potencia: parseFloat(potencia.toFixed(2))
      });

      // Añadir frecuencia y potencia a cada fila del segmento
      for (const idx of filasSegmento) {
        datosCSV[idx].push(frecuencia.toFixed(2));
        datosCSV[idx].push(potencia.toFixed(2));
      }
    }
  }

  // Agregar encabezados si no estaban
  if (!encabezados.includes("frecuencia") && !encabezados.includes("potencia")) {
    datosCSV[0].push("FrecuenciaDominante_Hz");
    datosCSV[0].push("Potencia");
  }

  // Guardar resultados para uso posterior
  localStorage.setItem("frecuencia_potencia_segmentos", JSON.stringify(resultados));
  localStorage.setItem("datosCSV_enriquecido", JSON.stringify(datosCSV));

  document.getElementById("resultadoFrecuencia").textContent =
    "✅ Análisis completado. Frecuencia y potencia añadidas al CSV.";
  document.getElementById("btnVerResultados").disabled = false;
}

function calcularFrecuenciaYPotencia(tiempos, valores) {
  const fMin = 5;
  const fMax = 50;
  const pasos = 1000;
  let maxPotencia = 0;
  let mejorFrecuencia = 0;

  for (let i = 0; i <= pasos; i++) {
    const f = fMin + (fMax - fMin) * i / pasos;
    const omega = 2 * Math.PI * f;

    let sumCos = 0,
      sumSin = 0;
    let sumCos2 = 0,
      sumSin2 = 0;

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

  return { frecuencia: mejorFrecuencia, potencia: maxPotencia };
}

function verResultados() {
  window.location.href = "resultados.html";
}

