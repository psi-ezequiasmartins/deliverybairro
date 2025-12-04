/**
 * services/areaValidation.js
 * Validação de área de cobertura e cálculos geográficos
 */

const db = require('../config/database.js');

// Constantes
const DELIVERY_RADIUS_KM = 3;
const EARTH_RADIUS_KM = 6371;

/**
 * Calcula a distância entre duas coordenadas usando fórmula de Haversine
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Verifica se uma coordenada está dentro do raio de cobertura
 */
function isWithinRadius(centerLat, centerLon, targetLat, targetLon, radiusKm = DELIVERY_RADIUS_KM) {
  if (!centerLat || !centerLon || !targetLat || !targetLon) {
    return { isWithinRadius: false, distance: null };
  }

  const distance = calculateDistance(centerLat, centerLon, targetLat, targetLon);

  return {
    isWithinRadius: distance <= radiusKm,
    distance: Number(distance.toFixed(2))
  };
}

/**
 * Middleware para validar área de cobertura em pedidos
 */
const validateOrderArea = async (req, res, next) => {
  try {
    const { deliveryId, deliveryLatitude, deliveryLongitude } = req.body;

    if (!deliveryId) {
      return res.status(400).json({
        error: 'DELIVERY_ID_REQUIRED',
        message: 'ID do delivery é obrigatório'
      });
    }

    // Busca coordenadas do delivery se não fornecidas
    let deliveryLat = deliveryLatitude;
    let deliveryLon = deliveryLongitude;

    if (!deliveryLat || !deliveryLon) {
      const [delivery] = await db.query(
        'SELECT LATITUDE, LONGITUDE FROM deliveries WHERE DELIVERY_ID = ?',
        [deliveryId]
      );

      if (!delivery.length) {
        return res.status(404).json({
          error: 'DELIVERY_NOT_FOUND',
          message: 'Delivery não encontrado'
        });
      }

      deliveryLat = delivery[0].LATITUDE;
      deliveryLon = delivery[0].LONGITUDE;
    }

    if (!deliveryLat || !deliveryLon) {
      return res.status(400).json({
        error: 'DELIVERY_LOCATION_MISSING',
        message: 'Localização do delivery não disponível'
      });
    }

    // Validação para diferentes tipos de requisição
    let targetLat, targetLon, validationType;

    if (req.body.customerLatitude && req.body.customerLongitude) {
      // Pedido do cliente
      targetLat = req.body.customerLatitude;
      targetLon = req.body.customerLongitude;
      validationType = 'customer';
    } else if (req.body.courierLatitude && req.body.courierLongitude) {
      // Aceite de pedido pelo entregador
      targetLat = req.body.courierLatitude;
      targetLon = req.body.courierLongitude;
      validationType = 'courier';
    } else {
      // Se não há coordenadas para validar, pula a validação
      return next();
    }

    const validation = isWithinRadius(deliveryLat, deliveryLon, targetLat, targetLon);

    if (!validation.isWithinRadius) {
      return res.status(400).json({
        error: 'OUT_OF_DELIVERY_AREA',
        message: `Localização fora da área de cobertura. Distância: ${validation.distance}km (máx. ${DELIVERY_RADIUS_KM}km)`,
        data: {
          distance: validation.distance,
          maxRadius: DELIVERY_RADIUS_KM,
          validationType
        }
      });
    }

    // Adiciona informações de validação no request para uso posterior
    req.areaValidation = {
      distance: validation.distance,
      maxRadius: DELIVERY_RADIUS_KM,
      validationType,
      deliveryCoords: { latitude: deliveryLat, longitude: deliveryLon },
      targetCoords: { latitude: targetLat, longitude: targetLon }
    };

    next();
  } catch (error) {
    console.error('Erro na validação de área:', error);
    res.status(500).json({
      error: 'AREA_VALIDATION_ERROR',
      message: 'Erro interno na validação de área'
    });
  }
};

/**
 * Middleware para validar área em aceite de pedidos pelos entregadores
 */
const validateCourierArea = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const courierId = req.user?.courierId;

    if (!courierId) {
      return res.status(401).json({
        error: 'COURIER_NOT_AUTHENTICATED',
        message: 'Entregador não autenticado'
      });
    }

    // Busca detalhes do pedido
    const [order] = await db.query(`
      SELECT 
        o.*,
        d.LATITUDE as PICKUP_LAT,
        d.LONGITUDE as PICKUP_LON
      FROM orders o
      LEFT JOIN deliveries d ON o.DELIVERY_ID = d.DELIVERY_ID
      WHERE o.ORDER_ID = ?
    `, [orderId]);

    if (!order.length) {
      return res.status(404).json({
        error: 'ORDER_NOT_FOUND',
        message: 'Pedido não encontrado'
      });
    }

    const orderData = order[0];

    if (!orderData.PICKUP_LAT || !orderData.PICKUP_LON ||
      !orderData.DELIVERY_LATITUDE || !orderData.DELIVERY_LONGITUDE) {
      return res.status(400).json({
        error: 'INCOMPLETE_ORDER_COORDINATES',
        message: 'Coordenadas do pedido incompletas'
      });
    }

    // Obtém localização do entregador (se fornecida no body)
    const courierLat = req.body.courierLatitude;
    const courierLon = req.body.courierLongitude;

    if (courierLat && courierLon) {
      // Valida distância até o pickup
      const pickupValidation = isWithinRadius(
        courierLat, courierLon,
        orderData.PICKUP_LAT, orderData.PICKUP_LON
      );

      // Valida distância total da rota
      const deliveryDistance = calculateDistance(
        orderData.PICKUP_LAT, orderData.PICKUP_LON,
        orderData.DELIVERY_LATITUDE, orderData.DELIVERY_LONGITUDE
      );

      const totalDistance = pickupValidation.distance + deliveryDistance;

      if (!pickupValidation.isWithinRadius || totalDistance > DELIVERY_RADIUS_KM * 2) {
        return res.status(400).json({
          error: 'OUT_OF_COURIER_AREA',
          message: `Pedido fora da área de atuação. Distância total: ${totalDistance.toFixed(1)}km`,
          data: {
            pickupDistance: pickupValidation.distance,
            deliveryDistance,
            totalDistance: Number(totalDistance.toFixed(2)),
            maxRadius: DELIVERY_RADIUS_KM * 2
          }
        });
      }

      req.courierValidation = {
        pickupDistance: pickupValidation.distance,
        deliveryDistance,
        totalDistance: Number(totalDistance.toFixed(2))
      };
    }

    next();
  } catch (error) {
    console.error('Erro na validação de área do entregador:', error);
    res.status(500).json({
      error: 'COURIER_AREA_VALIDATION_ERROR',
      message: 'Erro interno na validação de área'
    });
  }
};

/**
 * Função helper para buscar deliveries próximos
 */
const findNearbyDeliveries = async (latitude, longitude, radius = DELIVERY_RADIUS_KM) => {
  try {
    const [deliveries] = await db.query(`
      SELECT *,
        (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(?)) * 
            cos(radians(LATITUDE)) * 
            cos(radians(LONGITUDE) - radians(?)) + 
            sin(radians(?)) * 
            sin(radians(LATITUDE))
          )
        ) AS distance
      FROM deliveries 
      WHERE LATITUDE IS NOT NULL 
        AND LONGITUDE IS NOT NULL
        AND STATUS = 'active'
      HAVING distance < ?
      ORDER BY distance
    `, [latitude, longitude, latitude, radius]);

    return deliveries;
  } catch (error) {
    console.error('Erro ao buscar deliveries próximos:', error);
    throw error;
  }
};

module.exports = {
  validateOrderArea,
  validateCourierArea,
  findNearbyDeliveries,
  calculateDistance,
  isWithinRadius,
  DELIVERY_RADIUS_KM
};
