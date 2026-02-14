# Configurações de Ambiente - Documentação
-------------------------- backend ----------------------------
Bom dia!  
Aqui estão os comandos para rodar via SSH no backend do seu servidor:

```sh
rm -rf node_modules
rm -f yarn.lock
yarn install
pm2 restart psi-backend
```

Se for iniciar o backend pela primeira vez com PM2, use:

```sh
pm2 start src/index.js --name psi-backend
```

Esses comandos removem as dependências, reinstalam e reiniciam o backend com PM2.