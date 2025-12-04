/**
 * src/config/apiFirebase.js
 * Configuração Firebase para React Native usando Firebase Web SDK (compatível com Expo Go)
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback para variáveis Firebase caso @env falhe
let REACT_APP_APIKEY,
  REACT_APP_AUTHDOMAIN,
  REACT_APP_DATABASEURL,
  REACT_APP_PROJECTID,
  REACT_APP_STORAGEBUCKET,
  REACT_APP_MESSAGINGSENDERID,
  REACT_APP_APPID;

try {
  const env = require('@env');
  REACT_APP_APIKEY = env.REACT_APP_APIKEY;
  REACT_APP_AUTHDOMAIN = env.REACT_APP_AUTHDOMAIN;
  REACT_APP_DATABASEURL = env.REACT_APP_DATABASEURL;
  REACT_APP_PROJECTID = env.REACT_APP_PROJECTID;
  REACT_APP_STORAGEBUCKET = env.REACT_APP_STORAGEBUCKET;
  REACT_APP_MESSAGINGSENDERID = env.REACT_APP_MESSAGINGSENDERID;
  REACT_APP_APPID = env.REACT_APP_APPID;
} catch (error) {
  // Fallback para builds que não conseguem ler @env
  REACT_APP_APIKEY = 'AIzaSyBVZPJtP2wBvuOXEHYGETlysuE_8kwYLs4';
  REACT_APP_AUTHDOMAIN = 'psi-deliverybairro.firebaseapp.com';
  REACT_APP_DATABASEURL = 'https://psi-deliverybairro-default-rtdb.firebaseio.com';
  REACT_APP_PROJECTID = 'psi-deliverybairro';
  REACT_APP_STORAGEBUCKET = 'psi-deliverybairro.firebasestorage.app';
  REACT_APP_MESSAGINGSENDERID = '234983243246';
  REACT_APP_APPID = '1:234983243246:android:12c7a181d47dcdc492a2ff';
}

// Configuração do Firebase (você precisa adicionar suas credenciais)
const firebaseConfig = {
  apiKey: REACT_APP_APIKEY,
  authDomain: REACT_APP_AUTHDOMAIN,
  databaseURL: REACT_APP_DATABASEURL,
  projectId: REACT_APP_PROJECTID,
  storageBucket: REACT_APP_STORAGEBUCKET,
  messagingSenderId: REACT_APP_MESSAGINGSENDERID,
  appId: REACT_APP_APPID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obter instâncias dos serviços
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
export default app;
// Fim de src/config/apiFirebase.js
