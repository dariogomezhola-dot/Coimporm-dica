import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Configuración directa con las credenciales proporcionadas
// Esto elimina problemas de lectura de variables de entorno en hostings compartidos
const firebaseConfig = {
  apiKey: "AIzaSyDTuP7lHecHeSVNgJmnyppI0DasRrVb6wo",
  authDomain: "coimpormedica---academy.firebaseapp.com",
  projectId: "coimpormedica---academy",
  storageBucket: "coimpormedica---academy.firebasestorage.app",
  messagingSenderId: "397097091364",
  appId: "1:397097091364:web:fbfc44d92740f5cc8233b1",
  measurementId: "G-C7L7DRCX28"
};

const app = initializeApp(firebaseConfig);

// Exportamos los servicios para usarlos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);