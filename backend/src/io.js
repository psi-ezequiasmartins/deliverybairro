// src/io.js
// Gerencia instancia global do Socket.IO sem causar dependencias circulares
let ioInstance = null;
function setIO(io) { ioInstance = io; }
function getIO() { return ioInstance; }
module.exports = { setIO, getIO };