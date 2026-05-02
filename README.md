# Wolf Scanner Mobile

**Versión actual:** v1.1  
**Tipo:** PWA privada para iPhone  
**Hosting recomendado:** GitHub Pages

## Qué problema resuelve

Wolf Scanner Mobile permite capturar códigos **UPC/EAN/GTIN** desde la cámara del iPhone, acumularlos en una lista local y preparar la información para que **Wolf Inventory Agent** genere un CSV enriquecido para inventario.

La app no intenta identificar productos ni completar datos comerciales. Su función es capturar códigos de forma rápida, ordenada y exportable.

## Flujo de uso

1. Abrir la URL HTTPS publicada en GitHub Pages desde Safari en iPhone.
2. Iniciar cámara.
3. Escanear códigos UPC/EAN/GTIN.
4. Revisar lista capturada.
5. Ajustar cantidad o estado si aplica.
6. Copiar listado o prompt para ChatGPT.
7. Exportar CSV base para inventario.
8. Procesar los códigos con Wolf Inventory Agent.

## Funciones actuales

- Escaneo de códigos UPC/EAN/GTIN usando cámara del iPhone.
- Librería **ZXing Browser** cargada desde CDN.
- Captura manual individual.
- Captura manual masiva pegando varios códigos.
- Prevención de duplicados.
- Incremento automático de cantidad cuando un código duplicado se vuelve a capturar.
- Contador de códigos únicos.
- Contador de piezas totales.
- Contador de duplicados.
- Nombre de lote/sesión.
- Fecha de sesión.
- Modo de captura continuo o uno por uno.
- Búsqueda dentro de la lista.
- Ordenamiento por fecha, código o cantidad.
- Edición rápida de cantidad.
- Estado rápido: Nuevo, Sellado, Abierto, Usado.
- Copiar listado de códigos, uno por línea.
- Copiar prompt completo para ChatGPT.
- Exportar CSV compatible con inventario.
- Exportar TXT.
- Compartir usando Web Share API cuando el navegador lo soporte.
- Persistencia temporal con `localStorage`.
- Service Worker básico para PWA.
- Migración automática desde almacenamiento local de v1.0 si existe.

## Instalación en iPhone

1. Abrir la URL de GitHub Pages en Safari.
2. Tocar el botón de compartir.
3. Elegir **Agregar a pantalla de inicio**.
4. Confirmar el nombre **Wolf Scanner**.
5. Abrir la app desde el ícono creado.

## Publicación en GitHub Pages

1. Entrar al repositorio `wolf-scanner-mobile`.
2. Ir a **Settings**.
3. Ir a **Pages**.
4. En **Build and deployment**, seleccionar:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ root**
5. Guardar.
6. Abrir la URL HTTPS generada por GitHub Pages.

La URL tendrá una estructura parecida a:

```text
https://TU-USUARIO.github.io/wolf-scanner-mobile/
```

## Estructura de archivos

```text
index.html
manifest.webmanifest
sw.js
icon.svg
README.md
```

## Privacidad

- La app no requiere login.
- La app no envía códigos a una base de datos propia.
- Los datos capturados se guardan localmente en el navegador mediante `localStorage`.
- El usuario decide cuándo copiar, compartir o exportar los datos.
- La librería ZXing se carga desde CDN en la versión actual.
- Para máxima privacidad, una versión futura puede empaquetar ZXing localmente y eliminar la dependencia del CDN.

## Limitaciones conocidas

- La cámara en iPhone requiere HTTPS.
- Safari puede pedir permisos de cámara cada cierto tiempo.
- La linterna puede no estar disponible en todos los modelos o versiones de Safari.
- El soporte offline depende del caché del navegador.
- La primera carga requiere conexión para descargar ZXing desde CDN.
- `localStorage` puede borrarse si el usuario limpia datos del navegador.
- La app captura códigos; no identifica productos ni consulta catálogos.

## Columnas CSV oficiales

La exportación CSV usa estas columnas:

```text
UPC_EAN_GTIN
DESCRIPCION_ORIGINAL
CATEGORIA
MARCA
LINEA
NOMBRE_ARTICULO
NOMBRE_BUSQUEDA
ESTADO
CANTIDAD
PRECIO_PAGADO
FECHA_COMPRA
LUGAR_COMPRA
ASIN
SKU_INTERNO
URL_REFERENCIA
BUSCAR_AUTOMATICO
STATUS_CAPTURA
NOTAS
```

## Reglas de llenado CSV

- `UPC_EAN_GTIN`: código capturado.
- `NOMBRE_BUSQUEDA`: mismo código capturado.
- `ESTADO`: valor elegido por el usuario si existe.
- `CANTIDAD`: cantidad capturada o ajustada.
- `BUSCAR_AUTOMATICO`: `Si`.
- `STATUS_CAPTURA`: `PENDIENTE`.
- `NOTAS`: incluye lote, fecha de sesión y marca de captura.
- El resto de columnas quedan vacías para enriquecimiento posterior.

## Roadmap futuro

- Historial de sesiones.
- Exportación por lote histórico.
- Edición avanzada por código.
- Mejoras visuales tipo Wolf Collector.
- Mejor soporte offline.
- Versión autocontenida sin CDN.
- Lectura optimizada por formato específico.
- Importación desde CSV previo.
- Respaldo manual JSON.
- Restauración manual JSON.

## Historial de versiones

### v1.1

**Título:** Wolf Scanner Mobile v1.1 — Front reconstruido para captura por lote

**Summary:** Mejora completa del front para hacerlo más útil en sesiones reales de captura desde iPhone.

Cambios principales:

- Rediseño visual completo.
- Sesión/lote de captura.
- Fecha de sesión.
- Captura manual masiva.
- Cantidad editable.
- Estado rápido por código.
- Búsqueda y ordenamiento.
- Exportación TXT.
- Compartir con Web Share API.
- Intento de linterna cuando el navegador lo soporte.
- Cambio de cámara cuando hay más de una disponible.
- Migración local desde v1.0.

### v1.0

**Título:** Wolf Scanner Mobile v1.0 — Base funcional

**Summary:** Primera versión funcional para escaneo, lista local, copiado de prompt y exportación CSV.
