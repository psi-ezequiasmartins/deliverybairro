import { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/apiAxios';
import Logger from '../utils/logger';
import socket from '../services/socket';

export const AuthContext = createContext();

const COURIER_STORAGE_KEYS = [
  'token', 'expiresAt', 'courierID', 'courierNome', 'courierSobrenome',
  'courierTelefone', 'courierEmail', 'courierUrlImagem',
  'courierVehicleType', 'courierVehiclePlate', 'courierStatus', 'courierPushToken'
];

function mapCourier(data) {
  return {
    COURIER_ID: data.COURIER_ID,
    NOME: data.NOME || '',
    SOBRENOME: data.SOBRENOME || '',
    EMAIL: data.EMAIL || '',
    TELEFONE: data.TELEFONE || '',
    URL_IMAGEM: data.URL_IMAGEM || '',
    VEHICLE_TYPE: data.TRANSPORTE || data.VEHICLE_TYPE || 'DRIVING',
    VEHICLE_PLATE: data.PLACA || data.VEHICLE_PLATE || '',
    STATUS: data.STATUS || 'offline',
    RATING: data.RATING || 0,
    TOTAL_DELIVERIES: data.TOTAL_DELIVERIES || 0
  };
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [courier, setCourier] = useState(null);

  useEffect(() => {
    checkTokenValidity();
  }, []);

  useEffect(() => {
    if (!authenticated || !courier?.COURIER_ID) return undefined;
    const joinCourierRooms = () => {
      socket.emit('joinRoom', 'couriers');
      socket.emit('joinRoom', `courier_${courier.COURIER_ID}`);
    };
    socket.on('connect', joinCourierRooms);
    if (!socket.connected) socket.connect();
    else joinCourierRooms();
    return () => socket.off('connect', joinCourierRooms);
  }, [authenticated, courier?.COURIER_ID]);

  async function saveCourierSession(token, expiresIn, courierData) {
    const courierObj = mapCourier(courierData);
    const expiresAt = Date.now() + (expiresIn || 10800) * 1000;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('expiresAt', expiresAt.toString());
    await AsyncStorage.multiSet([
      ['courierID', String(courierObj.COURIER_ID)],
      ['courierNome', courierObj.NOME],
      ['courierSobrenome', courierObj.SOBRENOME],
      ['courierTelefone', courierObj.TELEFONE],
      ['courierEmail', courierObj.EMAIL],
      ['courierUrlImagem', courierObj.URL_IMAGEM],
      ['courierVehicleType', courierObj.VEHICLE_TYPE],
      ['courierVehiclePlate', courierObj.VEHICLE_PLATE],
      ['courierStatus', courierObj.STATUS]
    ]);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setCourier(courierObj);
    setAuthenticated(true);
  }

  async function signIn(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/api/courier/authenticate', {
        EMAIL: email.trim(),
        PASSWORD: password,
        timezoneOffset: new Date().getTimezoneOffset()
      });
      if (!data.token || !data.courier?.COURIER_ID) {
        throw new Error('Resposta de autenticação inválida');
      }
      await saveCourierSession(data.token, data.expiresIn, data.courier);
    } catch (error) {
      Logger.errorCritical('CourierAuth', 'Erro no login', {
        message: error.message,
        response: error.response?.data
      });
      Alert.alert('Erro no Login', 'E-mail ou senha inválidos.');
      setAuthenticated(false);
      setCourier(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(courierData) {
    setLoading(true);
    try {
      await api.post('/api/courier/register', {
        NOME: courierData.NOME,
        SOBRENOME: courierData.SOBRENOME,
        EMAIL: courierData.EMAIL.trim(),
        TELEFONE: courierData.TELEFONE,
        TRANSPORTE: courierData.TRANSPORTE,
        PLACA: courierData.PLACA || '',
        PASSWORD: courierData.password
      });
      Alert.alert('Cadastro Realizado', 'Seu cadastro foi realizado com sucesso!', [
        { text: 'OK', onPress: () => courierData.navigation?.goBack() }
      ]);
    } catch (error) {
      Logger.error('CourierAuth', 'Erro no cadastro', {
        message: error.message,
        response: error.response?.data
      });
      const message = error.response?.data?.error === 'EMAIL_ALREADY_REGISTERED'
        ? 'Este e-mail já possui cadastro. Use a recuperação de senha.'
        : error.response?.data?.details || 'Não foi possível concluir o cadastro.';
      Alert.alert('Erro no Cadastro', message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    socket.disconnect();
    await AsyncStorage.multiRemove(COURIER_STORAGE_KEYS);
    delete api.defaults.headers.Authorization;
    setCourier(null);
    setAuthenticated(false);
  }

  async function updateCourierStatus(status) {
    if (!courier) return;
    try {
      await api.put(`/api/courier/${courier.COURIER_ID}/status`, { status });
      setCourier(prev => ({ ...prev, STATUS: status }));
      await AsyncStorage.setItem('courierStatus', status);
    } catch (error) {
      Logger.error('CourierAuth', 'Erro ao atualizar status', { message: error.message });
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  }

  async function checkTokenValidity() {
    try {
      const [token, expiresAt, courierId] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('expiresAt'),
        AsyncStorage.getItem('courierID')
      ]);
      if (!token || !expiresAt || !courierId || Date.now() >= Number(expiresAt)) {
        await AsyncStorage.multiRemove(COURIER_STORAGE_KEYS);
        return;
      }

      api.defaults.headers.Authorization = `Bearer ${token}`;
      const { data } = await api.get(`/api/courier/${courierId}`);
      await saveCourierSession(token, Math.floor((Number(expiresAt) - Date.now()) / 1000), data);
    } catch (error) {
      Logger.error('CourierAuth', 'Erro ao restaurar sessão', { message: error.message });
      delete api.defaults.headers.Authorization;
      await AsyncStorage.multiRemove(COURIER_STORAGE_KEYS);
      setCourier(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function requestPasswordReset(email) {
    const { data } = await api.post('/api/courier/request-password-reset', { email: email.trim() });
    return data;
  }

  async function resetPassword(email, code, password) {
    await api.post('/api/courier/reset-password', {
      email: email.trim(),
      code,
      PASSWORD: password
    });
  }

  return (
    <AuthContext.Provider value={{
      authenticated,
      courier,
      loading,
      signIn,
      signUp,
      signOut,
      updateCourierStatus,
      requestPasswordReset,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}
