import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import Logger from '../utils/logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [pushToken, setPushToken] = useState(null);
  const [notify, setNotify] = useState(false);

  async function registerForPushNotifications() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Logger.warning('NotificationContext', 'Permissão para notificações push não concedida');
        return null;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId,
        })).data;

        // Atualiza tanto AsyncStorage quanto state
        await AsyncStorage.setItem('vPushToken', token);
        setPushToken(token);
        Logger.success('NotificationContext', 'PushToken registrado e salvo');
        return token;
      } catch (error) {
        Logger.errorCritical('NotificationContext', 'Falha ao gerar pushToken', { error: error.message });
        return null;
      }
    } else {
      Logger.warning('NotificationContext', 'Notificações push disponíveis apenas em dispositivos físicos');
      return null;
    }
  }

  async function updatePushToken(newToken) {
    Logger.token('NotificationContext', 'Atualizando pushToken', { hasToken: !!newToken });
    setPushToken(newToken);
    if (newToken) {
      await AsyncStorage.setItem('vPushToken', newToken);
    }
  }

  async function getPushToken() {
    Logger.debug('NotificationContext', 'Buscando pushToken');

    // Primeiro tenta pegar do state
    if (pushToken) {
      Logger.debug('NotificationContext', 'Token encontrado no state');
      return pushToken;
    }

    // Depois tenta pegar do AsyncStorage
    const storedToken = await AsyncStorage.getItem('vPushToken');
    if (storedToken && storedToken !== 'null' && storedToken !== '') {
      Logger.debug('NotificationContext', 'Token encontrado no AsyncStorage');
      setPushToken(storedToken);
      return storedToken;
    }

    // Por último, registra um novo token
    Logger.info('NotificationContext', 'Registrando novo token');
    const newToken = await registerForPushNotifications();
    return newToken;
  }

  async function loadStoredToken() {
    try {
      const storedToken = await AsyncStorage.getItem('vPushToken');
      if (storedToken && storedToken !== 'null' && storedToken !== '') {
        Logger.debug('NotificationContext', 'Carregando token do AsyncStorage');
        setPushToken(storedToken);
      } else {
        Logger.debug('NotificationContext', 'Nenhum token válido encontrado no AsyncStorage');
        setPushToken(null);
      }
    } catch (error) {
      Logger.error('NotificationContext', 'Erro ao carregar token', { error: error.message });
      setPushToken(null);
    }
  } useEffect(() => {
    loadStoredToken();
  }, []);

  return (
    <NotificationContext.Provider value={{
      pushToken,
      notify,
      getPushToken,
      updatePushToken,
      setNotify,
      registerForPushNotifications,
      loadStoredToken
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
