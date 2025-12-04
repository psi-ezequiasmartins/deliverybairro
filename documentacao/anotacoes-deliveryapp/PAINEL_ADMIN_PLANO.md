# 🎯 Plano de Implementação - Painel Administrativo

## 📋 Visão Geral

Expandir o **DeliveryApp** (web existente) com uma **área administrativa** completa para gerenciar todo o ecossistema DeliveryBairro.

---

## 🏗️ Estrutura Proposta

### Novo Módulo: `/admin`

```
DeliveryApp/
├── src/
│   ├── app/
│   │   ├── login/          # Login existente
│   │   ├── menu/           # Menu dos deliveries
│   │   └── admin/          ← NOVO MÓDULO
│   │       ├── dashboard/
│   │       ├── deliveries/
│   │       ├── usuarios/
│   │       ├── entregadores/
│   │       ├── taxas/
│   │       ├── pedidos/
│   │       ├── relatorios/
│   │       └── configuracoes/
│   ├── components/
│   │   └── admin/          ← NOVOS COMPONENTES
│   │       ├── AdminMenu.jsx
│   │       ├── StatCard.jsx
│   │       ├── Chart.jsx
│   │       └── DataTable.jsx
│   └── rotas.jsx          # Adicionar rotas admin
```

---

## 🔐 Sistema de Permissões

### Tabela: `admin_users`

```sql
CREATE TABLE admin_users (
  ADMIN_ID INT AUTO_INCREMENT PRIMARY KEY,
  USER_EMAIL VARCHAR(255) UNIQUE NOT NULL,
  USER_PASSWORD VARCHAR(255) NOT NULL,
  NOME VARCHAR(100) NOT NULL,
  ROLE ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPORT') DEFAULT 'ADMIN',
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  LAST_LOGIN TIMESTAMP NULL,
  ACTIVE BOOLEAN DEFAULT TRUE
);
```

### Níveis de Acesso:

- **SUPER_ADMIN**: Acesso total (configurar taxas, deletar deliveries, etc)
- **ADMIN**: Gerenciar deliveries, usuários, pedidos
- **SUPPORT**: Apenas visualizar dados e relatórios

---

## 📊 Telas do Painel Admin

### 1. Dashboard Principal

**Rota:** `/admin/dashboard`

**Componentes:**
```jsx
<Dashboard>
  <StatCard title="Deliveries Ativos" value={45} icon="store" />
  <StatCard title="Usuários Cadastrados" value={1.234} icon="users" />
  <StatCard title="Entregadores" value={89} icon="motorcycle" />
  <StatCard title="Pedidos (Hoje)" value={156} icon="shopping-bag" />
  
  <Chart type="line" title="Pedidos nos últimos 7 dias" />
  <Chart type="bar" title="Top 10 Deliveries" />
  <Chart type="pie" title="Pedidos por Categoria" />
  
  <RecentOrders limit={10} />
</Dashboard>
```

**Métricas:**
- Total de deliveries (por categoria, por plano)
- Total de usuários ativos
- Total de entregadores disponíveis
- Pedidos realizados (hoje, semana, mês)
- Receita (taxas cobradas)
- Gráficos de crescimento
- Deliveries mais ativos
- Áreas com mais pedidos

---

### 2. Gerenciar Deliveries

**Rota:** `/admin/deliveries`

**Funcionalidades:**
- ✅ Listar todos os deliveries
- ✅ Filtrar por categoria, plano, status
- ✅ Buscar por nome, email, telefone
- ✅ Visualizar detalhes completos
- ✅ Editar informações
- ✅ Ativar/Desativar delivery
- ✅ Deletar delivery (com confirmação)
- ✅ Alterar plano (FREE → PRO → PREMIUM)
- ✅ Ver histórico de pedidos por delivery
- ✅ Ver taxas aplicadas

**Tabela:**
```
| ID | Logo | Nome | Categoria | Plano | Status | Pedidos | Ações |
|----|------|------|-----------|-------|--------|---------|-------|
| 1  | 🍕   | Pizza| Comida    | PRO   | Ativo  | 234     | [Ver][Editar][Desativar] |
```

---

### 3. Gerenciar Usuários

**Rota:** `/admin/usuarios`

**Funcionalidades:**
- ✅ Listar todos os usuários
- ✅ Buscar por nome, email, telefone
- ✅ Filtrar por data de cadastro
- ✅ Ver histórico de pedidos
- ✅ Ver endereços salvos
- ✅ Bloquear/Desbloquear usuário
- ✅ Estatísticas individuais (total gasto, frequência)

**Tabela:**
```
| ID | Nome | Email | Telefone | Cadastro | Pedidos | Total Gasto | Status | Ações |
```

---

### 4. Gerenciar Entregadores

**Rota:** `/admin/entregadores`

**Funcionalidades:**
- ✅ Listar todos os entregadores
- ✅ Ver status (disponível, ocupado, offline)
- ✅ Histórico de entregas
- ✅ Rating médio
- ✅ Áreas de atuação
- ✅ Ativar/Desativar
- ✅ Estatísticas (entregas/dia, tempo médio, etc)

**Tabela:**
```
| ID | Nome | Telefone | Status | Entregas | Rating | Última Entrega | Ações |
```

---

### 5. Configurar Taxas ⭐ PRINCIPAL

**Rota:** `/admin/taxas`

**Funcionalidades:**
- ✅ Configurar Taxa de Serviço (Global)
- ✅ Configurar Taxas PSP (por provedor)
- ✅ Histórico de alterações de taxas
- ✅ Ativar/Desativar taxas
- ✅ Simular cálculo com diferentes valores
- ✅ Aplicar taxas customizadas por delivery (exceções)

**Interface:**
```jsx
<TaxasConfig>
  <Section title="Taxa de Serviço (DeliveryBairro)">
    <Input label="Valor Fixo" value={0.99} unit="R$" />
    <Toggle label="Ativa" checked={true} />
  </Section>
  
  <Section title="Taxas de Pagamento (PSP)">
    <Select label="Provedor" options={['PagSeguro', 'Pagar.me', 'Stripe']} />
    <Input label="Taxa Fixa" value={0.40} unit="R$" />
    <Input label="Taxa Percentual" value={3.99} unit="%" />
    <Range label="Faixa Permitida" min={3.99} max={4.99} />
  </Section>
  
  <Section title="Simulador">
    <Input label="Subtotal" value={50.00} />
    <Input label="Taxa Entrega" value={5.00} />
    <Result>
      Subtotal: R$ 50,00
      Taxa Entrega: R$ 5,00
      Taxa Serviço: R$ 0,99
      Taxa PSP Fixa: R$ 0,40
      Taxa PSP %: R$ 2,23
      ────────────────────
      TOTAL: R$ 58,62
    </Result>
  </Section>
  
  <Section title="Exceções por Delivery">
    <DataTable>
      | Delivery | Taxa Custom | Motivo | Ações |
    </DataTable>
  </Section>
</TaxasConfig>
```

---

### 6. Pedidos (Visão Global)

**Rota:** `/admin/pedidos`

**Funcionalidades:**
- ✅ Ver todos os pedidos do sistema
- ✅ Filtrar por status, delivery, usuário, data
- ✅ Timeline de status
- ✅ Detalhes completos (itens, taxas, pagamento)
- ✅ Exportar relatórios (CSV, PDF)
- ✅ Estatísticas agregadas

**Filtros:**
```
[ Status ▼ ] [ Delivery ▼ ] [ Data: [__/__/____] até [__/__/____] ] [ Buscar ]
```

---

### 7. Relatórios & Analytics

**Rota:** `/admin/relatorios`

**Relatórios Disponíveis:**

#### Financeiro
- Receita por taxas (serviço + PSP)
- Receita por delivery
- Comparativo mensal/anual
- Projeções

#### Operacional
- Pedidos por período
- Taxa de conversão
- Tempo médio de entrega
- Rating médio por delivery

#### Crescimento
- Novos deliveries/mês
- Novos usuários/mês
- Novos entregadores/mês
- Taxa de churn

#### Geográfico
- Mapa de calor de pedidos
- Áreas mais atendidas
- Gaps de cobertura

---

### 8. Configurações do Sistema

**Rota:** `/admin/configuracoes`

**Seções:**

#### Geral
- Nome do sistema
- Logo/Branding
- Contatos de suporte
- Redes sociais

#### Email
- Configurar SMTP
- Templates de email
- Testar envio

#### Notificações
- Configurar FCM/Push
- Templates de notificação

#### Integrações
- APIs externas (PagSeguro, Pagar.me, etc)
- Webhooks
- Chaves de API

#### Backup
- Agendamento de backups
- Download de backups
- Restaurar backup

---

## 🎨 Design do Menu Admin

```jsx
<AdminSidebar>
  <Logo src="/logo-admin.png" />
  
  <MenuItem icon="grid" href="/admin/dashboard">
    Dashboard
  </MenuItem>
  
  <MenuGroup label="Gerenciamento">
    <MenuItem icon="store" href="/admin/deliveries">
      Deliveries
    </MenuItem>
    <MenuItem icon="users" href="/admin/usuarios">
      Usuários
    </MenuItem>
    <MenuItem icon="motorcycle" href="/admin/entregadores">
      Entregadores
    </MenuItem>
  </MenuGroup>
  
  <MenuGroup label="Operações">
    <MenuItem icon="shopping-bag" href="/admin/pedidos">
      Pedidos
    </MenuItem>
    <MenuItem icon="dollar-sign" href="/admin/taxas">
      Taxas
    </MenuItem>
  </MenuGroup>
  
  <MenuGroup label="Análises">
    <MenuItem icon="bar-chart" href="/admin/relatorios">
      Relatórios
    </MenuItem>
  </MenuGroup>
  
  <MenuGroup label="Sistema">
    <MenuItem icon="settings" href="/admin/configuracoes">
      Configurações
    </MenuItem>
    <MenuItem icon="log-out" onClick={handleLogout}>
      Sair
    </MenuItem>
  </MenuGroup>
</AdminSidebar>
```

---

## 🔧 Backend - Novas Rotas

### Arquivo: `backend/src/routes_admin.js`

```javascript
// Dashboard
GET  /admin/dashboard/stats
GET  /admin/dashboard/charts
GET  /admin/dashboard/recent-orders

// Deliveries
GET  /admin/deliveries
GET  /admin/deliveries/:id
PUT  /admin/deliveries/:id
DELETE /admin/deliveries/:id
POST /admin/deliveries/:id/change-plan
POST /admin/deliveries/:id/toggle-status

// Usuários
GET  /admin/usuarios
GET  /admin/usuarios/:id
PUT  /admin/usuarios/:id
POST /admin/usuarios/:id/block

// Entregadores
GET  /admin/entregadores
GET  /admin/entregadores/:id
PUT  /admin/entregadores/:id

// Taxas
GET  /admin/taxas/config
PUT  /admin/taxas/config
GET  /admin/taxas/history
POST /admin/taxas/simulate
GET  /admin/taxas/exceptions
POST /admin/taxas/exceptions

// Pedidos
GET  /admin/pedidos
GET  /admin/pedidos/:id
GET  /admin/pedidos/export

// Relatórios
GET  /admin/relatorios/financeiro
GET  /admin/relatorios/operacional
GET  /admin/relatorios/crescimento
GET  /admin/relatorios/geografico
```

---

## 🗄️ Novas Tabelas no Banco

### 1. admin_users (Usuários Admin)
```sql
CREATE TABLE admin_users (
  ADMIN_ID INT AUTO_INCREMENT PRIMARY KEY,
  USER_EMAIL VARCHAR(255) UNIQUE NOT NULL,
  USER_PASSWORD VARCHAR(255) NOT NULL,
  NOME VARCHAR(100) NOT NULL,
  ROLE ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPORT') DEFAULT 'ADMIN',
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  LAST_LOGIN TIMESTAMP NULL,
  ACTIVE BOOLEAN DEFAULT TRUE,
  INDEX idx_email (USER_EMAIL)
);
```

### 2. taxas_config_history (Histórico de Taxas)
```sql
CREATE TABLE taxas_config_history (
  HISTORY_ID INT AUTO_INCREMENT PRIMARY KEY,
  TAXA_SERVICO DECIMAL(10,2),
  TAXA_PAGAMENTO_FIXA DECIMAL(10,2),
  TAXA_PAGAMENTO_PERCENTUAL DECIMAL(5,2),
  PSP_PROVIDER VARCHAR(50),
  CHANGED_BY INT,
  CHANGED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  REASON TEXT,
  FOREIGN KEY (CHANGED_BY) REFERENCES admin_users(ADMIN_ID)
);
```

### 3. taxas_exceptions (Exceções de Taxas)
```sql
CREATE TABLE taxas_exceptions (
  EXCEPTION_ID INT AUTO_INCREMENT PRIMARY KEY,
  DELIVERY_ID INT,
  TAXA_SERVICO_CUSTOM DECIMAL(10,2),
  TAXA_PAGAMENTO_FIXA_CUSTOM DECIMAL(10,2),
  TAXA_PAGAMENTO_PERCENTUAL_CUSTOM DECIMAL(5,2),
  REASON TEXT,
  ACTIVE BOOLEAN DEFAULT TRUE,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (DELIVERY_ID) REFERENCES deliveries(DELIVERY_ID)
);
```

### 4. system_logs (Logs do Sistema)
```sql
CREATE TABLE system_logs (
  LOG_ID INT AUTO_INCREMENT PRIMARY KEY,
  ADMIN_ID INT,
  ACTION VARCHAR(100),
  ENTITY_TYPE VARCHAR(50),
  ENTITY_ID INT,
  DETAILS TEXT,
  IP_ADDRESS VARCHAR(45),
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ADMIN_ID) REFERENCES admin_users(ADMIN_ID),
  INDEX idx_admin (ADMIN_ID),
  INDEX idx_action (ACTION),
  INDEX idx_created (CREATED_AT)
);
```

---

## 📦 Bibliotecas Necessárias

```json
{
  "dependencies": {
    "react-chartjs-2": "^5.2.0",
    "chart.js": "^4.4.0",
    "react-data-table-component": "^7.5.4",
    "date-fns": "^3.0.0",
    "react-export-table-to-excel": "^1.0.6",
    "jspdf": "^2.5.1",
    "react-hot-toast": "^2.4.1",
    "@heroicons/react": "^2.1.1"
  }
}
```

---

## 🚀 Plano de Implementação

### Fase 1: Estrutura Base (2-3 dias)
- [ ] Criar estrutura de pastas `/admin`
- [ ] Implementar sistema de login admin
- [ ] Criar tabelas no banco
- [ ] Implementar middleware de autenticação admin
- [ ] Criar layout base e menu lateral

### Fase 2: Dashboard (2-3 dias)
- [ ] Implementar cards de estatísticas
- [ ] Criar gráficos básicos
- [ ] Implementar listagem de pedidos recentes

### Fase 3: CRUD Básico (5-7 dias)
- [ ] Gerenciar Deliveries
- [ ] Gerenciar Usuários
- [ ] Gerenciar Entregadores
- [ ] Gerenciar Pedidos (visualização)

### Fase 4: Configuração de Taxas (3-4 dias)
- [ ] Interface de configuração
- [ ] Histórico de alterações
- [ ] Exceções por delivery
- [ ] Simulador de taxas

### Fase 5: Relatórios (4-5 dias)
- [ ] Relatórios financeiros
- [ ] Relatórios operacionais
- [ ] Gráficos de crescimento
- [ ] Exportação (CSV/PDF)

### Fase 6: Refinamentos (2-3 dias)
- [ ] Testes completos
- [ ] Otimizações de performance
- [ ] Documentação
- [ ] Deploy

**Total Estimado: 18-25 dias de desenvolvimento**

---

## 🔐 Segurança

### Checklist:
- [ ] Autenticação JWT para admin
- [ ] Permissões por role (SUPER_ADMIN, ADMIN, SUPPORT)
- [ ] Log de todas as ações administrativas
- [ ] Confirmação para ações destrutivas
- [ ] Rate limiting em endpoints admin
- [ ] Whitelist de IPs (opcional)
- [ ] 2FA (opcional, futuro)

---

## 📊 Métricas de Sucesso

### KPIs do Painel:
- Tempo médio de resposta dos endpoints
- Número de usuários admin ativos
- Ações realizadas por dia
- Tempo de carregamento das páginas
- Satisfação dos admin users

---

## 🎯 Próximos Passos

1. **Aprovar este plano**
2. **Criar primeira versão do dashboard**
3. **Implementar tela de configuração de taxas**
4. **Expandir gradualmente outras funcionalidades**

---

**Devo começar a implementação?** 🚀

Podemos começar pela:
1. 🏗️ Estrutura base + Login Admin
2. 💰 Tela de Configuração de Taxas (sua prioridade)
3. 📊 Dashboard com métricas básicas

**Qual você prefere começar?**
