/**
 * Rotas do CourierApp
 * Sistema de entregadores para DelireryBairro
 * 
 * NOTA: As rotas de autenticação e registro (/api/courier/authenticate e /api/courier/register)
 * foram movidas para routes.js para centralização
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./auth.js');
const db = require('./config/database.js');
const router = express.Router();

// MIDDLEWARE DE AUTENTICAÇÃO PARA TODAS AS ROTAS
// Todas as rotas deste arquivo requerem autenticação
router.use(authMiddleware);

// --- PERFIL DO ENTREGADOR ---

// Buscar dados do entregador
router.get('/api/courier/:courierId', async (req, res) => {
  try {
    const { courierId } = req.params;
    if (String(req.auth.id) !== String(courierId)) {
      return res.sendStatus(403);
    }

    const [courier] = await db.query(
      'SELECT * FROM couriers WHERE COURIER_ID = ?',
      [courierId]
    );

    if (!courier || courier.length === 0) {
      return res.status(404).json({ error: 'Entregador não encontrado' });
    }

    const safeCourier = { ...courier[0] };
    delete safeCourier.PASSWORD;
    res.json(safeCourier);
  } catch (error) {
    console.error('Erro ao buscar entregador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status do entregador
router.put('/api/courier/:courierId/status', async (req, res) => {
  try {
    const { courierId } = req.params;
    const { status } = req.body;

    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await db.query(
      'UPDATE couriers SET STATUS = ?, UPDATED_AT = NOW() WHERE COURIER_ID = ?',
      [status, courierId]
    );

    res.json({ success: true, message: 'Status atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- GERENCIAMENTO DE PEDIDOS ---

// Buscar pedidos disponíveis
router.get('/api/courier/orders/available', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.*,
        r.NOME as RESTAURANT_NAME,
        r.ENDERECO as PICKUP_ADDRESS,
        u.NOME as CUSTOMER_NAME,
        u.SOBRENOME as CUSTOMER_SURNAME
      FROM orders o
      LEFT JOIN restaurants r ON o.RESTAURANT_ID = r.RESTAURANT_ID
      LEFT JOIN users u ON o.USER_ID = u.USER_ID
      WHERE o.STATUS = 'confirmed' 
        AND o.COURIER_ID IS NULL
      ORDER BY o.CREATED_AT DESC
      LIMIT 20
    `);

    res.json(orders || []);
  } catch (error) {
    console.error('Erro ao buscar pedidos disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar pedidos aceitos pelo entregador
router.get('/api/courier/orders/accepted', async (req, res) => {
  try {
    const courierId = req.user.courierId;

    const [orders] = await db.query(`
      SELECT 
        o.*,
        r.NOME as RESTAURANT_NAME,
        r.ENDERECO as PICKUP_ADDRESS,
        u.NOME as CUSTOMER_NAME,
        u.SOBRENOME as CUSTOMER_SURNAME
      FROM orders o
      LEFT JOIN restaurants r ON o.RESTAURANT_ID = r.RESTAURANT_ID
      LEFT JOIN users u ON o.USER_ID = u.USER_ID
      WHERE o.COURIER_ID = ?
        AND o.STATUS IN ('accepted', 'picking_up', 'in_delivery')
      ORDER BY o.UPDATED_AT DESC
    `, [courierId]);

    res.json(orders || []);
  } catch (error) {
    console.error('Erro ao buscar pedidos aceitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aceitar pedido
router.post('/api/courier/orders/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;
    const courierId = req.user.courierId;

    // Verifica se o pedido está disponível
    const [order] = await db.query(
      'SELECT * FROM orders WHERE ORDER_ID = ? AND STATUS = "confirmed" AND COURIER_ID IS NULL',
      [orderId]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({ error: 'Pedido não disponível' });
    }

    // Aceita o pedido
    await db.query(
      'UPDATE orders SET COURIER_ID = ?, STATUS = "accepted", UPDATED_AT = NOW() WHERE ORDER_ID = ?',
      [courierId, orderId]
    );

    res.json({ success: true, message: 'Pedido aceito com sucesso' });
  } catch (error) {
    console.error('Erro ao aceitar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rejeitar pedido
router.post('/api/courier/orders/:orderId/reject', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const courierId = req.user.courierId;

    // Log da rejeição
    await db.query(`
      INSERT INTO courier_order_rejections (COURIER_ID, ORDER_ID, REASON, CREATED_AT)
      VALUES (?, ?, ?, NOW())
    `, [courierId, orderId, reason || 'Não especificado']);

    res.json({ success: true, message: 'Pedido rejeitado' });
  } catch (error) {
    console.error('Erro ao rejeitar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar detalhes de um pedido
router.get('/api/courier/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const [order] = await db.query(`
      SELECT 
        o.*,
        r.NOME as RESTAURANT_NAME,
        r.ENDERECO as PICKUP_ADDRESS,
        r.TELEFONE as RESTAURANT_PHONE,
        u.NOME as CUSTOMER_NAME,
        u.SOBRENOME as CUSTOMER_SURNAME,
        u.TELEFONE as CUSTOMER_PHONE,
        u.ENDERECO as DELIVERY_ADDRESS
      FROM orders o
      LEFT JOIN restaurants r ON o.RESTAURANT_ID = r.RESTAURANT_ID
      LEFT JOIN users u ON o.USER_ID = u.USER_ID
      WHERE o.ORDER_ID = ?
    `, [orderId]);

    if (!order || order.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Busca itens do pedido
    const [items] = await db.query(`
      SELECT oi.*, p.NOME as NAME, p.PRECO as PRICE
      FROM order_items oi
      LEFT JOIN products p ON oi.PRODUCT_ID = p.PRODUCT_ID
      WHERE oi.ORDER_ID = ?
    `, [orderId]);

    const orderData = {
      ...order[0],
      ITEMS: items || []
    };

    res.json(orderData);
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar coleta
router.put('/api/courier/orders/:orderId/pickup/start', async (req, res) => {
  try {
    const { orderId } = req.params;
    const courierId = req.user.courierId;

    await db.query(
      'UPDATE orders SET STATUS = "picking_up", PICKUP_STARTED_AT = NOW(), UPDATED_AT = NOW() WHERE ORDER_ID = ? AND COURIER_ID = ?',
      [orderId, courierId]
    );

    res.json({ success: true, message: 'Coleta iniciada' });
  } catch (error) {
    console.error('Erro ao iniciar coleta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Confirmar coleta
router.put('/api/courier/orders/:orderId/pickup/confirm', async (req, res) => {
  try {
    const { orderId } = req.params;
    const courierId = req.user.courierId;

    await db.query(
      'UPDATE orders SET STATUS = "in_delivery", PICKUP_CONFIRMED_AT = NOW(), UPDATED_AT = NOW() WHERE ORDER_ID = ? AND COURIER_ID = ?',
      [orderId, courierId]
    );

    res.json({ success: true, message: 'Coleta confirmada' });
  } catch (error) {
    console.error('Erro ao confirmar coleta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar entrega
router.put('/api/courier/orders/:orderId/delivery/start', async (req, res) => {
  try {
    const { orderId } = req.params;
    const courierId = req.user.courierId;

    await db.query(
      'UPDATE orders SET STATUS = "delivering", DELIVERY_STARTED_AT = NOW(), UPDATED_AT = NOW() WHERE ORDER_ID = ? AND COURIER_ID = ?',
      [orderId, courierId]
    );

    res.json({ success: true, message: 'Entrega iniciada' });
  } catch (error) {
    console.error('Erro ao iniciar entrega:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Finalizar entrega
router.put('/api/courier/orders/:orderId/delivery/complete', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveredAt } = req.body;
    const courierId = req.user.courierId;

    await db.query(
      'UPDATE orders SET STATUS = "delivered", DELIVERED_AT = ?, UPDATED_AT = NOW() WHERE ORDER_ID = ? AND COURIER_ID = ?',
      [deliveredAt || new Date(), orderId, courierId]
    );

    // Atualiza estatísticas do entregador
    await db.query(
      'UPDATE couriers SET TOTAL_DELIVERIES = TOTAL_DELIVERIES + 1, UPDATED_AT = NOW() WHERE COURIER_ID = ?',
      [courierId]
    );

    res.json({ success: true, message: 'Entrega finalizada' });
  } catch (error) {
    console.error('Erro ao finalizar entrega:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar localização durante entrega
router.put('/api/courier/orders/:orderId/location', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude, timestamp } = req.body;
    const courierId = req.user.courierId;

    // Salva localização na tabela de rastreamento
    await db.query(`
      INSERT INTO delivery_tracking (ORDER_ID, COURIER_ID, LATITUDE, LONGITUDE, TIMESTAMP)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      LATITUDE = VALUES(LATITUDE),
      LONGITUDE = VALUES(LONGITUDE),
      TIMESTAMP = VALUES(TIMESTAMP)
    `, [orderId, courierId, latitude, longitude, timestamp || new Date()]);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;