# 03 - Telas e Interfaces Detalhadas

## 📱 Mapeamento Completo das Telas

### **1. Telas de Autenticação**

#### **SignIn.js** - Tela de Login
- **Localização:** `src/pages/User/SignIn.js`
- **Funcionalidades:**
  - Login com email e senha
  - Validação de campos
  - Integração com Firebase Auth
  - Link para cadastro
  - Link para recuperação de senha
- **Elementos Visuais:**
  - Logo da aplicação
  - Campos de email e senha
  - Botão de login principal
  - Links de navegação
  - Seletor de idiomas

#### **SignUp1.js / SignUp2.js** - Cadastro de Usuário
- **Localização:** `src/pages/User/SignUp1.js` e `SignUp2.js`
- **Funcionalidades:**
  - Cadastro em etapas
  - Validação de dados pessoais
  - Integração com Firebase
  - Seletor de UF (estados)
- **Elementos Visuais:**
  - Formulário multi-etapa
  - Validação em tempo real
  - Progress indicator

#### **Reset.js** - Recuperação de Senha
- **Localização:** `src/pages/User/Reset.js`
- **Funcionalidades:**
  - Reset via email
  - Firebase Password Reset

---

### **2. Tela Principal - Categorias**

#### **Grupos/index.js** - Tela Inicial
- **Localização:** `src/pages/Grupos/index.js`
- **Layout:** Grid 3x4 com categorias
- **Categorias Disponíveis:**
  ```javascript
  [
    { id: 101, nome: "OFERTAS", imagem: "ofertas.jpg", ativo: true },
    { id: 102, nome: "SANDUICHES", imagem: "sanduiches.jpg", ativo: true },
    { id: 103, nome: "HOTDOGS", imagem: "hotdogs.jpg", ativo: true },
    { id: 104, nome: "BEBIDAS", imagem: "bebidas.jpg", ativo: true },
    { id: 105, nome: "PRATOS & PORÇÕES", imagem: "pratosporcoes.jpg", ativo: true },
    { id: 106, nome: "SUSHI", imagem: "sushi.jpg", ativo: true },
    { id: 107, nome: "FRUTAS & VERDURAS", imagem: "frutasverduras.jpg", ativo: true },
    { id: 108, nome: "MEDICAMENTOS", imagem: "medicamentos.jpg", ativo: false },
    { id: 109, nome: "GÁS DE COZINHA", imagem: "gasdecozinha.jpg", ativo: true },
    { id: 110, nome: "FLORICULTURA", imagem: "floricultura.jpg", ativo: true },
    { id: 111, nome: "ÁGUA MINERAL", imagem: "aguamineral.jpg", ativo: true },
    { id: 112, nome: "MERCADO", imagem: "mercado.jpg", ativo: true }
  ]
  ```
- **Elementos Visuais:**
  - Header com logo e carrinho
  - Grid responsivo 3 colunas
  - Imagens ilustrativas
  - Labels descritivos
  - Estados visuais (ativo/inativo)

---

### **3. Telas de Deliveries**

#### **Deliveries/index.js** - Lista de Estabelecimentos
- **Localização:** `src/pages/Deliveries/index.js`
- **Funcionalidades:**
  - Lista filtrada por categoria
  - Loading states
  - Cards informativos dos estabelecimentos
- **Elementos Visuais:**
  - Header com título da categoria
  - FlatList com cards
  - Loading indicator
  - Estado de lista vazia

#### **DeliveryInfo.js** - Detalhes do Estabelecimento
- **Localização:** `src/pages/Deliveries/DeliveryInfo.js`
- **Funcionalidades:**
  - Informações do estabelecimento
  - Lista de produtos
  - Adição ao carrinho
  - Modal de seleção de extras
- **Elementos Visuais:**
  - Header do estabelecimento
  - Lista de produtos com preços
  - Botões de adicionar
  - Modal de customização

---

### **4. Tela de Carrinho**

#### **Cesta/index.js** - Carrinho de Compras
- **Localização:** `src/pages/Cesta/index.js`
- **Funcionalidades:**
  - Visualização de produtos
  - Alteração de quantidades
  - Remoção de itens
  - Cálculo de totais
  - Confirmação de endereço GPS
  - Finalização do pedido
- **Elementos Visuais:**
  - Lista de produtos no carrinho
  - Controles de quantidade (+/-)
  - Resumo de valores
  - Botão de confirmar endereço
  - Botão de finalizar pedido
- **Estados:**
  - Carrinho vazio
  - Carrinho com produtos
  - Loading de criação do pedido
  - Confirmação de endereço

---

### **5. Telas de Pedidos**

#### **Pedidos/index.js** - Histórico de Pedidos
- **Localização:** `src/pages/Pedidos/index.js`
- **Funcionalidades:**
  - Lista de pedidos do usuário
  - Estados dos pedidos
  - Navegação para detalhes
- **Elementos Visuais:**
  - FlatList de pedidos
  - Cards com resumo do pedido
  - Status visual
  - Data e hora

#### **OrderDetailsNavigator.js** - Detalhes do Pedido
- **Localização:** `src/pages/Pedidos/OrderDetailsNavigator.js`
- **Estrutura:** Tab Navigator dentro do Stack
- **Abas:**
  - **OrderDetails.js** - Informações gerais
  - **OrderMapDetails.js** - Mapa da entrega
  - **OrderPayment.js** - Dados de pagamento
  - **OrderLiveUpdates.js** - Status em tempo real

---

### **6. Tela de Perfil**

#### **User/index.js** - Perfil do Usuário
- **Localização:** `src/pages/User/index.js`
- **Funcionalidades:**
  - Edição de dados pessoais
  - Upload de foto de perfil
  - Visualização de informações
  - Logout
- **Elementos Visuais:**
  - Foto do perfil (circular)
  - Formulário de dados
  - Botões de ação
  - Modal de câmera
- **Campos Editáveis:**
  - Nome e sobrenome
  - Telefone (com máscara)
  - Email
  - Foto de perfil

---

## 🎨 Especificações Visuais

### **Layout Patterns**

#### **Header Padrão**
```javascript
headerStyle: {
  backgroundColor: '#0033CC',
  borderBottomWidth: 0,
  elevation: 0,
  shadowOpacity: 0
},
headerTitleStyle: {
  fontWeight: 'bold',
  fontSize: 18,
  color: '#FFF'
}
```

#### **Bottom Tabs**
```javascript
tabBarStyle: {
  position: 'absolute',
  bottom: 0,
  height: 90,
  backgroundColor: '#FFF',
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0'
},
tabBarActiveTintColor: '#0033CC',
tabBarInactiveTintColor: '#5D5D5D'
```

#### **Drawer Menu**
```javascript
drawerStyle: {
  backgroundColor: '#FFF',
  width: '70%',
  marginTop: 70,
  marginBottom: 50,
  borderTopRightRadius: 25,
  borderBottomRightRadius: 25
}
```

### **Componentes de Interface**

#### **Botões Primários**
- Background: `#0033CC`
- Text Color: `#FFF`
- Border Radius: `8px`
- Padding: `15px`
- Font Weight: `bold`

#### **Cards de Produtos**
- Background: `#FFF`
- Shadow: elevação sutil
- Border Radius: `12px`
- Padding: `16px`
- Margin: `8px`

#### **Loading States**
- ActivityIndicator com cor `#0033CC`
- Texto "Carregando..." em cinza
- Background overlay transparente

### **Responsividade**

#### **Grid de Categorias**
- 3 colunas em portrait
- Espaçamento proporcional
- Imagens quadradas
- Labels centralizadas

#### **Listas**
- FlatList com otimizações
- Separadores sutis
- Padding consistente
- Scroll bounce nativo

---

## 📐 Especificações Técnicas

### **Navegação**
- React Navigation v6
- Transições nativas
- Header customizado por tela
- Bottom tabs persistentes

### **Estados de Tela**
```javascript
// Estados padrão para todas as telas
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);
```

### **Tratamento de Erros**
- Try/catch em operações async
- Alerts informativos
- Estados de fallback
- Logging para desenvolvimento

### **Performance**
- Lazy loading de componentes
- Otimização de FlatList
- Cache de imagens
- Debounce em buscas