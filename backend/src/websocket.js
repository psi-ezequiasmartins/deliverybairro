// src/websocket.js
const http = require('http');
const socketIo = require('socket.io');
const app = require('./index');
const { setIO } = require('./io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setIO(io);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Cliente entra em uma sala específica
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`✅ Cliente ${socket.id} entrou na sala: ${room}`);

    // Log de todas as salas do socket
    console.log(`📋 Salas do socket ${socket.id}:`, Array.from(socket.rooms));

    // Log do total de clientes na sala
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`👥 Total de clientes na sala ${room}: ${roomSize}`);
  });

  // Cliente sai de uma sala
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`🚪 Cliente ${socket.id} saiu da sala: ${room}`);
  });

  // Exemplo: escuta por atualização de status de pedido
  socket.on('updateOrderStatus', (data) => {
    // Broadcast para todos os clientes
    io.emit('orderStatusUpdated', data);
    console.log('Status do pedido atualizado:', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.WS_PORT || 33570;
server.listen(PORT, () => {
  console.log(`WebSocket rodando na porta ${PORT}`);
});

module.exports = io;
