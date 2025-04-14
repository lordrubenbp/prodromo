// Elementos del DOM
const fechaHoraActual = document.getElementById('fecha-hora-actual');
const btnSi = document.getElementById('btn-si');
const btnNo = document.getElementById('btn-no');
const btnRegistrarContraccion = document.getElementById('registrar-contraccion');
const btnGuardarInfo = document.getElementById('guardar-info');
const btnBorrarHistorial = document.getElementById('borrar-historial');
const btnUbicacion = document.getElementById('btn-ubicacion');
const contraccionesLista = document.getElementById('contracciones-lista');
const noContracciones = document.getElementById('no-contracciones');
const tablaHistorial = document.getElementById('tabla-historial');
const seccionAlerta = document.getElementById('alerta');
const mapaHospitales = document.getElementById('mapa-hospitales');
const mensajeDetalleAlerta = document.getElementById('mensaje-detalle-alerta');
const inputSemanas = document.getElementById('semanas');
const inputDias = document.getElementById('dias');
const selectPrimeriza = document.getElementById('primeriza');
const inputDuracion = document.getElementById('duracion');
const btnsIntensidad = document.querySelectorAll('.btn-intensidad');
const checkTaponMucoso = document.getElementById('tapon-mucoso');
const checkRomperAguas = document.getElementById('romper-aguas');
const checkSangrado = document.getElementById('sangrado');
const checkMenosMovimientos = document.getElementById('menos-movimientos');
const acordeonItems = document.querySelectorAll('.accordion-item');
const frecuenciaMedia = document.getElementById('frecuencia-media');
const duracionMedia = document.getElementById('duracion-media');
const intensidadMedia = document.getElementById('intensidad-media');
const btnIniciarCronometro = document.getElementById('btn-iniciar-cronometro');
const btnDetenerCronometro = document.getElementById('btn-detener-cronometro');
const cronometroDisplay = document.getElementById('cronometro-display');
const cronometroContainer = document.querySelector('.cronometro');
const duracionManualContainer = document.getElementById('duracion-manual-container');
const btnReiniciarCronometro = document.getElementById('btn-reiniciar-cronometro');

// Variables globales
let esDolorosa = null;
let intensidadSeleccionada = null;
let contracciones = [];
const COOKIE_NAME = 'prodromo_contracciones';
const COOKIE_INFO_NAME = 'prodromo_info_embarazo';
const INTERVALO_ALERTA_PRIMERIZA = 5; // minutos
const INTERVALO_ALERTA_MULTIPARA = 7; // minutos
const DURACION_MINIMA_ALERTA = 45; // segundos
const TIEMPO_MONITOREO = 60; // minutos
let cronometroActivo = false;
let tiempoInicio = 0;
let tiempoTranscurrido = 0;
let intervaloCronometro = null;
let duracionMedida = 0;

// Función para actualizar la fecha y hora actual
function actualizarFechaHora() {
    const ahora = new Date();
    fechaHoraActual.textContent = formatearFechaHora(ahora);
}

// Función para formatear fecha y hora
function formatearFechaHora(fecha) {
    const opciones = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
    };
    return fecha.toLocaleString('es-ES', opciones);
}

// Función para formatear intervalo de tiempo
function formatearIntervalo(minutos) {
    if (minutos < 60) {
        return `${minutos} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}min`;
    }
}

// Función para calcular intervalo entre contracciones
function calcularIntervalo(fechaActual, fechaAnterior) {
    const diferencia = fechaActual - fechaAnterior;
    return Math.floor(diferencia / (1000 * 60)); // Convertir a minutos
}

// Función para formatear el tiempo del cronómetro (minutos:segundos)
function formatearTiempoCronometro(tiempoMs) {
    const segundosTotales = Math.floor(tiempoMs / 1000);
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

// Función para iniciar el cronómetro
function iniciarCronometro() {
    if (!cronometroActivo) {
        cronometroActivo = true;
        tiempoInicio = Date.now() - tiempoTranscurrido;
        
        // Actualizar UI
        cronometroContainer.classList.add('cronometro-activo');
        btnIniciarCronometro.disabled = true;
        btnDetenerCronometro.disabled = false;
        btnReiniciarCronometro.disabled = true;
        
        // Actualizar el cronómetro cada 100ms para mayor precisión
        intervaloCronometro = setInterval(() => {
            tiempoTranscurrido = Date.now() - tiempoInicio;
            cronometroDisplay.textContent = formatearTiempoCronometro(tiempoTranscurrido);
        }, 100);
    }
}

// Función para detener el cronómetro
function detenerCronometro() {
    if (cronometroActivo) {
        cronometroActivo = false;
        clearInterval(intervaloCronometro);
        
        // Calcular duración en segundos
        duracionMedida = Math.floor(tiempoTranscurrido / 1000);
        
        // Actualizar UI
        cronometroContainer.classList.remove('cronometro-activo');
        btnIniciarCronometro.disabled = false;
        btnDetenerCronometro.disabled = true;
        btnReiniciarCronometro.disabled = false;
        
        // Actualizamos el campo oculto de duración con el valor medido
        inputDuracion.value = duracionMedida;
        
        // Permitir registrar contracción si los otros campos requeridos están completos
        validarFormulario();
    }
}

// Función para reiniciar el cronómetro
function reiniciarCronometro() {
    clearInterval(intervaloCronometro);
    cronometroActivo = false;
    tiempoTranscurrido = 0;
    duracionMedida = 0;
    cronometroDisplay.textContent = "00:00";
    cronometroContainer.classList.remove('cronometro-activo');
    btnIniciarCronometro.disabled = false;
    btnDetenerCronometro.disabled = true;
    btnReiniciarCronometro.disabled = true;
    
    // Restablecer campo de duración
    inputDuracion.value = 45; // Valor predeterminado
}

// Guardar contracciones en cookies
function guardarContracciones() {
    const datos = JSON.stringify(contracciones);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(datos)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

// Cargar contracciones desde cookies
function cargarContracciones() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [nombre, valor] = cookie.trim().split('=');
        if (nombre === COOKIE_NAME && valor) {
            try {
                contracciones = JSON.parse(decodeURIComponent(valor));
                actualizarHistorial();
                verificarPatronContracciones();
                actualizarEstadisticas();
            } catch (error) {
                console.error('Error al parsear las contracciones guardadas:', error);
            }
        }
    }
}

// Guardar información del embarazo en cookies
function guardarInfoEmbarazo() {
    const semanas = inputSemanas.value;
    const dias = inputDias.value;
    const primeriza = selectPrimeriza.value;
    
    if (semanas < 1 || semanas > 42 || dias < 0 || dias > 6) {
        alert('Por favor, introduce valores válidos para semanas (1-42) y días (0-6).');
        return;
    }
    
    const info = { semanas, dias, primeriza };
    const datos = JSON.stringify(info);
    document.cookie = `${COOKIE_INFO_NAME}=${encodeURIComponent(datos)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    
    alert('Información guardada correctamente.');
}

// Cargar información del embarazo desde cookies
function cargarInfoEmbarazo() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [nombre, valor] = cookie.trim().split('=');
        if (nombre === COOKIE_INFO_NAME && valor) {
            try {
                const info = JSON.parse(decodeURIComponent(valor));
                inputSemanas.value = info.semanas;
                inputDias.value = info.dias;
                if (info.primeriza) {
                    selectPrimeriza.value = info.primeriza;
                }
            } catch (error) {
                console.error('Error al parsear la información del embarazo:', error);
            }
        }
    }
}

// Obtener síntomas adicionales seleccionados
function obtenerSintomasSeleccionados() {
    const sintomas = [];
    if (checkTaponMucoso.checked) sintomas.push('tapon-mucoso');
    if (checkRomperAguas.checked) sintomas.push('romper-aguas');
    if (checkSangrado.checked) sintomas.push('sangrado');
    if (checkMenosMovimientos.checked) sintomas.push('menos-movimientos');
    return sintomas;
}

// Formatear síntomas para mostrar en UI
function formatearSintomas(sintomas) {
    if (!sintomas || sintomas.length === 0) return '-';
    
    const mapaSintomas = {
        'tapon-mucoso': 'Tapón mucoso',
        'romper-aguas': 'Ruptura de aguas',
        'sangrado': 'Sangrado',
        'menos-movimientos': 'Menos movimientos'
    };
    
    return sintomas.map(s => mapaSintomas[s] || s).join(', ');
}

// Registrar una nueva contracción
function registrarContraccion() {
    if (esDolorosa === null) {
        alert('Por favor indica si la contracción es dolorosa o no');
        return;
    }
    
    if (intensidadSeleccionada === null) {
        alert('Por favor selecciona la intensidad de la contracción');
        return;
    }
    
    const ahora = new Date();
    const semanas = inputSemanas.value;
    const dias = inputDias.value;
    
    // Si se usó el cronómetro, usamos la duración medida
    const duracion = duracionMedida > 0 ? duracionMedida : inputDuracion.value;
    const sintomas = obtenerSintomasSeleccionados();
    
    const nuevaContraccion = {
        fecha: ahora.toISOString(),
        esDolorosa: esDolorosa,
        intensidad: intensidadSeleccionada,
        duracion: duracion,
        semanas: semanas,
        dias: dias,
        sintomas: sintomas
    };
    
    contracciones.unshift(nuevaContraccion); // Añadir al principio para mostrar las más recientes primero
    guardarContracciones();
    actualizarHistorial();
    verificarPatronContracciones();
    actualizarEstadisticas();
    
    // Resetear selección y cronómetro
    esDolorosa = null;
    intensidadSeleccionada = null;
    btnSi.classList.remove('seleccionado');
    btnNo.classList.remove('seleccionado');
    btnsIntensidad.forEach(btn => btn.classList.remove('seleccionado'));
    btnRegistrarContraccion.disabled = true;
    checkTaponMucoso.checked = false;
    checkRomperAguas.checked = false;
    checkSangrado.checked = false;
    checkMenosMovimientos.checked = false;
    reiniciarCronometro();
}

// Actualizar la visualización del historial
function actualizarHistorial() {
    if (contracciones.length === 0) {
        noContracciones.classList.remove('hidden');
        tablaHistorial.classList.add('hidden');
        return;
    }
    
    noContracciones.classList.add('hidden');
    tablaHistorial.classList.remove('hidden');
    
    contraccionesLista.innerHTML = '';
    
    contracciones.forEach((contraccion, index) => {
        const fechaContraccion = new Date(contraccion.fecha);
        const fila = document.createElement('tr');
        
        // Fecha y hora
        const celdaFecha = document.createElement('td');
        celdaFecha.textContent = formatearFechaHora(fechaContraccion);
        fila.appendChild(celdaFecha);
        
        // Duración
        const celdaDuracion = document.createElement('td');
        celdaDuracion.textContent = contraccion.duracion ? `${contraccion.duracion}s` : '-';
        fila.appendChild(celdaDuracion);
        
        // Intensidad
        const celdaIntensidad = document.createElement('td');
        if (contraccion.intensidad) {
            let textoIntensidad = '';
            switch (parseInt(contraccion.intensidad)) {
                case 1: textoIntensidad = 'Leve'; break;
                case 2: textoIntensidad = 'Moderada'; break;
                case 3: textoIntensidad = 'Intensa'; break;
                default: textoIntensidad = contraccion.intensidad;
            }
            celdaIntensidad.textContent = textoIntensidad;
            celdaIntensidad.style.color = contraccion.esDolorosa ? '#dc3545' : '#28a745';
        } else {
            celdaIntensidad.textContent = contraccion.esDolorosa ? 'Dolorosa' : 'No dolorosa';
            celdaIntensidad.style.color = contraccion.esDolorosa ? '#dc3545' : '#28a745';
        }
        fila.appendChild(celdaIntensidad);
        
        // Intervalo
        const celdaIntervalo = document.createElement('td');
        if (index < contracciones.length - 1) {
            const fechaAnterior = new Date(contracciones[index + 1].fecha);
            const intervalo = calcularIntervalo(fechaContraccion, fechaAnterior);
            celdaIntervalo.textContent = formatearIntervalo(intervalo);
        } else {
            celdaIntervalo.textContent = '-';
        }
        fila.appendChild(celdaIntervalo);
        
        // Síntomas
        const celdaSintomas = document.createElement('td');
        celdaSintomas.textContent = formatearSintomas(contraccion.sintomas);
        fila.appendChild(celdaSintomas);
        
        contraccionesLista.appendChild(fila);
    });
}

// Actualizar estadísticas de contracciones
function actualizarEstadisticas() {
    if (contracciones.length < 2) {
        frecuenciaMedia.textContent = '-';
        duracionMedia.textContent = '-';
        intensidadMedia.textContent = '-';
        return;
    }
    
    // Obtener contracciones de la última hora
    const ahora = new Date();
    const unaHoraAtras = new Date(ahora.getTime() - 60 * 60 * 1000);
    const contraccionesRecientes = contracciones.filter(c => new Date(c.fecha) >= unaHoraAtras);
    
    if (contraccionesRecientes.length < 2) {
        frecuenciaMedia.textContent = '-';
        duracionMedia.textContent = '-';
        intensidadMedia.textContent = '-';
        return;
    }
    
    // Calcular intervalos entre contracciones
    let totalIntervalos = 0;
    let cantidadIntervalos = 0;
    for (let i = 0; i < contraccionesRecientes.length - 1; i++) {
        const fechaActual = new Date(contraccionesRecientes[i].fecha);
        const fechaAnterior = new Date(contraccionesRecientes[i + 1].fecha);
        const intervalo = calcularIntervalo(fechaActual, fechaAnterior);
        totalIntervalos += intervalo;
        cantidadIntervalos++;
    }
    
    // Calcular duración media
    const duracionesValidas = contraccionesRecientes.filter(c => c.duracion).map(c => parseInt(c.duracion));
    let duracionPromedio = '-';
    if (duracionesValidas.length > 0) {
        duracionPromedio = Math.round(duracionesValidas.reduce((sum, val) => sum + val, 0) / duracionesValidas.length);
    }
    
    // Calcular intensidad media
    const intensidadesValidas = contraccionesRecientes.filter(c => c.intensidad).map(c => parseInt(c.intensidad));
    let intensidadPromedio = '-';
    if (intensidadesValidas.length > 0) {
        intensidadPromedio = (intensidadesValidas.reduce((sum, val) => sum + val, 0) / intensidadesValidas.length).toFixed(1);
    }
    
    // Actualizar UI
    frecuenciaMedia.textContent = cantidadIntervalos > 0 ? `${Math.round(totalIntervalos / cantidadIntervalos)} min` : '-';
    duracionMedia.textContent = duracionPromedio !== '-' ? duracionPromedio : '-';
    intensidadMedia.textContent = intensidadPromedio !== '-' ? intensidadPromedio : '-';
}

// Verificar si hay un patrón de contracciones que requiera alerta
function verificarPatronContracciones() {
    // Obtener si es primeriza desde la info guardada
    let esPrimeriza = true; // por defecto asumimos que es primeriza
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [nombre, valor] = cookie.trim().split('=');
        if (nombre === COOKIE_INFO_NAME && valor) {
            try {
                const info = JSON.parse(decodeURIComponent(valor));
                esPrimeriza = info.primeriza === 'si';
            } catch (error) {
                console.error('Error al parsear la información del embarazo:', error);
            }
        }
    }
    
    // Determinar el intervalo de alerta según si es primeriza o no
    const intervaloAlerta = esPrimeriza ? INTERVALO_ALERTA_PRIMERIZA : INTERVALO_ALERTA_MULTIPARA;
    
    // Comprobar síntomas de alarma inmediata
    const tieneRupturaAguas = contracciones.some(c => c.sintomas && c.sintomas.includes('romper-aguas'));
    const tieneSangradoAbundante = contracciones.some(c => c.sintomas && c.sintomas.includes('sangrado'));
    const tieneMenosMovimientos = contracciones.some(c => c.sintomas && c.sintomas.includes('menos-movimientos'));
    
    if (tieneRupturaAguas || tieneSangradoAbundante || tieneMenosMovimientos) {
        seccionAlerta.classList.remove('hidden');
        
        let mensajeAlerta = '<p>Se ha detectado uno o más síntomas que requieren atención médica inmediata:</p><ul>';
        if (tieneRupturaAguas) mensajeAlerta += '<li>Ruptura de aguas</li>';
        if (tieneSangradoAbundante) mensajeAlerta += '<li>Sangrado</li>';
        if (tieneMenosMovimientos) mensajeAlerta += '<li>Disminución de movimientos fetales</li>';
        mensajeAlerta += '</ul>';
        
        mensajeDetalleAlerta.innerHTML = mensajeAlerta;
        return;
    }
    
    // Si hay menos de 3 contracciones, no es necesario verificar
    if (contracciones.length < 3) {
        seccionAlerta.classList.add('hidden');
        return;
    }
    
    // Filtrar solo contracciones dolorosas
    const contraccionesDolorosas = contracciones.filter(c => c.esDolorosa);
    if (contraccionesDolorosas.length < 3) {
        seccionAlerta.classList.add('hidden');
        return;
    }
    
    // Ordenar por fecha (de más reciente a más antigua)
    contraccionesDolorosas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Verificar si hay contracciones dolorosas en el tiempo de monitoreo
    const ahora = new Date();
    const tiempoAtras = new Date(ahora.getTime() - TIEMPO_MONITOREO * 60 * 1000);
    
    // Contar contracciones dolorosas en el período de monitoreo
    const contraccionesPeriodo = contraccionesDolorosas.filter(c => {
        const fechaContraccion = new Date(c.fecha);
        return fechaContraccion >= tiempoAtras;
    });
    
    if (contraccionesPeriodo.length >= 3) {
        // Verificar si hay contracciones con el intervalo y duración adecuadas
        let cumpleCriterios = true;
        let contraccionesCumplen = 0;
        let intervalosCortos = 0;
        
        for (let i = 0; i < contraccionesPeriodo.length - 1; i++) {
            const fechaActual = new Date(contraccionesPeriodo[i].fecha);
            const fechaAnterior = new Date(contraccionesPeriodo[i + 1].fecha);
            const intervalo = calcularIntervalo(fechaActual, fechaAnterior);
            const duracion = parseInt(contraccionesPeriodo[i].duracion || '0');
            
            if (intervalo <= intervaloAlerta && duracion >= DURACION_MINIMA_ALERTA) {
                contraccionesCumplen++;
                intervalosCortos++;
            } else if (intervalo <= intervaloAlerta) {
                intervalosCortos++;
            }
        }
        
        // En fase activa, considerar si hay suficientes contracciones que cumplen criterios
        if (contraccionesCumplen >= 2 || intervalosCortos >= 3) {
            seccionAlerta.classList.remove('hidden');
            
            let mensajeAlerta = `<p>Se ha detectado un patrón de contracciones que podría indicar trabajo de parto:</p>`;
            
            mensajeAlerta += `<ul>
                <li>Tienes contracciones dolorosas regulares cada ${intervaloAlerta} minutos o menos</li>
                <li>Algunas contracciones duran ${DURACION_MINIMA_ALERTA} segundos o más</li>
                <li>Este patrón se ha mantenido durante el último período de observación</li>
            </ul>`;
            
            if (esPrimeriza) {
                mensajeAlerta += `<p>Según las recomendaciones para mujeres primerizas, deberías considerar acudir al hospital cuando las contracciones sean cada 3-5 minutos durante al menos una hora, con duración de 45-60 segundos.</p>`;
            } else {
                mensajeAlerta += `<p>Según las recomendaciones para mujeres que ya han parido anteriormente, deberías considerar acudir al hospital cuando las contracciones sean cada 5-7 minutos durante al menos una hora, con duración de 45-60 segundos.</p>`;
            }
            
            mensajeDetalleAlerta.innerHTML = mensajeAlerta;
        } else {
            seccionAlerta.classList.add('hidden');
        }
    } else {
        seccionAlerta.classList.add('hidden');
    }
}

// Borrar historial de contracciones
function borrarHistorial() {
    if (confirm('¿Estás segura de que deseas borrar todo el historial de contracciones?')) {
        contracciones = [];
        guardarContracciones();
        actualizarHistorial();
        actualizarEstadisticas();
        seccionAlerta.classList.add('hidden');
    }
}

// Mostrar hospitales cercanos
function mostrarHospitalesCercanos() {
    if ('geolocation' in navigator) {
        btnUbicacion.textContent = 'Obteniendo ubicación...';
        btnUbicacion.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const latitud = posicion.coords.latitude;
                const longitud = posicion.coords.longitude;
                cargarMapaHospitales(latitud, longitud);
                btnUbicacion.textContent = 'Actualizar ubicación';
                btnUbicacion.disabled = false;
            },
            (error) => {
                console.error('Error al obtener la ubicación:', error);
                alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos de ubicación en tu navegador.');
                btnUbicacion.textContent = 'Mostrar hospitales cercanos';
                btnUbicacion.disabled = false;
            }
        );
    } else {
        alert('Tu navegador no soporta geolocalización.');
    }
}

// Cargar mapa con hospitales cercanos
function cargarMapaHospitales(latitud, longitud) {
    mapaHospitales.classList.remove('hidden');
    mapaHospitales.innerHTML = '<div class="cargando-hospitales"><p>Buscando hospitales cercanos...</p><div class="loader"></div></div>';
    
    // Mostrar coordenadas para depuración
    console.log(`Buscando hospitales cerca de: ${latitud}, ${longitud}`);
    
    // Añadir enlaces directos a servicios de mapas
    const linksMapas = document.createElement('div');
    linksMapas.className = 'links-mapas';
    linksMapas.innerHTML = `
        <p>Buscar hospitales con estas aplicaciones:</p>
        <div class="botones-mapas">
            <a href="https://www.google.com/maps/search/hospital+cerca+de+${latitud},${longitud}" target="_blank" rel="noopener" class="btn-mapa">
                <i class="fas fa-hospital"></i> Google Maps
            </a>
            <a href="https://www.bing.com/maps?q=hospital+cerca+de+${latitud}+${longitud}" target="_blank" rel="noopener" class="btn-mapa">
                <i class="fas fa-map-marker-alt"></i> Bing Maps
            </a>
            <a href="https://www.waze.com/ul?ll=${latitud}%2C${longitud}&navigate=yes&zoom=15" target="_blank" rel="noopener" class="btn-mapa">
                <i class="fas fa-location-arrow"></i> Waze
            </a>
        </div>
    `;
    mapaHospitales.appendChild(linksMapas);
    
    // Usar múltiples términos de búsqueda para aumentar las posibilidades de encontrar resultados
    const buscarHospitales = async () => {
        try {
            // Intentar primero con "hospital"
            let data = await fetchHospitales(latitud, longitud, "hospital");
            
            // Si no hay resultados, intentar con "centro médico"
            if (!data || data.length === 0) {
                data = await fetchHospitales(latitud, longitud, "centro+medico");
            }
            
            // Si aún no hay resultados, intentar con "clínica"
            if (!data || data.length === 0) {
                data = await fetchHospitales(latitud, longitud, "clinica");
            }
            
            // Si aún no hay resultados, intentar con "emergencia"
            if (!data || data.length === 0) {
                data = await fetchHospitales(latitud, longitud, "emergencia");
            }
            
            procesarResultadosHospitales(data, latitud, longitud);
        } catch (error) {
            manejarErrorBusqueda(error);
        }
    };
    
    buscarHospitales();
}

// Función para obtener hospitales con un término específico
async function fetchHospitales(latitud, longitud, termino) {
    // Añadir parámetros adicionales para mejorar la búsqueda
    const url = `https://nominatim.openstreetmap.org/search?q=${termino}&format=json&limit=10&addressdetails=1&lat=${latitud}&lon=${longitud}&radius=15000&accept-language=es`;
    
    console.log(`Buscando con término: ${termino}`);
    const response = await fetch(url, {
        headers: {
            'Accept-Language': 'es,es-ES'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
}

// Función para procesar los resultados de hospitales
function procesarResultadosHospitales(data, latitud, longitud) {
    const cargandoElement = mapaHospitales.querySelector('.cargando-hospitales');
    if (cargandoElement) {
        cargandoElement.remove();
    }
    
    // No mostramos la lista de hospitales cercanos, solo mantenemos los enlaces a las aplicaciones de mapas
    // que ya se añadieron en la función cargarMapaHospitales
    
    // Añadir un mensaje informativo
    const mensajeInfo = document.createElement('div');
    mensajeInfo.className = 'info-hospitales';
    mensajeInfo.innerHTML = `
        <p class="mensaje-accion">Por favor, utiliza alguna de las aplicaciones de mapas anteriores para encontrar el hospital más cercano.</p>
        <p class="info-emergencia">En caso de emergencia, llama al <a href="tel:+34112" class="telefono-emergencia">112</a></p>
    `;
    mapaHospitales.appendChild(mensajeInfo);
}

// Función para manejar errores en la búsqueda
function manejarErrorBusqueda(error) {
    console.error('Error al buscar hospitales:', error);
    
    const cargandoElement = mapaHospitales.querySelector('.cargando-hospitales');
    if (cargandoElement) {
        cargandoElement.remove();
    }
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-msg';
    errorMsg.innerHTML = `
        <p>Error al buscar hospitales cercanos: ${error.message || 'Error de conexión'}</p>
        <p>Por favor, verifica tu conexión a internet y los permisos de ubicación, o utiliza los enlaces a aplicaciones de mapas.</p>
    `;
    mapaHospitales.appendChild(errorMsg);
}

// Función para calcular la distancia entre dos puntos geográficos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distancia en km
    return d;
}

// Exportar historial de contracciones a CSV
function exportarHistorial() {
    if (contracciones.length === 0) {
        alert('No hay contracciones registradas para exportar.');
        return;
    }

    // Formatear los datos para CSV compatible con Excel
    const datos = contracciones.map((c, index) => {
        const fecha = new Date(c.fecha);
        // Formatear fecha como dd/mm/yyyy
        const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
        // Formatear hora como hh:mm:ss
        const horaFormateada = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`;
        
        let intensidadTexto = '-';
        if (c.intensidad) {
            switch (parseInt(c.intensidad)) {
                case 1: intensidadTexto = 'Leve'; break;
                case 2: intensidadTexto = 'Moderada'; break;
                case 3: intensidadTexto = 'Intensa'; break;
                default: intensidadTexto = c.intensidad;
            }
        }
        
        // Calcular el intervalo
        let intervaloTexto = '-';
        if (index < contracciones.length - 1) {
            const fechaAnterior = new Date(contracciones[index + 1].fecha);
            const intervalo = calcularIntervalo(fecha, fechaAnterior);
            intervaloTexto = intervalo.toString();
        }
        
        return {
            Fecha: fechaFormateada,
            Hora: horaFormateada,
            Dolorosa: c.esDolorosa ? 'Sí' : 'No',
            Intensidad: intensidadTexto,
            Duracion: c.duracion ? `${c.duracion}` : '-',
            Intervalo: intervaloTexto,
            Sintomas: formatearSintomas(c.sintomas)
        };
    });

    // Función para escapar valores con comas o comillas para CSV
    const escaparCSV = (valor) => {
        const str = String(valor);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Crear encabezados con nombres en español para Excel
    const encabezados = ['Fecha', 'Hora', 'Dolorosa', 'Intensidad', 'Duración (segundos)', 'Intervalo (minutos)', 'Síntomas'];
    
    // Generar contenido CSV con valores escapados correctamente
    const csvContent = [
        encabezados.join(';'),
        ...datos.map(row => Object.values(row).map(escaparCSV).join(';'))
    ].join('\r\n'); // Usar CRLF para mejor compatibilidad con Excel

    // Añadir BOM para que Excel reconozca correctamente caracteres UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    // Crear blob y descargar
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fechaActual = new Date();
    const nombreArchivo = `historial_contracciones_${fechaActual.getDate()}-${fechaActual.getMonth()+1}-${fechaActual.getFullYear()}.csv`;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Manejar el acordeón de información
function toggleAccordion(item) {
    const isActive = item.classList.contains('active');
    
    // Cerrar todos los items
    acordeonItems.forEach(acordeonItem => {
        acordeonItem.classList.remove('active');
    });
    
    // Si el item no estaba activo, abrirlo
    if (!isActive) {
        item.classList.add('active');
    }
}

// Event Listeners
window.addEventListener('load', () => {
    actualizarFechaHora();
    cargarContracciones();
    cargarInfoEmbarazo();
    setInterval(actualizarFechaHora, 1000);
    
    // Preseleccionar No como respuesta a ¿Es dolorosa?
    btnNo.click();
    
    // Preseleccionar Leve como intensidad
    const btnLeve = document.querySelector('.btn-intensidad[data-valor="1"]');
    if (btnLeve) {
        btnLeve.click();
    }
    
    // Inicializar el acordeón (abrir el primer item)
    if (acordeonItems.length > 0) {
        acordeonItems[0].classList.add('active');
    }
});

btnSi.addEventListener('click', () => {
    esDolorosa = true;
    btnSi.classList.add('seleccionado');
    btnNo.classList.remove('seleccionado');
    validarFormulario();
});

btnNo.addEventListener('click', () => {
    esDolorosa = false;
    btnNo.classList.add('seleccionado');
    btnSi.classList.remove('seleccionado');
    validarFormulario();
});

btnsIntensidad.forEach(btn => {
    btn.addEventListener('click', () => {
        intensidadSeleccionada = btn.dataset.valor;
        btnsIntensidad.forEach(b => b.classList.remove('seleccionado'));
        btn.classList.add('seleccionado');
        validarFormulario();
    });
});

function validarFormulario() {
    btnRegistrarContraccion.disabled = esDolorosa === null || intensidadSeleccionada === null;
}

btnRegistrarContraccion.addEventListener('click', registrarContraccion);
btnGuardarInfo.addEventListener('click', guardarInfoEmbarazo);
btnBorrarHistorial.addEventListener('click', borrarHistorial);
btnUbicacion.addEventListener('click', mostrarHospitalesCercanos);
const btnExportarHistorial = document.getElementById('exportar-historial');
btnExportarHistorial.addEventListener('click', exportarHistorial);

btnIniciarCronometro.addEventListener('click', iniciarCronometro);
btnDetenerCronometro.addEventListener('click', detenerCronometro);
btnReiniciarCronometro.addEventListener('click', reiniciarCronometro);

// Event listeners para el acordeón
acordeonItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => toggleAccordion(item));
});