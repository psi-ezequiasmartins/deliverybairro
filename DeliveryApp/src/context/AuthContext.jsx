/**
 * DeliveryApp\src\context\AuthContext.jsx
 */

import React, { createContext, useState, useEffect } from 'react';
import api from '../config/apiAxios';
import socket from '../services/socket';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [result, setResult] = useState('');

  useEffect(() => {
    setLoading(true);
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const token = JSON.parse(storedToken);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return undefined;
    const deliveryId = localStorage.getItem('vID');
    if (!deliveryId) return undefined;
    const joinDeliveryRoom = () => socket.emit('joinRoom', `delivery_${deliveryId}`);
    socket.on('connect', joinDeliveryRoom);
    if (!socket.connected) socket.connect();
    else joinDeliveryRoom();
    return () => socket.off('connect', joinDeliveryRoom);
  }, [authenticated]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  async function signIn(email, password) {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/api/delivery/authenticate', {
        EMAIL: email.trim(),
        PASSWORD: password,
        timezoneOffset: new Date().getTimezoneOffset()
      });
      const delivery = data.delivery;
      if (!data.token || !delivery?.DELIVERY_ID) {
        throw new Error('Invalid authentication response');
      }

      localStorage.setItem('token', JSON.stringify(data.token));
      localStorage.setItem('vID', delivery.DELIVERY_ID);
      localStorage.setItem('vDelivery', delivery.DELIVERY_NOME);
      localStorage.setItem('vMail', delivery.EMAIL);
      localStorage.setItem('vResponsavel', delivery.RESPONSAVEL || '');
      localStorage.setItem('vTelefone', delivery.TELEFONE || '');
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setAuthenticated(true);
      setResult('S');
    } catch (error) {
      console.error('Erro ao autenticar delivery:', error.message);
      setMessage('app.auth.invalid_credentials');
      setMessageType('error');
      setAuthenticated(false);
      setResult('N');
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setAuthenticated(false);
    socket.disconnect();
    api.defaults.headers.Authorization = undefined;
    localStorage.removeItem('token');
    localStorage.removeItem('vID');
    localStorage.removeItem('vDelivery');
    localStorage.removeItem('vMail');
    localStorage.removeItem('vResponsavel');
    localStorage.removeItem('vTelefone');
  }

  async function changePassword(email) {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/delivery/request-password-reset', { email: email.trim() });
      setMessage('app.auth.reset_code_sent');
      setMessageType('success');
      return true;
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error.message);
      setMessage('app.auth.reset_request_error');
      setMessageType('error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email, codigo, password) {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/api/delivery/reset-password', {
        email: email.trim(),
        codigo,
        PASSWORD: password
      });
      setMessage('app.auth.reset_complete');
      setMessageType('success');
      return true;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error.message);
      const errorCode = error.response?.data?.error;
      setMessage(errorCode === 'INVALID_OR_EXPIRED_RESET_CODE'
        ? 'app.auth.invalid_reset_code'
        : 'app.auth.reset_error');
      setMessageType('error');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{
      loading, message, messageType, result, authenticated,
      signIn, signOut, changePassword, resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
