function leerArchivoCSV(input) {
    const archivo = input.files[0];
    if (!archivo) return;
  
    const lector = new FileReader();
    lector.onload = function (e) {
      const contenido = e.target.result;
      const lineas = contenido.trim().split("\n");
      
      // Convertir el contenido CSV a un arreglo tipo datosCSV
      const nuevoCSV = [];
      for (let i = 0; i < lineas.length; i++) {
        const fila = lineas[i].split(",").map(valor => valor.trim());
        nuevoCSV.push(fila);
      }
  
      // Guardar en datosCSV
      datosCSV = nuevoCSV;
  
      // Mostrar mensaje y ejecutar análisis directamente
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

  const intervaloSegundos = 5; // 🕒 Duración de cada intervalo en segundos
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
      resultadosHTML.push(`<li>⏱️ Intervalo ${i + 1}: ${f.toFixed(2)} Hz → ${diag}</li>`);
    } else {
      resultadosHTML.push(`<li>⏱️ Intervalo ${i + 1}: ⚠️ Datos insuficientes</li>`);
    }
  }

  // Mostrar lista en div frecuenciasIntervalos
  document.getElementById("frecuenciasIntervalos").innerHTML = `<ul>${resultadosHTML.join("")}</ul>`;

  // Mostrar diagnóstico general (último intervalo válido o promedio)
  const ultimasFrecuencias = resultadosHTML.filter(item => item.includes("Hz"));
  if (ultimasFrecuencias.length > 0) {
    document.getElementById("resultadoFrecuencia").textContent = "✅ Análisis por intervalos completado.";
  } else {
    document.getElementById("resultadoFrecuencia").textContent = "⚠️ No se encontró ninguna frecuencia dominante válida.";
  }
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

  
function mostrarDiagnostico(frecuencia) {
    const divResultado = document.getElementById("resultadoFrecuencia");
  
    let mensaje = `🔍 Frecuencia dominante: ${frecuencia.toFixed(2)} Hz\n`;
    let diagnostico = "";
  
    if (frecuencia < 10) {
      diagnostico = "Lavadora posiblemente no está centrifugando o está vacía.";
    } else if (frecuencia < 25) {
      diagnostico = "Centrifugado suave. Verifica si hay carga suficiente.";
    } else if (frecuencia < 40) {
      diagnostico = "✅ Centrifugado normal.";
    } else if (frecuencia < 60) {
      diagnostico = "⚠️ Vibración elevada. Revisa si la carga está desbalanceada.";
    } else {
      diagnostico = "❌ Vibración excesiva. Posible daño mecánico en el tambor.";
    }
  
    divResultado.innerText = `${mensaje}\n${diagnostico}`;
  }
  
