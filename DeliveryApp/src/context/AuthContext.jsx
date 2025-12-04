/**
 * DeliveryApp\src\context\AuthContext.jsx
 */

import React, { createContext, useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getDatabase, get, ref } from "firebase/database";
import { firebase_app } from '../config/apiFirebase';
import api from '../config/apiAxios';

const auth = getAuth(firebase_app);
const db = getDatabase(firebase_app);

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000); // Oculta a mensagem após 3 segundos
      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [message]);

  async function signIn(email, password) {
    setLoading(true);
    setMessage('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const id = result.user.uid;

      const userData = ref(db, 'deliveries/' + id);
      const snapshot = await get(userData);
      const data = snapshot.val();

      if (!data) {
        throw new Error('Usuário não encontrado no Firebase');
      }

      localStorage.setItem("vID", data.DeliveryID);
      localStorage.setItem("vDelivery", data.DeliveryName);
      localStorage.setItem("vMail", data.DeliveryMail);
      localStorage.setItem("vResponsavel", data.Responsavel || '');
      localStorage.setItem("vTelefone", data.Telefone || '');

      const deliveryId = parseFloat(localStorage.getItem("vID")); // converte VID para número

      const response = await api.post('/api/delivery/authenticate', {
        DELIVERY_ID: deliveryId,
        CHV: 1,
        timezoneOffset: new Date().getTimezoneOffset()
      });

      const token = response.data?.token;
      if (token) {
        localStorage.setItem('token', JSON.stringify(token));
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setAuthenticated(true);
        setResult('S');
        setLoading(false);
      } else {
        throw new Error('Token não encontrado na resposta da API');
      }
    } catch (error) {
      console.log('Erro ao autenticar:', error);
      setMessage('E-mail e/ou senha inválidos!');
      setAuthenticated(false);
      setResult('N');
      setLoading(false);
    }
    setLoading(false);
  }

  function signOut() {
    setAuthenticated(false);
    api.defaults.headers.Authorization = undefined;
    localStorage.removeItem("token");
    localStorage.removeItem("vID");
    localStorage.removeItem("vDelivery");
    localStorage.removeItem("vMail");
    localStorage.removeItem("vResponsavel");
    localStorage.removeItem("vTelefone");
    localStorage.removeItem("firebase:host:psi-deliverybairro-default-rtdb.firebaseio.com");
    console.clear();
  }

  function changePassword(email) {
    sendPasswordResetEmail(auth, email).then(() => {
      setMessage("Email de Recuperação enviado com sucesso! Confira sua caixa de Entrada.");
      setAuthenticated(false);
    }).catch(error => {
      setMessage('Erro ao enviar email: ' + error.message);
      setAuthenticated(false);
    })
  }

  return (
    <AuthContext.Provider value={{
      loading, message, result, authenticated,
      signIn, signOut, changePassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider };