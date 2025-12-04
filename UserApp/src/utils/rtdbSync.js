/**
 * src/utils/rtdbSync.js
 * Utilitário para sincronização manual entre MySQL e Firebase RTDB
 */

import { getDatabase, ref, update, get } from "firebase/database";
import firebase_app from '../config/apiFirebase';
import Logger from './logger';
import api from '../config/apiAxios';

/**
 * Sincroniza dados do usuário do MySQL para o Firebase RTDB
 * @param {number} userId - ID do usuário
 * @param {string} firebaseUID - UID do Firebase
 */
export async function syncUserFromMySQLToRTDB(userId, firebaseUID) {
  try {
    Logger.info('RTDBSync', 'Iniciando sincronização MySQL -> RTDB', { userId, firebaseUID });

    if (!userId || !firebaseUID) {
      throw new Error('userId e firebaseUID são obrigatórios');
    }

    // Busca dados atualizados do MySQL via API
    const response = await api.get(`/api/usuario/${userId}`);
    const userData = response.data;

    Logger.info('RTDBSync', 'Dados obtidos do MySQL', userData);

    // Prepara dados para o RTDB
    const rtdbData = {
      Nome: userData.NOME || '',
      Sobrenome: userData.SOBRENOME || '',
      Email: userData.EMAIL || '',
      Telefone: userData.TELEFONE || '',
      UrlImagem: userData.URL_IMAGEM || '',
      UserID: userData.USER_ID
    };

    // Atualiza no RTDB
    const db = getDatabase(firebase_app);
    await update(ref(db, `users/${firebaseUID}`), rtdbData);

    Logger.success('RTDBSync', 'Sincronização concluída com sucesso', {
      userId,
      firebaseUID,
      syncedData: rtdbData
    });

    return rtdbData;

  } catch (error) {
    Logger.error('RTDBSync', 'Erro na sincronização MySQL -> RTDB', {
      error: error.message,
      userId,
      firebaseUID
    });
    throw error;
  }
}

/**
 * Sincroniza apenas a URL da imagem do usuário
 * @param {number} userId - ID do usuário
 * @param {string} firebaseUID - UID do Firebase
 * @param {string} imageUrl - Nova URL da imagem
 */
export async function syncUserImageToRTDB(userId, firebaseUID, imageUrl) {
  try {
    Logger.info('RTDBSync', 'Sincronizando apenas URL da imagem', { userId, firebaseUID, imageUrl });

    if (!userId || !firebaseUID) {
      throw new Error('userId e firebaseUID são obrigatórios');
    }

    const db = getDatabase(firebase_app);
    await update(ref(db, `users/${firebaseUID}`), {
      UrlImagem: imageUrl
    });

    Logger.success('RTDBSync', 'URL da imagem sincronizada com sucesso');

    return true;

  } catch (error) {
    Logger.error('RTDBSync', 'Erro ao sincronizar URL da imagem', {
      error: error.message,
      userId,
      firebaseUID,
      imageUrl
    });
    throw error;
  }
}

/**
 * Verifica e corrige inconsistências entre MySQL e RTDB
 * @param {number} userId - ID do usuário
 * @param {string} firebaseUID - UID do Firebase
 */
export async function validateAndSyncUserData(userId, firebaseUID) {
  try {
    Logger.info('RTDBSync', 'Validando consistência MySQL <-> RTDB', { userId, firebaseUID });

    // Busca dados do MySQL
    const mysqlResponse = await api.get(`/api/usuario/${userId}`);
    const mysqlData = mysqlResponse.data;

    // Busca dados do RTDB
    const db = getDatabase(firebase_app);
    const rtdbSnapshot = await get(ref(db, `users/${firebaseUID}`));
    const rtdbData = rtdbSnapshot.val() || {};

    // Compara URLs das imagens
    const mysqlImageUrl = mysqlData.URL_IMAGEM || '';
    const rtdbImageUrl = rtdbData.UrlImagem || '';

    if (mysqlImageUrl !== rtdbImageUrl) {
      Logger.warn('RTDBSync', 'Inconsistência detectada na URL da imagem', {
        mysql: mysqlImageUrl,
        rtdb: rtdbImageUrl
      });

      // Sincroniza do MySQL para RTDB (MySQL é fonte da verdade)
      await syncUserFromMySQLToRTDB(userId, firebaseUID);

      return {
        hadInconsistency: true,
        corrected: true,
        mysqlUrl: mysqlImageUrl,
        rtdbUrl: rtdbImageUrl
      };
    }

    Logger.info('RTDBSync', 'Dados consistentes entre MySQL e RTDB');
    return {
      hadInconsistency: false,
      corrected: false
    };

  } catch (error) {
    Logger.error('RTDBSync', 'Erro na validação de consistência', {
      error: error.message,
      userId,
      firebaseUID
    });
    return {
      hadInconsistency: true,
      corrected: false,
      error: error.message
    };
  }
}