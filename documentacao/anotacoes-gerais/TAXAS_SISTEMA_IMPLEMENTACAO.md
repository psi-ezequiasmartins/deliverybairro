# Implementação do Sistema de Taxas Adicionais - DeliveryBairro

## 📋 Resumo da Implementação

Este documento detalha a implementação do sistema de taxas adicionais no UserApp, permitindo adicionar:
- **Taxa de Serviço**: R$ 0,99 (deliverybairro.com)
- **Taxa Fixa PSP**: R$ 0,40 por transação
- **Taxa Percentual PSP**: 3,99% a 4,99% sobre o valor

---

## 🎯 Arquivos Criados

### 1. Configuração de Taxas

#### **UserApp/src/config/fees.js**
- Centraliza todas as configurações de taxas
- Função `calculateSystemFees()` para calcular automaticamente todas as taxas
- Suporte a taxas variáveis e ativação/desativação individual
- Exporta utilitários para formatação e gerenciamento

#### **backend/src/config/fees.js**
- Versão backend com mesma lógica de cálculo
- Garante consistência entre frontend e backend
- Integrado nas rotas de pedidos

### 2. Migration SQL

#### **backend/migrations/add_system_fees.sql**
Script SQL para adicionar os novos campos na tabela `pedidos`:
```sql
- TAXA_SERVICO (DECIMAL 10,2) - Taxa de serviço do DeliveryBairro
- TAXA_PAGAMENTO_FIXA (DECIMAL 10,2) - Taxa fixa do PSP
- TAXA_PAGAMENTO_PERCENTUAL (DECIMAL 5,2) - Percentual aplicado
- TAXA_PAGAMENTO_VALOR (DECIMAL 10,2) - Valor calculado da taxa percentual
```

---

## 🔧 Arquivos Modificados

### Backend

#### **backend/src/routes_userapp.js**
**Alterações:**
1. Import do módulo de taxas: `require('./config/fees.js')`
2. Rota `POST /user-app/add/pedido`:
   - Calcula taxas automaticamente usando `calculateSystemFees()`
   - Insere novos campos no banco: `TAXA_SERVICO`, `TAXA_PAGAMENTO_FIXA`, `TAXA_PAGAMENTO_PERCENTUAL`, `TAXA_PAGAMENTO_VALOR`
   - Retorna breakdown das taxas na resposta
3. Rota `GET /user-app/pedido/:id`:
   - SELECT atualizado para incluir novos campos de taxas
   - Resposta inclui todas as taxas discriminadas

### UserApp

#### **UserApp/src/pages/Cart/index.js**
**Alterações:**
1. Import do módulo de taxas
2. Novo estado: `feesBreakdown` para armazenar breakdown das taxas
3. Função `updateSubTotal()` atualizada:
   - Chama `calculateSystemFees()` para calcular todas as taxas
   - Atualiza `feesBreakdown` e `total` com valores corretos
4. `ListFooterComponent` do FlatList:
   - Exibe discriminação completa das taxas
   - Mostra: Subtotal, Taxa Entrega, Taxa Serviço, Taxa Pagamento Fixa, Taxa Pagamento Percentual
5. `tempOrder` atualizado:
   - Inclui `FEES_BREAKDOWN` para envio ao backend

#### **UserApp/src/pages/Orders/OrderDetails.js**
**Alterações:**
- Seção "RESUMO TOTAL DO PEDIDO" atualizada
- Exibe todas as taxas condicionalmente (apenas se > 0)
- Mostra percentual aplicado na taxa de pagamento

#### **UserApp/src/pages/Orders/OrderPayment.js**
**Alterações:**
- Container de valores atualizado
- Adiciona linhas para cada taxa adicional
- Exibe breakdown completo antes da seleção do método de pagamento

#### **UserApp/src/components/OrderPayments/CashPayment.js**
**Alterações:**
- Seção de detalhes atualizada
- Exibe todas as taxas discriminadas
- Total recalculado com todas as taxas

#### **UserApp/src/components/OrderPayments/CreditCardPayment.js**
**Alterações:**
- Substitui exibição simples por breakdown detalhado
- Mostra cada taxa em linha separada
- Exibe percentual aplicado na taxa de pagamento

---

## 🚀 Passos para Implementação

### 1. **Executar Migration do Banco de Dados**

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar o script
source backend/migrations/add_system_fees.sql
```

**Ou manualmente:**
```sql
USE deliverybairro;

ALTER TABLE pedidos 
ADD COLUMN TAXA_SERVICO DECIMAL(10, 2) DEFAULT 0.99 AFTER TAXA_ENTREGA;

ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_FIXA DECIMAL(10, 2) DEFAULT 0.40 AFTER TAXA_SERVICO;

ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_PERCENTUAL DECIMAL(5, 2) DEFAULT 3.99 AFTER TAXA_PAGAMENTO_FIXA;

ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_VALOR DECIMAL(10, 2) DEFAULT 0.00 AFTER TAXA_PAGAMENTO_PERCENTUAL;
```

### 2. **Reiniciar o Backend**

```bash
cd backend
npm install
npm start
# ou
pm2 restart deliverybairro-backend
```

### 3. **Atualizar UserApp**

```bash
cd UserApp
npm install
# Para desenvolvimento
npm start
# Para build
eas build --platform android
```

---

## 📊 Estrutura de Cálculo

### Fluxo de Cálculo de Taxas:

```
1. SUBTOTAL (soma dos produtos)
2. + TAXA_ENTREGA (do delivery)
3. = BASE_AMOUNT

4. + TAXA_SERVICO (R$ 0,99)
5. = BASE_FOR_PERCENTAGE

6. TAXA_PAGAMENTO_VALOR = BASE_FOR_PERCENTAGE × TAXA_PAGAMENTO_PERCENTUAL
7. + TAXA_PAGAMENTO_FIXA (R$ 0,40)

8. = VR_TOTAL (total final)
```

### Exemplo Prático:

```
Subtotal: R$ 50,00
Taxa Entrega: R$ 5,00
Base: R$ 55,00

Taxa Serviço: R$ 0,99
Base para %: R$ 55,99

Taxa Pagamento %: 55,99 × 3,99% = R$ 2,23
Taxa Pagamento Fixa: R$ 0,40

TOTAL: R$ 58,62
```

---

## ⚙️ Configuração das Taxas

### Modificar Taxa de Serviço:

**UserApp/src/config/fees.js**:
```javascript
const FEES_CONFIG = {
  SERVICE_FEE: 0.99, // Alterar valor aqui
  // ...
};
```

### Modificar Taxas de Pagamento:

```javascript
const FEES_CONFIG = {
  PAYMENT: {
    FIXED_FEE: 0.40,        // Taxa fixa
    PERCENTAGE_FEE: 0.0399, // 3.99% (em decimal)
    MIN_PERCENTAGE: 0.0399, // Mínimo permitido
    MAX_PERCENTAGE: 0.0499, // Máximo permitido
  }
};
```

### Desativar Taxas (Para Testes/Promoções):

```javascript
const FEES_CONFIG = {
  ENABLED: {
    SERVICE_FEE: false,     // Desativa taxa de serviço
    PAYMENT_FEES: false,    // Desativa taxas de pagamento
  }
};
```

### Usar Taxa Percentual Customizada por Pedido:

No `Cart/index.js`, ao criar o pedido:
```javascript
const tempOrder = {
  // ... outros campos
  CUSTOM_PAYMENT_PERCENTAGE: 0.0449 // 4.49% customizado
};
```

---

## 🔍 Verificações Necessárias

### 1. Backend
- [ ] Migration executada com sucesso
- [ ] Tabela `pedidos` possui novos campos
- [ ] Rota `POST /user-app/add/pedido` retorna taxas calculadas
- [ ] Rota `GET /user-app/pedido/:id` retorna taxas nos pedidos existentes

### 2. UserApp
- [ ] Import do `fees.js` funciona sem erros
- [ ] Carrinho exibe breakdown das taxas
- [ ] Tela de pedido mostra todas as taxas
- [ ] Pagamentos exibem discriminação correta
- [ ] Total calculado está correto em todas as telas

### 3. Teste Completo
```
1. Adicionar produtos ao carrinho
2. Verificar cálculo no carrinho (deve mostrar todas as taxas)
3. Finalizar pedido
4. Verificar se pedido foi criado com taxas no banco
5. Abrir detalhes do pedido
6. Verificar se todas as taxas aparecem
7. Ir para pagamento
8. Verificar breakdown em cada método de pagamento
```

---

## 🎨 Interface Atualizada

### Carrinho (Cart)
```
+ Sub-Total: R$ 50,00
+ Taxa de Entrega: R$ 5,00
+ Taxa de Serviço: R$ 0,99
+ Taxa Pagamento (Fixa): R$ 0,40
+ Taxa Pagamento (3.99%): R$ 2,23
= Total: R$ 58,62
```

### Detalhes do Pedido
```
RESUMO TOTAL DO PEDIDO
────────────────────────
+ SUB-TOTAL: R$ 50,00
+ TAXA DE ENTREGA: R$ 5,00
+ TAXA DE SERVIÇO: R$ 0,99
+ TAXA PAGAMENTO (FIXA): R$ 0,40
+ TAXA PAGAMENTO (3.99%): R$ 2,23
= TOTAL DO PEDIDO: R$ 58,62
```

---

## 📝 Notas Importantes

### 1. **Compatibilidade com Pedidos Antigos**
- Pedidos criados antes da implementação terão taxas = 0 ou NULL
- As telas verificam `> 0` antes de exibir, então não afeta pedidos antigos
- Opcional: executar UPDATE para aplicar taxas retroativas (ver migration)

### 2. **Taxas Variáveis por Negociação**
- Sistema permite alterar `CUSTOM_PAYMENT_PERCENTAGE` por pedido
- Útil para deliveries com taxas especiais
- Backend aceita esse parâmetro opcional

### 3. **Performance**
- Cálculo das taxas é realizado localmente (não requer chamada API)
- Backend recalcula para garantir consistência
- Banco armazena valores já calculados

### 4. **Segurança**
- Backend sempre recalcula taxas, não confia cegamente no frontend
- Valores enviados pelo app são apenas informativos
- Cálculo final é autoridade do backend

---

## 🐛 Troubleshooting

### Erro: "Cannot find module './config/fees'"
**Solução**: Verificar se os arquivos `fees.js` foram criados corretamente:
- `UserApp/src/config/fees.js`
- `backend/src/config/fees.js`

### Taxas não aparecem no pedido
**Solução**: 
1. Verificar se migration foi executada
2. Verificar logs do backend ao criar pedido
3. Confirmar que `calculateSystemFees()` está sendo chamada

### Total está errado
**Solução**:
1. Verificar se `updateSubTotal()` está sendo chamado
2. Confirmar que `feesBreakdown` está sendo atualizado
3. Verificar se `total` está usando `fees.grandTotal`

### Pedidos antigos com erro
**Solução**: Adicionar verificações de null/undefined:
```javascript
{pedido?.TAXA_SERVICO > 0 && (
  // renderizar taxa
)}
```

---

## 📞 Suporte

Para dúvidas ou problemas na implementação, verificar:
1. Logs do backend: `pm2 logs deliverybairro-backend`
2. Console do UserApp: `console.log` nos cálculos
3. Banco de dados: `SELECT * FROM pedidos ORDER BY PEDIDO_ID DESC LIMIT 1;`

---

## ✅ Checklist de Implementação

- [x] Criar `fees.js` no UserApp
- [x] Criar `fees.js` no backend
- [x] Criar migration SQL
- [x] Atualizar rota de criação de pedidos
- [x] Atualizar rota de busca de pedidos
- [x] Atualizar Cart/index.js
- [x] Atualizar OrderDetails.js
- [x] Atualizar OrderPayment.js
- [x] Atualizar CashPayment.js
- [x] Atualizar CreditCardPayment.js
- [ ] Executar migration no banco
- [ ] Testar criação de pedido
- [ ] Testar exibição de taxas
- [ ] Deploy em produção

---

**Data de Implementação**: 03/12/2025  
**Versão**: 1.0  
**Desenvolvido por**: DeliveryBairro Team
