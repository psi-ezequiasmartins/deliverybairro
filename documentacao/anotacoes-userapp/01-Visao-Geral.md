# 01 - Visão Geral do UserApp

## 📱 Sobre o Aplicativo

O **UserApp** é um aplicativo móvel de delivery desenvolvido em React Native que permite aos usuários:
- Explorar diferentes categorias de estabelecimentos
- Fazer pedidos de comida, bebidas e outros produtos
- Acompanhar entregas em tempo real
- Gerenciar perfil e histórico de pedidos

## 🏗️ Arquitetura Técnica

### Stack Principal
- **React Native** com Expo
- **React Navigation v6** (Stack, Tab, Drawer)
- **Firebase** (Authentication + Realtime Database)
- **Context API** (Gerenciamento de estado)
- **i18next** (Internacionalização)
- **Expo Location** (GPS/Geolocalização)
- **Axios** (Requisições HTTP)

### Estrutura de Navegação

```
DrawerNavigator (Menu lateral)
├── HomeDrawer
    └── TabNavigator (Abas inferiores)
        ├── HomeTab
        │   └── StackNavigator
        │       ├── HomeStack (Grupos/Categorias)
        │       ├── Deliveries (Lista de estabelecimentos)
        │       ├── DeliveryInfo (Detalhes + produtos)
        │       └── Cesta (Carrinho de compras)
        ├── OrdersTab
        │   └── StackNavigator
        │       ├── OrdersStack (Lista de pedidos)
        │       └── OrderDetailsNavigator (Detalhes do pedido)
        └── ProfileTab (Perfil do usuário)
```

## 🎨 Design System

### Cores Principais
- **Primária:** `#0033CC` (Azul)
- **Secundária:** `#FCC000` (Amarelo/Dourado)
- **Texto Ativo:** `#0033CC`
- **Texto Inativo:** `#5D5D5D`
- **Background:** `#FFF`
- **Bordas:** `#E0E0E0`

### Tipografia
- **Fonte Principal:** Sistema (iOS/Android)
- **Tamanhos:** 12px (tabs), 14px (corpo), 16px (títulos), 18px (headers)
- **Peso:** Normal, Bold

## 🔧 Configurações

### Internacionalização
- **Idiomas Suportados:** Português (pt-BR), Inglês (en-US), Espanhol (es-LA)
- **Arquivo de Configuração:** `src/i18n.js`
- **Traduções:** `src/locales/`

### API Backend
- **Base URL:** Configurável via `src/config/apiAxios.js`
- **Autenticação:** Firebase Auth + Backend próprio
- **Endpoints:** Prefixo `/user-app/`

## 📊 Fluxo de Dados

### Contextos Globais
1. **AuthContext** - Autenticação e dados do usuário
2. **CartContext** - Carrinho de compras e delivery selecionado
3. **OrderContext** - Criação e gerenciamento de pedidos
4. **NotificationContext** - Push notifications

### Persistência Local
- **AsyncStorage** - Tokens, preferências do usuário
- **Firebase RTDB** - Dados do usuário em tempo real

## 🔐 Segurança

### Autenticação
- **Firebase Auth** - Login/logout seguro
- **JWT Tokens** - Comunicação com backend
- **Push Tokens** - Notificações personalizadas

### Validações
- **Frontend** - Validação de formulários
- **Backend** - Validação de dados e autorização

## 📱 Recursos Nativos

### Dispositivo
- **GPS/Location** - Confirmação de endereço de entrega
- **Camera** - Foto do perfil do usuário
- **Push Notifications** - Atualizações de pedidos
- **AsyncStorage** - Cache local

### Permissões Necessárias
- Localização (obrigatória para entrega)
- Câmera (opcional para foto de perfil)
- Notificações (recomendada)

---

## 📈 Métricas de Qualidade

### Performance
- Navegação otimizada com lazy loading
- Cache de imagens
- Debounce em buscas

### UX/UI
- Design responsivo
- Feedback visual imediato
- Loading states em operações

### Manutenibilidade
- Componentes reutilizáveis
- Separação de responsabilidades
- Documentação inline