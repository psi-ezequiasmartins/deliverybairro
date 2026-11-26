/**
 * src/pages/Auth/SignUp.js
 * Tela de cadastro do entregador
 */

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';

export default function SignUp({ navigation }) {
  const { t } = useTranslation();
  const { signUp, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    transporte: 'DRIVING', // Valor padrão: DRIVING (moto/carro)
    placa: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const vehicleTypes = [
    { label: 'Motocicleta', value: 'DRIVING', icon: 'motorcycle', description: 'Moto ou Scooter' },
    { label: 'Bicicleta', value: 'BICYCLING', icon: 'bicycle', description: 'Bike, Bicicleta Elétrica, etc.' },
    { label: 'A pé', value: 'WALKING', icon: 'walking', description: 'Caminhando' }
  ];

  function updateFormData(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  // Função para formatar telefone
  function formatPhone(text) {
    // Remove tudo que não é dígito
    const numbers = text.replace(/\D/g, '');

    // Aplica a máscara conforme o tamanho
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      // Limita a 11 dígitos (celular com DDD)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  }

  function handlePhoneChange(text) {
    const formatted = formatPhone(text);
    updateFormData('telefone', formatted);
  }

  async function handleSignUp() {
    // Validações
    if (!formData.nome || !formData.sobrenome || !formData.email ||
      !formData.telefone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await signUp({
        NOME: formData.nome,
        SOBRENOME: formData.sobrenome,
        EMAIL: formData.email,
        TELEFONE: formData.telefone,
        TRANSPORTE: formData.transporte,
        PLACA: formData.placa,
        email: formData.email,
        password: formData.password,
        navigation
      });
    } catch (error) {
      Alert.alert('Erro no Cadastro', error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Cadastro de Entregador</Text>
            <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="user" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#666"
                value={formData.nome}
                onChangeText={(value) => updateFormData('nome', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="user" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sobrenome"
                placeholderTextColor="#666"
                value={formData.sobrenome}
                onChangeText={(value) => updateFormData('sobrenome', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="envelope" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor="#666"
                value={formData.telefone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowVehicleModal(true)}
            >
              <FontAwesome5 name="motorcycle" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.pickerText}>
                {vehicleTypes.find(v => v.value === formData.transporte)?.label || 'Selecione o veículo'}
              </Text>
              <FontAwesome5 name="chevron-down" size={16} color="#FF6B35" style={styles.chevronIcon} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="id-card" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Placa do Veículo (opcional)"
                placeholderTextColor="#666"
                value={formData.placa}
                onChangeText={(value) => updateFormData('placa', value)}
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Senha"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome5
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Confirmar Senha"
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesome5
                  name={showConfirmPassword ? 'eye-slash' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de seleção de veículo */}
      <Modal
        visible={showVehicleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehicleModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Tipo de Veículo</Text>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                <FontAwesome5 name="times" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.value}
                style={[
                  styles.vehicleOption,
                  formData.transporte === vehicle.value && styles.vehicleOptionSelected
                ]}
                onPress={() => {
                  updateFormData('transporte', vehicle.value);
                  setShowVehicleModal(false);
                }}
              >
                <FontAwesome5
                  name={vehicle.icon}
                  size={24}
                  color={formData.transporte === vehicle.value ? '#FF6B35' : '#888'}
                />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={[
                    styles.vehicleOptionText,
                    formData.transporte === vehicle.value && styles.vehicleOptionTextSelected
                  ]}>
                    {vehicle.label}
                  </Text>
                  <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
                </View>
                {formData.transporte === vehicle.value && (
                  <FontAwesome5 name="check-circle" size={20} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    color: '#FFF',
    fontSize: 16,
  },
  pickerText: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    color: '#FFF',
    fontSize: 16,
    lineHeight: 55,
  },
  chevronIcon: {
    paddingRight: 15,
  },
  eyeIcon: {
    padding: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
  },
  vehicleOptionSelected: {
    backgroundColor: '#2a2a2a',
    borderColor: '#FF6B35',
  },
  vehicleOptionText: {
    fontSize: 16,
    color: '#FFF',
  },
  vehicleOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  vehicleDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  footerLink: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
});