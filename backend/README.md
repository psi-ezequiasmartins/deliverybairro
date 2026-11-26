## psi-Delivery (backend v1.0)
Aplicação backend escrita em NodeJs + Express + JWT c/ base de dados em MySQL, parte integrante do psi-Delivery v1.0 (Sistema de Gestão de Pedidos e Entregas a Domicílio para Bares, Restaurantes, Fastfoods, Deliveries em geral).

## Instalação
> npm | yarn install

## Execução
> nodemon src/index.js

## Migração do Firebase
O Firebase Auth, Realtime Database, Storage e FCM foram removidos. Os três aplicativos autenticam via MySQL; fotos novas são enviadas ao backend e gravadas em `backend/uploads`, e os eventos em tempo real usam Socket.IO. O Socket.IO só atualiza apps conectados; não há notificações quando estão fechados ou suspensos.

Antes de iniciar a versão nova, faça backup e aplique uma única vez `migrations/20261126_remove_firebase.sql`. Ela adiciona `couriers.PASSWORD`, remove os antigos identificadores Firebase e tokens push, e cria a tabela de códigos de recuperação. A coluna `usuarios.PASSWORD` deve existir como `VARCHAR(240)`; ela já foi adicionada no banco atual. Não execute a migração novamente.

O DeliveryApp valida `usuarios.EMAIL` e `usuarios.PASSWORD` e localiza o estabelecimento correspondente em `deliveries` pelo mesmo e-mail. As senhas usam o hash compatível com o formato MySQL do `psi-org`. Usuários sem senha MySQL precisam definir uma por meio da recuperação de senha.

Configure `MAIL_USER`, `MAIL_PASS` e `MAIL_FROM` (opcionalmente `MAIL_SERVICE`) para envio dos códigos de recuperação. Configure `PUBLIC_BASE_URL` com a URL pública do backend. Em produção, monte `backend/uploads` em armazenamento persistente; os arquivos novos são servidos em `/uploads`.

As URLs de imagens antigas não são migradas. Após desativar o Firebase, imagens antigas podem não carregar até serem reenviadas. Os endpoints de leitura de `usuarios` não devem retornar `PASSWORD`.

<img src='.temp/logo.png' width=300 />

## Acesse esse projeto em <a href="https://deliverybairro.com" target="_blank">deliverybairro.com</a>

## Última Revisão/Atualização:
21-09-2025 07:56:39

Desenvolvido por <a href="https://github.com/psi-ezequiasmartins" target="_blank">Ezequias Martins</a> ® 1999-2025 Direitos Reservados
<p><a href="https://linezequiasmartins.blogspot.com/" target="_blank"><img src=".temp/assinatura.jpg"></a></p>

## Contato
<p>Email: ezequiasmartins@gmail.com<br />Telefone: (31) 98410-7540 WhatsApp<br />Telegram: t.me/psi_software</p>

