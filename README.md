# Wolf Inventory Control — mejora Capturar UPC compacto

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`

## Mejora aplicada

En la sección **Entradas**, el botón **Capturar UPC** ya no abre una ventana grande. Ahora se reemplaza por un recuadro compacto de cámara dentro de la misma línea.

## Comportamiento

- Al presionar **Capturar UPC**, el botón se reemplaza por la cámara.
- El recuadro incluye botón **Cerrar**.
- Al cerrar, la cámara se apaga y vuelve el botón.
- Solo puede haber un escáner abierto a la vez.
- Al detectar UPC, se llena el campo UPC y se cierra la cámara.
- Si hay diferencia entre cantidad esperada y confirmada, aparece **Solicitar aprobación**.

## Nota

Este paquete reemplaza la entrega anterior defectuosa y contiene una app completa estática para evitar pantallas en blanco.
