# deliverybairro.com (psi-Delivery v3.0-MVP)

**Data:** 01/06/2025  
**Responsável:** Ezequias Martins  
**Versão:** 3.0 MVP
**Atualizado em: 01/11/2025 13:04
---

## 🚨 O Problema

Pequenos bares, lanchonetes, fast-foods e deliveries locais sofrem com:

- Altas taxas cobradas por apps de delivery tradicionais.
- Falta de controle direto sobre o pedido e o cliente.
- Soluções complexas e caras, sem foco em negócios locais do bairro.

---

## 💡 A Solução

**DeliveryBairro.com** é uma plataforma leve, simples e otimizada para que negócios locais tenham:

- Seu próprio painel de pedidos.
- Atendimento direto ao cliente, sem intermediação.
- Pagamento rápido via PIX, Cartão de Crédito ou ao Portador.
- Gestão de pedidos fácil e intuitiva através de um painel web (via navegador, 100% online).
- Facilidade de uso, versão web c/ cardápio online e aplicativo mobile 

---

## ✨ Diferenciais

- 100% baseado em JavaScript: Node.js + ReactJs e React Native (c/ Expo SDK 53).
- Interface responsiva e moderna.
- Foco em performance e baixo custo.
- Independência total do negócio com sub-domínio próprio (cardapio.deliverybairro.com/nome_do_delivery).
- Integração fácil com WhatsApp (cardápio online).

---

## 🎯 Público-alvo

- Pequenos comércios alimentícios e deliveries locais (bares, restaurantes, fastfoods, floriculturas, entrega de gás de cozinha, água mineral, pequenas farmácias e mercados, etc.).
- Negócios que desejam autonomia sobre pedidos e pagamentos.
- Clientes que preferem pedir direto sem apps intermediários.

---

## 💰 Monetização

- Receita por bilhetagem (taxa de 1 a 2 % por pedido efetuado na plataforma)
- Planos de Adesão (recursos extras): 
  Free (básico), 
  Pro (cardápio online + suporte online), 
  Premium (Pro + Campanha Ads)

---

## 🛠️ Tecnologia

- **Frontend:** ReactJS + Bootstrap
- **Backend:** Node.js + Express + JWT
- **Banco de Dados:** MySQL
- **Pagamentos:** Cartão de Crédito, PIX e ao Portador
- **Infra:** PM2, Apache, GitHub, Vercel, Servidores da Absam.io, Contabo.com

---

## 🚧 Status Atual

- Estrutura base funcional online.
- Página de apresentação disponível: [https://deliverybairro.com](https://deliverybairro.com)
- Backend e painel de pedidos prontos para testes.
- Integração CC, PIX e Pagto. Ao Portador, envio de pedidos finalizada.

---

## 🗺️ Roadmap

- ✅ MVP funcional com painel e pedidos diretos
- 🔄 Finalizar testes com usuários reais
- 📱 Versão mobile (Android/iOs) com React Native + Expo SDK 54 (e PWA em estudo)
- 🧾 Impressão automática de pedidos
- 📞 Integração WhatsApp + notificações (cardápio online, modelo simplificado)
- 🏷️ Marketplace com múltiplos estabelecimentos
- 📊 Relatórios de vendas e gestão simples

---

## 🎯 Objetivo

Apresentar o MVP para validação, parceiros, clientes e investidores com potencial de crescimento gradual e escalável.

## Fluxo de Dados do Sistema psi-Delivery
O sistema psi-Delivery opera em um modelo cliente-servidor, onde o backend centraliza toda a lógica de negócios e os dados, comunicando-se com três aplicativos frontend distintos através de uma API RESTful.

Backend (Node.js + Express + JWT)
Coração do Sistema: O backend é o ponto central onde todas as operações são processadas e os dados são armazenados (banco de dados).

Autenticação e Segurança: O JSON Web Tokens (JWT) é utilizado para gerenciar a autenticação de usuários, deliveries e entregadores, garantindo que apenas usuários autorizados acessem endpoints específicos da API.

RESTful API: O backend expõe uma série de endpoints (rotas) que os aplicativos frontend utilizam para interagir com o sistema.

Comunicação: A troca de dados entre o frontend e o backend é feita exclusivamente em formato JSON.

Fluxo de Comunicação e Interação
Este é o fluxo simplificado, do início ao fim, da interação entre os componentes do sistema.

1. UserApp (Usuário)
Cadastro/Login: O usuário se cadastra ou faz login, enviando dados para o backend via API. O backend valida as credenciais e retorna um token JWT.

Busca por Deliveries: O aplicativo utiliza a geolocalização do usuário (GPS) para buscar deliveries próximos. A requisição para o backend inclui as coordenadas do usuário.

Listagem de Deliveries: O backend consulta o banco de dados e retorna uma lista de deliveries próximos em formato JSON.

Criação de Pedido: O usuário seleciona itens, adiciona-os ao carrinho e finaliza o pedido. O aplicativo envia os detalhes do pedido para o backend (API POST /pedidos).

Acompanhamento de Pedido: O aplicativo faz requisições periódicas ao backend para obter o status atual do pedido.

2. DeliveryApp (Bar, Restaurante, etc.)
Login: O delivery faz login, recebe o token JWT e acessa sua interface de gerenciamento.

Fila de Pedidos: O aplicativo exibe uma fila de pedidos recebidos em tempo real. Uma vez que o pedido é criado pelo UserApp, o backend envia uma notificação para o DeliveryApp (ex: usando WebSockets, para simular o tempo real) e o pedido aparece na fila.

Gestão de Pedidos: O delivery pode aceitar, preparar ou rejeitar um pedido. Essas ações são enviadas para o backend (ex: API PUT /pedidos/:id/status). O backend atualiza o status do pedido no banco de dados.

3. CourierApp (Entregador)
Login: O entregador faz login, recebendo o token JWT.

Lista de Pedidos Disponíveis: O aplicativo exibe uma lista de pedidos que foram "aceitos" pelo delivery e estão aguardando um entregador. O entregador pode visualizar os detalhes (local de coleta, local de entrega).

Aceite de Pedido: O entregador seleciona um pedido para aceitar. Uma requisição para o backend associa o entregador ao pedido.

Navegação (Google Maps API): O aplicativo usa a API get-directions do Google Maps para traçar a rota da coleta (delivery) e, em seguida, a rota da entrega (usuário).

Atualização de Status: O entregador atualiza o status do pedido (ex: "Coletado", "Em Rota", "Entregue") através do aplicativo. O backend, por sua vez, atualiza o status no banco de dados e notifica o UserApp e o DeliveryApp sobre o andamento.

Resumo do Fluxo (Backend-Centric)

UserApp envia pedido para o Backend.
Backend salva o pedido e notifica o DeliveryApp.
DeliveryApp visualiza, aceita e prepara o pedido, atualizando o status no Backend.
Backend disponibiliza o pedido para o CourierApp.
CourierApp aceita o pedido e utiliza a API do Google Maps para a rota, enquanto atualiza o status do pedido no Backend.
Backend atualiza o status do pedido, que pode ser visualizado tanto pelo UserApp quanto pelo DeliveryApp.
