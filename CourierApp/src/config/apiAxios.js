/**
 * src/config/apiAxios.js
 * Configuração do Axios para CourierApp
 */

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback para BASE_URL caso @env falhe
let BASE_URL;
export const isDevelopment = __DEV__;

try {
  const env = require('@env');
  BASE_URL = env.BASE_URL;
} catch (error) {
  // Fallback automático baseado no ambiente
  BASE_URL = __DEV__
    ? 'http://192.168.0.11:33570' // Backend local para desenvolvimento
    : 'https://srv.deliverybairro.com'; // Backend de produção
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus(status) {
    return status >= 200 && status < 300;
  }
});

api.ping = async () => {
  try {
    const response = await api.get('/api/ping');
    return response.status === 200;
  } catch (error) {
    if (error.response?.status === 401) console.warn('Acesso não autorizado à rota /api/ping.');
    else console.error('Erro de conectividade:', { message: error.message, status: error.response?.status, data: error.response?.data });
    return false;
  }
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout
      await AsyncStorage.multiRemove([
        'token', 'expiresAt', 'courierID', 'courierNome', 'courierSobrenome',
        'courierTelefone', 'courierEmail', 'courierPushToken', 'courierUrlImagem',
        'courierVehicleType', 'courierVehiclePlate', 'courierStatus'
      ]);
      delete api.defaults.headers.Authorization;
    }
    return Promise.reject(error);
  }
);

export default api;