import api from '../config/apiAxios';
import Logger from '../utils/logger';

class UserImageUploadService {
  static async uploadUserPhoto(imageUri, userId) {
    if (!imageUri || !userId) {
      throw new Error('URI da imagem e ID do usuário são obrigatórios');
    }

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: `user-${userId}-${Date.now()}.jpg`,
      type: 'image/jpeg'
    });

    try {
      const { data } = await api.post('/user-app/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!data.url) throw new Error('O servidor não retornou a URL da imagem');
      return data.url;
    } catch (error) {
      Logger.error('UserImageUpload', 'Erro no upload da foto', {
        error: error.message,
        userId
      });
      throw new Error(`Falha no upload da foto: ${error.response?.data?.details || error.message}`);
    }
  }

  static async updateUserPhoto(newImageUri, currentImageUrl, userId) {
    return this.uploadUserPhoto(newImageUri, userId);
  }
}

export default UserImageUploadService;
