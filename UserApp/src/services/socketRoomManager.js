/**
 * src/services/socketRoomManager.js
 * Gerenciador centralizado de salas do WebSocket
 */

// Mantém registro das salas em que o cliente está
const currentRooms = new Set();

// Lazy import do socket para evitar circular dependency
let socket = null;
function getSocket() {
  if (!socket) {
    socket = require('./socket').default;
  }
  return socket;
}

/**
 * Entra em uma sala do WebSocket
 * @param {string} room - Nome da sala (ex: 'user_123', 'order_456')
 * @param {boolean} waitForConnection - Se true, aguarda conexão antes de entrar
 */
export function joinRoom(room, waitForConnection = true) {
  if (!room) {
    console.warn('⚠️ [SocketRoomManager] Room não especificada');
    return;
  }

  const socketInstance = getSocket();
  if (!socketInstance) {
    console.warn('⚠️ [SocketRoomManager] Socket não disponível');
    return;
  }

  const doJoin = () => {
    if (!socketInstance.connected) {
      console.warn('⚠️ [SocketRoomManager] Socket não conectado, não é possível entrar na sala:', room);
      return;
    }

    socketInstance.emit('joinRoom', room);
    currentRooms.add(room);
    console.log(`✅ [SocketRoomManager] Entrou na sala: ${room}`);
    console.log(`📋 [SocketRoomManager] Salas atuais:`, Array.from(currentRooms));
  };

  if (socketInstance.connected) {
    doJoin();
  } else if (waitForConnection) {
    console.log(`⏳ [SocketRoomManager] Aguardando conexão para entrar na sala: ${room}`);
    socketInstance.once('connect', doJoin);
  }
}

/**
 * Sai de uma sala do WebSocket
 * @param {string} room - Nome da sala
 */
export function leaveRoom(room) {
  if (!room) return;

  const socketInstance = getSocket();
  if (!socketInstance) return;

  if (socketInstance.connected) {
    socketInstance.emit('leaveRoom', room);
    currentRooms.delete(room);
    console.log(`🚪 [SocketRoomManager] Saiu da sala: ${room}`);
    console.log(`📋 [SocketRoomManager] Salas atuais:`, Array.from(currentRooms));
  }
}

/**
 * Reentra em todas as salas após reconexão
 */
export function rejoinAllRooms() {
  const socketInstance = getSocket();
  if (!socketInstance) return;

  if (!socketInstance.connected) {
    console.warn('⚠️ [SocketRoomManager] Socket não conectado');
    return;
  }

  console.log(`🔄 [SocketRoomManager] Reentrando em ${currentRooms.size} sala(s)...`);

  currentRooms.forEach(room => {
    socketInstance.emit('joinRoom', room);
    console.log(`✅ [SocketRoomManager] Reentrou na sala: ${room}`);
  });
}

/**
 * Retorna lista de salas atuais
 */
export function getCurrentRooms() {
  return Array.from(currentRooms);
}

/**
 * Limpa todas as salas (útil ao fazer logout)
 */
export function clearAllRooms() {
  const socketInstance = getSocket();

  if (socketInstance && socketInstance.connected) {
    currentRooms.forEach(room => {
      socketInstance.emit('leaveRoom', room);
    });
  }

  currentRooms.clear();
  console.log('🧹 [SocketRoomManager] Todas as salas foram limpas');
}

// Inicializa listener de reconexão quando o socket estiver disponível
export function initializeSocketListeners() {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.on('reconnect', () => {
      console.log('🔄 [SocketRoomManager] Socket reconectado, reentrando nas salas...');
      rejoinAllRooms();
    });
  }
}