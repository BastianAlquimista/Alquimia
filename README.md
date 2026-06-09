# ☿ Alquimia App — Con Firebase

## Paso 1 — Crear proyecto Firebase (5 min, gratis)

1. Ve a **console.firebase.google.com**
2. Inicia sesión con tu cuenta Google
3. Clic en **Agregar proyecto**
4. Nombre: `alquimia-app` → continuar → continuar → crear proyecto
5. Una vez dentro clic en **Firestore Database** (menú izquierdo)
6. Clic en **Crear base de datos**
7. Selecciona **Comenzar en modo de prueba** → siguiente → listo

## Paso 2 — Obtener las credenciales

1. En el menú izquierdo clic en el ícono de engranaje ⚙️ → **Configuración del proyecto**
2. Baja hasta **Tus apps** → clic en el ícono `</>` (web)
3. Nombre de la app: `alquimia` → clic en **Registrar app**
4. Copia el bloque `firebaseConfig` que aparece — tiene este formato:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "alquimia-app.firebaseapp.com",
  projectId: "alquimia-app",
  ...
};
```

## Paso 3 — Pegar las credenciales

1. Abre el archivo `src/firebase.js`
2. Reemplaza los valores `"TU_..."` con los de tu proyecto
3. Guarda el archivo

## Paso 4 — Subir a GitHub y Vercel

1. Sube todos estos archivos a tu repositorio GitHub (reemplaza los anteriores)
2. Vercel detecta el cambio y redeploya automático en 2 minutos
3. Listo — todos tus dispositivos sincronizan en tiempo real

## Reglas de Firestore (seguridad básica)

En Firebase Console → Firestore → Reglas, pega esto:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alquimia/{document} {
      allow read, write: if true;
    }
  }
}
```
