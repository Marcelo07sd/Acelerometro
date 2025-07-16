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
  
    const tiempos = [];
    const modulos = [];
  
    for (let i = 1; i < datosCSV.length; i++) {
      const fila = datosCSV[i];
      const t = parseFloat(fila[0]);
      const m = parseFloat(fila[4]);
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
  
    const resultadosHTML = [];
  
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
        const diag = generarDiagnosticoTexto(f);
        resultadosHTML.push(`<li>⏱️ Intervalo ${i + 1} (${inicio.toFixed(1)}s - ${fin.toFixed(1)}s): ${f.toFixed(2)} Hz → ${diag}</li>`);
      } else {
        resultadosHTML.push(`<li>⏱️ Intervalo ${i + 1} (${inicio.toFixed(1)}s - ${fin.toFixed(1)}s): ⚠️ Datos insuficientes</li>`);
      }
    }
  
    document.getElementById("frecuenciasIntervalos").innerHTML = `<ul>${resultadosHTML.join("")}</ul>`;
    document.getElementById("resultadoFrecuencia").textContent = "✅ Análisis por intervalos completado.";
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
  
  function generarDiagnosticoTexto(frecuencia) {
    if (frecuencia < 10) return "Lavadora posiblemente no está centrifugando o está vacía.";
    if (frecuencia < 25) return "Centrifugado suave. Verifica si hay carga suficiente.";
    if (frecuencia < 40) return "✅ Centrifugado normal.";
    if (frecuencia < 60) return "⚠️ Vibración elevada. Revisa si la carga está desbalanceada.";
    return "❌ Vibración excesiva. Posible daño mecánico en el tambor.";
  }
  
