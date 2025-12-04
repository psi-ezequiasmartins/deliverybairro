/**
 * App.js
 * eas build --platform android --profile preview
 * delirverybairro.com UserApp com sistema i18n
 */

import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: 'https://3e46534c96935d7bcc028ed7a6ec5fe6@o4505409112309760.ingest.us.sentry.io/4505648727654400', // Substitua por sua DSN real
  debug: __DEV__, // Logs apenas em desenvolvimento
});

import { useEffect, Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { OrderProvider } from './src/contexts/OrderContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { TranslateProvider } from './src/contexts/TranslateContext';
import { LogBox, View, Text } from 'react-native';
import Logger from './src/utils/logger';

LogBox.ignoreAllLogs(true); // Ignora todos os logs de aviso

import './src/i18n'; // Importa a configuração do i18n
import api from './src/config/apiAxios'; // Importa a configuração do Axios
import Routes from './src/routes';

// ErrorBoundary para capturar erros
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 [ErrorBoundary] Erro capturado:', error, errorInfo);
    Logger.error('ErrorBoundary', 'Erro crítico no app', { error: error.message, stack: error.stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Algo deu errado</Text>
          <Text style={{ fontSize: 14, color: 'red', textAlign: 'center' }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    console.log('🚀 [App] Iniciando aplicativo...');
    Logger.info('App', 'Aplicativo iniciado');

    async function checkConnectivity() {
      try {
        console.log('🔍 [App] Verificando conectividade...');
        const isConnected = await api.ping();
        if (!isConnected) {
          console.warn('⚠️ [App] Servidor offline ou inacessível');
          Logger.warning('App', 'Servidor offline ou inacessível');
        } else {
          console.log('✅ [App] Servidor online');
          Logger.success('App', 'Conectividade com servidor verificada');
        }
      } catch (error) {
        console.error('🔴 [App] Erro ao verificar conectividade:', error.message);
        Logger.error('App', 'Erro ao verificar conectividade', { error: error.message });
      }
    }

    checkConnectivity();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <TranslateProvider>
            <AuthProvider>
              <CartProvider>
                <OrderProvider>
                  <NotificationProvider>
                    <StatusBar style="dark" backgroundColor="#FFFFCC" translucent={false} />
                    <Routes />
                  </NotificationProvider>
                </OrderProvider>
              </CartProvider>
            </AuthProvider>
          </TranslateProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
