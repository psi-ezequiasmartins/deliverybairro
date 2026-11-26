# CourierApp - DelireryBairro

Aplicativo React Native + Expo para entregadores do DelireryBairro. Permite que entregadores gerenciem pedidos, naveguem até os destinos e façam entregas de forma eficiente.

## 🚀 Características

### Autenticação
- Login/logout de entregadores
- Cadastro de novos entregadores (aguarda aprovação)
- Recuperação de senha
- Autenticação via backend e MySQL

### Dashboard
- Status do entregador (Online/Offline/Ocupado)
- Estatísticas de entregas
- Resumo de pedidos do dia
- Ações rápidas

### Gerenciamento de Pedidos
- Lista de pedidos disponíveis
- Aceitar/rejeitar pedidos
- Lista de pedidos aceitos
- Detalhes completos do pedido
- Controle do fluxo de entrega (coleta → entrega → finalização)

### Navegação
- Integração com Google Maps
- Rastreamento em tempo real
- Cálculo de rotas otimizadas
- Atualização de localização durante entrega
- Suporte a apps externos de navegação

### Outros Recursos
- Sistema de internacionalização (PT/EN/ES)
- Atualizações em tempo real via Socket.IO enquanto o app estiver conectado
- Logs detalhados para debug
- Interface responsiva e otimizada

## 📱 Tecnologias

- **React Native** 0.81.5
- **Expo SDK** ~54.0.0
- **React Navigation** 7.x
- **React Native Maps** 1.20.1
- **React Native Maps Directions** 1.9.0
- **Axios** para API calls
- **i18next** para internacionalização

## 🛠️ Configuração

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Android Studio ou Xcode
- Backend do DeliveryBairro configurado
- Google Maps API key

### Instalação

1. Clone o repositório:
```bash
cd CourierApp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `BASE_URL`: URL do backend
- `GOOGLE_MAPS_API_KEY`: Sua chave da API do Google Maps

5. Inicie o projeto:
```bash
expo start
```

## 📁 Estrutura do Projeto

```
CourierApp/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/           # Contextos React
│   │   ├── AuthContext.js  # Autenticação
│   │   ├── OrderContext.js # Gerenciamento de pedidos
│   │   └── TranslateContext.js
│   ├── config/             # Configurações
│   │   ├── apiAxios.js     # Configuração Axios
│   ├── locales/           # Traduções
│   │   ├── pt-BR.json
│   │   ├── en-US.json
│   │   └── es-LA.json
│   ├── pages/             # Telas do app
│   │   ├── Auth/          # Autenticação
│   │   ├── Dashboard/     # Dashboard principal
│   │   ├── Orders/        # Gerenciamento de pedidos
│   │   ├── Navigation/    # Navegação e mapas
│   │   └── Profile/       # Perfil do usuário
│   ├── routes/            # Navegação
│   ├── services/          # Serviços externos
│   └── utils/            # Utilitários
├── assets/               # Assets (imagens, ícones)
├── App.js               # Componente principal
└── package.json
```

## 🔧 Backend Integration

O app está integrado com o backend via rotas específicas em `routes_courierapp.js`:

### Endpoints Principais:
- `POST /api/courier/authenticate` - Autenticação
- `POST /api/courier/register` - Cadastro
- `GET /api/courier/orders/available` - Pedidos disponíveis
- `GET /api/courier/orders/accepted` - Pedidos aceitos
- `POST /api/courier/orders/:id/accept` - Aceitar pedido
- `PUT /api/courier/orders/:id/pickup/start` - Iniciar coleta
- `PUT /api/courier/orders/:id/pickup/confirm` - Confirmar coleta
- `PUT /api/courier/orders/:id/delivery/complete` - Finalizar entrega
- `PUT /api/courier/orders/:id/location` - Atualizar localização

## 🗺️ Google Maps

Para usar a funcionalidade de navegação:

1. Obtenha uma API key no Google Cloud Console
2. Ative as APIs:
   - Maps SDK for Android/iOS
   - Directions API
   - Places API
3. Configure a chave no arquivo `.env`

## 📱 Build e Deploy

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### EAS Build (recomendado)
```bash
eas build --platform android
eas build --platform ios
```

## 🐛 Debug e Logs

O app inclui um sistema de logs detalhado:
- Logs salvos no AsyncStorage em produção
- Console logs em desenvolvimento
- Logs específicos para entrega, localização e notificações

Para visualizar logs:
```javascript
import Logger from './src/utils/logger';
const logs = await Logger.getLogs();
```

## 🌐 Internacionalização

Suporte para 3 idiomas:
- Português (pt-BR) - padrão
- Inglês (en-US)
- Espanhol (es-LA)

Para adicionar novos idiomas:
1. Crie arquivo em `src/locales/`
2. Adicione ao array em `TranslateContext.js`
3. Configure no `i18n.js`

## 🔔 Atualizações em tempo real

Os eventos são recebidos via Socket.IO enquanto o app estiver aberto e conectado. Não há notificações quando o app está suspenso ou fechado.

## 📄 Licença

Este projeto é parte do sistema DelireryBairro e está sob licença proprietária.

## 🤝 Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.