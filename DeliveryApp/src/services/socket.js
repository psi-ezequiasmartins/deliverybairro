// src/services/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:33570';
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
