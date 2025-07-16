function iniciarAnalisisFrecuencia() {
    // Verificar si hay datos en datosCSV
    if (!Array.isArray(datosCSV) || datosCSV.length < 2) {
      document.getElementById("resultadoFrecuencia").textContent = "⚠️ No hay datos suficientes para analizar.";
      return;
    }
  
    // Extraer solo columnas Tiempo_s y Modulo
    const tiempos = [];
    const modulos = [];
  
    for (let i = 1; i < datosCSV.length; i++) {
      const fila = datosCSV[i]; // ['Tiempo_s', 'X', 'Y', 'Z', 'Modulo']
      const t = parseFloat(fila[0]); // Tiempo
      const m = parseFloat(fila[4]); // Módulo
  
      if (!isNaN(t) && !isNaN(m)) {
        tiempos.push(t);
        modulos.push(m);
      }
    }
  
    // Validar cantidad mínima de datos
    if (tiempos.length < 20) {
      document.getElementById("resultadoFrecuencia").textContent = "⚠️ Se necesitan al menos 20 datos para un análisis válido.";
      return;
    }
  
    // Calcular frecuencia dominante
    const frecuencia = calcularFrecuenciaDominante(tiempos, modulos);
  
    // Mostrar el diagnóstico en pantalla
    mostrarDiagnostico(frecuencia);
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
  