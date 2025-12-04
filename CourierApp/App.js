/**
 * CourierApp.js
 * App para entregadores do DelireryBairro
 * Sistema de coletas e entregas integrado com UserApp e DeliveryApp
 */

import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { OrderProvider } from './src/contexts/OrderContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { TranslateProvider } from './src/contexts/TranslateContext';
import Logger from './src/utils/logger';
import './src/i18n';
import api from './src/config/apiAxios';
import Routes from './src/routes';

LogBox.ignoreAllLogs(true);

// Configura interceptor para logs de requisições
api.interceptors.request.use(
  (config) => {
    Logger.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    Logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    Logger.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    Logger.error('API Response Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

function App() {
  useEffect(() => {
    Logger.log('CourierApp iniciado');
  }, []);

  return (
    <TranslateProvider>
      <AuthProvider>
        <NotificationProvider>
          <OrderProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Routes />
              </NavigationContainer>
            </SafeAreaProvider>
          </OrderProvider>
        </NotificationProvider>
      </AuthProvider>
    </TranslateProvider>
  );
}

export default App;