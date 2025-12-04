# 📋 Painel Administrativo - Guia de Uso

## 🎯 Visão Geral

Sistema administrativo para gerenciar as taxas do DeliveryBairro, deliveries cadastrados, usuários e entregadores.

---

## 🚀 Acesso Inicial

### 1. Criar Primeiro Administrador

Execute o script de criação do primeiro admin:

```bash
cd backend
node src/utils/createFirstAdmin.js
```

**Credenciais padrão criadas:**
- **Email:** admin@deliverybairro.com
- **Senha:** Admin@2025
- **Role:** SUPER_ADMIN

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

### 2. Acessar o Painel

```
URL: http://localhost:3001/admin/login
```

---

## 🔐 Sistema de Autenticação

### Níveis de Acesso

| Role | Permissões |
|------|-----------|
| **SUPER_ADMIN** | Acesso total - pode alterar taxas, criar admins, ver logs |
| **ADMIN** | Pode alterar taxas e gerenciar deliveries/usuários |
| **SUPPORT** | Apenas visualização de dados |

### Login

1. Acesse `/admin/login`
2. Insira email e senha
3. Token JWT gerado com validade de **8 horas**
4. Redirecionamento automático para dashboard

### Segurança

- Senhas criptografadas com **bcrypt** (salt rounds: 10)
- Tokens JWT assinados com secret do `.env`
- Middleware de autenticação em todas as rotas protegidas
- Validação de roles para operações sensíveis
- Logs de todas as ações administrativas

---

## 💰 Gerenciamento de Taxas

### Acessar Configuração

```
Menu Lateral > Configurações > Taxas do Sistema
```

### Campos Configuráveis

#### 1. Taxa de Serviço (R$)
- **Descrição:** Taxa fixa cobrada por pedido
- **Padrão:** R$ 0,99
- **Aplicação:** Somada ao total de todos os pedidos

#### 2. Taxa PSP Fixa (R$)
- **Descrição:** Taxa fixa do processador de pagamento
- **Padrão:** R$ 0,40
- **Aplicação:** Cobrada por transação

#### 3. Taxa PSP Percentual (%)
- **Descrição:** Percentual do processador de pagamento
- **Padrão:** 3.99%
- **Limites:** Entre 3.99% e 4.99%
- **Aplicação:** Calculada sobre (subtotal + taxa de entrega)

### Fórmula de Cálculo

```javascript
subtotalComEntrega = subtotal + taxaEntrega
taxaPspVariavel = (subtotalComEntrega × taxaPspPercentual) / 100
totalTaxas = taxaServico + taxaPspFixa + taxaPspVariavel
totalFinal = subtotalComEntrega + totalTaxas
```

### Simulador em Tempo Real

O painel inclui um **simulador visual** que mostra o impacto das taxas:

1. Digite valor do pedido
2. Digite taxa de entrega
3. Veja o cálculo detalhado em tempo real
4. Confirme antes de salvar

### Histórico de Alterações

Todas as mudanças nas taxas são registradas em `taxas_config_history`:

```sql
SELECT 
  CHANGED_AT,
  CHANGED_BY,
  OLD_VALUES,
  NEW_VALUES
FROM taxas_config_history
ORDER BY CHANGED_AT DESC;
```

---

## 🏪 Exceções de Taxas por Delivery

### Quando Usar

Permite configurar taxas diferentes para deliveries específicos:

- Parceiros estratégicos com descontos
- Estabelecimentos em período de teste
- Deliveries com volume alto de pedidos

### Criar Exceção

```javascript
POST /admin/taxas/exceptions
Authorization: Bearer <token>

{
  "DELIVERY_ID": 123,
  "TAXA_SERVICO": 0.50,        // Opcional - desconto na taxa de serviço
  "TAXA_PSP_PERCENTUAL": 2.99,  // Opcional - percentual reduzido
  "OBSERVACOES": "Parceiro platinum - desconto de 50%",
  "DATA_INICIO": "2025-01-01",
  "DATA_FIM": "2025-12-31"      // Opcional - deixar null para indefinido
}
```

### Listar Exceções Ativas

```javascript
GET /admin/taxas/exceptions?active=true
Authorization: Bearer <token>
```

### Desativar Exceção

```javascript
DELETE /admin/taxas/exceptions/:id
Authorization: Bearer <token>
```

---

## 📊 Dashboard e Estatísticas

### Endpoint de Estatísticas

```javascript
GET /admin/dashboard/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "pedidos": {
      "total": 1234,
      "hoje": 56,
      "mes": 789
    },
    "deliveries": {
      "ativos": 45,
      "total": 67
    },
    "usuarios": {
      "ativos": 2340,
      "total": 3456
    },
    "entregadores": {
      "online": 12,
      "total": 34
    },
    "taxas": {
      "arrecadado_mes": 5678.90,
      "taxas_aplicadas": 1234
    }
  }
}
```

---

## 🔄 Fluxo de Atualização de Taxas

### Passo a Passo

1. **Admin acessa painel**
   - Login com credenciais
   - Token JWT gerado

2. **Navega para Taxas**
   - `/admin/taxas`
   - Carrega configuração atual

3. **Simula mudanças**
   - Testa valores no simulador
   - Vê impacto no total do pedido

4. **Salva configuração**
   - Validação de limites (3.99% - 4.99%)
   - Verifica permissão (ADMIN ou SUPER_ADMIN)
   - Registra em histórico
   - Gera log no sistema

5. **Aplicação imediata**
   - Próximos pedidos usam novas taxas
   - Sem necessidade de restart
   - UserApp e backend sincronizados

---

## 🛡️ Auditoria e Logs

### Sistema de Logs

Todas as ações administrativas são registradas:

```sql
SELECT 
  ACTION_TYPE,
  USER_ID,
  DESCRIPTION,
  CREATED_AT,
  IP_ADDRESS,
  USER_AGENT
FROM system_logs
WHERE ACTION_TYPE = 'CONFIG_CHANGE'
ORDER BY CREATED_AT DESC;
```

### Tipos de Ações Logadas

| Action Type | Descrição |
|-------------|-----------|
| `LOGIN` | Login de administrador |
| `CONFIG_CHANGE` | Alteração de taxas |
| `EXCEPTION_CREATED` | Exceção criada |
| `EXCEPTION_DELETED` | Exceção removida |
| `ADMIN_CREATED` | Novo admin cadastrado |

---

## 🔧 Configuração Backend

### Variáveis de Ambiente

Adicione ao `backend/.env`:

```env
# JWT Secret para admin
JWT_SECRET=seu_secret_super_seguro_aqui

# Tempo de expiração do token
JWT_EXPIRES_IN=8h
```

### Rotas Implementadas

```javascript
// Autenticação
POST   /admin/login          // Login do admin
GET    /admin/verify         // Verificar token válido

// Taxas
GET    /admin/taxas/config   // Buscar configuração
PUT    /admin/taxas/config   // Atualizar taxas
GET    /admin/taxas/history  // Histórico de mudanças

// Exceções
GET    /admin/taxas/exceptions       // Listar exceções
POST   /admin/taxas/exceptions       // Criar exceção
DELETE /admin/taxas/exceptions/:id   // Remover exceção

// Dashboard
GET    /admin/dashboard/stats        // Estatísticas gerais
```

---

## 🚨 Troubleshooting

### Login não funciona

```bash
# Verificar se admin existe
SELECT * FROM admin_users WHERE USER_EMAIL = 'admin@deliverybairro.com';

# Recriar admin se necessário
node src/utils/createFirstAdmin.js
```

### Token expirado

- Tokens duram **8 horas**
- Faça login novamente
- Token é renovado automaticamente

### Erro ao salvar taxas

**Erro comum:** "Taxa PSP percentual deve estar entre 3.99% e 4.99%"

**Solução:** 
- Verifique se o valor está dentro dos limites
- Valores aceitos: 3.99 até 4.99

### Alterações não refletem no app

1. Verifique se salvou a configuração
2. Confirme que backend está rodando
3. Teste com novo pedido (não pedidos antigos)

---

## 📱 Interface do Painel

### Menu Lateral

```
📊 Dashboard
├── 📈 Visão Geral
│
🏢 Gerenciamento
├── 🏪 Deliveries
├── 👥 Usuários
├── 🏍️ Entregadores
└── 🛍️ Pedidos
│
⚙️ Configurações
├── 💰 Taxas do Sistema     ← Implementado
├── 🏷️ Exceções de Taxas    ← Backend pronto
└── 👨‍💼 Administradores
│
📄 Relatórios
├── 📊 Relatórios
└── 📜 Logs do Sistema
```

### Tela de Taxas

**Layout:**
- **Coluna Esquerda:** Formulário de configuração
- **Coluna Direita:** Simulador em tempo real

**Recursos:**
- ✅ Validação em tempo real
- ✅ Feedback visual de erros
- ✅ Calculadora automática
- ✅ Histórico de mudanças

---

## 🎨 Customização

### Cores do Painel

Editável em `admin-login.css` e `admin-taxas.css`:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cor de destaque */
color: #667eea;
```

### Logo

Substitua a imagem em:
```
DeliveryApp/public/images/logo.png
```

---

## 📈 Próximos Passos

### Features Pendentes

- [ ] Dashboard com gráficos (Chart.js)
- [ ] Gerenciamento de deliveries
- [ ] Gerenciamento de usuários
- [ ] Gerenciamento de entregadores
- [ ] Relatórios em PDF
- [ ] Exportação de dados (CSV)
- [ ] Notificações em tempo real
- [ ] Configuração de email
- [ ] Backup automático

### Melhorias Sugeridas

- [ ] Two-factor authentication (2FA)
- [ ] Recuperação de senha por email
- [ ] Tema escuro
- [ ] Filtros avançados
- [ ] Bulk actions
- [ ] API documentation (Swagger)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique este guia
2. Consulte os logs do sistema
3. Revise o código em `backend/src/routes_admin.js`

---

## 📝 Changelog

### v1.0.0 - Janeiro 2025

✅ **Implementado:**
- Sistema de autenticação admin (JWT)
- Gerenciamento de taxas
- Simulador em tempo real
- Histórico de alterações
- Sistema de exceções
- Logs de auditoria
- Interface responsiva
- Menu lateral navegável

🔄 **Em Desenvolvimento:**
- Dashboard com gráficos
- Demais módulos de gerenciamento

---

**Desenvolvido para DeliveryBairro** 🚀
