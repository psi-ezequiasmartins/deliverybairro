/**
 * src/contexts/AuthContext.js
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
import socket from '../services/socket';
import { joinRoom, leaveRoom, clearAllRooms, initializeSocketListeners } from '../services/socketRoomManager';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const { registerForPushNotifications, updatePushToken } = useContext(NotificationContext) || {};
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Inicializa listeners do socket quando o componente montar
  useEffect(() => {
    initializeSocketListeners();
  }, []);
  const db = getDatabase(firebase_app);

  useEffect(() => {
    setLoading(true);
    checkTokenValidity();
  }, []);

  async function signIn(email, password) {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const id = result.user.uid;
      const snapshot = await get(ref(db, `users/${id}`));
      const rtdbData = snapshot.val() || {};
      const userId = rtdbData.UserID;

      let pushToken = rtdbData.PushToken;

      if (!userId) {
        Logger.errorCritical('AuthContext', 'UserID não encontrado no RTDB', rtdbData);
        Alert.alert('Erro', 'UserID não encontrado. Verifique o cadastro.');
        setLoading(false);
        return;
      }

      // Garante que sempre temos um pushToken válido
      if (!pushToken || pushToken === null || pushToken === '') {
        Logger.info('AuthContext', 'PushToken não encontrado, gerando novo');
        if (registerForPushNotifications) {
          try {
            pushToken = await registerForPushNotifications();
            Logger.success('AuthContext', 'Novo pushToken gerado');

            if (pushToken) {
              // Atualiza no RTDB
              await update(ref(db, 'users/' + id), { PushToken: pushToken });
              Logger.success('AuthContext', 'PushToken atualizado no RTDB');

              // Sincroniza com NotificationContext
              if (updatePushToken) {
                await updatePushToken(pushToken);
              }
            }
          } catch (error) {
            Logger.error('AuthContext', 'Erro ao gerar pushToken', { error: error.message });
            pushToken = ''; // Define como string vazia para evitar null
          }
        } else {
          Logger.warning('AuthContext', 'registerForPushNotifications não disponível');
          pushToken = ''; // Define como string vazia para evitar null
        }
      } else {
        Logger.debug('AuthContext', 'PushToken existente encontrado');
        // Sincroniza token existente com NotificationContext
        if (updatePushToken) {
          await updatePushToken(pushToken);
        }
      }

      // Autenticação JWT
      const authPayload = {
        USER_ID: userId,
        CHV: 1,
        timezoneOffset: new Date().getTimezoneOffset(),
      };

      const authResponse = await api.post('/api/user/authenticate', authPayload);
      const token = authResponse.data?.token;
      const expiresAt = Date.now() + (authResponse.data.expiresIn || 10800) * 1000;

      if (!token) {
        throw new Error('Token não encontrado na resposta do backend.');
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('expiresAt', expiresAt.toString());

      // Configura o token no header do axios para próximas requisições
      api.defaults.headers.Authorization = `Bearer ${token}`;

      // Dados complementares do usuário via backend (MySQL é fonte primária)
      const response = await api.get(`/api/user/${userId}`);
      const userData = response.data || {}; // Backend retorna objeto diretamente, não array

      if (!userData || !userData.USER_ID) {
        throw new Error('Dados do usuário não encontrados no backend');
      }

      // Monta objeto user usando MySQL como fonte primária
      const userObj = {
        USER_ID: userData.USER_ID,
        NOME: userData.NOME || '',
        SOBRENOME: userData.SOBRENOME || '',
        EMAIL: userData.EMAIL || '',
        TELEFONE: userData.TELEFONE || '',
        URL_IMAGEM: userData.URL_IMAGEM || '',
        PUSH_TOKEN: pushToken || '',
        FIREBASE_UID: id
      };

      Logger.info('AuthContext', 'Dados do usuário carregados do MySQL', {
        userId: userObj.USER_ID,
        hasUrlImagem: !!userObj.URL_IMAGEM,
        urlImagem: userObj.URL_IMAGEM
      });

      // Atualiza RTDB com dados essenciais do MySQL (sem URL_IMAGEM)
      await set(ref(db, 'users/' + id), {
        UserID: userObj.USER_ID,
        Nome: userObj.NOME,
        Sobrenome: userObj.SOBRENOME,
        Email: userObj.EMAIL,
        Telefone: userObj.TELEFONE,
        PushToken: userObj.PUSH_TOKEN
      });

      Logger.success('AuthContext', 'RTDB sincronizado com dados essenciais do MySQL');

      // Salva no AsyncStorage com pushToken correto
      await AsyncStorage.multiSet([
        ["vUserID", String(userObj.USER_ID)],
        ["vNome", userObj.NOME],
        ["vSobrenome", userObj.SOBRENOME],
        ["vTelefone", userObj.TELEFONE],
        ["vEmail", userObj.EMAIL],
        ["vPushToken", userObj.PUSH_TOKEN], // Usa o pushToken do userObj
        ["vUrlImagem", userObj.URL_IMAGEM],
      ]);

      Logger.success('AuthContext', 'Dados salvos no AsyncStorage', { userId: userObj.USER_ID, hasPushToken: !!userObj.PUSH_TOKEN });

      setUser(userObj);
      setAuthenticated(true);

      // Conecta ao websocket após login bem-sucedido
      if (!socket.connected) {
        Logger.info('AuthContext', 'Conectando ao websocket...');
        socket.connect();
      }

      // Usa o gerenciador de salas para entrar na sala do usuário
      const userRoom = `user_${userObj.USER_ID}`;
      joinRoom(userRoom, true); // true = aguarda conexão se necessário
      Logger.success('AuthContext', 'Solicitou entrada na sala via RoomManager', { room: userRoom });
    } catch (error) {
      Logger.errorCritical('AuthContext', 'Erro no login', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      Alert.alert(t('common.error'), t('messages.invalidCredentials'));
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(nome, sobrenome, telefone, email, password, confirm_password, pushToken) {
    setLoading(true);
    if (!email || !password) {
      Alert.alert('Favor preencher todos os campos!');
      setLoading(false);
      return;
    }
    if (password !== confirm_password) {
      Alert.alert('As senhas não conferem! Digite-as novamente');
      setLoading(false);
      return;
    }

    try {
      // Garante que sempre temos um pushToken válido no registro
      let validPushToken = pushToken;
      if (!validPushToken || validPushToken === null || validPushToken === '') {
        Logger.info('AuthContext', 'PushToken não fornecido no signUp, gerando novo');
        if (registerForPushNotifications) {
          try {
            validPushToken = await registerForPushNotifications();
            Logger.success('AuthContext', 'Novo pushToken gerado no signUp', { hasToken: !!validPushToken });

            // Sincroniza com NotificationContext
            if (validPushToken && updatePushToken) {
              await updatePushToken(validPushToken);
            }
          } catch (error) {
            Logger.error('AuthContext', 'Erro ao gerar pushToken no signUp', { error: error.message });
            validPushToken = ''; // Define como string vazia para evitar null
          }
        } else {
          Logger.warning('AuthContext', 'registerForPushNotifications não disponível no signUp');
          validPushToken = ''; // Define como string vazia para evitar null
        }
      }

      const value = await createUserWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;
      const json = {
        USER_ID: null,
        FIREBASE_UID: uid,
        NOME: nome,
        SOBRENOME: sobrenome,
        TELEFONE: telefone,
        EMAIL: email,
        SENHA: password,
        URL_IMAGEM: '', // Inicia vazio - frontend usa noImage quando vazio
        CHV: 1
      };
      const result = await api.post('/api/add/usuario/', json);

      // Salva no RTDB apenas dados essenciais (sem URL_IMAGEM)
      await set(ref(db, 'users/' + uid), {
        UserID: result.data.USER_ID,
        Nome: result.data.NOME,
        Sobrenome: result.data.SOBRENOME,
        Telefone: result.data.TELEFONE,
        Email: result.data.EMAIL,
        PushToken: validPushToken || ''
      });

      // Salva no AsyncStorage com pushToken válido
      await AsyncStorage.multiSet([
        ["vUserID", String(result.data.USER_ID)],
        ["vNome", result.data.NOME],
        ["vSobrenome", result.data.SOBRENOME],
        ["vTelefone", result.data.TELEFONE],
        ["vEmail", result.data.EMAIL],
        ["vPushToken", validPushToken || ''], // Garante que nunca seja null
        ["vUrlImagem", result.data.URL_IMAGEM],
      ]);

      Logger.success('AuthContext', 'Usuário registrado com pushToken', { hasPushToken: !!validPushToken });
      Alert.alert('Usuário registrado com sucesso!');
      setLoading(false);
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao registrar usuário', { error: error.message });
      Alert.alert('Erro ao registrar usuário. Tente novamente.');
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      // Limpa todas as salas do WebSocket antes de desconectar
      clearAllRooms();

      // Desconecta do WebSocket
      if (socket.connected) {
        socket.disconnect();
        Logger.info('AuthContext', 'WebSocket desconectado');
      }

      await firebaseSignOut(auth);
      setAuthenticated(false);
      api.defaults.headers['Authorization'] = undefined;
      await AsyncStorage.multiRemove(["token", "expiresAt", "vUserID", "vNome", "vSobrenome", "vTelefone", "vEmail", "vPushToken", "vUrlImagem"]);
      setUser(null);

      // Limpa pushToken do NotificationContext
      if (updatePushToken) {
        await updatePushToken(null);
      }

      Logger.success('AuthContext', 'SignOut realizado com sucesso');
    } catch (error) {
      Logger.error('AuthContext', 'Erro no signOut', { error: error.message });
    }
  }

  function changePassword(email) {
    sendPasswordResetEmail(auth, email).then(() => {
      Alert.alert("Email de Recuperação enviado com sucesso! Confira sua caixa de Entrada.");
      setAuthenticated(false);
    }).catch(error => {
      Alert.alert('Erro ao enviar email: ' + error.message);
      setAuthenticated(false);
    });
  }

  async function checkTokenValidity() {
    try {
      const token = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('expiresAt');
      if (token && expiresAt) {
        const now = Date.now();
        if (now >= Number(expiresAt)) {
          await AsyncStorage.multiRemove(['token', 'expiresAt']);
          setAuthenticated(false);
          setUser(null);
          Alert.alert('Sessão expirada. Faça login novamente.');
        } else {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          setAuthenticated(true);

          // Carrega dados do usuário do AsyncStorage se estiver autenticado
          const userData = await AsyncStorage.multiGet([
            'vUserID', 'vNome', 'vSobrenome', 'vTelefone', 'vEmail', 'vPushToken', 'vUrlImagem'
          ]);

          const userObj = {
            USER_ID: userData[0][1] || '',
            NOME: userData[1][1] || '',
            SOBRENOME: userData[2][1] || '',
            TELEFONE: userData[3][1] || '',
            EMAIL: userData[4][1] || '',
            PUSH_TOKEN: userData[5][1] || '',
            URL_IMAGEM: userData[6][1] || '' // Deixa vazio para usar noImage no frontend
          };

          setUser(userObj);

          // Sincroniza pushToken com NotificationContext
          if (userObj.PUSH_TOKEN && updatePushToken) {
            await updatePushToken(userObj.PUSH_TOKEN);
            Logger.debug('AuthContext', 'PushToken sincronizado no checkTokenValidity', { hasToken: !!userObj.PUSH_TOKEN });
          }

          // Conecta ao websocket se usuário estiver autenticado
          if (userObj.USER_ID) {
            if (!socket.connected) {
              Logger.info('AuthContext', 'Conectando ao websocket após restaurar sessão...');
              socket.connect();
            }

            // Usa o gerenciador de salas para entrar na sala do usuário
            const userRoom = `user_${userObj.USER_ID}`;
            joinRoom(userRoom, true); // true = aguarda conexão se necessário
            Logger.success('AuthContext', 'Solicitou entrada na sala via RoomManager (checkTokenValidity)', { room: userRoom });
          }
        }
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      Logger.error('AuthContext', 'Erro ao verificar a validade do token', { error: error.message });
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{
      signed: !!authenticated, user, setUser,
      loading, signIn, signUp, changePassword, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}
