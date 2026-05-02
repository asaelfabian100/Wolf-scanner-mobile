# Wolf Inventory Control

**Versión:** v1.3.0 — Inventory foundation  
**Estatus:** MVP funcional cero pesos  
**Hosting recomendado:** GitHub Pages  
**Base central recomendada:** Firebase Firestore en Spark Plan

## 1. Qué problema resuelve

Wolf Inventory Control centraliza el control de inventario entre México y Colombia.

La sede de México funciona como administración central: crea entradas esperadas, visualiza stock, revisa ventas y audita movimientos. Colombia funciona como operación física: confirma entradas, escanea productos, crea ventas y descuenta inventario.

El scanner deja de ser el producto principal y pasa a ser una herramienta operativa dentro del módulo Colombia.

## 2. Flujo operativo

```text
México Admin
→ crea orden de entrada
→ define productos y cantidades esperadas

Colombia Operación
→ recibe la entrada
→ escanea o captura productos
→ confirma cantidades reales
→ sistema suma stock confirmado

Colombia Operación
→ crea venta
→ escanea o captura productos vendidos
→ confirma salida
→ sistema descuenta stock

México Admin
→ visualiza stock, ventas, diferencias y movimientos
```

## 3. Regla central

```text
México crea intención documental.
Colombia confirma realidad física.
Colombia vende.
El sistema registra movimientos auditables.
```

## 4. Funciones actuales v1.3

- Login con Firebase Authentication.
- Roles operativos:
  - `super_admin`
  - `mx_admin`
  - `co_operator`
  - `viewer`
- Panel de dashboard.
- Módulo México Admin.
- Módulo Colombia Operación.
- Creación de órdenes de entrada.
- Confirmación de entradas desde Colombia.
- Creación y confirmación de ventas desde Colombia.
- Descuento de inventario por venta confirmada.
- Stock centralizado en Firestore.
- Movimientos auditables.
- Scanner integrado como herramienta de evidencia.
- Captura manual de UPC/EAN/GTIN.
- Soporte PWA básico.
- Demo local para revisar interfaz sin Firebase.

## 5. Arquitectura cero pesos

```text
GitHub Pages
→ publica la app web/PWA con HTTPS

Firebase Authentication
→ login por correo y contraseña

Firebase Firestore Spark
→ servidor flotante free / base central

localStorage
→ respaldo local/demo operativo
```

No usar en esta etapa:

```text
Firebase Blaze
Cloud Functions
SMS Auth
Netlify
Servidor propio
Computadora 24/7
Google Drive como base principal
```

## 6. Estructura de archivos

```text
index.html
manifest.webmanifest
sw.js
icon.svg
README.md
firebase-config.js
firestore.rules
firestore-seed.json
```

## 7. Configuración GitHub Pages

1. Sube todos los archivos a la raíz del repositorio.
2. Ve a **Settings**.
3. Entra a **Pages**.
4. En **Build and deployment**, selecciona:
   - Branch: `main`
   - Folder: `/root`
5. Guarda.
6. Abre la URL HTTPS publicada por GitHub Pages.

## 8. Configuración Firebase cero pesos

1. Entra a Firebase Console.
2. Crea un proyecto nuevo.
3. Mantén el proyecto en **Spark Plan**.
4. No actives **Blaze**.
5. No agregues método de pago.
6. Activa **Authentication**.
7. Habilita proveedor **Email/Password**.
8. Crea usuarios desde Authentication.
9. Copia el UID de cada usuario.
10. Crea Firestore Database.
11. Crea documentos en `users/{UID}` usando la plantilla `firestore-seed.json`.
12. Pega las reglas de `firestore.rules` en Firestore Rules.
13. Crea una Web App en Firebase.
14. Copia la configuración en `firebase-config.js`.
15. Sube `firebase-config.js` actualizado a GitHub.

## 9. Roles

### `super_admin`

Control maestro.

Puede:

- Ver todo.
- Administrar perfiles.
- Crear entradas.
- Confirmar operaciones.
- Ver stock y movimientos.

### `mx_admin`

Administración México.

Puede:

- Crear órdenes de entrada.
- Ver stock Colombia.
- Ver ventas Colombia.
- Ver movimientos.

No debe operar ventas ni confirmación física ordinaria.

### `co_operator`

Operación Colombia.

Puede:

- Confirmar entradas.
- Crear ventas.
- Confirmar salidas.
- Escanear evidencia.
- Ver stock operativo.

### `viewer`

Consulta.

Puede:

- Ver dashboard.
- Ver stock.
- Ver movimientos.

No puede crear ni modificar operaciones.

## 10. Modelo de datos

Colecciones principales:

```text
users
products
entry_orders
sales_orders
inventory_stock
inventory_movements
scan_events
```

### `inventory_stock`

Representa el saldo actual.

### `inventory_movements`

Representa la auditoría. No se borra.

Regla:

```text
inventory_stock = saldo
inventory_movements = estado de cuenta
```

## 11. Privacidad

- La app no requiere servidor propio.
- La app usa Firebase Authentication para login.
- La información se guarda en Firestore.
- La cámara se usa desde el navegador del usuario.
- Los escaneos quedan como evidencia operativa.
- La librería ZXing se carga desde CDN en esta versión.
- Para máxima privacidad futura, ZXing puede empaquetarse localmente.

## 12. Limitaciones conocidas

- El MVP actual actualiza stock desde frontend usando Firestore Rules.
- No usa Cloud Functions para mantener cero pesos.
- No hay validación empresarial avanzada contra stock negativo.
- El scanner depende de HTTPS y permisos de cámara.
- La linterna y selección avanzada de cámara no están garantizadas en todos los navegadores.
- Firebase Spark tiene cuotas gratuitas; si se exceden, el servicio puede limitarse.

## 13. Roadmap futuro

- Validación fuerte de stock negativo.
- Flujo de venta en borrador/reserva/surtida.
- Ajustes autorizados con motivo obligatorio.
- Catálogo maestro enriquecido con Wolf Inventory Agent.
- Reportes por periodo.
- Kardex por producto.
- Diferencias por entrada.
- Panel de auditoría.
- Exportaciones CSV por módulo.
- Modo offline con cola real de sincronización.
- Separación futura de interfaces admin/operación si el volumen crece.
- Empaquetar ZXing localmente.

## 14. Historial de versiones

### v1.3.0 — Inventory foundation

- Reconstrucción conceptual del proyecto como Wolf Inventory Control.
- México Admin y Colombia Operación.
- Login y roles.
- Entradas, ventas, stock y movimientos.
- Scanner integrado como herramienta.

### v1.2.0 — Zero-cost sync foundation

- Preparación de sincronización centralizada.
- Concepto de servidor flotante free.
- Firebase como base central.

### v1.1.0 — Scanner batch UX

- Mejoras al scanner móvil.
- Lotes, cantidades, estados y exportaciones.

### v1.0.0 — Scanner inicial

- PWA privada para escaneo UPC/EAN/GTIN.
- Exportación CSV y prompt para Wolf Inventory Agent.
