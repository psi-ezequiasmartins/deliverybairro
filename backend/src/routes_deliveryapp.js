/**
 * Rotas do DeliveryApp extraídas de rotas.js
 */

const express = require('express');
const authMiddleware = require('./auth.js');
const db = require('./config/database.js');
const router = express.Router();

// =====================================================
// FUNÇÃO AUXILIAR: GEOCODIFICAÇÃO
// =====================================================
async function geocodeAddress(endereco, numero, bairro, cidade, uf) {
  try {
    const fullAddress = `${endereco}, ${numero}, ${bairro}, ${cidade}, ${uf}, Brasil`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'DeliveryBairro/1.0' }
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

// ROTAS PÚBLICAS DELIVERY-APP (ajuste conforme necessário)
const publicRoutes = [
  // Exemplo: '/delivery-app/ping', etc.
];

// Middleware de validação de campos obrigatórios
function validarCamposObrigatorios(campos) {
  return (req, res, next) => {
    const ausentes = campos.filter(campo => !req.body[campo]);
    if (ausentes.length > 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        details: `Os campos obrigatórios são: ${ausentes.join(', ')}`
      });
    }
    next();
  };
}
// MIDDLEWARE DE AUTENTICAÇÃO

router.use((req, res, next) => {
  const path = req.path;
  const isPublic = publicRoutes.some(route => {
    if (route.includes(':')) {
      const basePath = route.split(':')[0];
      return path.startsWith(basePath);
    }
    return path === route;
  });
  if (isPublic) return next();
  return authMiddleware(req, res, next);
});

/** ROTAS DELIVERY-APP */

// Listar pedidos por delivery
router.get('/delivery-app/listar/pedidos/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(`
      SELECT p.*, 
        CONCAT(u.NOME, ' ', u.SOBRENOME) AS nome_cliente, u.TELEFONE AS telefone_cliente,
        DATE_FORMAT(p.DATA, '%d/%m/%Y %H:%i:%s') AS data_pedido
      FROM pedidos p 
      JOIN usuarios u ON (u.USER_ID = p.USER_ID)
      WHERE p.DELIVERY_ID = ? 
      ORDER BY p.DATA DESC
    `, [id]);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar pedidos', details: error.message });
  }
});

// Listar pedidos abertos por delivery
router.get('/delivery-app/pedidos/abertos/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query(`
      SELECT p.PEDIDO_ID, p.DELIVERY_ID, p.USER_ID,
        DATE_FORMAT(p.DATA, '%d/%m/%Y %H:%i:%s') AS data_pedido, 
        p.STATUS, p.PUSH_TOKEN,
        CONCAT(u.NOME, ' ', u.SOBRENOME) AS nome_cliente,
        u.TELEFONE AS telefone_cliente,
        p.ENDERECO_ENTREGA, p.LATITUDE, p.LONGITUDE,    
        p.VR_SUBTOTAL, p.TAXA_ENTREGA, p.VR_TOTAL, 
        i.ITEM_ID, o.PRODUTO_NOME, o.URL_IMAGEM, i.QTD, i.ACRESCIMOS, i.OBS
      FROM pedidos p
      JOIN usuarios u ON (u.USER_ID = p.USER_ID)
      JOIN itens i ON (i.PEDIDO_ID = p.PEDIDO_ID)
      JOIN produtos o ON (o.PRODUTO_ID = i.PRODUTO_ID)
      WHERE p.DELIVERY_ID = ? AND p.STATUS <> 'FINALIZADO'
      ORDER BY p.DATA DESC
    `, [id]);

    // Monta estrutura agrupada por pedido
    const pedidos = [];
    result.forEach((pedidoResult) => {
      const pedido_ID = pedidoResult.PEDIDO_ID;
      let pedido = pedidos.find((p) => p.PEDIDO_ID === pedido_ID);
      if (!pedido) {
        pedido = {
          PEDIDO_ID: pedido_ID,
          DATA: pedidoResult.data_pedido,
          PUSH_TOKEN: pedidoResult.PUSH_TOKEN,
          STATUS: pedidoResult.STATUS,
          USER_ID: pedidoResult.USER_ID,
          CLIENTE: pedidoResult.nome_cliente,
          TELEFONE: pedidoResult.telefone_cliente,
          ENDERECO_ENTREGA: pedidoResult.ENDERECO_ENTREGA,
          LATITUDE: pedidoResult.LATITUDE,
          LONGITUDE: pedidoResult.LONGITUDE,
          VR_SUBTOTAL: pedidoResult.VR_SUBTOTAL,
          TAXA_ENTREGA: pedidoResult.TAXA_ENTREGA,
          VR_TOTAL: pedidoResult.VR_TOTAL,
          ITENS: [],
        };
        pedidos.push(pedido);
      }
      let acrescimos = [];
      try {
        if (pedidoResult.ACRESCIMOS && typeof pedidoResult.ACRESCIMOS === 'string') {
          acrescimos = JSON.parse(pedidoResult.ACRESCIMOS);
        } else if (typeof pedidoResult.ACRESCIMOS === 'object') {
          acrescimos = pedidoResult.ACRESCIMOS;
        }
      } catch (error) {
        acrescimos = [];
      }
      pedido.ITENS.push({
        ITEM_ID: pedidoResult.ITEM_ID,
        PRODUTO_NOME: pedidoResult.PRODUTO_NOME.toUpperCase(),
        URL_IMAGEM: pedidoResult.URL_IMAGEM,
        QTD: pedidoResult.QTD,
        ACRESCIMOS: acrescimos,
        OBS: pedidoResult.OBS,
      });
    });

    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ error: 'Nenhum pedido aberto encontrado para este delivery' });
    }
    return res.status(200).json(pedidos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar pedidos abertos', details: error.message });
  }
});

// Listar produtos por delivery
router.get('/delivery-app/listar/produtos/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM produtos WHERE DELIVERY_ID = ? ORDER BY PRODUTO_NOME', [id]);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar produtos', details: error.message });
  }
});

// Buscar produto por ID
router.get('/delivery-app/produto/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM produtos WHERE PRODUTO_ID = ?', [id]);
    const produto = result[0] || null;
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produto', details: error.message });
  }
});

// Adicionar produto
router.post(
  '/delivery-app/add/produto',
  validarCamposObrigatorios(['PRODUTO_NOME', 'VR_UNITARIO', 'DELIVERY_ID']),
  async (req, res) => {
    try {
      const { PRODUTO_NOME, VR_UNITARIO, DELIVERY_ID, DESCRICAO, URL_IMAGEM, ITENS_EXTRAS, ITENS_OBS, CHV } = req.body;
      const chvValue = typeof CHV !== 'undefined' ? String(CHV) : '1';

      const [result] = await db.query(
        'INSERT INTO produtos (PRODUTO_NOME, DESCRICAO, VR_UNITARIO, URL_IMAGEM, ITENS_EXTRAS, ITENS_OBS, DELIVERY_ID, CHV) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [PRODUTO_NOME, DESCRICAO || '', VR_UNITARIO || 0, URL_IMAGEM || '', ITENS_EXTRAS || 'S', ITENS_OBS || 'S', DELIVERY_ID, chvValue]
      );

      return res.status(201).json({ PRODUTO_ID: result.insertId, ...req.body, CHV: chvValue });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao adicionar produto', details: error.message });
    }
  }
);

// Atualizar produto
router.put(
  '/delivery-app/update/produto/:id',
  validarCamposObrigatorios(['PRODUTO_NOME', 'VR_UNITARIO']),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { PRODUTO_NOME, VR_UNITARIO, DESCRICAO, URL_IMAGEM, ITENS_EXTRAS, ITENS_OBS } = req.body;

      await db.query(
        'UPDATE produtos SET PRODUTO_NOME = ?, DESCRICAO = ?, VR_UNITARIO = ?, URL_IMAGEM = ?, ITENS_EXTRAS = ?, ITENS_OBS = ? WHERE PRODUTO_ID = ?',
        [PRODUTO_NOME, DESCRICAO, VR_UNITARIO, URL_IMAGEM, ITENS_EXTRAS, ITENS_OBS, id]
      );

      return res.status(200).json({ PRODUTO_ID: id, ...req.body });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
    }
  }
);

// Deletar produto
router.delete('/delivery-app/delete/produto/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM produtos WHERE PRODUTO_ID = ?', [id]);
    const produto = result[0] || null;
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    await db.query('DELETE FROM produtos WHERE PRODUTO_ID = ?', [id]);
    return res.status(200).json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover produto', details: error.message });
  }
});

// Atualizar imagem do produto
router.put('/delivery-app/update/imagem/produto/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { url_imagem } = req.body;
    if (!url_imagem) {
      return res.status(400).json({
        error: 'URL da imagem é obrigatória',
        details: 'O campo url_imagem não pode estar vazio'
      });
    }
    await db.query('UPDATE produtos SET URL_IMAGEM = ? WHERE PRODUTO_ID = ?', [url_imagem, id]);
    return res.status(200).json({ url_imagem });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar imagem', details: error.message });
  }
});

// Listar extras por delivery
router.get('/delivery-app/listar/extras/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM extras WHERE DELIVERY_ID = ? ORDER BY DESCRICAO', [id]);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar extras', details: error.message });
  }
});

// Buscar extra por ID
router.get('/delivery-app/extra/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM extras WHERE EXTRA_ID = ?', [id]);
    const extra = result[0] || null;
    if (!extra) {
      return res.status(404).json({ error: 'Extra não encontrado' });
    }
    return res.status(200).json(extra);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar extra', details: error.message });
  }
});

// Adicionar extra
router.post(
  '/delivery-app/add/extra',
  validarCamposObrigatorios(['DESCRICAO', 'VR_UNITARIO', 'DELIVERY_ID']),
  async (req, res) => {
    try {
      const { DESCRICAO, VR_UNITARIO, DELIVERY_ID } = req.body;

      const [result] = await db.query(
        'INSERT INTO extras (DESCRICAO, VR_UNITARIO, DELIVERY_ID) VALUES (?, ?, ?)',
        [DESCRICAO, VR_UNITARIO || 0, DELIVERY_ID]
      );

      return res.status(201).json({ EXTRA_ID: result.insertId, ...req.body });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao adicionar extra', details: error.message });
    }
  }
);

// Atualizar extra
router.put(
  '/delivery-app/update/extra/:id',
  validarCamposObrigatorios(['DESCRICAO', 'VR_UNITARIO']),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { DESCRICAO, VR_UNITARIO } = req.body;

      await db.query(
        'UPDATE extras SET DESCRICAO = ?, VR_UNITARIO = ? WHERE EXTRA_ID = ?',
        [DESCRICAO, VR_UNITARIO, id]
      );

      return res.status(200).json({ EXTRA_ID: id, ...req.body });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar extra', details: error.message });
    }
  }
);

// Deletar extra
router.delete('/delivery-app/delete/extra/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('SELECT * FROM extras WHERE EXTRA_ID = ?', [id]);
    const extra = result[0] || null;
    if (!extra) {
      return res.status(404).json({ error: 'Extra não encontrado' });
    }
    await db.query('DELETE FROM extras WHERE EXTRA_ID = ?', [id]);
    return res.status(200).json({ message: 'Item extra removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover extra', details: error.message });
  }
});

// Atualizar dados do delivery
router.put('/delivery-app/update/delivery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE, HORARIO,
      MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, RATING, TAXA_ENTREGA, URL_IMAGEM, CEP, ENDERECO,
      NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, CHV
    } = req.body;

    // Geocodifica o endereço se houver dados de endereço completos
    let latitude = null;
    let longitude = null;

    if (ENDERECO && NUMERO && BAIRRO && CIDADE && UF) {
      const coords = await geocodeAddress(ENDERECO, NUMERO, BAIRRO, CIDADE, UF);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
        console.log(`Endereço geocodificado para delivery ${id}: LAT=${latitude}, LON=${longitude}`);
      } else {
        console.warn(`Não foi possível geocodificar o endereço do delivery ${id}`);
      }
    }

    await db.query(`
      UPDATE deliveries SET 
        DELIVERY_NOME = ?, PLANO = ?, CATEGORIA_ID = ?, RESPONSAVEL = ?, EMAIL = ?, 
        TELEFONE = ?, HORARIO = ?, MIN_DELIVERY_TIME = ?, MAX_DELIVERY_TIME = ?, RATING = ?, 
        TAXA_ENTREGA = ?, URL_IMAGEM = ?, CEP = ?, ENDERECO = ?, NUMERO = ?, COMPLEMENTO = ?, 
        BAIRRO = ?, CIDADE = ?, UF = ?, LATITUDE = ?, LONGITUDE = ?, CHV = ? 
      WHERE DELIVERY_ID = ?
    `, [
      DELIVERY_NOME, PLANO, CATEGORIA_ID, RESPONSAVEL, EMAIL, TELEFONE, HORARIO,
      MIN_DELIVERY_TIME, MAX_DELIVERY_TIME, RATING, TAXA_ENTREGA, URL_IMAGEM, CEP, ENDERECO,
      NUMERO, COMPLEMENTO, BAIRRO, CIDADE, UF, latitude, longitude, CHV, id
    ]);

    return res.status(200).json({ DELIVERY_ID: id, ...req.body, LATITUDE: latitude, LONGITUDE: longitude });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar dados do delivery', details: error.message });
  }
});

// Atualizar status do pedido
router.put('/delivery-app/update/status/pedido', async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId e status são obrigatórios' });
    }

    // Primeiro busca o pedido para obter o PUSH_TOKEN
    const [pedidoResult] = await db.query(
      'SELECT PUSH_TOKEN, USER_ID FROM pedidos WHERE PEDIDO_ID = ?',
      [orderId]
    );

    if (!pedidoResult || pedidoResult.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Atualiza status
    await db.query('UPDATE pedidos SET STATUS = ? WHERE PEDIDO_ID = ?', [status, orderId]);

    // Estratégia híbrida: websocket OU push
    const pushToken = pedidoResult[0].PUSH_TOKEN;
    const userId = pedidoResult[0].USER_ID;
    let websocketSent = false;

    try {
      const { getIO } = require('./io');
      const io = getIO();
      if (io) {
        const userRoom = `user_${userId}`;
        const orderRoom = `order_${orderId}`;

        // Verifica se há clientes conectados nas rooms
        const socketsInUserRoom = io.sockets.adapter.rooms.get(userRoom);
        const socketsInOrderRoom = io.sockets.adapter.rooms.get(orderRoom);

        if ((socketsInUserRoom && socketsInUserRoom.size > 0) || (socketsInOrderRoom && socketsInOrderRoom.size > 0)) {
          // Cliente online: apenas websocket (sem push)
          io.to(userRoom).emit('orderStatusUpdated', { orderId, status });
          io.to(orderRoom).emit('orderStatusUpdated', { orderId, status });
          websocketSent = true;
          console.log(`[WebSocket] ✅ Status enviado para user_${userId} e order_${orderId}`);
        }
      }
    } catch (emitErr) {
      console.warn('Falha ao emitir evento websocket:', emitErr.message);
    }

    // Enviar push apenas se websocket não entregou (cliente offline)
    if (!websocketSent && pushToken) {
      try {
        const { sendExpoNotification } = require('./services/notifications');
        await sendExpoNotification(
          pushToken,
          'Atualização do Pedido',
          `Pedido #${orderId} foi atualizado para: ${status.replace(/_/g, ' ')}`,
          { orderId, status, type: 'order_update' }
        );
        console.log(`[Push] Notificação enviada para user ${userId}`);
      } catch (notificationError) {
        console.warn('Erro ao enviar notificação push:', notificationError.message);
      }
    }

    return res.status(200).json({
      message: 'Status do pedido atualizado com sucesso',
      notificationSent: !!pushToken,
      orderId,
      status
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status do pedido', details: error.message });
  }
});

module.exports = router;