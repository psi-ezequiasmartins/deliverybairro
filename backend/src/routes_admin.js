/**
 * backend/src/routes_admin.js
 * Rotas administrativas do sistema DeliveryBairro
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./config/database.js');
const router = express.Router();

// Chave secreta para JWT (deve estar em .env em produção)
const JWT_SECRET = process.env.JWT_SECRET || "#AdminSecretKey2025DeliveryBairro";

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO ADMIN
// =====================================================

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verifica se é um token admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado: usuário não é administrador' });
    }

    req.adminUser = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware para verificar role específica
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({
        error: 'Acesso negado: permissão insuficiente',
        requiredRole: roles,
        userRole: req.adminUser.role
      });
    }
    next();
  };
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário admin e verificar senha (usando SHA1(MD5()))
    const [users] = await db.query(
      'SELECT * FROM admin_users WHERE USER_EMAIL = ? AND USER_PASSWORD = SHA1(MD5(?)) AND ACTIVE = 1',
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha inválidos'
      });
    }

    const user = users[0];
    console.log('✅ Admin login:', user.NOME);

    // Atualizar último login
    await db.query(
      'UPDATE admin_users SET LAST_LOGIN = NOW() WHERE ADMIN_ID = ?',
      [user.ADMIN_ID]
    );

    // Gerar token JWT
    const token = jwt.sign(
      {
        adminId: user.ADMIN_ID,
        email: user.USER_EMAIL,
        nome: user.NOME,
        role: user.ROLE,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log da ação
    await db.query(
      `INSERT INTO system_logs (ADMIN_ID, ACTION, DETAILS, IP_ADDRESS, USER_AGENT) 
       VALUES (?, 'LOGIN', 'Admin login realizado', ?, ?)`,
      [user.ADMIN_ID, req.ip, req.get('user-agent') || 'Unknown']
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        ADMIN_ID: user.ADMIN_ID,
        NOME: user.NOME,
        USER_EMAIL: user.USER_EMAIL,
        ROLE: user.ROLE
      }
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    return res.status(500).json({
      error: 'Erro ao realizar login',
      details: error.message
    });
  }
});

// Verificar token (para manter sessão)
router.get('/verify', adminAuthMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT ADMIN_ID, USER_EMAIL, NOME, ROLE FROM admin_users WHERE ADMIN_ID = ? AND ACTIVE = 1',
      [req.adminUser.adminId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    return res.status(200).json({
      user: {
        id: users[0].ADMIN_ID,
        nome: users[0].NOME,
        email: users[0].USER_EMAIL,
        role: users[0].ROLE
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ error: 'Erro ao verificar token' });
  }
});

// =====================================================
// CONFIGURAÇÃO DE TAXAS
// =====================================================

// Buscar configuração atual de taxas
router.get('/taxas/config', adminAuthMiddleware, async (req, res) => {
  try {
    const [config] = await db.query(
      'SELECT * FROM taxas_config ORDER BY CONFIG_ID DESC LIMIT 1'
    );

    if (config.length === 0) {
      return res.status(404).json({
        error: 'Configuração de taxas não encontrada'
      });
    }

    return res.status(200).json(config[0]);
  } catch (error) {
    console.error('Erro ao buscar configuração de taxas:', error);
    return res.status(500).json({
      error: 'Erro ao buscar configuração',
      details: error.message
    });
  }
});

// Atualizar configuração de taxas
router.put('/taxas/config', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const {
      TAXA_SERVICO,
      TAXA_SERVICO_ATIVA,
      PSP_PROVIDER,
      TAXA_PAGAMENTO_FIXA,
      TAXA_PAGAMENTO_PERCENTUAL,
      TAXA_PAGAMENTO_MIN,
      TAXA_PAGAMENTO_MAX,
      TAXA_PAGAMENTO_ATIVA,
      REASON
    } = req.body;

    // Validações
    if (TAXA_PAGAMENTO_PERCENTUAL < TAXA_PAGAMENTO_MIN ||
      TAXA_PAGAMENTO_PERCENTUAL > TAXA_PAGAMENTO_MAX) {
      return res.status(400).json({
        error: 'Taxa percentual fora do range permitido',
        min: TAXA_PAGAMENTO_MIN,
        max: TAXA_PAGAMENTO_MAX,
        provided: TAXA_PAGAMENTO_PERCENTUAL
      });
    }

    // Buscar configuração atual para histórico
    const [currentConfig] = await db.query(
      'SELECT * FROM taxas_config ORDER BY CONFIG_ID DESC LIMIT 1'
    );

    // Atualizar configuração
    await db.query(
      `UPDATE taxas_config SET
        TAXA_SERVICO = ?,
        TAXA_SERVICO_ATIVA = ?,
        PSP_PROVIDER = ?,
        TAXA_PAGAMENTO_FIXA = ?,
        TAXA_PAGAMENTO_PERCENTUAL = ?,
        TAXA_PAGAMENTO_MIN = ?,
        TAXA_PAGAMENTO_MAX = ?,
        TAXA_PAGAMENTO_ATIVA = ?,
        UPDATED_BY = ?
      WHERE CONFIG_ID = ?`,
      [
        TAXA_SERVICO,
        TAXA_SERVICO_ATIVA ? 1 : 0,
        PSP_PROVIDER,
        TAXA_PAGAMENTO_FIXA,
        TAXA_PAGAMENTO_PERCENTUAL,
        TAXA_PAGAMENTO_MIN,
        TAXA_PAGAMENTO_MAX,
        TAXA_PAGAMENTO_ATIVA ? 1 : 0,
        req.adminUser.adminId,
        currentConfig[0].CONFIG_ID
      ]
    );

    // Salvar no histórico
    await db.query(
      `INSERT INTO taxas_config_history 
       (TAXA_SERVICO, TAXA_PAGAMENTO_FIXA, TAXA_PAGAMENTO_PERCENTUAL, 
        PSP_PROVIDER, CHANGED_BY, REASON, OLD_VALUES, NEW_VALUES)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TAXA_SERVICO,
        TAXA_PAGAMENTO_FIXA,
        TAXA_PAGAMENTO_PERCENTUAL,
        PSP_PROVIDER,
        req.adminUser.adminId,
        REASON || 'Atualização de taxas',
        JSON.stringify(currentConfig[0]),
        JSON.stringify(req.body)
      ]
    );

    // Log da ação
    await db.query(
      `INSERT INTO system_logs (ADMIN_ID, ACTION, ENTITY_TYPE, DETAILS, IP_ADDRESS) 
       VALUES (?, 'UPDATE_TAXAS', 'taxas_config', ?, ?)`,
      [req.adminUser.adminId, `Taxas atualizadas: ${REASON || 'Sem motivo especificado'}`, req.ip]
    );

    return res.status(200).json({
      message: 'Configuração de taxas atualizada com sucesso',
      config: req.body
    });

  } catch (error) {
    console.error('Erro ao atualizar taxas:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar taxas',
      details: error.message
    });
  }
});

// Listar histórico de alterações
router.get('/taxas/history', adminAuthMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [history] = await db.query(
      `SELECT h.*, a.NOME as ADMIN_NOME, a.USER_EMAIL as ADMIN_EMAIL
       FROM taxas_config_history h
       LEFT JOIN admin_users a ON h.CHANGED_BY = a.ADMIN_ID
       ORDER BY h.CHANGED_AT DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    return res.status(200).json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({
      error: 'Erro ao buscar histórico',
      details: error.message
    });
  }
});

// =====================================================
// EXCEÇÕES DE TAXAS POR DELIVERY
// =====================================================

// Listar exceções
router.get('/taxas/exceptions', adminAuthMiddleware, async (req, res) => {
  try {
    const [exceptions] = await db.query(
      `SELECT e.*, d.DELIVERY_NOME, a.NOME as CREATED_BY_NAME
       FROM taxas_exceptions e
       JOIN deliveries d ON e.DELIVERY_ID = d.DELIVERY_ID
       LEFT JOIN admin_users a ON e.CREATED_BY = a.ADMIN_ID
       WHERE e.ACTIVE = 1
       ORDER BY e.CREATED_AT DESC`
    );

    return res.status(200).json(exceptions);
  } catch (error) {
    console.error('Erro ao listar exceções:', error);
    return res.status(500).json({
      error: 'Erro ao listar exceções',
      details: error.message
    });
  }
});

// Criar exceção
router.post('/taxas/exceptions', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const {
      DELIVERY_ID,
      TAXA_SERVICO_CUSTOM,
      TAXA_PAGAMENTO_FIXA_CUSTOM,
      TAXA_PAGAMENTO_PERCENTUAL_CUSTOM,
      REASON
    } = req.body;

    if (!DELIVERY_ID || !REASON) {
      return res.status(400).json({
        error: 'DELIVERY_ID e REASON são obrigatórios'
      });
    }

    // Verificar se delivery existe
    const [delivery] = await db.query(
      'SELECT DELIVERY_ID FROM deliveries WHERE DELIVERY_ID = ?',
      [DELIVERY_ID]
    );

    if (delivery.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }

    // Desativar exceções anteriores
    await db.query(
      'UPDATE taxas_exceptions SET ACTIVE = 0 WHERE DELIVERY_ID = ?',
      [DELIVERY_ID]
    );

    // Criar nova exceção
    const [result] = await db.query(
      `INSERT INTO taxas_exceptions 
       (DELIVERY_ID, TAXA_SERVICO_CUSTOM, TAXA_PAGAMENTO_FIXA_CUSTOM, 
        TAXA_PAGAMENTO_PERCENTUAL_CUSTOM, REASON, CREATED_BY)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        DELIVERY_ID,
        TAXA_SERVICO_CUSTOM,
        TAXA_PAGAMENTO_FIXA_CUSTOM,
        TAXA_PAGAMENTO_PERCENTUAL_CUSTOM,
        REASON,
        req.adminUser.adminId
      ]
    );

    // Log da ação
    await db.query(
      `INSERT INTO system_logs (ADMIN_ID, ACTION, ENTITY_TYPE, ENTITY_ID, DETAILS, IP_ADDRESS) 
       VALUES (?, 'CREATE_EXCEPTION', 'taxas_exceptions', ?, ?, ?)`,
      [req.adminUser.adminId, result.insertId, `Exceção criada: ${REASON}`, req.ip]
    );

    return res.status(201).json({
      message: 'Exceção criada com sucesso',
      exceptionId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar exceção:', error);
    return res.status(500).json({
      error: 'Erro ao criar exceção',
      details: error.message
    });
  }
});

// Remover exceção
router.delete('/taxas/exceptions/:id', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'UPDATE taxas_exceptions SET ACTIVE = 0 WHERE EXCEPTION_ID = ?',
      [id]
    );

    // Log da ação
    await db.query(
      `INSERT INTO system_logs (ADMIN_ID, ACTION, ENTITY_TYPE, ENTITY_ID, DETAILS, IP_ADDRESS) 
       VALUES (?, 'DELETE_EXCEPTION', 'taxas_exceptions', ?, 'Exceção removida', ?)`,
      [req.adminUser.adminId, id, req.ip]
    );

    return res.status(200).json({ message: 'Exceção removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover exceção:', error);
    return res.status(500).json({
      error: 'Erro ao remover exceção',
      details: error.message
    });
  }
});

// =====================================================
// DASHBOARD - ESTATÍSTICAS
// =====================================================

router.get('/dashboard/stats', adminAuthMiddleware, async (req, res) => {
  try {
    // Total de deliveries
    const [deliveries] = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN CHV = "1" THEN 1 ELSE 0 END) as ativos FROM deliveries'
    );

    // Total de usuários
    const [users] = await db.query('SELECT COUNT(*) as total FROM usuarios');

    // Total de entregadores
    const [couriers] = await db.query('SELECT COUNT(*) as total FROM couriers');

    // Pedidos hoje
    const [ordersToday] = await db.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE DATE(DATA) = CURDATE()'
    );

    // Pedidos esta semana
    const [ordersWeek] = await db.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE YEARWEEK(DATA) = YEARWEEK(NOW())'
    );

    // Pedidos este mês
    const [ordersMonth] = await db.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE YEAR(DATA) = YEAR(NOW()) AND MONTH(DATA) = MONTH(NOW())'
    );

    return res.status(200).json({
      deliveries: {
        total: deliveries[0].total,
        ativos: deliveries[0].ativos
      },
      usuarios: users[0].total,
      entregadores: couriers[0].total,
      pedidos: {
        hoje: ordersToday[0].total,
        semana: ordersWeek[0].total,
        mes: ordersMonth[0].total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: error.message
    });
  }
});

// =====================================================
// DELIVERIES - GERENCIAMENTO
// =====================================================

router.get('/deliveries', adminAuthMiddleware, async (req, res) => {
  try {
    const [deliveries] = await db.query(`
      SELECT 
        DELIVERY_ID,
        DELIVERY_NOME as NOME,
        EMAIL,
        TELEFONE,
        CATEGORIA_ID as CATEGORIA,
        URL_IMAGEM as LOGO,
        ENDERECO,
        CHV as SITUACAO
      FROM deliveries
      ORDER BY DELIVERY_ID DESC
    `);

    return res.status(200).json({ deliveries });
  } catch (error) {
    console.error('Erro ao buscar deliveries:', error);
    return res.status(500).json({ error: 'Erro ao buscar deliveries' });
  }
});

router.get('/deliveries/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [delivery] = await db.query('SELECT * FROM deliveries WHERE DELIVERY_ID = ?', [id]);

    if (delivery.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }

    return res.status(200).json({ delivery: delivery[0] });
  } catch (error) {
    console.error('Erro ao buscar delivery:', error);
    return res.status(500).json({ error: 'Erro ao buscar delivery' });
  }
});

router.put('/deliveries/:id/toggle-status', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar status atual
    const [current] = await db.query('SELECT CHV FROM deliveries WHERE DELIVERY_ID = ?', [id]);

    if (current.length === 0) {
      return res.status(404).json({ error: 'Delivery não encontrado' });
    }

    const newStatus = current[0].CHV === '1' ? '0' : '1';

    await db.query('UPDATE deliveries SET CHV = ? WHERE DELIVERY_ID = ?', [newStatus, id]); return res.status(200).json({
      success: true,
      message: `Delivery ${newStatus === 1 ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return res.status(500).json({ error: 'Erro ao alterar status' });
  }
});

// =====================================================
// USERS - GERENCIAMENTO
// =====================================================

router.get('/users', adminAuthMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        USER_ID as USUARIO_ID,
        NOME,
        EMAIL,
        TELEFONE,
        CHV as ATIVO
      FROM usuarios
      ORDER BY USER_ID DESC
    `);

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.get('/users/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query('SELECT USER_ID as USUARIO_ID, NOME, SOBRENOME, EMAIL, TELEFONE, CHV as ATIVO FROM usuarios WHERE USER_ID = ?', [id]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar endereços (se a tabela existir)
    let enderecos = [];
    try {
      const [result] = await db.query(
        'SELECT * FROM enderecos WHERE USER_ID = ?',
        [id]
      );
      enderecos = result;
    } catch (e) {
      // Tabela enderecos pode não existir
      enderecos = [];
    }

    // Contar pedidos
    const [pedidos] = await db.query(
      'SELECT COUNT(*) as total FROM pedidos WHERE USER_ID = ?',
      [id]
    );

    return res.status(200).json({
      user: {
        ...user[0],
        enderecos,
        totalPedidos: pedidos[0].total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

router.post('/users/:id/block', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar status atual
    const [current] = await db.query('SELECT CHV FROM usuarios WHERE USER_ID = ?', [id]);

    if (current.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const newStatus = current[0].CHV === '1' ? '0' : '1';

    await db.query('UPDATE usuarios SET CHV = ? WHERE USER_ID = ?', [newStatus, id]); return res.status(200).json({
      success: true,
      message: `Usuário ${newStatus === 1 ? 'desbloqueado' : 'bloqueado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return res.status(500).json({ error: 'Erro ao alterar status' });
  }
});

// =====================================================
// COURIERS - GERENCIAMENTO
// =====================================================

router.get('/couriers', adminAuthMiddleware, async (req, res) => {
  try {
    const [couriers] = await db.query(`
      SELECT 
        COURIER_ID,
        NOME,
        EMAIL,
        TELEFONE,
        TRANSPORTE as VEICULO,
        CHV as ATIVO,
        0 as totalEntregas,
        0 as rating
      FROM couriers
      ORDER BY COURIER_ID DESC
    `);

    return res.status(200).json({ couriers });
  } catch (error) {
    console.error('Erro ao buscar entregadores:', error);
    return res.status(500).json({ error: 'Erro ao buscar entregadores' });
  }
});

router.get('/couriers/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [courier] = await db.query(`
      SELECT 
        COURIER_ID,
        NOME,
        SOBRENOME,
        EMAIL,
        TELEFONE,
        TRANSPORTE as VEICULO,
        CHV as ATIVO,
        0 as totalEntregas,
        0 as rating,
        0 as totalAvaliacoes
      FROM couriers
      WHERE COURIER_ID = ?
    `, [id]);

    if (courier.length === 0) {
      return res.status(404).json({ error: 'Entregador não encontrado' });
    }

    // Buscar últimas entregas (funcionalidade futura)
    const ultimasEntregas = [];

    return res.status(200).json({
      courier: {
        ...courier[0],
        ultimasEntregas
      }
    });
  } catch (error) {
    console.error('Erro ao buscar entregador:', error);
    return res.status(500).json({ error: 'Erro ao buscar entregador' });
  }
});

router.put('/couriers/:id/toggle-status', adminAuthMiddleware, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const [current] = await db.query('SELECT CHV FROM couriers WHERE COURIER_ID = ?', [id]);

    if (current.length === 0) {
      return res.status(404).json({ error: 'Entregador não encontrado' });
    }

    const newStatus = current[0].CHV === '1' ? '0' : '1';

    await db.query('UPDATE couriers SET CHV = ? WHERE COURIER_ID = ?', [newStatus, id]); return res.status(200).json({
      success: true,
      message: `Entregador ${newStatus === 1 ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return res.status(500).json({ error: 'Erro ao alterar status' });
  }
});

// =====================================================
// ORDERS - GERENCIAMENTO
// =====================================================

router.get('/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        p.PEDIDO_ID,
        p.DATA,
        p.STATUS,
        p.VR_TOTAL as VALOR_TOTAL,
        'Não especificado' as FORMA_PAGAMENTO,
        u.NOME as USUARIO_NOME,
        d.DELIVERY_NOME as DELIVERY_NOME,
        p.DELIVERY_ID
      FROM pedidos p
      LEFT JOIN usuarios u ON p.USER_ID = u.USER_ID
      INNER JOIN deliveries d ON p.DELIVERY_ID = d.DELIVERY_ID
      ORDER BY p.DATA DESC
      LIMIT 500
    `);

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

router.get('/orders/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [order] = await db.query(`
      SELECT 
        p.*,
        p.VR_SUBTOTAL as SUBTOTAL,
        p.VR_TOTAL as VALOR_TOTAL,
        0 as TAXA_SERVICO,
        u.NOME as USUARIO_NOME,
        u.TELEFONE as USUARIO_TELEFONE,
        d.DELIVERY_NOME as DELIVERY_NOME,
        d.TELEFONE as DELIVERY_TELEFONE,
        NULL as COURIER_NOME,
        NULL as COURIER_TELEFONE,
        'Não especificado' as FORMA_PAGAMENTO,
        '' as OBSERVACOES
      FROM pedidos p
      LEFT JOIN usuarios u ON p.USER_ID = u.USER_ID
      INNER JOIN deliveries d ON p.DELIVERY_ID = d.DELIVERY_ID
      WHERE p.PEDIDO_ID = ?
    `, [id]);

    if (order.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Buscar itens do pedido
    const [itens] = await db.query(`
      SELECT 
        ip.*,
        pr.PRODUTO_NOME,
        ip.VR_ITEM as VALOR_UNITARIO
      FROM itens_pedido ip
      INNER JOIN produtos pr ON ip.PRODUTO_ID = pr.PRODUTO_ID
      WHERE ip.PEDIDO_ID = ?
    `, [id]);

    return res.status(200).json({
      order: {
        ...order[0],
        itens
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

module.exports = router;

