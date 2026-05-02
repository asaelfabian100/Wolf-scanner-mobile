# Wolf Inventory Control — mejoras Entradas y Confirmaciones

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`

## Cambios aplicados

- Se mantiene el menú lateral con Dashboard, Entradas, Confirmaciones de órdenes, Inventario, Usuarios y Configuración.
- Se agrega botón **Cerrar sesión** en el menú lateral.
- La sección **Entradas** queda enfocada en generar órdenes desde México.
- La orden México, origen y destino se capturan una sola vez arriba.
- Las líneas de Entradas solo incluyen Capturar UPC, UPC escaneado y Cantidad esperada.
- Se elimina de Entradas: estado por línea, cantidad confirmada, notas y confirmar.
- Se agrega botón general **Capturar entrada**.
- Al capturar la entrada, la orden viaja a **Confirmaciones de órdenes**.
- En Confirmaciones aparece orden, origen, destino, estado, capturar UPC, UPC recibido, cantidad esperada no editable, cantidad confirmada, notas y acciones.
- Si la cantidad confirmada difiere de la esperada, aparece **Solicitar autorización**.
- Se conserva el escáner UPC compacto dentro de la línea.
