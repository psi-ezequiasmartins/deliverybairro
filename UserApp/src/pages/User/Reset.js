import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator,
  Keyboard, Platform, StyleSheet, KeyboardAvoidingView, ScrollView, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';

import icon from '../../../assets/icon.png';
import marca from '../../../assets/logomarca.png';

export default function Reset() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { changePassword, resetPassword, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  async function handleRequestCode() {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('messages.emailInvalid'));
      return;
    }
    if (await changePassword(email)) setCodeSent(true);
  }

  async function handleUpdatePassword() {
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('messages.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('messages.passwordsNotMatch'));
      return;
    }
    if (await resetPassword(email, code, password)) navigation.navigate('SignIn');
  }

  return (
    <SafeAreaView style={styles.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image style={styles.logo} source={icon} resizeMode="contain" />
            <Image style={styles.marca} source={marca} resizeMode="contain" />
            <Text style={styles.title}>{t('reset.title')}</Text>
            <Text style={styles.subtitle}>{t(codeSent ? 'reset.enterCode' : 'reset.subtitle')}</Text>
          </View>

          <View style={styles.areaInput}>
            <Text style={styles.label}>{t('auth.email')}:</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!codeSent}
              style={styles.input}
            />
          </View>

          {codeSent && (
            <>
              <View style={styles.areaInput}>
                <Text style={styles.label}>{t('reset.code')}:</Text>
                <TextInput
                  value={code}
                  onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor="#666"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
              </View>
              <View style={styles.areaInput}>
                <Text style={styles.label}>{t('auth.password')}:</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
              <View style={styles.areaInput}>
                <Text style={styles.label}>{t('auth.confirmPassword')}:</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  onSubmitEditing={Keyboard.dismiss}
                  style={styles.input}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.btnSubmit}
            onPress={codeSent ? handleUpdatePassword : handleRequestCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color="orange" />
            ) : (
              <Text style={styles.btnTxt}>
                {t(codeSent ? 'reset.updatePassword' : 'reset.sendLink').toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>

          {codeSent && (
            <TouchableOpacity style={styles.link} onPress={handleRequestCode} disabled={loading}>
              <Text style={styles.linkTxt}>{t('reset.resendCode')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.linkTxt}>{t('reset.backToLogin')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  header: { justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: '#000', textAlign: 'center', fontWeight: 'bold', fontSize: 21 },
  subtitle: { color: '#000', textAlign: 'center', fontSize: 15 },
  logo: { width: 100, height: 100 },
  marca: { width: 200, height: 70, marginBottom: 15 },
  areaInput: { width: '100%', marginBottom: 10 },
  label: { marginBottom: 8, color: '#000' },
  input: {
    width: '95%',
    height: 50,
    backgroundColor: '#FFF',
    padding: 10,
    borderColor: '#8CB8D2',
    borderWidth: 1,
    borderRadius: 7,
    fontSize: 17,
    color: '#000'
  },
  btnSubmit: {
    width: '95%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
    margin: 10
  },
  btnTxt: { color: '#FFF', fontSize: 18, textAlign: 'center' },
  link: { marginTop: 10 },
  linkTxt: { textAlign: 'center', color: '#000' }
});
