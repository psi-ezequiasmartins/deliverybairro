// src/services/socket.js
import { io } from 'socket.io-client';
import { BASE_URL } from '../config/apiAxios';

const socket = io(BASE_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
