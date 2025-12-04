# 💰 Sistema de Taxas - DeliveryBairro

## Visão Geral

O sistema de taxas do DeliveryBairro adiciona transparência e flexibilidade ao cálculo do valor final dos pedidos, permitindo a inclusão de:

1. **Taxa de Serviço** (DeliveryBairro.com)
2. **Taxas de Pagamento** (PSP - Payment Service Provider)

---

## 📊 Composição do Valor Total

```
┌─────────────────────────────────────────────┐
│  COMPOSIÇÃO DO PEDIDO                       │
├─────────────────────────────────────────────┤
│  1. Subtotal (Produtos)           R$ 50,00  │
│  2. Taxa de Entrega               R$  5,00  │
│  ├─────────────────────────────────────────┤
│  │  Subtotal + Entrega            R$ 55,00 │
│  └─────────────────────────────────────────┘
│                                              │
│  3. Taxa de Serviço               R$  0,99  │
│  ├─────────────────────────────────────────┤
│  │  Base para Cálculo             R$ 55,99 │
│  └─────────────────────────────────────────┘
│                                              │
│  4. Taxa Pagamento (Fixa)         R$  0,40  │
│  5. Taxa Pagamento (3,99%)        R$  2,23  │
│  ├─────────────────────────────────────────┤
│  │  TOTAL DO PEDIDO              R$ 58,62  │
│  └─────────────────────────────────────────┘
└─────────────────────────────────────────────┘
```

---

## 🎯 Taxas Aplicadas

### 1. Taxa de Serviço (DeliveryBairro)
- **Valor:** R$ 0,99 por pedido
- **Tipo:** Fixa
- **Objetivo:** Manutenção da plataforma
- **Configurável:** Sim

### 2. Taxa de Pagamento Fixa (PSP)
- **Valor:** R$ 0,40 por transação
- **Tipo:** Fixa
- **Fornecedor:** PagSeguro (ou outro PSP)
- **Configurável:** Sim

### 3. Taxa de Pagamento Percentual (PSP)
- **Valor:** 3,99% a 4,99%
- **Tipo:** Percentual sobre (Subtotal + Taxa Entrega + Taxa Serviço)
- **Fornecedor:** PagSeguro (ou outro PSP)
- **Configurável:** Sim
- **Variável:** Pode variar por negociação

---

## 🔧 Configuração

### Localização dos Arquivos

```
UserApp/src/config/fees.js          # Configuração frontend
backend/src/config/fees.js          # Configuração backend
backend/migrations/add_system_fees.sql  # Migration do banco
```

### Alterar Valores das Taxas

Edite o arquivo `fees.js`:

```javascript
const FEES_CONFIG = {
  // Taxa de serviço do DeliveryBairro
  SERVICE_FEE: 0.99,  // ← Alterar aqui
  
  // Taxas do sistema de pagamento
  PAYMENT: {
    FIXED_FEE: 0.40,           // ← Taxa fixa
    PERCENTAGE_FEE: 0.0399,    // ← 3.99% em decimal
    MIN_PERCENTAGE: 0.0399,    // ← Mínimo permitido
    MAX_PERCENTAGE: 0.0499,    // ← Máximo permitido
  }
};
```

### Desativar Taxas Temporariamente

Para promoções ou testes:

```javascript
const FEES_CONFIG = {
  ENABLED: {
    SERVICE_FEE: false,      // ← Desativa taxa de serviço
    PAYMENT_FEES: false,     // ← Desativa taxas de pagamento
  }
};
```

---

## 💻 Uso no Código

### Calcular Taxas

```javascript
import { calculateSystemFees } from '../config/fees';

// Dados do pedido
const subtotal = 50.00;
const taxaEntrega = 5.00;

// Calcular todas as taxas
const fees = calculateSystemFees(subtotal, taxaEntrega);

console.log(fees);
// {
//   subtotal: 50.00,
//   deliveryFee: 5.00,
//   baseAmount: 55.00,
//   serviceFee: 0.99,
//   paymentFixedFee: 0.40,
//   paymentPercentageFee: 3.99,
//   paymentPercentageValue: 2.23,
//   totalFees: 3.62,
//   grandTotal: 58.62
// }
```

### Taxa Percentual Customizada

Para deliveries com taxas negociadas:

```javascript
const customPercentage = 0.0449; // 4.49%
const fees = calculateSystemFees(subtotal, taxaEntrega, customPercentage);
```

### Exibir na Interface

```jsx
<View>
  <Text>Subtotal: R$ {fees.subtotal.toFixed(2)}</Text>
  <Text>Taxa Entrega: R$ {fees.deliveryFee.toFixed(2)}</Text>
  <Text>Taxa Serviço: R$ {fees.serviceFee.toFixed(2)}</Text>
  <Text>Taxa Pagamento (Fixa): R$ {fees.paymentFixedFee.toFixed(2)}</Text>
  <Text>Taxa Pagamento ({fees.paymentPercentageFee.toFixed(2)}%): 
    R$ {fees.paymentPercentageValue.toFixed(2)}
  </Text>
  <Text style={{fontWeight: 'bold'}}>
    Total: R$ {fees.grandTotal.toFixed(2)}
  </Text>
</View>
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `pedidos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `VR_SUBTOTAL` | DECIMAL(10,2) | Subtotal dos produtos |
| `TAXA_ENTREGA` | DECIMAL(10,2) | Taxa de entrega do delivery |
| `TAXA_SERVICO` | DECIMAL(10,2) | Taxa de serviço (R$ 0,99) |
| `TAXA_PAGAMENTO_FIXA` | DECIMAL(10,2) | Taxa fixa do PSP (R$ 0,40) |
| `TAXA_PAGAMENTO_PERCENTUAL` | DECIMAL(5,2) | Percentual aplicado (ex: 3.99) |
| `TAXA_PAGAMENTO_VALOR` | DECIMAL(10,2) | Valor calculado da taxa % |
| `VR_TOTAL` | DECIMAL(10,2) | **Total final do pedido** |

### Consulta Exemplo

```sql
SELECT 
  PEDIDO_ID,
  VR_SUBTOTAL,
  TAXA_ENTREGA,
  TAXA_SERVICO,
  TAXA_PAGAMENTO_FIXA,
  TAXA_PAGAMENTO_PERCENTUAL,
  TAXA_PAGAMENTO_VALOR,
  VR_TOTAL,
  (VR_SUBTOTAL + TAXA_ENTREGA + TAXA_SERVICO + 
   TAXA_PAGAMENTO_FIXA + TAXA_PAGAMENTO_VALOR) as TOTAL_CALCULADO
FROM pedidos
WHERE PEDIDO_ID = 123;
```

---

## 🔄 Fluxo de Criação de Pedido

### Frontend (UserApp)

1. Usuário adiciona produtos ao carrinho
2. Sistema calcula subtotal dos produtos
3. Sistema obtém taxa de entrega do delivery selecionado
4. `calculateSystemFees()` calcula todas as taxas
5. Interface exibe breakdown completo
6. Usuário confirma pedido
7. Dados são enviados ao backend

### Backend (API)

1. Recebe dados do pedido
2. **Recalcula** todas as taxas (segurança)
3. Insere pedido no banco com todas as taxas
4. Retorna confirmação com breakdown

```javascript
// Backend - routes_userapp.js
const feesCalculation = calculateSystemFees(
  VR_SUBTOTAL, 
  TAXA_ENTREGA,
  CUSTOM_PAYMENT_PERCENTAGE // opcional
);

await db.query(
  `INSERT INTO pedidos (
    VR_SUBTOTAL, TAXA_ENTREGA,
    TAXA_SERVICO, TAXA_PAGAMENTO_FIXA,
    TAXA_PAGAMENTO_PERCENTUAL, TAXA_PAGAMENTO_VALOR,
    VR_TOTAL, ...
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ...)`,
  [
    feesCalculation.subtotal,
    feesCalculation.deliveryFee,
    feesCalculation.serviceFee,
    feesCalculation.paymentFixedFee,
    feesCalculation.paymentPercentageFee,
    feesCalculation.paymentPercentageValue,
    feesCalculation.grandTotal,
    ...
  ]
);
```

---

## 📱 Telas Atualizadas

### 1. Carrinho (`Cart/index.js`)
- Exibe breakdown completo das taxas
- Atualiza total em tempo real
- Mostra cada taxa individualmente

### 2. Detalhes do Pedido (`Orders/OrderDetails.js`)
- Seção "RESUMO TOTAL DO PEDIDO"
- Lista todas as taxas aplicadas
- Exibe percentual da taxa de pagamento

### 3. Seleção de Pagamento (`Orders/OrderPayment.js`)
- Breakdown antes de escolher método
- Total visível e destacado

### 4. Pagamento em Dinheiro (`OrderPayments/CashPayment.js`)
- Discriminação completa das taxas
- Instruções sobre valor a pagar

### 5. Pagamento com Cartão (`OrderPayments/CreditCardPayment.js`)
- Breakdown detalhado antes do formulário
- Total claramente exibido

---

## 🧪 Testes

### Cenários de Teste

#### Teste 1: Pedido Pequeno
```
Subtotal: R$ 20,00
Taxa Entrega: R$ 3,00
---
Taxa Serviço: R$ 0,99
Taxa Pagamento (Fixa): R$ 0,40
Taxa Pagamento (3.99%): R$ 0,96
---
Total: R$ 25,35
```

#### Teste 2: Pedido Médio
```
Subtotal: R$ 50,00
Taxa Entrega: R$ 5,00
---
Taxa Serviço: R$ 0,99
Taxa Pagamento (Fixa): R$ 0,40
Taxa Pagamento (3.99%): R$ 2,23
---
Total: R$ 58,62
```

#### Teste 3: Pedido Grande
```
Subtotal: R$ 100,00
Taxa Entrega: R$ 8,00
---
Taxa Serviço: R$ 0,99
Taxa Pagamento (Fixa): R$ 0,40
Taxa Pagamento (3.99%): R$ 4,35
---
Total: R$ 113,74
```

### Script de Teste

```bash
cd UserApp/src/config
node fees.examples.js
```

---

## 📈 Impacto Financeiro

### Análise de Custo por Faixa

| Faixa de Pedido | Taxas Sistema | % do Total |
|-----------------|---------------|------------|
| R$ 10 - 30 | R$ 1,50 - 2,50 | 10% - 8% |
| R$ 30 - 60 | R$ 2,50 - 4,00 | 8% - 6% |
| R$ 60 - 100 | R$ 4,00 - 5,50 | 6% - 5% |
| R$ 100+ | R$ 5,50+ | 5% ou menos |

### Calculadora Online

Disponível em: `UserApp/src/config/fees.examples.js`

---

## 🔐 Segurança

### Proteções Implementadas

1. **Backend Recalcula**: Nunca confia cegamente no frontend
2. **Validação de Range**: Taxa percentual deve estar entre 3,99% e 4,99%
3. **Valores Armazenados**: Banco guarda todas as taxas aplicadas
4. **Auditoria**: Possível rastrear valores históricos

---

## 🚀 Deploy

### Checklist de Produção

- [ ] Executar migration no banco de produção
- [ ] Fazer backup do banco antes da migration
- [ ] Deploy do backend atualizado
- [ ] Deploy do UserApp atualizado
- [ ] Testar com pedido real
- [ ] Verificar cálculo no banco
- [ ] Monitorar logs por 24h

### Rollback

Se necessário reverter:

```sql
-- Remover colunas (cuidado: perde dados!)
ALTER TABLE pedidos 
DROP COLUMN TAXA_SERVICO,
DROP COLUMN TAXA_PAGAMENTO_FIXA,
DROP COLUMN TAXA_PAGAMENTO_PERCENTUAL,
DROP COLUMN TAXA_PAGAMENTO_VALOR;
```

---

## 📞 FAQ

### Por que adicionar essas taxas?

Para transparência e cobertura de custos operacionais:
- **Taxa de Serviço**: Manutenção da plataforma
- **Taxas PSP**: Custos de processamento de pagamento

### As taxas são obrigatórias?

Sim, mas podem ser desativadas temporariamente via configuração.

### Posso ter taxas diferentes por delivery?

Sim, use o parâmetro `CUSTOM_PAYMENT_PERCENTAGE` ao criar pedido.

### Pedidos antigos são afetados?

Não. Pedidos antigos terão taxas = 0 ou NULL.

### Como testar sem afetar produção?

Use ambiente de desenvolvimento e desative taxas:
```javascript
FEES_CONFIG.ENABLED.SERVICE_FEE = false;
FEES_CONFIG.ENABLED.PAYMENT_FEES = false;
```

---

## 📚 Documentos Relacionados

- [Implementação Completa](./TAXAS_SISTEMA_IMPLEMENTACAO.md)
- [Exemplos de Código](../src/config/fees.examples.js)
- [Migration SQL](../../backend/migrations/add_system_fees.sql)

---

**Versão:** 1.0  
**Última Atualização:** 03/12/2025  
**Desenvolvido por:** DeliveryBairro Team
