# Wolf Scanner Mobile

**Versión inicial:** v1.0  
**Tipo:** PWA privada para iPhone  
**Hosting recomendado:** GitHub Pages

## 1. Nombre del proyecto

**Wolf Scanner Mobile**

Repositorio sugerido:

```text
wolf-scanner-mobile
```

## 2. Qué problema resuelve

Wolf Scanner Mobile permite capturar códigos **UPC/EAN/GTIN** de artículos coleccionables desde la cámara del iPhone, guardarlos temporalmente en una lista local y prepararlos para ser procesados después por **Wolf Inventory Agent**.

El objetivo es evitar capturas manuales lentas, screenshots o registros uno por uno.

## 3. Flujo de uso

```text
iPhone
→ abrir Wolf Scanner Mobile
→ escanear productos
→ copiar listado de códigos
→ pegarlo en ChatGPT
→ Wolf Inventory Agent genera CSV enriquecido
→ importar CSV al inventario principal
```

## 4. Funciones actuales

- Abrir cámara desde Safari en iPhone.
- Escanear códigos UPC/EAN/GTIN.
- Guardar códigos capturados en una lista.
- Evitar duplicados.
- Contador de códigos capturados.
- Contador de duplicados detectados.
- Agregar código manualmente.
- Copiar solo el listado de códigos, uno por línea.
- Copiar prompt completo para ChatGPT:

```text
Wolf Inventory Agent: procesa estos EAN y genera CSV para inventario:
[códigos aquí]
```

- Exportar CSV compatible con el inventario.
- Guardar temporalmente datos en `localStorage`.
- Limpiar lista con confirmación.
- Soporte básico PWA.

## 5. Instalación en iPhone

1. Abrir la URL publicada de GitHub Pages desde **Safari**.
2. Tocar el botón **Compartir**.
3. Elegir **Agregar a pantalla de inicio**.
4. Confirmar el nombre **Wolf Scanner**.
5. Abrir la app desde el ícono creado.

## 6. Publicación en GitHub Pages

1. Crear repositorio público en GitHub.
2. Subir estos archivos a la raíz del repositorio:

```text
index.html
manifest.webmanifest
sw.js
icon.svg
README.md
```

3. Entrar a **Settings**.
4. Ir a **Pages**.
5. En **Build and deployment**, seleccionar:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

6. Guardar cambios.
7. Esperar a que GitHub genere la URL HTTPS.

## 7. Estructura de archivos

```text
wolf-scanner-mobile/
├─ index.html
├─ manifest.webmanifest
├─ sw.js
├─ icon.svg
└─ README.md
```

## 8. Privacidad

- La app no requiere login.
- La app no envía códigos a una base de datos propia.
- Los datos capturados se guardan localmente en el navegador mediante `localStorage`.
- El usuario decide cuándo copiar o exportar los datos.
- La versión actual carga ZXing Browser desde CDN.
- Para máxima privacidad, una versión futura puede empaquetar ZXing localmente sin depender de CDN.

## 9. Limitaciones conocidas

- La cámara en iPhone requiere abrir la app desde una URL segura **HTTPS**.
- No se recomienda abrir el archivo localmente.
- La librería de escaneo se carga desde CDN en la versión v1.0.
- El soporte offline es parcial porque la librería externa depende de conexión al cargar por primera vez.
- La app no identifica productos; solo captura códigos.
- El enriquecimiento de datos se realiza después con ChatGPT y Wolf Inventory Agent.

## 10. Roadmap futuro

- Modo sesión/lote.
- Nombre de lote de captura.
- Fecha automática por sesión.
- Exportación TXT además de CSV.
- Edición de cantidad por código.
- Campo de estado rápido: Nuevo, Sellado, Abierto, Usado.
- Historial de sesiones.
- Botón para compartir por WhatsApp o copiar en portapapeles.
- Mejor soporte offline.
- Versión autocontenida sin CDN.
- Mejoras visuales tipo Wolf Collector.

## 11. Historial de versiones

### v1.0 — Base funcional PWA

**Título:** Wolf Scanner Mobile v1.0  
**Summary:** Base funcional para escaneo UPC/EAN/GTIN desde iPhone.

Cambios principales:

- Se crea la estructura inicial del proyecto.
- Se agrega interfaz móvil para Safari en iPhone.
- Se integra ZXing Browser desde CDN.
- Se agrega captura por cámara.
- Se agrega captura manual.
- Se agrega prevención de duplicados.
- Se agrega copiado de listado.
- Se agrega copiado de prompt para ChatGPT.
- Se agrega exportación CSV compatible con inventario.
- Se agrega persistencia temporal con `localStorage`.
- Se agrega configuración inicial de PWA.

**Riesgo:** Bajo/medio. La función de cámara depende de permisos del navegador, HTTPS y compatibilidad de Safari con la librería de escaneo.
