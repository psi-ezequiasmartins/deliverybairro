/**
 * src/contexts/AuthContext.js
 * Context de autenticação para CourierApp - Entregadores
 */

import { createContext, useState, useEffect, useContext } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut as firebaseSignOut } from "firebase/auth";
import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth } from '../config/apiFirebase';
import firebase_app from '../config/apiFirebase';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from './NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/apiAxios';
import Logger from '../utils/logger';
import Constants from 'expo-constants';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const { registerForPushNotifications, updatePushToken } = useContext(NotificationContext) || {};
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [courier, setCourier] = useState(null);
  const db = getDatabase(firebase_app);

  // Detecta se está rodando no Expo Go
  const isExpoGo = Constants?.appOwnership === 'expo';

  useEffect(() => {
    setLoading(true);
    checkTokenValidity();
  }, []);

  async function signIn(email, password) {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const id = result.user.uid;
      const snapshot = await get(ref(db, `couriers/${id}`));
      const rtdbData = snapshot.val() || {};
      const courierId = rtdbData.CourierID;

      let pushToken = rtdbData.PushToken;

      if (!courierId) {
        Logger.errorCritical('CourierAuth', 'CourierID não encontrado no RTDB', rtdbData);
        Alert.alert('Erro', 'CourierID não encontrado. Verifique o cadastro.');
        setLoading(false);
        return;
      }

      // Garante que sempre temos um pushToken válido
      if (!pushToken || pushToken === null || pushToken === '') {
        Logger.info('CourierAuth', 'PushToken não encontrado, gerando novo');
        if (registerForPushNotifications) {
          try {
            pushToken = await registerForPushNotifications();
            Logger.success('CourierAuth', 'Novo pushToken gerado');

            if (pushToken) {
              // Atualiza no RTDB
              await update(ref(db, 'couriers/' + id), { PushToken: pushToken });
              Logger.success('CourierAuth', 'PushToken atualizado no RTDB');

              // Sincroniza com NotificationContext
              if (updatePushToken) {
                await updatePushToken(pushToken);
              }
            }
          } catch (error) {
            Logger.error('CourierAuth', 'Erro ao gerar pushToken', { error: error.message });
            pushToken = '';
          }
        } else {
          Logger.warning('CourierAuth', 'registerForPushNotifications não disponível');
          pushToken = '';
        }
      } else {
        Logger.debug('CourierAuth', 'PushToken existente encontrado');
        if (updatePushToken) {
          await updatePushToken(pushToken);
        }
      }

      // Autenticação JWT para Courier
      const authPayload = {
        COURIER_ID: courierId,
        CHV: 1,
        timezoneOffset: new Date().getTimezoneOffset(),
      };

      const authResponse = await api.post('/api/courier/authenticate', authPayload);
      const token = authResponse.data?.token;
      const expiresAt = Date.now() + (authResponse.data.expiresIn || 10800) * 1000;

      if (!token) {
        throw new Error('Token não encontrado na resposta do backend.');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('expiresAt', expiresAt.toString());

      // Configura o token no header do axios
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // Dados complementares do entregador via backend
      const response = await api.get(`/api/courier/${courierId}`);
      const courierData = response.data || {};

      if (!courierData || !courierData.COURIER_ID) {
        throw new Error('Dados do entregador não encontrados no backend');
      }

      // Monta objeto courier
      const courierObj = {
        COURIER_ID: courierData.COURIER_ID,
        NOME: courierData.NOME || '',
        SOBRENOME: courierData.SOBRENOME || '',
        EMAIL: courierData.EMAIL || '',
        TELEFONE: courierData.TELEFONE || '',
        URL_IMAGEM: courierData.URL_IMAGEM || '',
        VEHICLE_TYPE: courierData.VEHICLE_TYPE || 'moto',
        VEHICLE_PLATE: courierData.VEHICLE_PLATE || '',
        STATUS: courierData.STATUS || 'offline',
        RATING: courierData.RATING || 0,
        TOTAL_DELIVERIES: courierData.TOTAL_DELIVERIES || 0,
        PUSH_TOKEN: pushToken || '',
        FIREBASE_UID: id
      };

      Logger.info('CourierAuth', 'Dados do entregador carregados', {
        courierId: courierObj.COURIER_ID,
        status: courierObj.STATUS,
        vehicleType: courierObj.VEHICLE_TYPE
      });

      // Atualiza RTDB com dados essenciais
      await set(ref(db, 'couriers/' + id), {
        CourierID: courierObj.COURIER_ID,
        Nome: courierObj.NOME,
        Sobrenome: courierObj.SOBRENOME,
        Email: courierObj.EMAIL,
        Telefone: courierObj.TELEFONE,
        VehicleType: courierObj.VEHICLE_TYPE,
        Status: courierObj.STATUS,
        PushToken: courierObj.PUSH_TOKEN
      });

      // Salva no AsyncStorage
      await AsyncStorage.multiSet([
        ["courierID", String(courierObj.COURIER_ID)],
        ["courierNome", courierObj.NOME],
        ["courierSobrenome", courierObj.SOBRENOME],
        ["courierTelefone", courierObj.TELEFONE],
        ["courierEmail", courierObj.EMAIL],
        ["courierPushToken", courierObj.PUSH_TOKEN],
        ["courierUrlImagem", courierObj.URL_IMAGEM],
        ["courierVehicleType", courierObj.VEHICLE_TYPE],
        ["courierVehiclePlate", courierObj.VEHICLE_PLATE],
        ["courierStatus", courierObj.STATUS],
      ]);

      Logger.success('CourierAuth', 'Login realizado com sucesso', {
        courierId: courierObj.COURIER_ID,
        hasPushToken: !!courierObj.PUSH_TOKEN
      });

      setCourier(courierObj);
      setAuthenticated(true);
    } catch (error) {
      Logger.errorCritical('CourierAuth', 'Erro no login', {
        message: error.message,
        code: error.code
      });
      Alert.alert('Erro no Login', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(courierData) {
    setLoading(true);
    try {
      Logger.info('CourierAuth', 'Iniciando cadastro', { email: courierData.EMAIL });

      // 1. Gerar PushToken se disponível e não estiver no Expo Go
      let validPushToken = '';
      if (!isExpoGo && registerForPushNotifications) {
        try {
          validPushToken = await registerForPushNotifications();
          Logger.success('CourierAuth', 'PushToken gerado', { hasPushToken: !!validPushToken });
        } catch (error) {
          Logger.error('CourierAuth', 'Erro ao gerar pushToken', { error: error.message });
          validPushToken = '';
        }
      } else if (isExpoGo) {
        Logger.info('CourierAuth', 'Ignorando pushToken (Expo Go)');
        validPushToken = '';
      }

      // 2. Criar conta no Firebase Auth
      const { email, password } = courierData;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = result.user.uid;

      Logger.info('CourierAuth', 'Firebase Auth criado', { firebaseUid });

      // 3. Registrar no backend (MySQL)
      const backendPayload = {
        FIREBASE_UID: firebaseUid,
        NOME: courierData.NOME,
        SOBRENOME: courierData.SOBRENOME,
        EMAIL: courierData.EMAIL,
        TELEFONE: courierData.TELEFONE,
        TRANSPORTE: courierData.TRANSPORTE,
        PLACA: courierData.PLACA || ''
      };

      const response = await api.post('/api/courier/register', backendPayload);

      Logger.success('CourierAuth', 'Cadastro no backend realizado', response.data);

      if (response.data?.success && response.data?.courierId) {
        const courierId = response.data.courierId;

        // 4. Salvar no RTDB (Real Time Database)
        await set(ref(db, 'couriers/' + firebaseUid), {
          CourierID: courierId,
          Nome: courierData.NOME,
          Sobrenome: courierData.SOBRENOME,
          Email: courierData.EMAIL,
          Telefone: courierData.TELEFONE,
          Transporte: courierData.TRANSPORTE,
          Placa: courierData.PLACA || '',
          PushToken: validPushToken || ''
        });

        Logger.success('CourierAuth', 'Dados salvos no RTDB', { courierId });

        Alert.alert(
          'Cadastro Realizado',
          'Seu cadastro foi realizado com sucesso!',
          [{
            text: 'OK', onPress: () => {
              firebaseSignOut(auth);
              if (typeof courierData.navigation === 'function') {
                courierData.navigation('SignIn');
              } else if (courierData.navigation && courierData.navigation.navigate) {
                courierData.navigation.navigate('SignIn');
              }
            }
          }]
        );
      } else {
        throw new Error('Resposta do backend não contém courierId');
      }
    } catch (error) {
      Logger.error('CourierAuth', 'Erro no cadastro', {
        error: error.message,
        response: error.response?.data
      });

      // Se criou no Firebase mas falhou no backend, faz rollback
      try {
        if (auth.currentUser) {
          await auth.currentUser.delete();
          Logger.info('CourierAuth', 'Rollback: conta Firebase removida');
        }
      } catch (rollbackError) {
        Logger.error('CourierAuth', 'Erro no rollback', { error: rollbackError.message });
      }

      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
      const errorDetails = error.response?.data?.details || '';

      Alert.alert(
        'Erro no Cadastro',
        errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);

      // Remove dados do AsyncStorage
      await AsyncStorage.multiRemove([
        'token', 'expiresAt', 'courierID', 'courierNome', 'courierSobrenome',
        'courierTelefone', 'courierEmail', 'courierPushToken', 'courierUrlImagem',
        'courierVehicleType', 'courierVehiclePlate', 'courierStatus'
      ]);

      // Remove token do header do axios
      delete api.defaults.headers.Authorization;

      // Sign out do Firebase
      await firebaseSignOut(auth);

      // Reset estados
      setCourier(null);
      setAuthenticated(false);

      Logger.info('CourierAuth', 'Logout realizado com sucesso');
    } catch (error) {
      Logger.error('CourierAuth', 'Erro no logout', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function updateCourierStatus(status) {
    if (!courier) return;

    try {
      await api.put(`/api/courier/${courier.COURIER_ID}/status`, { status });

      // Atualiza estado local
      setCourier(prev => ({ ...prev, STATUS: status }));

      // Atualiza AsyncStorage
      await AsyncStorage.setItem('courierStatus', status);

      // Atualiza RTDB
      const snapshot = await get(ref(db, `couriers/${courier.FIREBASE_UID}`));
      if (snapshot.exists()) {
        await update(ref(db, `couriers/${courier.FIREBASE_UID}`), { Status: status });
      }

      Logger.info('CourierAuth', 'Status do entregador atualizado', { status });
    } catch (error) {
      Logger.error('CourierAuth', 'Erro ao atualizar status', { error: error.message });
    }
  }

  async function checkTokenValidity() {
    try {
      const token = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('expiresAt');

      if (!token || !expiresAt) {
        setLoading(false);
        return;
      }

      if (Date.now() > parseInt(expiresAt)) {
        await signOut();
        return;
      }

      // Configura token no axios
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // Recupera dados do entregador do AsyncStorage
      const courierData = await AsyncStorage.multiGet([
        'courierID', 'courierNome', 'courierSobrenome', 'courierTelefone',
        'courierEmail', 'courierPushToken', 'courierUrlImagem', 'courierVehicleType',
        'courierVehiclePlate', 'courierStatus'
      ]);

      const courierObj = {
        COURIER_ID: courierData[0][1],
        NOME: courierData[1][1],
        SOBRENOME: courierData[2][1],
        TELEFONE: courierData[3][1],
        EMAIL: courierData[4][1],
        PUSH_TOKEN: courierData[5][1],
        URL_IMAGEM: courierData[6][1],
        VEHICLE_TYPE: courierData[7][1],
        VEHICLE_PLATE: courierData[8][1],
        STATUS: courierData[9][1],
      };

      if (courierObj.COURIER_ID) {
        setCourier(courierObj);
        setAuthenticated(true);
        Logger.info('CourierAuth', 'Token válido, entregador logado automaticamente');
      }
    } catch (error) {
      Logger.error('CourierAuth', 'Erro ao verificar token', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email Enviado', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch (error) {
      Logger.error('CourierAuth', 'Erro ao enviar email de reset', { error: error.message });
      Alert.alert('Erro', 'Erro ao enviar email de recuperação.');
    }
  }

  return (
    <AuthContext.Provider value={{
      authenticated,
      courier,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateCourierStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}