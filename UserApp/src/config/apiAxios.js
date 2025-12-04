/**
 * src/config/apiAxios.js
 */

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';

export const isDevelopment = __DEV__;

if (!BASE_URL) {
  throw new Error('BASE_URL não está definida no arquivo .env');
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

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('Erro na resposta:', error.message);
  return Promise.reject(error);
});

export default api;
