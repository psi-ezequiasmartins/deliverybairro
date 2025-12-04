# 🎨 Guia Visual - Onde as Taxas Aparecem no UserApp

## 📱 Telas Atualizadas

### 1. 🛒 TELA: Carrinho (Cart)

**Arquivo:** `UserApp/src/pages/Cart/index.js`

**Visualização:**
```
┌─────────────────────────────────┐
│  🛒 Cesta de Compras            │
├─────────────────────────────────┤
│                                 │
│  [LISTA DE PRODUTOS]            │
│                                 │
├─────────────────────────────────┤
│  + Sub-Total: R$ 50,00         │
│  + Taxa de Entrega: R$ 5,00    │
│  + Taxa de Serviço: R$ 0,99    │◄── NOVO
│  + Taxa Pagamento (Fixa):      │◄── NOVO
│    R$ 0,40                      │
│  + Taxa Pagamento (3.99%):     │◄── NOVO
│    R$ 2,23                      │
│  ─────────────────────────────  │
│  = Total: R$ 58,62             │
├─────────────────────────────────┤
│  [CONTINUAR COMPRANDO]          │
│  [FINALIZAR PEDIDO]             │
└─────────────────────────────────┘
```

**Código Relevante:**
```jsx
<FlatList
  data={basket}
  ListFooterComponent={() => (
    <View>
      <Text>+ Sub-Total: R$ {subtotal.toFixed(2)}</Text>
      <Text>+ Taxa de Entrega: R$ {deliveryFee.toFixed(2)}</Text>
      {feesBreakdown && (
        <>
          <Text>+ Taxa de Serviço: R$ {feesBreakdown.serviceFee.toFixed(2)}</Text>
          <Text>+ Taxa Pagamento (Fixa): R$ {feesBreakdown.paymentFixedFee.toFixed(2)}</Text>
          <Text>+ Taxa Pagamento ({feesBreakdown.paymentPercentageFee.toFixed(2)}%): 
            R$ {feesBreakdown.paymentPercentageValue.toFixed(2)}
          </Text>
        </>
      )}
      <Text>= Total: R$ {total.toFixed(2)}</Text>
    </View>
  )}
/>
```

---

### 2. 📋 TELA: Detalhes do Pedido

**Arquivo:** `UserApp/src/pages/Orders/OrderDetails.js`

**Visualização:**
```
┌─────────────────────────────────┐
│  📋 Pedido #123                  │
├─────────────────────────────────┤
│  Status: EM PREPARAÇÃO          │
│  Data: 03/12/2025 14:30         │
│                                 │
│  [LISTA DE ITENS]               │
│                                 │
├─────────────────────────────────┤
│  RESUMO TOTAL DO PEDIDO         │
├─────────────────────────────────┤
│  + SUB-TOTAL: R$ 50,00         │
│  + TAXA DE ENTREGA: R$ 5,00    │
│  + TAXA DE SERVIÇO: R$ 0,99    │◄── NOVO
│  + TAXA PAGAMENTO (FIXA):      │◄── NOVO
│    R$ 0,40                      │
│  + TAXA PAGAMENTO (3.99%):     │◄── NOVO
│    R$ 2,23                      │
│  ─────────────────────────────  │
│  = TOTAL DO PEDIDO: R$ 58,62   │
└─────────────────────────────────┘
```

**Código Relevante:**
```jsx
<Card>
  <Text style={{ fontWeight: "bold" }}>RESUMO TOTAL DO PEDIDO</Text>
  <Divider />
  <Text>+ SUB-TOTAL: R$ {parseFloat(pedido?.VR_SUBTOTAL).toFixed(2)}</Text>
  <Text>+ TAXA DE ENTREGA: R$ {parseFloat(pedido?.TAXA_ENTREGA).toFixed(2)}</Text>
  {pedido?.TAXA_SERVICO > 0 && (
    <Text>+ TAXA DE SERVIÇO: R$ {parseFloat(pedido?.TAXA_SERVICO).toFixed(2)}</Text>
  )}
  {pedido?.TAXA_PAGAMENTO_FIXA > 0 && (
    <Text>+ TAXA PAGAMENTO (FIXA): R$ {parseFloat(pedido?.TAXA_PAGAMENTO_FIXA).toFixed(2)}</Text>
  )}
  {pedido?.TAXA_PAGAMENTO_VALOR > 0 && (
    <Text>+ TAXA PAGAMENTO ({parseFloat(pedido?.TAXA_PAGAMENTO_PERCENTUAL).toFixed(2)}%): 
      R$ {parseFloat(pedido?.TAXA_PAGAMENTO_VALOR).toFixed(2)}
    </Text>
  )}
  <Text>= TOTAL DO PEDIDO: R$ {parseFloat(pedido?.VR_TOTAL).toFixed(2)}</Text>
</Card>
```

---

### 3. 💳 TELA: Seleção de Pagamento

**Arquivo:** `UserApp/src/pages/Orders/OrderPayment.js`

**Visualização:**
```
┌─────────────────────────────────┐
│  💳 Pagamento - Pedido #123     │
├─────────────────────────────────┤
│  PEDIDO Nº 123                  │
│  DELIVERY: Restaurante XYZ      │
│  DATA: 03/12/2025               │
│                                 │
├─────────────────────────────────┤
│  Subtotal: R$ 50,00            │
│  Taxa de Entrega: R$ 5,00      │
│  Taxa de Serviço: R$ 0,99      │◄── NOVO
│  Taxa Pagamento (Fixa):        │◄── NOVO
│    R$ 0,40                      │
│  Taxa Pagamento (3.99%):       │◄── NOVO
│    R$ 2,23                      │
│  ─────────────────────────────  │
│  Total: R$ 58,62               │
├─────────────────────────────────┤
│  SELECIONE A FORMA DE PAGAMENTO │
│                                 │
│  [💳 CARTÃO DE CRÉDITO]         │
│  [🏦 PIX]                        │
│  [💵 DINHEIRO]                   │
└─────────────────────────────────┘
```

**Código Relevante:**
```jsx
<View style={styles.valueContainer}>
  <View style={styles.valueRow}>
    <Text>Subtotal:</Text>
    <Text>R$ {parseFloat(pedido?.VR_SUBTOTAL).toFixed(2)}</Text>
  </View>
  
  <View style={styles.valueRow}>
    <Text>Taxa de Entrega:</Text>
    <Text>R$ {parseFloat(pedido?.TAXA_ENTREGA).toFixed(2)}</Text>
  </View>
  
  {pedido?.TAXA_SERVICO > 0 && (
    <View style={styles.valueRow}>
      <Text>Taxa de Serviço:</Text>
      <Text>R$ {parseFloat(pedido?.TAXA_SERVICO).toFixed(2)}</Text>
    </View>
  )}
  
  {/* ... mais taxas ... */}
  
  <View style={styles.totalRow}>
    <Text style={styles.totalLabel}>Total:</Text>
    <Text style={styles.totalValue}>
      R$ {parseFloat(pedido?.VR_TOTAL).toFixed(2)}
    </Text>
  </View>
</View>
```

---

### 4. 💵 TELA: Pagamento em Dinheiro

**Arquivo:** `UserApp/src/components/OrderPayments/CashPayment.js`

**Visualização:**
```
┌─────────────────────────────────┐
│  💵 Pagamento ao Portador       │
├─────────────────────────────────┤
│  Pedido #123                    │
│                                 │
│  Total a pagar: R$ 58,62       │
│                                 │
├─────────────────────────────────┤
│  Detalhes:                      │
│                                 │
│  Subtotal: R$ 50,00            │
│  Taxa de Entrega: R$ 5,00      │
│  Taxa de Serviço: R$ 0,99      │◄── NOVO
│  Taxa Pagamento (Fixa):        │◄── NOVO
│    R$ 0,40                      │
│  Taxa Pagamento (3.99%):       │◄── NOVO
│    R$ 2,23                      │
│  ─────────────────────────────  │
│  Total: R$ 58,62               │
├─────────────────────────────────┤
│  Como funciona:                 │
│  • O pagamento será feito na    │
│    entrega                      │
│  • Tenha o valor exato ou       │
│    troco disponível             │
│                                 │
│  [CONFIRMAR PAGAMENTO]          │
└─────────────────────────────────┘
```

**Código Relevante:**
```jsx
<View style={styles.detailsContainer}>
  <View style={styles.detailRow}>
    <Text>Subtotal:</Text>
    <Text>R$ {parseFloat(pedido?.VR_SUBTOTAL || 0).toFixed(2)}</Text>
  </View>
  
  <View style={styles.detailRow}>
    <Text>Taxa de Entrega:</Text>
    <Text>R$ {parseFloat(pedido?.TAXA_ENTREGA || 0).toFixed(2)}</Text>
  </View>
  
  {pedido?.TAXA_SERVICO > 0 && (
    <View style={styles.detailRow}>
      <Text>Taxa de Serviço:</Text>
      <Text>R$ {parseFloat(pedido?.TAXA_SERVICO || 0).toFixed(2)}</Text>
    </View>
  )}
  
  {/* ... mais taxas ... */}
  
  <View style={styles.totalRow}>
    <Text style={styles.totalLabel}>Total:</Text>
    <Text style={styles.totalValue}>
      R$ {parseFloat(pedido?.VR_TOTAL || 0).toFixed(2)}
    </Text>
  </View>
</View>
```

---

### 5. 💳 TELA: Pagamento com Cartão

**Arquivo:** `UserApp/src/components/OrderPayments/CreditCardPayment.js`

**Visualização:**
```
┌─────────────────────────────────┐
│  💳 Pagamento com Cartão        │
├─────────────────────────────────┤
│  PEDIDO Nº 123 - 03/12/2025    │
│                                 │
├─────────────────────────────────┤
│  Subtotal: R$ 50,00            │
│  Taxa de Entrega: R$ 5,00      │
│  Taxa de Serviço: R$ 0,99      │◄── NOVO
│  Taxa Pagamento (Fixa):        │◄── NOVO
│    R$ 0,40                      │
│  Taxa Pagamento (3.99%):       │◄── NOVO
│    R$ 2,23                      │
│  ─────────────────────────────  │
│  Total: R$ 58,62               │
├─────────────────────────────────┤
│                                 │
│  Email:                         │
│  [________________]             │
│                                 │
│  Número do Cartão:              │
│  [____ ____ ____ ____]          │
│                                 │
│  Validade:        CVV:          │
│  [__/__]          [___]         │
│                                 │
│  [CONFIRMAR PAGAMENTO]          │
└─────────────────────────────────┘
```

**Código Relevante:**
```jsx
<View style={{ marginVertical: 10 }}>
  <Text>Subtotal: R$ {parseFloat(pedido?.VR_SUBTOTAL).toFixed(2)}</Text>
  <Text>Taxa de Entrega: R$ {parseFloat(pedido?.TAXA_ENTREGA).toFixed(2)}</Text>
  {pedido?.TAXA_SERVICO > 0 && (
    <Text>Taxa de Serviço: R$ {parseFloat(pedido?.TAXA_SERVICO).toFixed(2)}</Text>
  )}
  {pedido?.TAXA_PAGAMENTO_FIXA > 0 && (
    <Text>Taxa Pagamento (Fixa): R$ {parseFloat(pedido?.TAXA_PAGAMENTO_FIXA).toFixed(2)}</Text>
  )}
  {pedido?.TAXA_PAGAMENTO_VALOR > 0 && (
    <Text>Taxa Pagamento ({parseFloat(pedido?.TAXA_PAGAMENTO_PERCENTUAL).toFixed(2)}%): 
      R$ {parseFloat(pedido?.TAXA_PAGAMENTO_VALOR).toFixed(2)}
    </Text>
  )}
  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
    Total: R$ {parseFloat(pedido?.VR_TOTAL).toFixed(2)}
  </Text>
</View>
```

---

## 🎯 Pontos-Chave da Interface

### Exibição Condicional

As taxas aparecem **somente se > 0**:

```jsx
{pedido?.TAXA_SERVICO > 0 && (
  // Renderizar taxa
)}
```

Isso garante:
✅ Pedidos antigos não mostram taxas  
✅ Taxas desativadas não aparecem  
✅ Interface limpa e organizada  

### Formatação Consistente

Todos os valores usam:
```jsx
parseFloat(valor).toFixed(2)
```

Exemplo: `50.00` → `"50.00"`

### Percentual Exibido

Taxa de pagamento mostra o percentual aplicado:
```jsx
Taxa Pagamento (3.99%): R$ 2,23
```

---

## 📊 Hierarquia de Informação

### Nível 1: Sempre Visível
- ✅ Subtotal
- ✅ Taxa de Entrega
- ✅ **Total Final**

### Nível 2: Condicional (se > 0)
- 🟡 Taxa de Serviço
- 🟡 Taxa Pagamento (Fixa)
- 🟡 Taxa Pagamento (%)

### Nível 3: Destaque
- ⭐ Total (bold, maior, separador visual)

---

## 🎨 Estilo Visual

### Cores e Fontes

```jsx
// Taxas normais
<Text style={styles.taxa}>
  + Taxa de Serviço: R$ 0,99
</Text>

// Total destacado
<Text style={styles.total}>
  = Total: R$ 58,62
</Text>

// Estilos sugeridos
const styles = StyleSheet.create({
  taxa: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  }
});
```

---

## 🔄 Fluxo do Usuário

```
┌─────────────────────────────────────────────┐
│  1. Carrinho                                │
│     ↓ Vê breakdown de taxas                │
│     ↓ Confirma endereço                     │
├─────────────────────────────────────────────┤
│  2. Pedido Criado                           │
│     ↓ Backend calcula taxas                │
│     ↓ Salva no banco                        │
├─────────────────────────────────────────────┤
│  3. Detalhes do Pedido                      │
│     ↓ Vê todas as taxas aplicadas          │
│     ↓ Clica em "Ir para Pagamento"         │
├─────────────────────────────────────────────┤
│  4. Seleção de Pagamento                    │
│     ↓ Revisa breakdown novamente            │
│     ↓ Escolhe método                        │
├─────────────────────────────────────────────┤
│  5. Tela de Pagamento Específica            │
│     ↓ Vê breakdown final                    │
│     ↓ Preenche dados (cartão) ou confirma   │
│     ↓ Finaliza pagamento                    │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist Visual

Ao testar, verifique se em **todas as telas** aparece:

- [ ] **Carrinho**: Breakdown completo no footer
- [ ] **Detalhes Pedido**: Seção "RESUMO TOTAL DO PEDIDO"
- [ ] **Seleção Pagamento**: Valores antes dos botões
- [ ] **Pagamento Dinheiro**: Detalhes na área superior
- [ ] **Pagamento Cartão**: Breakdown antes do formulário
- [ ] **Todas as taxas** estão formatadas corretamente
- [ ] **Total** está em destaque (bold)
- [ ] **Percentual** aparece na taxa de pagamento

---

## 🎉 Resultado Final

O usuário agora tem **transparência total** sobre todos os custos:

✅ Vê cada taxa individualmente  
✅ Entende o que está pagando  
✅ Pode revisar em múltiplas etapas  
✅ Recebe confirmação visual clara  

**Isso aumenta a confiança e reduz contestações!** 🚀

---

**Data:** 03/12/2025  
**Desenvolvido por:** DeliveryBairro Team
