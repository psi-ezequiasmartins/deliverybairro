# 04 - Componentes Reutilizáveis

## 📦 Biblioteca de Componentes

### **1. Header Component**

#### **Localização:** `src/components/Header/index.js`
#### **Responsabilidades:**
- Exibir logo da aplicação
- Mostrar contador de itens no carrinho
- Gerenciar push notifications
- Navegação para carrinho

#### **Props:** Nenhuma (usa contextos)
#### **Contextos Utilizados:**
- `CartContext` - para quantidade de itens
- `NotificationContext` - para push tokens

#### **Elementos Visuais:**
```javascript
// Layout horizontal com espaçamento
<View style={styles.container}>
  <Image source={logomarca} /> // Logo principal
  <TouchableOpacity onPress={goToCart}>
    <Image source={sacola} />
    {basket.length > 0 && (
      <View style={styles.badge}>
        <Text>{basket.length}</Text>
      </View>
    )}
  </TouchableOpacity>
</View>
```

#### **Funcionalidades:**
- Badge dinâmico no carrinho
- Registro de push notifications
- Navegação condicional

---

### **2. SideBar (Drawer) Component**

#### **Localização:** `src/components/SideBar/index.js`
#### **Responsabilidades:**
- Menu lateral de navegação
- Exibir dados do usuário
- Seletor de idiomas
- Opções de logout

#### **Props:** React Navigation drawer props
#### **Contextos Utilizados:**
- `AuthContext` - dados do usuário, logout
- `useTranslation` - textos internacionalizados

#### **Estrutura:**
```javascript
<DrawerContentScrollView>
  {/* Header do usuário */}
  <View style={styles.userSection}>
    <Image source={logotipo} />
    <Text>{user?.NOME} {user?.SOBRENOME}</Text>
    <Text>User ID: {user?.USER_ID}</Text>
  </View>
  
  {/* Seletor de idiomas */}
  <LanguageSelector />
  
  {/* Menu items */}
  <DrawerItem label="CATEGORIAS" onPress={...} />
  <DrawerItem label="PEDIDOS" onPress={...} />
  <DrawerItem label="PERFIL" onPress={...} />
  <DrawerItem label="LOGOUT" onPress={signOut} />
</DrawerContentScrollView>
```

---

### **3. LanguageSelector Component**

#### **Localização:** `src/components/LanguageSelector/index.js`
#### **Responsabilidades:**
- Modal para seleção de idiomas
- Exibir idioma atual
- Alternar entre português, inglês e espanhol

#### **Props:**
- `containerStyle` (opcional)
- `textStyle` (opcional)

#### **Contextos Utilizados:**
- `useTranslateContext` - gerenciamento de idiomas
- `useTranslation` - textos

#### **Estados:**
```javascript
const [modalVisible, setModalVisible] = useState(false);
```

#### **Idiomas Suportados:**
```javascript
const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-LA', name: 'Español', flag: '🇪🇸' }
];
```

---

### **4. Basket/BasketItem Component**

#### **Localização:** `src/components/Basket/index.js`
#### **Responsabilidades:**
- Exibir item do carrinho
- Controles de quantidade
- Cálculo de valores
- Remoção de itens

#### **Props:**
```javascript
{
  item: {
    PRODUTO_ID: string,
    NOME: string,
    VR_UNITARIO: number,
    VR_ACRESCIMOS: number,
    QTD: number,
    TOTAL: number,
    ACRESCIMOS: array,
    OBS: string
  },
  onAdd: function,
  onRemove: function
}
```

#### **Layout:**
```javascript
<View style={styles.container}>
  <View style={styles.productInfo}>
    <Text style={styles.name}>{item.NOME}</Text>
    <Text style={styles.price}>R$ {item.VR_UNITARIO}</Text>
    {item.ACRESCIMOS.length > 0 && (
      <Text style={styles.extras}>
        Extras: +R$ {item.VR_ACRESCIMOS}
      </Text>
    )}
    {item.OBS && (
      <Text style={styles.observation}>{item.OBS}</Text>
    )}
  </View>
  
  <View style={styles.controls}>
    <TouchableOpacity onPress={onRemove}>
      <Text style={styles.button}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantity}>{item.QTD}</Text>
    <TouchableOpacity onPress={onAdd}>
      <Text style={styles.button}>+</Text>
    </TouchableOpacity>
  </View>
  
  <Text style={styles.total}>R$ {item.TOTAL}</Text>
</View>
```

---

### **5. CameraModal Component**

#### **Localização:** `src/components/CameraModal.js`
#### **Responsabilidades:**
- Modal para captura de fotos
- Integração com câmera do dispositivo
- Preview da foto capturada
- Callback com URI da imagem

#### **Props:**
```javascript
{
  visible: boolean,
  onClose: function,
  onCapture: function(uri)
}
```

#### **Estados:**
```javascript
const [hasPermission, setHasPermission] = useState(null);
const [type, setType] = useState(Camera.Constants.Type.back);
const [photo, setPhoto] = useState(null);
```

#### **Funcionalidades:**
- Solicitar permissão da câmera
- Captura de fotos
- Preview antes de confirmar
- Retornar URI para componente pai

---

### **6. GPS/Geolocation Components**

#### **useGeolocation Hook**
**Localização:** `src/components/gps/useGeolocation.js`
```javascript
export const getCurrentLocationStandalone = async () => {
  // Solicita permissão
  const permission = await Location.requestForegroundPermissionsAsync();
  
  if (permission.status === 'granted') {
    // Obtém localização atual
    const location = await Location.getCurrentPositionAsync({});
    
    // Converte para endereço
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    
    return { location, address };
  }
  
  throw new Error('Permissão negada');
};
```

#### **AddressConfirmationModal**
**Localização:** `src/components/gps/AddressConfirmationDialog.js`
```javascript
export const AddressConfirmationModal = ({ 
  visible, 
  address, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <Modal visible={visible}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirme seu endereço</Text>
        <Text style={styles.address}>{address}</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onCancel}>
            <Text>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm}>
            <Text>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

---

### **7. Order Components**

#### **OrderListItem**
**Localização:** `src/pages/Pedidos/OrderListItem.js`
```javascript
export default function OrderListItem({ pedido, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{pedido.PEDIDO_ID}</Text>
        <Text style={styles.date}>{formatDate(pedido.CREATED_AT)}</Text>
      </View>
      
      <Text style={styles.establishment}>{pedido.DELIVERY_NOME}</Text>
      <Text style={styles.status}>{pedido.STATUS}</Text>
      <Text style={styles.total}>Total: R$ {pedido.TOTAL}</Text>
    </TouchableOpacity>
  );
}
```

#### **OrderPayments Component**
**Localização:** `src/components/OrderPayments/index.js`
- Seleção de forma de pagamento
- Validação de dados
- Integração com gateways

---

### **8. SelectUF Component**

#### **Localização:** `src/components/SelectUF/index.js`
#### **Responsabilidades:**
- Dropdown de estados brasileiros
- Utilizado no cadastro de usuário

#### **Props:**
```javascript
{
  selectedValue: string,
  onValueChange: function,
  style: object (opcional)
}
```

#### **Estados Disponíveis:**
```javascript
const estados = [
  { label: 'Acre', value: 'AC' },
  { label: 'Alagoas', value: 'AL' },
  { label: 'Amapá', value: 'AP' },
  // ... todos os estados brasileiros
];
```

---

## 🔧 Padrões de Implementação

### **1. Estrutura Base de Componente**
```javascript
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ComponentName({ 
  prop1, 
  prop2, 
  onCallback 
}) {
  // Estados locais
  const [state, setState] = useState(initialValue);
  
  // Contextos
  const { data } = useContext(SomeContext);
  
  // Effects
  useEffect(() => {
    // Logic here
  }, [dependencies]);
  
  // Handlers
  const handleSomeAction = () => {
    // Logic here
    onCallback?.(result);
  };
  
  return (
    <View style={styles.container}>
      {/* JSX content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles
  }
});
```

### **2. Padrão de Props**
- Always destructure props
- Use default values when appropriate
- Document expected prop types
- Use optional callbacks with `?.`

### **3. Padrão de Estilos**
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  // Consistent naming and organization
});
```

### **4. Tratamento de Erros**
```javascript
try {
  // Async operation
  const result = await someAsyncFunction();
  setData(result);
} catch (error) {
  console.error('Error:', error);
  // User feedback
  Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
}
```

---

## 📋 Componentes por Categoria

### **Layout & Navigation**
- Header
- SideBar
- TabBar (React Navigation)

### **Forms & Inputs**
- LanguageSelector
- SelectUF
- CameraModal
- Text inputs with validation

### **Data Display**
- OrderListItem
- BasketItem
- Product cards
- Status indicators

### **Functional**
- GPS components
- Payment components
- Notification handlers

### **Modals & Overlays**
- AddressConfirmationModal
- Language selection modal
- Product customization modal