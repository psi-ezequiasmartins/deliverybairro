/**
 * src/components/Header/index.js
 */

import { useEffect, useContext, useRef, useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../../contexts/CartContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { isDevelopment } from '../../config/apiAxios';
import Constants from 'expo-constants';
import Logger from '../../utils/logger';
import DebugPanel from '../DebugPanel';

import * as Notifications from 'expo-notifications';

import icon from '../../../assets/icon.png';
import logomarca from '../../../assets/logomarca.png';
import sacola from '../../../assets/pedidos.png';

// Verifica se está rodando no Expo Go (que não suporta push notifications)
const isExpoGo = Constants.appOwnership === 'expo';

export default function Header() {
  const navigation = useNavigation();
  const { basket } = useContext(CartContext);
  const { pushToken, registerForPushNotifications, getPushToken, loadStoredToken } = useContext(NotificationContext);
  const { setNotify } = useContext(NotificationContext);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const notificationListener = useRef();

  useEffect(() => {
    // Desabilita notificações push no Expo Go
    if (isExpoGo) {
      Logger.warning('Header', 'Notificações push desabilitadas no Expo Go');
      return;
    }

    // Força carregamento do token do AsyncStorage
    loadStoredToken();

    // Se não tiver pushToken, tenta obter um
    if (!pushToken) {
      Logger.debug('Header', 'PushToken não encontrado, tentando obter');
      getPushToken().then((token) => {
        Logger.token('Header', 'Resultado getPushToken', { hasToken: !!token });
      }).catch(error => {
        Logger.error('Header', 'Erro ao obter pushToken', { error: error.message });
      });
    }

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotify(true);
        // Verifica se é uma notificação de atualização de pedido
        if (notification.request.content.data?.type === 'order_update') {
          GoToLink('OrdersTab');
        }
      });
    } catch (error) {
      Logger.warning('Header', 'Erro ao configurar listener de notificações', { error: error.message });
    }

    return () => {
      if (notificationListener.current) {
        try {
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (error) {
          Logger.warning('Header', 'Erro ao remover listener de notificações', { error: error.message });
        }
      }
    };
  }, [setNotify, pushToken]);

  async function handleLogoPress() {
    // Força atualização do token antes de exibir
    const currentToken = await getPushToken();
    const displayToken = currentToken || 'null';

    Logger.debug('Header', 'Exibindo info do token', {
      contextToken: !!pushToken,
      currentToken: !!currentToken
    });

    alert(`deliverybairro.com - UserApp v3.2\nSuporte (31) 98410-7540\nToken (push notifications):\n${displayToken}`);
    GoToLink("Home");
  }

  function handleLongPress() {
    setShowDebugPanel(true);
  }

  function GoToLink(link) {
    if (link === 'Cart') {
      // Navegar para a tela Cart dentro do Stack de Deliveries no tab GroupsTab
      navigation.navigate('Main', {
        screen: 'GroupsTab',
        params: { screen: 'Cart' }
      });
    } else if (link === 'Home') {
      // Navegar para a tela principal (GroupsTab)
      navigation.navigate('Main', { screen: 'GroupsTab' });
    } else {
      // Fallback para outras navegações
      navigation.navigate(link);
    }
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleLogoPress}
        onLongPress={handleLongPress}
      >
        <Image source={icon} style={{ width: 85, height: 85 }} resizeMode="contain" />
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={logomarca} style={{ width: 180 }} resizeMode="contain" />
      </View>
      <TouchableOpacity onPress={() => GoToLink('Cart')}>
        <Image source={sacola} style={{ width: 55, height: 55 }} resizeMode="contain" />
        {basket.length >= 1 &&
          <View style={styles.dot}>
            <Text style={styles.dotText}>{basket?.length}</Text>
          </View>
        }
      </TouchableOpacity>

      <DebugPanel
        visible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomColor: '#CCC',
    borderBottomWidth: 0.5,
    marginBottom: 5,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
    zIndex: 99,
    bottom: 7,
    left: -10
  },
  dotText: {
    fontSize: 14,
    color: '#FFF'
  }
});
