// Wolf Inventory Control v1.3
// 1) Crea tu proyecto en Firebase usando Spark Plan.
// 2) En Firebase Console > Project settings > Your apps > Web app, copia la configuración.
// 3) Reemplaza los valores placeholder de abajo.
// 4) No actives Blaze ni agregues método de pago para mantener cero pesos.

export const firebaseConfig = {
  apiKey: "REEMPLAZA_API_KEY",
  authDomain: "REEMPLAZA_PROJECT_ID.firebaseapp.com",
  projectId: "REEMPLAZA_PROJECT_ID",
  storageBucket: "REEMPLAZA_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "REEMPLAZA_SENDER_ID",
  appId: "REEMPLAZA_APP_ID"
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("REEMPLAZA") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.startsWith("REEMPLAZA")
  );
}
