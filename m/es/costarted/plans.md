# Prodromo — Planes de desarrollo

## Descripción del proyecto

Prodromo es una aplicación web para el seguimiento de contracciones durante el embarazo. Permite registrar contracciones con cronómetro, evaluar intensidad y dolor, y alertar cuando los patrones sugieren trabajo de parto activo.

## Funcionalidades actuales

- **Registro de información del embarazo**: semanas de gestación y si es primer parto.
- **Cronómetro de contracciones**: inicio, pausa y reinicio para medir la duración exacta de cada contracción.
- **Evaluación de dolor e intensidad**: selección de si la contracción es dolorosa y su nivel de intensidad (leve, moderada, intensa).
- **Síntomas adicionales**: registro de pérdida del tapón mucoso, ruptura de aguas, sangrado y cambios en movimientos fetales.
- **Historial de contracciones**: tabla con fecha, duración, intensidad, intervalo y síntomas de cada contracción registrada.
- **Estadísticas**: frecuencia media, duración media e intensidad media de la última hora.
- **Alertas de trabajo de parto**: notificación automática cuando el patrón de contracciones cumple criterios clínicos (cada 3-5 min en primerizas, cada 5-7 min en multíparas, con duración ≥ 45 s durante al menos 1 hora).
- **Hospitales cercanos**: botón para localizar hospitales cercanos.
- **Exportar a CSV**: descarga del historial de contracciones en formato CSV.
- **Almacenamiento local**: persistencia de datos mediante cookies del navegador.

## Planes futuros

### Corto plazo

- Añadir soporte de Progressive Web App (PWA) para uso sin conexión y acceso directo desde la pantalla de inicio.
- Implementar almacenamiento con `localStorage` o `IndexedDB` en lugar de cookies para mejorar la persistencia y capacidad de datos.
- Agregar gráficos de evolución de contracciones a lo largo del tiempo (frecuencia, duración e intensidad).

### Medio plazo

- Añadir soporte multilingüe (inglés, portugués y otros idiomas).
- Permitir compartir el historial de contracciones con el equipo médico a través de un enlace o código QR.
- Incluir temporizador con notificaciones push para recordar registrar contracciones.
- Mejorar la accesibilidad (WCAG 2.1 nivel AA).

### Largo plazo

- Desarrollar una versión nativa para iOS y Android.
- Integrar con servicios de mapas para mostrar la ruta al hospital más cercano.
- Añadir inteligencia artificial para analizar patrones de contracciones y ofrecer recomendaciones personalizadas.
- Permitir que múltiples usuarios (pareja, familiar) sigan el progreso en tiempo real.

## Cómo empezar

1. Abre `index.html` en tu navegador.
2. Introduce las semanas de gestación y si es tu primer parto.
3. Pulsa **Guardar Información**.
4. Cuando empiece una contracción, pulsa **Iniciar** en el cronómetro.
5. Cuando termine, pulsa **Detener**, selecciona dolor e intensidad, y pulsa **Registrar Contracción**.
6. Consulta el historial y las estadísticas en la sección correspondiente.

## Contribuir

Las contribuciones son bienvenidas. Si deseas colaborar:

1. Haz un fork del repositorio.
2. Crea una rama con tu mejora: `git checkout -b mi-mejora`.
3. Realiza tus cambios y haz commit: `git commit -m "Descripción de la mejora"`.
4. Envía un pull request.
