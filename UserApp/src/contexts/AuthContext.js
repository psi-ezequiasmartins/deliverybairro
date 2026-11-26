import { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/apiAxios';
import Logger from '../utils/logger';
import socket from '../services/socket';
import { joinRoom, clearAllRooms, initializeSocketListeners } from '../services/socketRoomManager';

export const AuthContext = createContext();

const USER_STORAGE_KEYS = [
  'token', 'expiresAt', 'vUserID', 'vNome', 'vSobrenome',
  'vTelefone', 'vEmail', 'vUrlImagem', 'vPushToken'
];

function mapUser(userData) {
  return {
    USER_ID: userData.USER_ID,
    NOME: userData.NOME || '',
    SOBRENOME: userData.SOBRENOME || '',
    EMAIL: userData.EMAIL || '',
    TELEFONE: userData.TELEFONE || '',
    URL_IMAGEM: userData.URL_IMAGEM || ''
  };
}

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeSocketListeners();
    checkTokenValidity();
  }, []);

  function connectUserSocket(userId) {
    const joinUserRoom = () => joinRoom(`user_${userId}`, true);
    socket.off('connect', joinUserRoom);
    socket.on('connect', joinUserRoom);
    if (!socket.connected) socket.connect();
    else joinUserRoom();
  }

  async function signIn(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/api/user/authenticate', {
        EMAIL: email.trim(),
        PASSWORD: password,
        timezoneOffset: new Date().getTimezoneOffset()
      });
      if (!data.token || !data.userId) throw new Error('Resposta de autenticação inválida');

      const expiresAt = Date.now() + (data.expiresIn || 10800) * 1000;
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('expiresAt', expiresAt.toString());
      await AsyncStorage.setItem('vUserID', String(data.userId));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;

      const response = await api.get(`/api/user/${data.userId}`);
      const userObj = mapUser(response.data);
      await AsyncStorage.multiSet([
        ['vNome', userObj.NOME],
        ['vSobrenome', userObj.SOBRENOME],
        ['vTelefone', userObj.TELEFONE],
        ['vEmail', userObj.EMAIL],
        ['vUrlImagem', userObj.URL_IMAGEM]
      ]);

      setUser(userObj);
      setAuthenticated(true);
      connectUserSocket(userObj.USER_ID);
    } catch (error) {
      Logger.errorCritical('AuthContext', 'Erro no login', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      api.defaults.headers.Authorization = undefined;
      await AsyncStorage.multiRemove(USER_STORAGE_KEYS);
      Alert.alert(t('common.error'), t('messages.invalidCredentials'));
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(nome, sobrenome, telefone, email, password, confirmPassword) {
    if (!email || !password || !nome || !sobrenome || !telefone) {
      Alert.alert(t('common.error'), t('signup.requiredFields'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signup.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('messages.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/user/register', {
        NOME: nome.trim(),
        SOBRENOME: sobrenome.trim(),
        TELEFONE: telefone.trim(),
        EMAIL: email.trim(),
        PASSWORD: password
      });
      Alert.alert(t('common.success'), t('signup.success'));
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao registrar usuário', {
        message: error.message,
        response: error.response?.data
      });
      const message = error.response?.data?.error === 'EMAIL_ALREADY_REGISTERED'
        ? t('signup.emailAlreadyRegistered')
        : t('signup.error');
      Alert.alert(t('common.error'), message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    clearAllRooms();
    socket.disconnect();
    setAuthenticated(false);
    setUser(null);
    api.defaults.headers.Authorization = undefined;
    await AsyncStorage.multiRemove(USER_STORAGE_KEYS);
  }

  async function changePassword(email) {
    setLoading(true);
    try {
      await api.post('/api/user/request-password-reset', { email: email.trim() });
      Alert.alert(t('reset.title'), t('reset.codeSent'));
      return true;
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao solicitar redefinição de senha', { message: error.message });
      Alert.alert(t('common.error'), t('reset.error'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email, code, password) {
    setLoading(true);
    try {
      await api.post('/api/user/reset-password', {
        email: email.trim(),
        code,
        PASSWORD: password
      });
      Alert.alert(t('reset.title'), t('reset.passwordUpdated'));
      return true;
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao redefinir senha', { message: error.message });
      const errorKey = error.response?.data?.error === 'INVALID_OR_EXPIRED_RESET_CODE'
        ? 'reset.invalidCode'
        : 'reset.error';
      Alert.alert(t('common.error'), t(errorKey));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function checkTokenValidity() {
    try {
      const [token, expiresAt, userId] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('expiresAt'),
        AsyncStorage.getItem('vUserID')
      ]);
      if (!token || !expiresAt || !userId || Date.now() >= Number(expiresAt)) {
        await AsyncStorage.multiRemove(USER_STORAGE_KEYS);
        setAuthenticated(false);
        return;
      }

      api.defaults.headers.Authorization = `Bearer ${token}`;
      const response = await api.get(`/api/user/${userId}`);
      const userObj = mapUser(response.data);
      setUser(userObj);
      setAuthenticated(true);
      connectUserSocket(userObj.USER_ID);
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao verificar a sessão', { message: error.message });
      api.defaults.headers.Authorization = undefined;
      await AsyncStorage.multiRemove(USER_STORAGE_KEYS);
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{
      signed: !!authenticated,
      user,
      setUser,
      loading,
      signIn,
      signUp,
      changePassword,
      resetPassword,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}
