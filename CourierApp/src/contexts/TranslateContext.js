/**
 * src/contexts/TranslateContext.js
 * Contexto para gerenciar estado global do idioma no CourierApp
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const TranslateContext = createContext();

export const useTranslateContext = () => {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error('useTranslateContext must be used within a TranslateProvider');
  }
  return context;
};

export const TranslateProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('courier-language');
        const supportedLanguages = ['pt-BR', 'en-US', 'es-LA'];

        if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
          console.log('🔄 Aplicando idioma salvo:', savedLanguage);
          if (savedLanguage !== i18n.language) {
            await i18n.changeLanguage(savedLanguage);
          }
          setCurrentLanguage(savedLanguage);
        } else {
          console.log('🌐 Aplicando idioma padrão:', currentLanguage);
          await i18n.changeLanguage(currentLanguage);
          await AsyncStorage.setItem('courier-language', currentLanguage);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar idioma:', error);
        await i18n.changeLanguage('pt-BR');
        setCurrentLanguage('pt-BR');
        await AsyncStorage.setItem('courier-language', 'pt-BR');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    const handleLanguageChanged = async (lng) => {
      console.log('🌐 Idioma alterado para:', lng);
      setCurrentLanguage(lng);
      try {
        await AsyncStorage.setItem('courier-language', lng);
        console.log('✅ Idioma salvo no AsyncStorage');
      } catch (error) {
        console.error('❌ Erro ao salvar idioma:', error);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const setLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('courier-language', languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
    }
  };

  return (
    <TranslateContext.Provider value={{
      currentLanguage,
      setLanguage,
      isLoading,
      supportedLanguages: ['pt-BR', 'en-US', 'es-LA']
    }}>
      {children}
    </TranslateContext.Provider>
  );
};