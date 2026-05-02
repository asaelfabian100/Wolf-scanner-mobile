# Wolf Inventory Control — UX/Auth Fix

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`

## Correcciones principales

- Se restaura pantalla de login con correo y contraseña.
- Se agrega sesión local con `sessionStorage`.
- Cerrar sesión ahora limpia la sesión y regresa al login.
- Se rediseña Cerrar sesión para que haga sintonía con el menú lateral.
- Se revisa UX general: espaciados, jerarquía visual, toolbar, cards, tablas y estados.
- Se mantiene la estructura con menú lateral.
- Se mantiene el flujo de Entradas y Confirmaciones de órdenes.
- Se conserva el escáner UPC compacto dentro de la línea.

## Acceso demo

- Correo: `admin@wolf.com`
- Contraseña: `admin123`

## Nota de producción

La autenticación incluida es demo local. En producción debe reemplazarse por Firebase Auth:

- `signInWithEmailAndPassword(auth, email, password)`
- `signOut(auth)`
- `onAuthStateChanged(auth, callback)`
