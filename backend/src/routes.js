/**
 * src/rotas.js
 */

const express = require('express');
const authMiddleware = require('./auth.js');
const db = require('./config/database.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { hashPassword } = require('./utils/hash.js');
const passwordReset = require('./services/passwordReset.js');

const router = express.Router();
const DELIVERY_JWT_SECRET = '#23f3dDF209B6dDc156e79F5405402ACffA1b7686';

// Função auxiliar para geocodificar endereço usando Nominatim (OpenStreetMap)
async function geocodeAddress(endereco, numero, bairro, cidade, uf) {
  try {
    const fullAddress = `${endereco}, ${numero}, ${bairro}, ${cidade}, ${uf}, Brasil`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DeliveryBairro/1.0'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

const publicRoutes = [
  '/api/ping',
  '/api/health',
  '/api/delivery/authenticate',
  '/api/delivery/validar-codigo-cadastro',
  '/api/delivery/finalizar-cadastro',
  '/api/delivery/request-password-reset',
  '/api/delivery/reset-password',
  '/api/user/register',
  '/api/user/authenticate',
  '/api/user/request-password-reset',
  '/api/user/reset-password',
  '/api/courier/authenticate',
  '/api/courier/register',
  '/api/courier/request-password-reset',
  '/api/courier/reset-password',
  '/api/delivery/pre-cadastro',
  '/api/delivery/send-validation-code',
  '/api/delivery/update-address-only',
  '/api/delivery/validar-codigo',
  '/api/delivery/get-code',
  '/api/pedido/:id',
  '/admin/login',
  '/admin/verify'
];

router.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Server is online', status: res.statusCode });
});

// Rota de verificação de saúde do servidor
router.get('/api/health', (req, res) => {
  let websocketInfo = {
    enabled: false,
    connected: 0,
    rooms: [],
    activeConnections: []
  };

  try {
    const { getIO } = require('./io');
    const io = getIO();

    if (io) {
      websocketInfo.enabled = true;
      websocketInfo.connected = io.engine.clientsCount || 0;

      // Lista todas as salas ativas
      const rooms = Array.from(io.sockets.adapter.rooms.keys());
      websocketInfo.rooms = rooms.filter(room => room.startsWith('user_') || room.startsWith('order_'));

      // Informações sobre conexões ativas
      io.sockets.sockets.forEach((socket) => {
        const socketRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        if (socketRooms.length > 0) {
          websocketInfo.activeConnections.push({
            socketId: socket.id.substring(0, 8) + '...',
            rooms: socketRooms
          });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao obter info do websocket:', error);
  }

  res.status(200).json({
    message: 'Server is healthy',
    status: res.statusCode,
    database: process.env.DB_NAME + ' (' + process.env.DB_HOST + ')',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    websocket: websocketInfo
  });
});

// ==========================================
// ROTA ANTIGA - DESABILITADA (versão simplificada)
// Mantida para referência histórica
// ==========================================
// router.post('/api/user/authenticate', (request, response) => {
//   const { USER_ID, CHV } = request.body;
//   const IP_ADDRESS = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
//   const DT_ACCESS = new Date().toISOString().slice(0, 19).replace('T', ' '); // data e hora do servidor

//   const user = {
//     id: USER_ID,
//     data: DT_ACCESS,
//     chv: CHV,
//   };

//   const secret = '#23f3dDF209B6dDc156e79F5405402ACffA1b7686';
//   const token = jwt.sign(user, secret, { expiresIn: '3h' });

//   let ssql = 'insert into userlog (USER_ID, IP_ADDRESS, DT_ACCESS, TOKEN, CHV) values (?, ?, ?, ?, ?) ';
//   db.query(ssql, [USER_ID, IP_ADDRESS, DT_ACCESS, token, CHV], (error, result) => {
//     if (error) {
//       return response.status(400).send(error);
//     } else {
//       return response.json({ token });
//     }
//   });
// });

router.post('/api/delivery/authenticate', async (req, res) => {
  try {
    const { EMAIL, PASSWORD, timezoneOffset } = req.body;
    if (typeof EMAIL !== 'string' || !EMAIL.trim() || typeof PASSWORD !== 'string' || !PASSWORD) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
    }
    if (!Number.isFinite(timezoneOffset)) {
      return res.status(400).json({ error: 'INVALID_TIMEZONE_OFFSET' });
    }

    const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let IP_ADDRESS = rawIp.includes(',') ? rawIp.split(',')[0].trim() : rawIp;
    IP_ADDRESS = IP_ADDRESS.replace('::ffff:', '');

    const [deliveries] = await db.query(
      `SELECT d.DELIVERY_ID, d.DELIVERY_NOME, d.EMAIL, d.RESPONSAVEL, d.TELEFONE, d.CHV
       FROM usuarios u
       INNER JOIN deliveries d ON d.EMAIL = u.EMAIL
       WHERE u.EMAIL = ? AND u.\`PASSWORD\` = ? AND u.CHV = '1' AND d.CHV = '1'
       LIMIT 1`,
      [EMAIL.trim(), hashPassword(PASSWORD)]
    );

    if (deliveries.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const delivery = deliveries[0];
    const serverTime = new Date();
    const localTime = new Date(serverTime.getTime() - timezoneOffset * 60000);
    const DT_ACCESS = localTime.toISOString().slice(0, 19).replace('T', ' ');
    const EXPIRATION_TIME = new Date(localTime.getTime() + 10800 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const user = {
      id: delivery.DELIVERY_ID,
      type: 'delivery',
      dt_access: DT_ACCESS,
      chv: delivery.CHV
    };
    const token = jwt.sign(user, DELIVERY_JWT_SECRET, {
      expiresIn: '3h',
      algorithm: 'HS256'
    });

    await db.query(
      `insert into userlog (USER_ID, IP_ADDRESS, DT_ACCESS, TOKEN, EXPIRATION_TIME, CHV) values (?, ?, ?, ?, ?, ?)`,
      [delivery.DELIVERY_ID, IP_ADDRESS, DT_ACCESS, token, EXPIRATION_TIME, delivery.CHV]
    );

    return res.status(200).json({
      token,
      expiresIn: 10800,
      delivery: {
        DELIVERY_ID: delivery.DELIVERY_ID,
        DELIVERY_NOME: delivery.DELIVERY_NOME,
        EMAIL: delivery.EMAIL,
        RESPONSAVEL: delivery.RESPONSAVEL,
        TELEFONE: delivery.TELEFONE
      }
    });
  } catch (error) {
    console.error('Erro na autenticação do delivery:', error.message);
    return res.status(500).json({ error: 'AUTHENTICATION_ERROR' });
  }
});

router.post('/api/delivery/validar-codigo-cadastro', async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof codigo !== 'string' || !/^\d{6}$/.test(codigo)) {
      return res.status(400).json({ error: 'INVALID_REGISTRATION_CODE' });
    }

    const [deliveries] = await db.query(
      `SELECT DELIVERY_ID, EMAIL
       FROM deliveries
      WHERE EMAIL = ? AND VALIDATION_CODE = ? AND CHV IN ('0', '1')
       LIMIT 1`,
      [email.trim(), codigo]
    );
    if (deliveries.length === 0) {
      return res.status(200).json({ valid: false, error: 'INVALID_REGISTRATION_CODE' });
    }

    const delivery = deliveries[0];
    const [updated] = await db.query(
      `UPDATE deliveries
       SET CHV = '1', VALIDATION_CODE = NULL
      WHERE DELIVERY_ID = ? AND CHV IN ('0', '1') AND VALIDATION_CODE = ?`,
      [delivery.DELIVERY_ID, codigo]
    );
    if (updated.affectedRows === 0) {
      return res.status(200).json({ valid: false, error: 'INVALID_REGISTRATION_CODE' });
    }

    const registrationToken = jwt.sign({
      tokenType: 'delivery-registration',
      DELIVERY_ID: delivery.DELIVERY_ID,
      EMAIL: delivery.EMAIL
    }, DELIVERY_JWT_SECRET, {
      expiresIn: '30m',
      algorithm: 'HS256'
    });

    return res.status(200).json({
      valid: true,
      DELIVERY_ID: delivery.DELIVERY_ID,
      registrationToken
    });
  } catch (error) {
    console.error('Erro ao validar código de cadastro:', error.message);
    return res.status(500).json({ error: 'REGISTRATION_ERROR' });
  }
});

router.post('/api/delivery/finalizar-cadastro', async (req, res) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'INVALID_REGISTRATION_TOKEN' });
  }

  let registration;
  try {
    registration = jwt.verify(token, DELIVERY_JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_REGISTRATION_TOKEN' });
  }
  if (registration.tokenType !== 'delivery-registration' || !registration.DELIVERY_ID || !registration.EMAIL) {
    return res.status(401).json({ error: 'INVALID_REGISTRATION_TOKEN' });
  }

  const { PASSWORD } = req.body;
  if (typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
    return res.status(400).json({ error: 'INVALID_PASSWORD' });
  }

  try {
    const [deliveries] = await db.query(
      `SELECT DELIVERY_NOME, RESPONSAVEL, TELEFONE
       FROM deliveries
       WHERE DELIVERY_ID = ? AND EMAIL = ? AND CHV = '1'
       LIMIT 1`,
      [registration.DELIVERY_ID, registration.EMAIL]
    );
    if (deliveries.length === 0) {
      return res.status(404).json({ error: 'DELIVERY_NOT_FOUND' });
    }

    const delivery = deliveries[0];
    const [users] = await db.query(
      'SELECT USER_ID, `PASSWORD` FROM usuarios WHERE EMAIL = ? LIMIT 1',
      [registration.EMAIL]
    );
    const passwordHash = hashPassword(PASSWORD);

    if (users.length > 0) {
      const currentPasswordHash = users[0].PASSWORD;
      if (currentPasswordHash && currentPasswordHash !== passwordHash) {
        return res.status(409).json({ error: 'USER_ACCOUNT_PASSWORD_MISMATCH' });
      }
      if (!currentPasswordHash) {
        await db.query(
          `UPDATE usuarios SET \`PASSWORD\` = ?
           WHERE USER_ID = ? AND (\`PASSWORD\` IS NULL OR \`PASSWORD\` = '')`,
          [passwordHash, users[0].USER_ID]
        );
      }
    } else {
      const responsibleName = (delivery.RESPONSAVEL || delivery.DELIVERY_NOME || '').trim();
      const nameParts = responsibleName.split(/\s+/);
      const firstName = (nameParts.shift() || delivery.DELIVERY_NOME).slice(0, 60);
      const lastName = nameParts.join(' ').slice(0, 60);
      await db.query(
        `INSERT INTO usuarios (NOME, SOBRENOME, TELEFONE, EMAIL, \`PASSWORD\`, URL_IMAGEM, CHV)
         VALUES (?, ?, ?, ?, ?, '', '1')`,
        [firstName, lastName, delivery.TELEFONE || '', registration.EMAIL, passwordHash]
      );
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao concluir cadastro do delivery:', error.message);
    return res.status(500).json({ error: 'REGISTRATION_ERROR' });
  }
});

router.post('/api/delivery/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'INVALID_EMAIL' });
  }

  try {
    const [deliveries] = await db.query(
      `SELECT d.DELIVERY_ID, d.EMAIL, d.RESPONSAVEL, d.DELIVERY_NOME
       FROM deliveries d
       INNER JOIN usuarios u ON u.EMAIL = d.EMAIL
       WHERE d.EMAIL = ? AND d.CHV = '1' AND u.CHV = '1'
       LIMIT 1`,
      [email.trim()]
    );

    if (deliveries.length > 0) {
      const delivery = deliveries[0];
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      await db.query(
        `UPDATE deliveries
         SET VALIDATION_CODE = CONCAT(?, UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL 15 MINUTE)))
         WHERE DELIVERY_ID = ? AND CHV = '1'`,
        [code, delivery.DELIVERY_ID]
      );

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: delivery.EMAIL,
        subject: 'Código para redefinir sua senha - deliverybairro.com',
        text: `Olá ${delivery.RESPONSAVEL || delivery.DELIVERY_NOME},\n\nSeu código para redefinir a senha é: ${code}\n\nEle expira em 15 minutos. Se você não solicitou essa alteração, ignore este e-mail.\n\nEquipe deliverybairro.com.`
      });
    }

    return res.status(200).json({ message: 'PASSWORD_RESET_CODE_SENT' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

router.post('/api/delivery/reset-password', async (req, res) => {
  const { email, codigo, PASSWORD } = req.body;
  if (typeof email !== 'string' || !email.trim() || typeof codigo !== 'string' ||
      !/^\d{6}$/.test(codigo) || typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
    return res.status(400).json({ error: 'INVALID_PASSWORD_RESET_DATA' });
  }

  try {
    const [result] = await db.query(
      `UPDATE usuarios u
       INNER JOIN deliveries d ON d.EMAIL = u.EMAIL
       SET u.\`PASSWORD\` = ?, d.VALIDATION_CODE = NULL
       WHERE u.EMAIL = ? AND u.CHV = '1' AND d.CHV = '1'
         AND LEFT(d.VALIDATION_CODE, 6) = ?
         AND CAST(SUBSTRING(d.VALIDATION_CODE, 7) AS UNSIGNED) > UNIX_TIMESTAMP()`,
      [hashPassword(PASSWORD), email.trim(), codigo]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'INVALID_OR_EXPIRED_RESET_CODE' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao redefinir senha do delivery:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

router.post('/api/user/register', async (req, res) => {
  try {
    const { NOME, SOBRENOME, TELEFONE, EMAIL, PASSWORD } = req.body;
    if (![NOME, SOBRENOME, TELEFONE, EMAIL].every(value => typeof value === 'string' && value.trim()) ||
        typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
      return res.status(400).json({ error: 'INVALID_REGISTRATION_DATA' });
    }

    const email = EMAIL.trim().toLowerCase();
    const [existing] = await db.query(
      'SELECT USER_ID FROM usuarios WHERE EMAIL = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'EMAIL_ALREADY_REGISTERED' });
    }

    const [result] = await db.query(
      `INSERT INTO usuarios (NOME, SOBRENOME, TELEFONE, EMAIL, \`PASSWORD\`, URL_IMAGEM, CHV)
       VALUES (?, ?, ?, ?, ?, '', '1')`,
      [NOME.trim(), SOBRENOME.trim(), TELEFONE.trim(), email, hashPassword(PASSWORD)]
    );

    return res.status(201).json({
      success: true,
      USER_ID: result.insertId,
      NOME: NOME.trim(),
      SOBRENOME: SOBRENOME.trim(),
      TELEFONE: TELEFONE.trim(),
      EMAIL: email,
      URL_IMAGEM: ''
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error.message);
    return res.status(500).json({ error: 'USER_REGISTRATION_ERROR' });
  }
});

router.post('/api/user/authenticate', async (req, res) => {
  try {
    const { EMAIL, PASSWORD, timezoneOffset } = req.body;
    if (typeof EMAIL !== 'string' || !EMAIL.trim() ||
        typeof PASSWORD !== 'string' || !PASSWORD ||
        !Number.isFinite(timezoneOffset)) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
    }

    const [users] = await db.query(
      `SELECT USER_ID, CHV
       FROM usuarios
       WHERE EMAIL = ? AND \`PASSWORD\` = ? AND CHV = '1'
       LIMIT 1`,
      [EMAIL.trim(), hashPassword(PASSWORD)]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const userId = users[0].USER_ID;
    const CHV = users[0].CHV;
    const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const IP_ADDRESS = String(rawIp).split(',')[0].trim().replace('::ffff:', '');
    const serverTime = new Date();
    const localTime = new Date(serverTime.getTime() - timezoneOffset * 60000);
    const DT_ACCESS = localTime.toISOString().slice(0, 19).replace('T', ' ');
    const EXPIRATION_TIME = new Date(localTime.getTime() + 10800 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const user = {
      id: userId,
      type: 'user',
      dt_access: DT_ACCESS,
      chv: CHV
    };
    const token = jwt.sign(user, DELIVERY_JWT_SECRET, {
      expiresIn: '3h',
      algorithm: 'HS256'
    });

    await db.query(
      `insert into userlog (USER_ID, IP_ADDRESS, DT_ACCESS, TOKEN, EXPIRATION_TIME, CHV) values (?, ?, ?, ?, ?, ?)`,
      [userId, IP_ADDRESS, DT_ACCESS, token, EXPIRATION_TIME, CHV]
    );

    return res.status(200).json({
      token,
      expiresIn: 10800,
      userId
    });
  } catch (error) {
    console.error('Erro na autenticação do usuário:', error.message);
    return res.status(500).json({ error: 'USER_AUTHENTICATION_ERROR' });
  }
});

router.post('/api/user/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'INVALID_EMAIL' });
  }
  try {
    await passwordReset.requestPasswordReset('user', email.trim().toLowerCase());
    return res.status(200).json({ message: 'PASSWORD_RESET_CODE_SENT' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha do usuário:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

router.post('/api/user/reset-password', async (req, res) => {
  const { email, code, PASSWORD } = req.body;
  if (typeof email !== 'string' || !email.trim() ||
      typeof code !== 'string' || !/^\d{6}$/.test(code) ||
      typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
    return res.status(400).json({ error: 'INVALID_PASSWORD_RESET_DATA' });
  }
  try {
    const reset = await passwordReset.resetPassword(
      'user', email.trim().toLowerCase(), code, hashPassword(PASSWORD)
    );
    if (!reset) return res.status(400).json({ error: 'INVALID_OR_EXPIRED_RESET_CODE' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao redefinir senha do usuário:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

// ==========================================
// AUTENTICAÇÃO DO COURIER (Entregador)
// ==========================================
router.post('/api/courier/authenticate', async (req, res) => {
  try {
    const { EMAIL, PASSWORD, timezoneOffset } = req.body;
    if (typeof EMAIL !== 'string' || !EMAIL.trim() ||
        typeof PASSWORD !== 'string' || !PASSWORD ||
        !Number.isFinite(timezoneOffset)) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
    }

    const [couriers] = await db.query(
      `SELECT COURIER_ID, NOME, SOBRENOME, EMAIL, TELEFONE, TRANSPORTE, PLACA, URL_IMAGEM, CHV
       FROM couriers
       WHERE EMAIL = ? AND \`PASSWORD\` = ? AND CHV = '1'
       LIMIT 1`,
      [EMAIL.trim().toLowerCase(), hashPassword(PASSWORD)]
    );
    if (couriers.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }

    const courier = couriers[0];
    const COURIER_ID = courier.COURIER_ID;
    const CHV = courier.CHV;
    const rawIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const IP_ADDRESS = String(rawIp).split(',')[0].trim().replace('::ffff:', '');
    const serverTime = new Date();
    const localTime = new Date(serverTime.getTime() - timezoneOffset * 60000);
    const DT_ACCESS = localTime.toISOString().slice(0, 19).replace('T', ' ');
    const EXPIRATION_TIME = new Date(localTime.getTime() + 10800 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const user = {
      id: COURIER_ID,
      courierId: COURIER_ID,
      type: 'courier',
      dt_access: DT_ACCESS,
      chv: CHV
    };

    const token = jwt.sign(user, DELIVERY_JWT_SECRET, {
      expiresIn: '3h',
      algorithm: 'HS256'
    });

    // Log de acesso do entregador
    await db.query(
      `INSERT INTO userlog (USER_ID, IP_ADDRESS, DT_ACCESS, TOKEN, EXPIRATION_TIME, CHV) VALUES (?, ?, ?, ?, ?, ?)`,
      [COURIER_ID, IP_ADDRESS, DT_ACCESS, token, EXPIRATION_TIME, CHV]
    );

    return res.status(200).json({
      token,
      expiresIn: 10800,
      courier: {
        COURIER_ID: courier.COURIER_ID,
        NOME: courier.NOME,
        SOBRENOME: courier.SOBRENOME,
        EMAIL: courier.EMAIL,
        TELEFONE: courier.TELEFONE,
        TRANSPORTE: courier.TRANSPORTE,
        PLACA: courier.PLACA,
        URL_IMAGEM: courier.URL_IMAGEM
      }
    });
  } catch (error) {
    console.error('Erro na autenticação do entregador:', error.message);
    return res.status(500).json({ error: 'COURIER_AUTHENTICATION_ERROR' });
  }
});

// ==========================================
// CADASTRO DO COURIER (Entregador)
// ==========================================
router.post('/api/courier/register', async (req, res) => {
  try {
    const {
      NOME,
      SOBRENOME,
      EMAIL,
      TELEFONE,
      TRANSPORTE,
      PLACA,
      PASSWORD
    } = req.body;

    if (![NOME, SOBRENOME, EMAIL, TELEFONE, TRANSPORTE].every(value => typeof value === 'string' && value.trim()) ||
        typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
      return res.status(400).json({ error: 'INVALID_REGISTRATION_DATA' });
    }

    // Valida tipo de transporte
    const validTransportes = ['DRIVING', 'BICYCLING', 'WALKING'];
    if (!validTransportes.includes(TRANSPORTE)) {
      return res.status(400).json({
        error: 'Tipo de transporte inválido',
        details: 'TRANSPORTE deve ser: DRIVING, BICYCLING ou WALKING'
      });
    }

    const email = EMAIL.trim().toLowerCase();
    const [existing] = await db.query(
      'SELECT COURIER_ID FROM couriers WHERE EMAIL = ? LIMIT 1',
      [email]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'EMAIL_ALREADY_REGISTERED' });
    }

    const [result] = await db.query(`
      INSERT INTO couriers (
        NOME, SOBRENOME, TELEFONE, EMAIL, \`PASSWORD\`,
        TRANSPORTE, PLACA, URL_IMAGEM, CHV
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '', '1')
    `, [
      NOME.trim(), SOBRENOME.trim(), TELEFONE.trim(), email,
      hashPassword(PASSWORD), TRANSPORTE, PLACA || ''
    ]);

    return res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso',
      courierId: result.insertId
    });
  } catch (error) {
    console.error('Erro no cadastro do entregador:', error.message);
    return res.status(500).json({ error: 'COURIER_REGISTRATION_ERROR' });
  }
});

router.post('/api/courier/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'INVALID_EMAIL' });
  }
  try {
    await passwordReset.requestPasswordReset('courier', email.trim().toLowerCase());
    return res.status(200).json({ message: 'PASSWORD_RESET_CODE_SENT' });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha do entregador:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

router.post('/api/courier/reset-password', async (req, res) => {
  const { email, code, PASSWORD } = req.body;
  if (typeof email !== 'string' || !email.trim() ||
      typeof code !== 'string' || !/^\d{6}$/.test(code) ||
      typeof PASSWORD !== 'string' || PASSWORD.length < 6) {
    return res.status(400).json({ error: 'INVALID_PASSWORD_RESET_DATA' });
  }
  try {
    const reset = await passwordReset.resetPassword(
      'courier', email.trim().toLowerCase(), code, hashPassword(PASSWORD)
    );
    if (!reset) return res.status(400).json({ error: 'INVALID_OR_EXPIRED_RESET_CODE' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao redefinir senha do entregador:', error.message);
    return res.status(500).json({ error: 'PASSWORD_RESET_ERROR' });
  }
});

router.post('/api/delivery/pre-cadastro', async (req, res) => {
  try {
    const {
      DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE, HORARIO,
      MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, TAXA_ENTREGA, RATING, URL_IMAGEM
    } = req.body;
    if (!DELIVERY_NOME || !EMAIL) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        details: 'DELIVERY_NOME e EMAIL são obrigatórios'
      });
    }
    const [result] = await db.query(
      `insert into deliveries (
        DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE, 
        HORARIO, MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, TAXA_ENTREGA, RATING, URL_IMAGEM, CHV
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0')
      `,
      [DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE, HORARIO, MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, TAXA_ENTREGA, RATING, URL_IMAGEM]
    );

    return res.status(201).json({
      DELIVERY_ID: result.insertId,
      message: 'Pré-cadastro realizado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao realizar pré-cadastro:', error);
    return res.status(500).send(error);
  }
});

// Rota para buscar o código de validação atual
router.get('/api/delivery/get-code/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const [rows] = await db.query(
      'SELECT VALIDATION_CODE FROM deliveries WHERE DELIVERY_ID = ? AND CHV = "0"',
      [deliveryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado ou já validado.' });
    }

    return res.status(200).json({ codigo: rows[0].VALIDATION_CODE });
  } catch (error) {
    console.error('Erro ao buscar código:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

router.post('/api/delivery/validar-codigo', async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo) {
      return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
    }
    const [result] = await db.query(
      `SELECT DELIVERY_ID FROM deliveries WHERE EMAIL = ? AND VALIDATION_CODE = ? AND CHV = '0' `,
      [email, codigo]
    );
    if (result.length === 0) {
      return res.status(200).json({ valid: false, error: 'Código inválido ou já utilizado.' });
    }
    const deliveryId = result[0].DELIVERY_ID;
    await db.query(
      `UPDATE deliveries SET CHV = '1', VALIDATION_CODE = NULL WHERE DELIVERY_ID = ? `,
      [deliveryId]
    );
    return res.status(200).json({
      valid: true,
      message: 'Cadastro validado e ativado com sucesso!',
      DELIVERY_ID: deliveryId
    });
  } catch (error) {
    console.error('Erro ao validar código de ativação:', error);
    return res.status(500).json({ error: 'Erro interno ao validar código.' });
  }
});

// Rota para gerar e enviar código de validação (sem endereço)
router.post('/api/delivery/send-validation-code/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { SEND_METHOD } = req.body;

    // Gera código de validação
    const codigoValidacao = Math.floor(100000 + Math.random() * 900000).toString();

    // Atualiza o delivery com o código
    await db.query(
      `UPDATE deliveries SET VALIDATION_CODE = ? WHERE DELIVERY_ID = ?`,
      [codigoValidacao, deliveryId]
    );

    // Busca os dados do delivery para enviar o código
    const [deliveryData] = await db.query(
      'SELECT EMAIL, RESPONSAVEL, DELIVERY_NOME, TELEFONE FROM deliveries WHERE DELIVERY_ID = ?',
      [deliveryId]
    );

    if (deliveryData.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }

    const email = deliveryData[0].EMAIL;
    const responsavel = deliveryData[0].RESPONSAVEL;
    const deliveryNome = deliveryData[0].DELIVERY_NOME;

    // Envia código por e-mail se não for WhatsApp
    if (SEND_METHOD !== 'whatsapp') {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        },
      });

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Validação de pré-cadastro - deliverybairro.com',
        text: `Olá ${responsavel || deliveryNome},\n\nSeu pré-cadastro foi realizado com sucesso!\n\nCódigo de validação: ${codigoValidacao}\n\nAcesse o link de validação e informe o código para ativar seu cadastro.\n\nEquipe deliverybairro.com.`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de validação enviado para:', email);
      } catch (mailError) {
        console.error('Erro ao enviar e-mail de validação:', mailError);
        throw mailError;
      }
    }

    return res.status(200).json({
      message: 'Código de validação gerado e enviado com sucesso',
      codigo: SEND_METHOD === 'whatsapp' ? codigoValidacao : undefined
    });
  } catch (error) {
    console.error('Erro ao enviar código de validação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Rota para atualizar apenas endereço (sem enviar novo código)
router.put('/api/delivery/update-address-only/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { CEP, ENDERECO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF } = req.body;

    if (!CEP || !ENDERECO || !NUMERO || !BAIRRO || !CIDADE || !UF) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        details: 'CEP, ENDERECO, NUMERO, BAIRRO, CIDADE e UF são obrigatórios'
      });
    }

    // Geocodifica o endereço
    const coords = await geocodeAddress(ENDERECO, NUMERO, BAIRRO, CIDADE, UF);

    let latitude = null;
    let longitude = null;

    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
      console.log(`Endereço geocodificado: LAT=${latitude}, LON=${longitude}`);
    } else {
      console.warn('Não foi possível geocodificar o endereço. Salvando sem coordenadas.');
    }

    // Atualiza o delivery com endereço e coordenadas (sem alterar código de validação)
    await db.query(
      `UPDATE deliveries 
       SET CEP = ?, ENDERECO = ?, NUMERO = ?, COMPLEMENTO = ?, BAIRRO = ?, CIDADE = ?, UF = ?,
           LATITUDE = ?, LONGITUDE = ?
       WHERE DELIVERY_ID = ?`,
      [CEP, ENDERECO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, latitude, longitude, deliveryId]
    );

    return res.status(200).json({
      message: 'Endereço atualizado com sucesso',
      geocoded: !!coords,
      latitude,
      longitude
    });
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

router.use((req, res, next) => {
  const path = req.path;

  // Skip admin routes - eles tem seu próprio middleware em routes_admin.js
  if (path.startsWith('/admin')) {
    return next();
  }

  const isPublic = publicRoutes.some(route => {
    if (route.includes(':')) {
      const basePath = route.split(':')[0];
      return path.startsWith(basePath);
    }
    return path === route;
  });

  if (isPublic) {
    return next();
  }

  return authMiddleware(req, res, next);
});

router.get('/api/listar/categorias', async (req, res) => {
  try {
    const [result] = await db.query('select * from categorias order by ORDEM');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).send(error);
  }
});

router.get('/api/listar/deliveries', async (req, res) => {
  try {
    const [result] = await db.query('select * from deliveries order by DELIVERY_NOME');
    const deliveries = result.map(delivery => ({
      ...delivery,
      CHV: delivery.CHV ? delivery.CHV : "0" // garantir que CHV nunca seja null (1 Ativo / 0 Inativo)
    }));
    return res.status(200).json(deliveries);
  } catch (error) {
    console.error('Erro ao listar deliveries:', error);
    return res.status(500).send(error);
  }
});

router.get('/api/listar/usuarios', async (req, res) => {
  try {
    const [result] = await db.query('select * from usuarios order by NOME');
    const users = result.map(user => {
      const safeUser = { ...user };
      delete safeUser.PASSWORD;
      return safeUser;
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).send(error);
  }
});

router.get('/api/listar/produtos', async (req, res) => {
  try {
    const [result] = await db.query('select * from produtos order by PRODUTO_NOME');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return res.status(500).send(error);
  }
});

router.get('/api/listar/extras', async (req, res) => {
  try {
    const [result] = await db.query('select * from extras order by DESCRICAO');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao listar extras:', error);
    return res.status(500).send(error);
  }
});

router.get('/api/pedido/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(`
      select p.PEDIDO_ID, 
      p.DELIVERY_ID, d.DELIVERY_NOME, d.URL_IMAGEM as imagem_delivery, d.TELEFONE as telefone_delivery, 
      concat(d.ENDERECO, ', ', d.NUMERO, ' ', d.COMPLEMENTO, ', ', d.BAIRRO, ', ', d.CIDADE, '-', d.UF, ', ', d.CEP) as endereco_delivery, 
      date_format(p.DATA, '%d/%m/%Y %H:%i:%s') as data_pedido, 
      concat(u.NOME, ' ', u.SOBRENOME) as nome_cliente, u.TELEFONE as telefone_cliente, 
      p.ENDERECO_ENTREGA, p.LATITUDE, p.LONGITUDE, 
      p.STATUS, p.VR_SUBTOTAL, p.TAXA_ENTREGA, p.VR_TOTAL,
      i.ITEM_ID, pp.PRODUTO_NOME, pp.URL_IMAGEM as imagem_produto, pp.VR_UNITARIO, i.QTD, i.ACRESCIMOS, i.OBS, i.VR_ACRESCIMOS, i.TOTAL 
      FROM pedidos p 
      join usuarios u ON (u.USER_ID = p.USER_ID) 
      join itens i ON (i.PEDIDO_ID = p.PEDIDO_ID) 
      join produtos pp ON (pp.PRODUTO_ID = i.PRODUTO_ID) 
      join deliveries d ON (d.DELIVERY_ID = p.DELIVERY_ID) 
      where p.PEDIDO_ID = ?
    `, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const pedidos = [];
    result.forEach((pedidoResult) => {
      const existingPedido = pedidos.find(p => p.PEDIDO_ID === pedidoResult.PEDIDO_ID);

      if (existingPedido) {
        existingPedido.ITENS.push({
          ITEM_ID: pedidoResult.ITEM_ID,
          PRODUTO: pedidoResult.PRODUTO_NOME,
          URL_IMAGEM: pedidoResult.imagem_produto,
          VR_UNITARIO: pedidoResult.VR_UNITARIO,
          ACRESCIMOS: JSON.parse(pedidoResult.ACRESCIMOS || '[]'),
          OBS: pedidoResult.OBS,
          VR_ACRESCIMOS: pedidoResult.VR_ACRESCIMOS,
          QTD: pedidoResult.QTD,
          TOTAL: pedidoResult.TOTAL
        });
      } else {
        pedidos.push({
          PEDIDO_ID: pedidoResult.PEDIDO_ID,
          DATA: pedidoResult.data_pedido,
          CLIENTE_NOME: pedidoResult.nome_cliente,
          ENDERECO_ENTREGA: pedidoResult.ENDERECO_ENTREGA,
          LATITUDE: pedidoResult.LATITUDE,
          LONGITUDE: pedidoResult.LONGITUDE,
          TELEFONE: pedidoResult.telefone_cliente,
          DELIVERY_ID: pedidoResult.DELIVERY_ID,
          DELIVERY_NOME: pedidoResult.DELIVERY_NOME,
          DELIVERY_IMG: pedidoResult.imagem_delivery,
          DELIVERY_TELEFONE: pedidoResult.telefone_delivery,
          DELIVERY_ENDERECO: pedidoResult.endereco_delivery,
          VR_SUBTOTAL: pedidoResult.VR_SUBTOTAL,
          TAXA_ENTREGA: pedidoResult.TAXA_ENTREGA,
          VR_TOTAL: pedidoResult.VR_TOTAL,
          STATUS: pedidoResult.STATUS,
          ITENS: [{
            ITEM_ID: pedidoResult.ITEM_ID,
            PRODUTO: pedidoResult.PRODUTO_NOME,
            URL_IMAGEM: pedidoResult.imagem_produto,
            VR_UNITARIO: pedidoResult.VR_UNITARIO,
            ACRESCIMOS: JSON.parse(pedidoResult.ACRESCIMOS || '[]'),
            OBS: pedidoResult.OBS,
            VR_ACRESCIMOS: pedidoResult.VR_ACRESCIMOS,
            QTD: pedidoResult.QTD,
            TOTAL: pedidoResult.TOTAL
          }]
        });
      }
    });
    return res.status(200).json(pedidos[0]);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).send(error);
  }
});

/** CRUD TABELA DELIVERIES */

router.post('/api/add/delivery', async (req, res) => {
  try {
    const { DELIVERY_NOME, EMAIL } = req.body;
    if (!DELIVERY_NOME || !EMAIL) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        details: 'DELIVERY_NOME e EMAIL são obrigatórios'
      });
    }
    const [result] = await db.query(
      'insert into deliveries (DELIVERY_NOME, EMAIL) values (?, ?)',
      [DELIVERY_NOME, EMAIL]
    );
    return res.status(201).json({
      DELIVERY_ID: result.insertId,
      DELIVERY_NOME,
      EMAIL,
      CHV: "0" // definir CHV como "1" (Ativo) ou "0" (Inativo) por padrão
    });
  } catch (error) {
    console.error('Erro ao adicionar delivery:', error);
    return res.status(400).send(error);
  }
});

router.get('/api/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('select * from deliveries where DELIVERY_ID = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar delivery:', error);
    return res.status(500).send(error);
  }
});

router.put('/api/update/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE,
      HORARIO, MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, RATING, TAXA_ENTREGA, URL_IMAGEM,
      CEP, ENDERECO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF
    } = req.body;

    // Geocodifica o endereço se houver dados completos
    let latitude = null;
    let longitude = null;

    if (ENDERECO && NUMERO && BAIRRO && CIDADE && UF) {
      const coords = await geocodeAddress(ENDERECO, NUMERO, BAIRRO, CIDADE, UF);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
        console.log(`Endereço do delivery ${id} geocodificado: LAT=${latitude}, LON=${longitude}`);
      } else {
        console.warn(`Não foi possível geocodificar o endereço do delivery ${id}`);
      }
    }

    await db.query(`
      update deliveries set 
      DELIVERY_NOME = ?, PLANO = ?, CATEGORIA_ID = ?, RESPONSAVEL = ?, EMAIL = ?, TELEFONE = ?, 
      HORARIO = ?, MIN_DELIVERY_TIME = ?, MAX_DELIVERY_TIME = ?, RATING = ?, TAXA_ENTREGA = ?, URL_IMAGEM = ?, 
      CEP = ?, ENDERECO = ?, NUMERO = ?, COMPLEMENTO = ?, BAIRRO = ?, CIDADE = ?, UF = ?,
      LATITUDE = ?, LONGITUDE = ?
      where DELIVERY_ID = ?
    `, [
      DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE,
      HORARIO, MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, RATING, TAXA_ENTREGA, URL_IMAGEM,
      CEP, ENDERECO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, latitude, longitude, id
    ]);
    return res.status(200).json({ ...req.body, LATITUDE: latitude, LONGITUDE: longitude });
  } catch (error) {
    console.error('Erro ao atualizar delivery:', error);
    return res.status(500).send(error);
  }
});

router.delete('/api/delete/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [exists] = await db.query('select DELIVERY_ID from deliveries where DELIVERY_ID = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }
    await db.query('delete from deliveries where DELIVERY_ID = ?', [id]);
    return res.status(200).json({ message: 'Delivery removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover delivery:', error);
    return res.status(400).send(error);
  }
});

/** CRUD TABELA USUARIOS */

router.post('/api/add/usuario', async (req, res) => {
  try {
    const {
      NOME, SOBRENOME, TELEFONE, EMAIL, URL_IMAGEM,
      CHV
    } = req.body;
    const [result] = await db.query(`insert into usuarios (
      NOME, SOBRENOME, TELEFONE, EMAIL, URL_IMAGEM, CHV
      ) values (?, ?, ?, ?, ?, ?) `,
      [NOME, SOBRENOME, TELEFONE, EMAIL, URL_IMAGEM, CHV]);
    const user = {
      USER_ID: result.insertId,
      ...req.body
    };
    delete user.PASSWORD;
    return res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(400).send(error);
  }
});

router.get('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (req.auth?.type !== 'user' || String(req.auth.id) !== String(id)) {
      return res.sendStatus(403);
    }
    const [result] = await db.query('select * from usuarios where USER_ID = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const user = { ...result[0] };
    delete user.PASSWORD;
    return res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(400).send(error);
  }
});

router.put('/api/update/usuario/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (req.auth?.type !== 'user' || String(req.auth.id) !== String(id)) {
      return res.sendStatus(403);
    }
    const {
      NOME, SOBRENOME, TELEFONE, EMAIL, URL_IMAGEM
    } = req.body;
    await db.query(`update usuarios 
      set NOME = ?, SOBRENOME = ?, TELEFONE = ?, EMAIL = ?,  URL_IMAGEM = ? where USER_ID = ? `,
      [NOME, SOBRENOME, TELEFONE, EMAIL, URL_IMAGEM, id]
    );
    const user = {
      USER_ID: id,
      ...req.body
    };
    delete user.PASSWORD;
    return res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(400).send(error);
  }
});

router.delete('/api/delete/usuario/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [exists] = await db.query('select USER_ID from usuarios where USER_ID = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    await db.query('delete from usuarios where USER_ID = ?', [id]);
    return res.status(200).json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(400).send(error);
  }
});

/** CRUD TABELA COURIERS */

router.post('/api/add/courier', async (req, res) => {
  try {
    const { NOME, SOBRENOME, EMAIL, TELEFONE } = req.body;
    if (!NOME || !SOBRENOME || !EMAIL) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        details: 'NOME, SOBRENOME e EMAIL são obrigatórios'
      });
    }
    const [result] = await db.query(
      'insert into couriers (NOME, SOBRENOME, EMAIL, TELEFONE) values (?, ?, ?, ?)',
      [NOME, SOBRENOME, EMAIL, TELEFONE || '']
    );
    return res.status(201).json({
      COURIER_ID: result.insertId,
      NOME, SOBRENOME, EMAIL, TELEFONE
    });
  } catch (error) {
    console.error('Erro ao adicionar courier:', error);
    return res.status(400).send(error);
  }
});

router.get('/api/courier/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (req.auth?.type !== 'courier' || String(req.auth.id) !== String(id)) {
      return res.sendStatus(403);
    }
    const [result] = await db.query(
      'select COURIER_ID, NOME, SOBRENOME, TELEFONE, EMAIL, TRANSPORTE, PLACA, URL_IMAGEM, CHV from couriers where COURIER_ID = ?',
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: 'Courier não encontrado' });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar courier:', error);
    return res.status(400).send(error);
  }
});

router.put('/api/update/courier/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { NOME, SOBRENOME, EMAIL, TELEFONE } = req.body;
    await db.query(
      'update couriers set NOME = ?, SOBRENOME = ?, EMAIL = ?, TELEFONE = ? where COURIER_ID = ?',
      [NOME, SOBRENOME, EMAIL, TELEFONE, id]
    );
    return res.status(200).json({
      COURIER_ID: id,
      NOME, SOBRENOME, EMAIL, TELEFONE
    });
  } catch (error) {
    console.error('Erro ao atualizar courier:', error);
    return res.status(400).send(error);
  }
});

router.delete('/api/delete/courier/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [exists] = await db.query('select COURIER_ID from couriers where COURIER_ID = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'Courier não encontrado' });
    }
    await db.query('delete from couriers where COURIER_ID = ?', [id]);
    return res.status(200).json({ message: 'Courier removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover courier:', error);
    return res.status(400).send(error);
  }
});

// Endpoint administrativo para geocodificar deliveries sem coordenadas
router.post('/api/admin/geocode-deliveries', async (req, res) => {
  try {
    // Busca todos os deliveries que têm endereço mas não têm coordenadas
    const [deliveries] = await db.query(`
      SELECT DELIVERY_ID, ENDERECO, NUMERO, BAIRRO, CIDADE, UF, DELIVERY_NOME
      FROM deliveries 
      WHERE (LATITUDE IS NULL OR LONGITUDE IS NULL)
        AND ENDERECO IS NOT NULL 
        AND NUMERO IS NOT NULL 
        AND BAIRRO IS NOT NULL 
        AND CIDADE IS NOT NULL 
        AND UF IS NOT NULL
    `);

    if (deliveries.length === 0) {
      return res.status(200).json({
        message: 'Nenhum delivery encontrado para geocodificação',
        processed: 0
      });
    }

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Processa cada delivery
    for (const delivery of deliveries) {
      try {
        const coords = await geocodeAddress(
          delivery.ENDERECO,
          delivery.NUMERO,
          delivery.BAIRRO,
          delivery.CIDADE,
          delivery.UF
        );

        if (coords) {
          await db.query(
            'UPDATE deliveries SET LATITUDE = ?, LONGITUDE = ? WHERE DELIVERY_ID = ?',
            [coords.latitude, coords.longitude, delivery.DELIVERY_ID]
          );
          successCount++;
          results.push({
            id: delivery.DELIVERY_ID,
            nome: delivery.DELIVERY_NOME,
            status: 'success',
            latitude: coords.latitude,
            longitude: coords.longitude
          });
          console.log(`Delivery ${delivery.DELIVERY_ID} (${delivery.DELIVERY_NOME}) geocodificado com sucesso`);
        } else {
          failCount++;
          results.push({
            id: delivery.DELIVERY_ID,
            nome: delivery.DELIVERY_NOME,
            status: 'failed',
            error: 'Não foi possível geocodificar o endereço'
          });
          console.warn(`Falha ao geocodificar delivery ${delivery.DELIVERY_ID} (${delivery.DELIVERY_NOME})`);
        }

        // Delay de 1 segundo entre requisições para não sobrecarregar a API Nominatim
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failCount++;
        results.push({
          id: delivery.DELIVERY_ID,
          nome: delivery.DELIVERY_NOME,
          status: 'error',
          error: error.message
        });
        console.error(`Erro ao processar delivery ${delivery.DELIVERY_ID}:`, error);
      }
    }

    return res.status(200).json({
      message: 'Processamento concluído',
      total: deliveries.length,
      success: successCount,
      failed: failCount,
      results
    });
  } catch (error) {
    console.error('Erro no processamento em lote:', error);
    return res.status(500).json({
      error: 'Erro no processamento em lote',
      details: error.message
    });
  }
});

module.exports = router;