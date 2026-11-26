/* 
* src/pages/User/index.js
* deliverybairro.com - Perfil do usuário com i18n
*/

import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { MaskedTextInput } from 'react-native-mask-text';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CameraModal from '../../components/Camera/CameraModal';
import Logger from '../../utils/logger';
import UserImageUploadService from '../../services/userImageUpload';
import ImageUploadStatus from '../../components/ImageUploadStatus';

import Header from '../../components/Header';
import noImage from '../../../assets/noImage.png';
import api from '../../config/apiAxios';

export default function Perfil() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, setUser, signOut } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [nome, setNome] = useState(user?.NOME || '');
  const [sobrenome, setSobrenome] = useState(user?.SOBRENOME || '');
  const [url_imagem, setUrlImagem] = useState(user?.URL_IMAGEM || '');
  const [telefone, setTelefone] = useState(user?.TELEFONE || '');
  const [email, setEmail] = useState(user?.EMAIL || '');

  // Carrega dados atualizados ao abrir a tela
  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setLoading(true);
      Logger.info('Perfil', 'Carregando dados do usuário do contexto');

      // Verifica se o usuário está logado
      if (!user) {
        Logger.warn('Perfil', 'Usuário não encontrado no contexto');
        return;
      }

      // Usa dados do contexto como fonte primária (já vem do MySQL)
      Logger.info('Perfil', 'Dados do usuário no contexto', {
        USER_ID: user?.USER_ID,
        NOME: user?.NOME,
        URL_IMAGEM: user?.URL_IMAGEM,
        hasUrlImagem: !!user?.URL_IMAGEM
      });

      // Atualiza estados diretamente do contexto (AuthContext já sincronizou MySQL)
      setNome(user?.NOME || '');
      setSobrenome(user?.SOBRENOME || '');
      setTelefone(user?.TELEFONE || '');
      setEmail(user?.EMAIL || '');
      setUrlImagem(user?.URL_IMAGEM || '');

      Logger.success('Perfil', 'Estados atualizados com dados do contexto');

    } catch (error) {
      Logger.error('Perfil', 'Erro ao carregar dados do usuário', {
        error: error.message,
        stack: error.stack
      });
      Alert.alert('Erro', 'Falha ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  }  // Valida se URL da imagem é válida (não local)
  function isValidImageUrl(url) {
    try {
      if (!url || url === '') {
        Logger.info('Perfil', 'URL vazia ou nula');
        return false;
      }

      // URLs locais não funcionam após logout/login
      if (url.startsWith('file://')) {
        Logger.warn('Perfil', 'URL local detectada, será ignorada', { url });
        return false;
      }

      // URLs válidas (http/https)
      const isValid = url.startsWith('http://') || url.startsWith('https://');
      Logger.info('Perfil', 'Validação de URL', { url, isValid });
      return isValid;
    } catch (error) {
      Logger.error('Perfil', 'Erro na validação da URL', { url, error: error.message });
      return false;
    }
  }

  async function onCapture(uri) {
    try {
      Logger.info('Perfil', 'Foto capturada', { uri, type: 'local' });

      if (!uri) {
        Logger.warn('Perfil', 'URI de foto vazia recebida');
        Alert.alert('Erro', 'Não foi possível capturar a foto.');
        return;
      }

      setVisible(false);
      setPhoto(uri);

      // Pergunta se quer fazer upload imediatamente
      Alert.alert(
        'Foto capturada!',
        'Deseja enviar a foto agora? Ela será armazenada no servidor do DeliveryBairro.',
        [
          {
            text: 'Depois',
            style: 'cancel',
            onPress: () => {
              Logger.info('Perfil', 'Upload adiado pelo usuário');
            }
          },
          {
            text: 'Fazer Upload',
            onPress: () => uploadCapturedPhoto(uri)
          }
        ]
      );
    } catch (error) {
      Logger.error('Perfil', 'Erro ao processar foto capturada', { error: error.message, uri });
      Alert.alert('Erro', 'Falha ao processar a foto capturada.');
    }
  }

  // Função para upload da foto capturada
  async function uploadCapturedPhoto(uri) {
    try {
      setUploadingPhoto(true);
      Logger.info('Perfil', 'Iniciando upload da foto capturada');

      if (!user?.USER_ID) {
        throw new Error('Usuário não autenticado');
      }

      // Faz upload da nova foto
      const newImageUrl = await UserImageUploadService.updateUserPhoto(
        uri,
        user.USER_ID
      );

      Logger.success('Perfil', 'Upload da foto concluído', { newImageUrl });

      // Atualiza estado local e contexto
      setUrlImagem(newImageUrl);
      setPhoto(null); // Limpa foto local

      // Atualiza contexto para refletir mudança
      setUser({
        ...user,
        URL_IMAGEM: newImageUrl
      });

      Alert.alert('Sucesso!', 'Foto enviada e salva com sucesso!');

    } catch (error) {
      Logger.error('Perfil', 'Erro no upload da foto', { error: error.message });
      Alert.alert('Erro', `Falha no upload da foto: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  } async function onSave() {
    try {
      setLoading(true);
      Logger.info('Perfil', 'Iniciando salvamento de dados');

      // Se há uma foto local pendente, pergunta se quer fazer upload
      if (photo && !uploadingPhoto) {
        const shouldUpload = await new Promise((resolve) => {
          Alert.alert(
            'Foto Pendente',
            'Há uma foto capturada que ainda não foi enviada. Deseja enviá-la agora?',
            [
              { text: 'Não', onPress: () => resolve(false) },
              { text: 'Sim', onPress: () => resolve(true) }
            ]
          );
        });

        if (shouldUpload) {
          await uploadCapturedPhoto(photo);
        }
      }

      await updateUser();

      if (user && user.USER_ID) {
        Logger.info('Perfil', 'Redirecionando para tela principal após salvamento');
        navigation.navigate('Main', { screen: 'GroupsTab' });
      } else {
        Logger.error('Perfil', 'Usuário não autenticado após salvamento');
        Alert.alert('Erro', 'Usuário não autenticado.');
      }
    } catch (error) {
      Logger.error('Perfil', 'Erro no processo de salvamento', error);
      Alert.alert('Erro', 'Falha ao salvar os dados.');
    } finally {
      setLoading(false);
    }
  }

  async function updateUser() {
    try {
      Logger.info('Perfil', 'Iniciando atualização do usuário');

      // Prepara dados para envio
      const finalUrlImagem = isValidImageUrl(url_imagem) ? url_imagem : '';

      const json = {
        NOME: nome,
        SOBRENOME: sobrenome,
        EMAIL: email,
        TELEFONE: telefone,
        URL_IMAGEM: finalUrlImagem, // Só envia URLs válidas
      };

      Logger.info('Perfil', 'Dados a serem enviados', json);

      // Atualiza no backend
      const response = await api.put(`/api/update/usuario/${user?.USER_ID}`, json);
      Logger.success('Perfil', 'Dados atualizados no backend', response.data);

      // Atualiza AuthContext
      const updatedUser = {
        ...user,
        NOME: nome,
        SOBRENOME: sobrenome,
        EMAIL: email,
        TELEFONE: telefone,
        URL_IMAGEM: finalUrlImagem
      };

      setUser(updatedUser);

      // Atualiza AsyncStorage
      await AsyncStorage.multiSet([
        ["vNome", nome],
        ["vSobrenome", sobrenome],
        ["vTelefone", telefone],
        ["vEmail", email],
        ["vUrlImagem", finalUrlImagem],
      ]);

      Logger.success('Perfil', 'Atualização completa realizada com sucesso');
      Alert.alert('Dados atualizados com sucesso!');

    } catch (error) {
      Logger.error('Perfil', 'Erro ao atualizar usuário', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Alert.alert('Erro', 'Não foi possível atualizar os dados: ' + error.message);
    }
  }

  return (
    <SafeAreaView style={styles.safearea}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  // Prioridade: 1) foto recém capturada, 2) URL válida, 3) noImage
                  photo ? { uri: photo } :
                    isValidImageUrl(url_imagem) ? { uri: url_imagem } : noImage
                }
                style={styles.avatarImage}
                onError={(error) => {
                  Logger.warn('Perfil', 'Erro ao carregar imagem', {
                    error: error.nativeEvent?.error || 'Erro desconhecido',
                    source: photo || url_imagem || 'noImage'
                  });
                  // Se erro ao carregar URL externa, limpa para mostrar noImage
                  if (url_imagem && isValidImageUrl(url_imagem)) {
                    setUrlImagem('');
                  }
                }}
                onLoad={() => {
                  Logger.info('Perfil', 'Imagem carregada com sucesso', {
                    source: photo || url_imagem || 'noImage'
                  });
                }}
              />
              <TouchableOpacity
                style={[styles.cameraIcon, uploadingPhoto && { opacity: 0.5 }]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size={16} color="#FFF" />
                ) : (
                  <Feather name="camera" size={20} color="#FFF" />
                )}
              </TouchableOpacity>
              {uploadingPhoto && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.uploadingText}>Enviando foto...</Text>
                </View>
              )}
              {photo && !uploadingPhoto && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => uploadCapturedPhoto(photo)}
                >
                  <Feather name="upload" size={16} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
              )}
            </View>
            <CameraModal visible={visible} onClose={() => setVisible(false)} onCapture={onCapture} />
          </View>

          <View style={styles.areaInput}>
            <Text style={styles.label}>{t('user.userId')} ({t('user.userId')} Nº):</Text>
            <TextInput
              value={String(user?.USER_ID)}
              placeholder={String(user?.USER_ID)}
              style={[styles.input, { backgroundColor: '#EEE', color: '#FF0000' }]}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <View style={styles.rowInput}>
            <View style={[styles.areaInput, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>{t('user.name')}:</Text>
              <TextInput
                value={nome}
                placeholder={t('user.name')}
                autoCorrect={false}
                onChangeText={setNome}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#AAA"
              />
            </View>

            <View style={[styles.areaInput, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>{t('user.lastName')}:</Text>
              <TextInput
                value={sobrenome}
                placeholder={t('user.lastName')}
                onChangeText={setSobrenome}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#AAA"
              />
            </View>
          </View>

          <View style={styles.areaInput}>
            <Text style={styles.label}>{t('user.phone')}:</Text>
            <MaskedTextInput
              value={telefone}
              mask="(99) 99999-9999"
              placeholder="(31) 99999-9999"
              onChangeText={setTelefone}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#AAA"
            />
          </View>

          <View style={styles.areaInput}>
            <Text style={styles.label}>{t('user.email')}:</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="username@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholderTextColor="#AAA"
            />
          </View>

          <TouchableOpacity
            style={[styles.btnSubmit, loading && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.btnTxt}>{t('profile.updateData').toUpperCase()}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLogout} onPress={signOut}>
            <Text style={styles.btnTxt}>{t('navigation.logout').toUpperCase()}</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Status de Upload */}
        <ImageUploadStatus
          isVisible={uploadingPhoto}
          isUploading={uploadingPhoto}
          message="Enviando foto para o servidor..."
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 10,
  },
  subtitle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    height: 120,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: '#EEE',
  },
  cameraIcon: {
    position: 'absolute',
    right: -40,
    bottom: -15,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 7,
    elevation: 3,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  uploadButton: {
    position: 'absolute',
    right: -40,
    top: -15,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  areaInput: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#000',
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 45,
    padding: 10,
    backgroundColor: '#FFF',
    borderColor: '#8CB8D2',
    borderWidth: 1,
    borderRadius: 7,
    fontSize: 17,
    color: '#000',
  },
  btnSubmit: {
    width: '95%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#66BB6A',
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  btnLogout: {
    width: '95%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E57373',
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  btnTxt: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
  },
})

/*
{
    "UserID": 100001,
    "Nome": "Ezequias",
    "Sobrenome": "Martins",
    "UrlImagem": "",
    "Email": "ezequiasmartins@gmail.com",
    "Telefone": "+55 31 98410-7540",
    "Endereco": "Rua dos Comanches, 870 Santa Mônica, Belo Horizonte, MG, 31530-250",
    "Latitude": -19.826617659416904, 
    "Longitude": -43.98354455908985,
    "TokenUSR": ""
}
*/

/**
 ** tabela de cores: #FFB901 #55A9D6 #7F7B7B #5D5D5D #FF0000 #0033CC #FFF000 #131313 #4DCE4D
 */