// Wolf Inventory Control v1.3
// Firebase web app configuration for GitHub Pages + Firebase Spark.
// Mantener el proyecto en Spark Plan para operar con cero pesos.

export const firebaseConfig = {
  apiKey: "AIzaSyAUx_401rYXM03Qdl0RIu-19-VlGldaSJQ",
  authDomain: "wolf-inventory-control.firebaseapp.com",
  projectId: "wolf-inventory-control",
  storageBucket: "wolf-inventory-control.firebasestorage.app",
  messagingSenderId: "216606742360",
  appId: "1:216606742360:web:dce8efc3366a52f639b72d"
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("REEMPLAZA") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.startsWith("REEMPLAZA")
  );
}
