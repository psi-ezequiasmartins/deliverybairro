/**
 * src/services/userImageUpload.js
 * Serviço de upload de fotos de usuários para Firebase Storage
 */

import { storage } from '../config/apiFirebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Logger from '../utils/logger';

class UserImageUploadService {

  /**
   * Faz upload da foto do usuário para Firebase Storage
   * @param {string} imageUri - URI local da imagem
   * @param {string} userId - ID do usuário
   * @returns {Promise<string>} - URL da imagem no Firebase Storage
   */
  static async uploadUserPhoto(imageUri, userId) {
    try {
      Logger.info('UserImageUpload', 'Iniciando upload da foto do usuário', { imageUri, userId });

      if (!imageUri || !userId) {
        throw new Error('URI da imagem e ID do usuário são obrigatórios');
      }

      // Verifica se é uma URI válida
      if (!imageUri.startsWith('file://') && !imageUri.startsWith('http')) {
        throw new Error('URI da imagem inválida');
      }

      // Busca o blob da imagem
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Falha ao carregar a imagem local: ${response.status}`);
      }

      const blob = await response.blob();

      // Verifica se o blob é válido
      if (!blob || blob.size === 0) {
        throw new Error('Imagem vazia ou corrompida');
      }

      if (blob.size > 5 * 1024 * 1024) { // 5MB max
        throw new Error('Imagem muito grande (máximo 5MB)');
      }

      Logger.info('UserImageUpload', 'Blob da imagem criado', { size: blob.size, type: blob.type });

      // Cria referência no Storage: usuarios/[userId]/profile_[timestamp].jpg
      const timestamp = new Date().getTime();
      const fileName = `profile_${timestamp}.jpg`;
      const storageRef = ref(storage, `usuarios/${userId}/${fileName}`);

      Logger.info('UserImageUpload', 'Fazendo upload para Firebase Storage', {
        path: `usuarios/${userId}/${fileName}`,
        blobSize: blob.size
      });

      // Metadados do arquivo
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'userId': userId.toString(),
          'uploadedAt': new Date().toISOString(),
          'originalSize': blob.size.toString()
        }
      };

      // Faz o upload
      const uploadResult = await uploadBytes(storageRef, blob, metadata);

      Logger.success('UserImageUpload', 'Upload concluído com sucesso', {
        fullPath: uploadResult.ref.fullPath
      });

      // Obtém a URL de download
      const downloadURL = await getDownloadURL(uploadResult.ref);
      Logger.success('UserImageUpload', 'URL de download gerada', { downloadURL });

      return downloadURL;

    } catch (error) {
      Logger.error('UserImageUpload', 'Erro no upload da foto', {
        error: error.message,
        imageUri,
        userId
      });
      throw new Error(`Falha no upload da foto: ${error.message}`);
    }
  }

  /**
   * Remove foto anterior do usuário do Firebase Storage
   * @param {string} imageUrl - URL da imagem a ser removida
   * @param {string} userId - ID do usuário
   */
  static async deleteUserPhoto(imageUrl, userId) {
    try {
      Logger.info('UserImageUpload', 'Iniciando remoção de foto anterior', { imageUrl, userId });

      if (!imageUrl || !imageUrl.includes('firebase')) {
        Logger.warn('UserImageUpload', 'URL não é do Firebase Storage, ignorando remoção', { imageUrl });
        return;
      }

      // Extrai o path da URL do Firebase
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      const pathStart = imageUrl.indexOf('/o/') + 3;
      const pathEnd = imageUrl.indexOf('?alt=');

      if (pathStart === 2 || pathEnd === -1) {
        Logger.warn('UserImageUpload', 'URL não tem formato esperado do Firebase', { imageUrl });
        return;
      }

      const filePath = decodeURIComponent(imageUrl.substring(pathStart, pathEnd));
      Logger.info('UserImageUpload', 'Extraindo path do arquivo', { filePath });

      // Cria referência e deleta
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);

      Logger.success('UserImageUpload', 'Foto anterior removida com sucesso', { filePath });

    } catch (error) {
      // Não falha o processo se não conseguir deletar a imagem anterior
      Logger.warn('UserImageUpload', 'Falha ao remover foto anterior (não crítico)', {
        error: error.message,
        imageUrl
      });
    }
  }

  /**
   * Atualiza a foto do usuário: remove a anterior e faz upload da nova
   * @param {string} newImageUri - URI da nova imagem
   * @param {string} currentImageUrl - URL da imagem atual (para remoção)
   * @param {string} userId - ID do usuário
   * @returns {Promise<string>} - URL da nova imagem
   */
  static async updateUserPhoto(newImageUri, currentImageUrl, userId) {
    try {
      Logger.info('UserImageUpload', 'Iniciando atualização de foto do usuário', {
        newImageUri,
        currentImageUrl,
        userId
      });

      // Remove foto anterior em paralelo (não crítico)
      if (currentImageUrl) {
        this.deleteUserPhoto(currentImageUrl, userId);
      }

      // Faz upload da nova foto
      const newImageUrl = await this.uploadUserPhoto(newImageUri, userId);

      Logger.success('UserImageUpload', 'Foto do usuário atualizada com sucesso', {
        newImageUrl,
        oldImageUrl: currentImageUrl
      });

      return newImageUrl;

    } catch (error) {
      Logger.error('UserImageUpload', 'Erro na atualização da foto', {
        error: error.message,
        newImageUri,
        userId
      });
      throw error;
    }
  }
}

export default UserImageUploadService;