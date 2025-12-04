# Guia de Configuração Simples do Sentry - UserApp-OLD

## 1. Dependência Instalada
```bash
yarn add @sentry/react-native
```

## 2. Configuração no sentry.io
1. Acesse https://sentry.io e faça login
2. Crie um novo projeto React Native
3. Copie apenas o **DSN** (exemplo: `https://abc123@o456.ingest.sentry.io/789`)

## 3. Configuração no App.js
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'SUA_DSN_AQUI', // Cole seu DSN real aqui
  debug: __DEV__, // Logs apenas em desenvolvimento
});
```

## 4. Substituir DSN no App.js
- Abra `App.js`
- Encontre a linha: `dsn: 'SUA_DSN_AQUI'`
- Substitua por sua DSN real do Sentry

## 5. Testar Build
```bash
eas build --platform android --profile preview
```

## 6. Monitorar Crashes
- Instale o APK problemático
- Acesse sentry.io → Seu projeto
- Veja crashes em tempo real na seção "Issues"

## Configuração Atual
✅ Dependência instalada (@sentry/react-native)  
✅ Configuração simples no App.js  
✅ Removidas configurações complexas que causavam erro  
⏳ **Próximo passo:** Obter DSN real e substituir no App.js

## Vantagens desta abordagem
- ✅ Sem erros de Metro Serializer
- ✅ Sem conflitos de build 
- ✅ Captura crashes efetivamente
- ✅ Configuração mínima e funcional
- ✅ Compatível com EAS builds