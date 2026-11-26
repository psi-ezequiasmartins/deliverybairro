/**
 * src/pages/Profile/index.js
 * Tela de perfil do entregador
 */

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { useTranslateContext } from '../../contexts/TranslateContext';

export default function Profile() {
  const { t } = useTranslation();
  const { courier, signOut } = useContext(AuthContext);
  const { currentLanguage, setLanguage, supportedLanguages } = useTranslateContext();

  const handleSignOut = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de edição de perfil será implementada em breve.');
  };

  const handleChangePassword = () => {
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de alteração de senha será implementada em breve.');
  };

  const handleLanguageChange = () => {
    const languages = [
      { code: 'pt-BR', name: 'Português' },
      { code: 'en-US', name: 'English' },
      { code: 'es-LA', name: 'Español' }
    ];

    const buttons = languages.map(lang => ({
      text: lang.name,
      onPress: () => setLanguage(lang.code)
    }));

    buttons.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Selecionar Idioma', 'Escolha o idioma do aplicativo:', buttons);
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'moto':
      case 'motorcycle':
        return 'motorcycle';
      case 'bike':
        return 'bicycle';
      case 'car':
        return 'car';
      case 'walking':
        return 'walking';
      default:
        return 'motorcycle';
    }
  };

  const getVehicleName = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'moto':
      case 'motorcycle':
        return 'Motocicleta';
      case 'bike':
        return 'Bicicleta';
      case 'car':
        return 'Carro';
      case 'walking':
        return 'A pé';
      default:
        return vehicleType || 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#22C55E';
      case 'offline': return '#EF4444';
      case 'busy': return '#F59E0B';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'busy': return 'Ocupado';
      default: return 'Desconhecido';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header do perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user" size={40} color="#FFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {courier?.NOME} {courier?.SOBRENOME}
            </Text>
            <Text style={styles.profileEmail}>{courier?.EMAIL}</Text>
            <Text style={styles.profilePhone}>{courier?.TELEFONE}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(courier?.STATUS) }]} />
              <Text style={styles.statusText}>{getStatusText(courier?.STATUS)}</Text>
            </View>
          </View>
        </View>

        {/* Informações do veículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <View style={styles.vehicleInfo}>
            <FontAwesome5
              name={getVehicleIcon(courier?.VEHICLE_TYPE)}
              size={24}
              color="#FF6B35"
            />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleType}>
                {getVehicleName(courier?.VEHICLE_TYPE)}
              </Text>
              {courier?.VEHICLE_PLATE && (
                <Text style={styles.vehiclePlate}>
                  Placa: {courier.VEHICLE_PLATE}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <FontAwesome5 name="truck" size={20} color="#FF6B35" />
              <Text style={styles.statValue}>{courier?.TOTAL_DELIVERIES || 0}</Text>
              <Text style={styles.statLabel}>Entregas</Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesome5 name="star" size={20} color="#FFD700" />
              <Text style={styles.statValue}>{courier?.RATING || '0.0'}</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <FontAwesome5 name="edit" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Editar Perfil</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
            <FontAwesome5 name="lock" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Alterar Senha</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
            <FontAwesome5 name="language" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Idioma</Text>
            <Text style={styles.settingValue}>
              {currentLanguage === 'pt-BR' ? 'Português' :
                currentLanguage === 'en-US' ? 'English' : 'Español'}
            </Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <FontAwesome5 name="bell" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Atualizações em tempo real enquanto conectado</Text>
          </View>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>

          <TouchableOpacity style={styles.settingItem}>
            <FontAwesome5 name="question-circle" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Central de Ajuda</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <FontAwesome5 name="phone" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Fale Conosco</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <FontAwesome5 name="file-alt" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Termos de Uso</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <FontAwesome5 name="shield-alt" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Política de Privacidade</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Informações do app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <View style={styles.settingItem}>
            <FontAwesome5 name="mobile-alt" size={20} color="#FF6B35" />
            <Text style={styles.settingText}>Versão do App</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CourierApp - DelireryBairro</Text>
          <Text style={styles.footerText}>© 2024 Todos os direitos reservados</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    backgroundColor: '#1a1a1a',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    gap: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  settingValue: {
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});