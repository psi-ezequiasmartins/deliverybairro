import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar as traduções
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esLA from './locales/es-LA.json';

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-LA': {
    translation: esLA
  }
};

i18n
  // Detector de idioma do navegador
  .use(LanguageDetector)
  // Integração com React
  .use(initReactI18next)
  // Configuração
  .init({
    resources,

    // Idioma padrão se não detectar
    fallbackLng: 'pt-BR',

    // Idiomas suportados
    supportedLngs: ['pt-BR', 'en-US', 'es-LA'],

    // Configuração de detecção
    detection: {
      // Ordem de verificação: localStorage -> navegador -> padrão
      order: ['localStorage', 'navigator'],

      // Chave no localStorage
      lookupLocalStorage: 'bluedelivery-language',

      // Garantir que a chave seja consistente
      caches: ['localStorage'],

      // Mapear idiomas do navegador para nossos códigos
      convertDetectedLanguage: (lng) => {
        // ...existing code...

        // Remover região se existir e pegar apenas o idioma base
        const baseLang = lng.split('-')[0].toLowerCase();

        // Mapear códigos para nossos idiomas suportados
        const languageMap = {
          'pt': 'pt-BR',
          'en': 'en-US',
          'es': 'es-LA'
        };

        const mappedLanguage = languageMap[baseLang] || 'pt-BR';
        console.log('🔄 Idioma mapeado:', `${lng} -> ${mappedLanguage}`);

        return mappedLanguage;
      },

      // Evitar conversões desnecessárias se já está correto
      checkWhitelist: false
    },

    interpolation: {
      // React já escapa por padrão
      escapeValue: false
    },

    // Debug apenas em desenvolvimento
    debug: false // Desabilitado para reduzir logs
  });

// Verificação adicional na inicialização - previne loops
i18n.on('initialized', () => {
  const savedLanguage = localStorage.getItem('bluedelivery-language');
  console.log('🔧 i18n inicializado:', {
    currentLanguage: i18n.language,
    savedLanguage,
    supportedLngs: i18n.options.supportedLngs
  });

  // Só aplicar se for diferente E for um idioma suportado
  if (savedLanguage &&
    savedLanguage !== i18n.language &&
    i18n.options.supportedLngs.includes(savedLanguage)) {
    console.log('🔄 Aplicando idioma salvo válido:', savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }
});

export default i18n;