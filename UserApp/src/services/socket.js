// src/services/socket.js
import { io } from 'socket.io-client';
import { BASE_URL } from '@env';

if (!BASE_URL) {
  throw new Error('BASE_URL não está definida no arquivo .env');
}

const SOCKET_URL = BASE_URL;

console.log('🔌 [Socket] Inicializando socket com URL:', SOCKET_URL);

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false, // Conectar manualmente após login
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 20000,
});

// Logs de debug
socket.on('connect', () => {
  console.log('✅ [Socket] Conectado ao servidor WebSocket');
  console.log('🆔 [Socket] ID da conexão:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ [Socket] Desconectado do servidor:', reason);

  // Se desconexão for involuntária, tenta reconectar
  if (reason === 'io server disconnect') {
    console.log('🔄 [Socket] Reconectando...');
    socket.connect();
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 [Socket] Reconectado após', attemptNumber, 'tentativa(s)');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 [Socket] Tentativa de reconexão #', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('🔴 [Socket] Erro na reconexão:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('🔴 [Socket] Falha ao reconectar após todas as tentativas');
});

socket.on('connect_error', (error) => {
  console.error('🔴 [Socket] Erro de conexão:', error.message);
});

// Log de TODOS os eventos recebidos para debug
socket.onAny((eventName, ...args) => {
  console.log('📨 [Socket] Evento recebido:', eventName, 'Dados:', JSON.stringify(args, null, 2));
});

// Inicializa listeners do socketRoomManager após definir o socket
// Usando setTimeout para evitar circular dependency na primeira carga
setTimeout(() => {
  try {
    const { initializeSocketListeners } = require('./socketRoomManager');
    initializeSocketListeners();
    console.log('✅ [Socket] SocketRoomManager inicializado');
  } catch (error) {
    console.warn('⚠️ [Socket] Erro ao inicializar SocketRoomManager:', error.message);
  }
}, 100);

export default socket;
