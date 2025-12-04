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
        Logger.warning('CourierNotification', 'Permissão para notificações push não concedida');
        return null;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId,
        })).data;

        // Atualiza tanto AsyncStorage quanto state para Courier
        await AsyncStorage.setItem('courierPushToken', token);
        setPushToken(token);
        Logger.success('CourierNotification', 'PushToken registrado e salvo');
        return token;
      } catch (error) {
        Logger.errorCritical('CourierNotification', 'Falha ao gerar pushToken', { error: error.message });
        return null;
      }
    } else {
      Logger.warning('CourierNotification', 'Notificações push disponíveis apenas em dispositivos físicos');
      return null;
    }
  }

  async function updatePushToken(newToken) {
    try {
      setPushToken(newToken);
      await AsyncStorage.setItem('courierPushToken', newToken);
      Logger.info('CourierNotification', 'PushToken atualizado', { token: newToken });
    } catch (error) {
      Logger.error('CourierNotification', 'Erro ao atualizar pushToken', { error: error.message });
    }
  }

  useEffect(() => {
    // Carrega pushToken do AsyncStorage na inicialização
    loadPushTokenFromStorage();

    // Listener para notificações recebidas
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      Logger.info('CourierNotification', 'Notificação recebida', { notification });
      setNotify(true);
      // Aqui você pode processar notificações específicas para entregas
    });

    // Listener para quando o usuário interage com a notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      Logger.info('CourierNotification', 'Usuário interagiu com notificação', { response });
      // Navegar para tela específica baseada no tipo da notificação
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function loadPushTokenFromStorage() {
    try {
      const storedToken = await AsyncStorage.getItem('courierPushToken');
      if (storedToken) {
        setPushToken(storedToken);
        Logger.info('CourierNotification', 'PushToken carregado do AsyncStorage');
      }
    } catch (error) {
      Logger.error('CourierNotification', 'Erro ao carregar pushToken', { error: error.message });
    }
  }

  function handleNotificationResponse(response) {
    const data = response.notification.request.content.data;

    // Processar diferentes tipos de notificação para entregadores
    switch (data.type) {
      case 'new_order':
        // Navegar para lista de pedidos ou aceitar pedido
        Logger.info('CourierNotification', 'Nova entrega disponível');
        break;
      case 'order_canceled':
        // Notificar cancelamento
        Logger.info('CourierNotification', 'Pedido cancelado');
        break;
      case 'delivery_update':
        // Atualização na entrega
        Logger.info('CourierNotification', 'Atualização na entrega');
        break;
      default:
        Logger.info('CourierNotification', 'Notificação genérica');
    }
  }

  return (
    <NotificationContext.Provider value={{
      pushToken,
      notify,
      setNotify,
      registerForPushNotifications,
      updatePushToken,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}