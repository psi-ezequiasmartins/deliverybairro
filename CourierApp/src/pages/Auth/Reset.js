import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

export default function Reset({ navigation }) {
  const { requestPasswordReset, resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequestCode() {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setCodeSent(true);
      Alert.alert('Recuperação de senha', 'Se a conta estiver cadastrada, você receberá um código por e-mail.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível solicitar a recuperação da senha.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, password);
      Alert.alert('Senha atualizada', 'Faça login com sua nova senha.', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error === 'INVALID_OR_EXPIRED_RESET_CODE'
        ? 'Código inválido ou expirado.'
        : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <FontAwesome5 name="key" size={60} color="#FF6B35" />
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              {codeSent
                ? 'Informe o código recebido e escolha uma nova senha.'
                : 'Digite seu e-mail para receber um código de recuperação.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="envelope" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!codeSent}
              />
            </View>

            {codeSent && (
              <>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="key" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Código de seis dígitos"
                    placeholderTextColor="#666"
                    value={code}
                    onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="lock" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nova senha"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="lock" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar nova senha"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={codeSent ? handleReset : handleRequestCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>{codeSent ? 'Atualizar Senha' : 'Enviar Código'}</Text>
              )}
            </TouchableOpacity>
            {codeSent && (
              <TouchableOpacity style={styles.resendButton} onPress={handleRequestCode} disabled={loading}>
                <Text style={styles.resendText}>Reenviar código</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>
                <FontAwesome5 name="arrow-left" size={14} color="#FF6B35" />
                {' '}Voltar para o login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  keyboardContainer: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 20, marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
  form: { marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a',
    borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333'
  },
  inputIcon: { paddingLeft: 15 },
  input: { flex: 1, height: 55, paddingHorizontal: 15, color: '#FFF', fontSize: 16 },
  button: {
    backgroundColor: '#FF6B35', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 5
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  resendButton: { alignItems: 'center', padding: 14 },
  resendText: { color: '#FF6B35', fontSize: 14 },
  footer: { alignItems: 'center' },
  backLink: { color: '#FF6B35', fontSize: 16, fontWeight: '600' }
});
