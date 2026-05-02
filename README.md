# Wolf Inventory Control — Firebase Auth + Roles restaurado

## Archivos incluidos

- `index.html`
- `styles.css`
- `app.js`
- `firebase-config.js`
- `README.md`

## Qué corrige esta versión

- Elimina el login demo local.
- Restaura login con Firebase Auth.
- Restaura cierre de sesión con Firebase `signOut`.
- Lee perfiles/roles desde Firestore.
- Soporta roles:
  - Owner
  - Super Admin
  - Operador México
  - Operador Colombia
  - Auditor
- Aplica permisos visibles en el menú.
- Guarda órdenes en Firestore en la colección `orders`.
- Carga órdenes desde Firestore en Confirmaciones de órdenes.
- Mantiene la mejora de cámara UPC compacta.
- Mantiene la separación entre Entradas y Confirmaciones de órdenes.

## Configuración requerida

Pegar la configuración real del proyecto en:

```js
firebase-config.js
```

No cambiar el nombre exportado:

```js
export const firebaseConfig = { ... }
```

## Colecciones esperadas

La app busca perfil del usuario en este orden:

1. `users/{uid}`
2. `userProfiles/{uid}`
3. `profiles/{uid}`

Campos recomendados:

```js
{
  email: "usuario@empresa.com",
  displayName: "Nombre Usuario",
  role: "super-admin",
  active: true,
  permissions: []
}
```

## Roles soportados

- `owner`
- `super-admin`
- `superadmin`
- `operador-mexico`
- `operador-colombia`
- `auditor`

## Colección de órdenes

```js
orders/{folioInterno}
```

Cada orden guarda:

```js
{
  mexicoOrderNumber,
  origin,
  destination,
  status,
  createdAt,
  createdAtServer,
  createdBy,
  createdByEmail,
  lines: []
}
```

## Nota

Esta versión no crea usuarios ni contraseñas. Usa los usuarios que ya existen en Firebase Auth.
