/**
* src/config/apiFirebase.js
*/

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DATABASEURL,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID
};
// Verifica se as variáveis de ambiente estão sendo carregadas corretamente
try {
  console.log('Firebase Config:', JSON.stringify(firebaseConfig, null, 2));
} catch { }

// Evita inicializar múltiplas vezes em hot reload
const firebase_app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let database = null;
try {
  database = getDatabase(firebase_app);
} catch (e) {
  console.warn('[Firebase] Realtime Database indisponível no momento:', e.message);
}

export { firebase_app, database };
