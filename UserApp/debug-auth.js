/**
 * Teste de autenticação - UserApp
 * Debug do fluxo de login
 */

// Teste 1: Verificar se o usuário existe no Firebase Auth
console.log('=== TESTE DE DEBUG - LOGIN ===');

// Dados do teste (conforme seu usuário)
const testUser = {
  email: 'ezequiasmartins@gmail.com',
  uid: 'x1OFq9mZLjWLBYSe37EksjjEzVd2',
  USER_ID: '100001'
};

console.log('Dados do usuário para teste:', testUser);

// Teste 2: Testar JWT diretamente
const jwt = require('jsonwebtoken');
const secret = '#23f3dDF209B6dDc156e79F5405402ACffA1b7686';

const testJWT = {
  id: testUser.USER_ID,
  dt_access: new Date().toISOString().slice(0, 19).replace('T', ' '),
  chv: 1
};

try {
  const token = jwt.sign(testJWT, secret, { expiresIn: '3h' });
  console.log('Token JWT gerado com sucesso:', token.substring(0, 50) + '...');

  // Verificar se consegue decodificar
  const decoded = jwt.verify(token, secret);
  console.log('Token decodificado:', decoded);
} catch (error) {
  console.error('Erro no JWT:', error.message);
}

console.log('=== FIM DO TESTE ===');