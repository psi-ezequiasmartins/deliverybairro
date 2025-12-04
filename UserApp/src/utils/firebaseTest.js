/**
 * src/utils/firebaseTest.js
 * Utilitário para testar conexão com Firebase Storage
 */

import { storage } from '../config/apiFirebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Logger from './logger';

export async function testFirebaseStorage() {
  try {
    Logger.info('FirebaseTest', 'Testando conexão com Firebase Storage');

    // Cria um arquivo de teste pequeno
    const testData = new Blob(['teste firebase storage'], { type: 'text/plain' });
    const testRef = ref(storage, 'test/connection-test.txt');

    // Tenta fazer upload
    const uploadResult = await uploadBytes(testRef, testData);
    Logger.success('FirebaseTest', 'Upload de teste bem-sucedido', {
      fullPath: uploadResult.ref.fullPath
    });

    // Tenta obter URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    Logger.success('FirebaseTest', 'URL de download obtida', { downloadURL });

    return {
      success: true,
      message: 'Firebase Storage funcionando corretamente',
      url: downloadURL
    };

  } catch (error) {
    Logger.error('FirebaseTest', 'Erro no teste do Firebase Storage', {
      error: error.message,
      code: error.code
    });

    return {
      success: false,
      message: `Erro: ${error.message}`,
      error: error
    };
  }
}

export async function testUserImageUpload(userId = 'test-user') {
  try {
    Logger.info('FirebaseTest', 'Testando upload específico de imagem de usuário');

    // Simula uma imagem pequena para teste
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 50, 50);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

    const testRef = ref(storage, `usuarios/${userId}/test-profile.jpg`);

    const uploadResult = await uploadBytes(testRef, blob, {
      contentType: 'image/jpeg'
    });

    const downloadURL = await getDownloadURL(uploadResult.ref);

    Logger.success('FirebaseTest', 'Teste de upload de imagem de usuário bem-sucedido', {
      downloadURL,
      userId
    });

    return {
      success: true,
      message: 'Upload de imagem de usuário funcionando',
      url: downloadURL
    };

  } catch (error) {
    Logger.error('FirebaseTest', 'Erro no teste de upload de imagem', {
      error: error.message,
      userId
    });

    return {
      success: false,
      message: `Erro no upload: ${error.message}`,
      error: error
    };
  }
}