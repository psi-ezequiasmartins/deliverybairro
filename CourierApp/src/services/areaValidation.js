/**
 * src/services/areaValidation.js
 * Serviço para validação de área de cobertura
 */

import api from '../config/apiAxios';
import {
  getCurrentLocation,
  validateDeliveryArea,
  validateCourierRange,
  DELIVERY_RADIUS_KM
} from '../utils/geolocation';
import Logger from '../utils/logger';

class AreaValidationService {
  /**
   * Valida se o entregador está dentro da área de um pedido
   */
  async validateOrderForCourier(orderId) {
    try {
      const courierLocation = await getCurrentLocation();
      if (!courierLocation) {
        return {
          valid: false,
          message: 'Não foi possível obter sua localização',
          error: 'LOCATION_ERROR'
        };
      }

      // Busca detalhes do pedido
      const response = await api.get(`/api/courier/orders/${orderId}`);
      const order = response.data;

      if (!order.PICKUP_LATITUDE || !order.PICKUP_LONGITUDE ||
        !order.DELIVERY_LATITUDE || !order.DELIVERY_LONGITUDE) {
        return {
          valid: false,
          message: 'Coordenadas do pedido incompletas',
          error: 'INVALID_COORDINATES'
        };
      }

      const pickupCoords = {
        latitude: order.PICKUP_LATITUDE,
        longitude: order.PICKUP_LONGITUDE
      };

      const deliveryCoords = {
        latitude: order.DELIVERY_LATITUDE,
        longitude: order.DELIVERY_LONGITUDE
      };

      const validation = validateCourierRange(courierLocation, pickupCoords, deliveryCoords);

      Logger.info('AreaValidation', 'Validação de área para entregador', {
        orderId,
        canAccept: validation.canAccept,
        distances: {
          pickup: validation.pickupDistance,
          total: validation.totalDistance
        }
      });

      return {
        valid: validation.canAccept,
        message: validation.message,
        data: {
          courierLocation,
          pickupCoords,
          deliveryCoords,
          distances: {
            pickup: validation.pickupDistance,
            total: validation.totalDistance
          },
          maxRadius: DELIVERY_RADIUS_KM
        }
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro na validação de área', {
        error: error.message,
        orderId
      });

      return {
        valid: false,
        message: 'Erro ao validar área de cobertura',
        error: error.message
      };
    }
  }

  /**
   * Valida se uma localização está dentro da área de entrega de um delivery
   */
  async validateLocationForDelivery(deliveryId, targetCoords) {
    try {
      // Busca coordenadas do delivery
      const response = await api.get(`/api/deliveries/${deliveryId}`);
      const delivery = response.data;

      if (!delivery.LATITUDE || !delivery.LONGITUDE) {
        return {
          valid: false,
          message: 'Localização do delivery não disponível',
          error: 'DELIVERY_LOCATION_MISSING'
        };
      }

      const deliveryCoords = {
        latitude: delivery.LATITUDE,
        longitude: delivery.LONGITUDE
      };

      const validation = validateDeliveryArea(deliveryCoords, targetCoords);

      Logger.info('AreaValidation', 'Validação de área para delivery', {
        deliveryId,
        canDeliver: validation.canDeliver,
        distance: validation.distance
      });

      return {
        valid: validation.canDeliver,
        message: validation.message,
        data: {
          deliveryCoords,
          targetCoords,
          distance: validation.distance,
          maxRadius: DELIVERY_RADIUS_KM
        }
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro na validação de delivery', {
        error: error.message,
        deliveryId
      });

      return {
        valid: false,
        message: 'Erro ao validar área de entrega',
        error: error.message
      };
    }
  }

  /**
   * Obtém deliveries próximos baseado na localização atual
   */
  async getNearbyDeliveries() {
    try {
      const userLocation = await getCurrentLocation();
      if (!userLocation) {
        return {
          success: false,
          message: 'Não foi possível obter sua localização'
        };
      }

      const response = await api.post('/api/deliveries/nearby', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: DELIVERY_RADIUS_KM
      });

      return {
        success: true,
        data: response.data,
        userLocation
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro ao buscar deliveries próximos', {
        error: error.message
      });

      return {
        success: false,
        message: 'Erro ao buscar deliveries próximos',
        error: error.message
      };
    }
  }

  /**
   * Calcula rota otimizada considerando limitações de área
   */
  async calculateOptimizedRoute(waypoints) {
    try {
      if (!waypoints || waypoints.length < 2) {
        throw new Error('Pelo menos 2 pontos necessários para rota');
      }

      // Valida se todos os pontos estão dentro da área permitida
      const startPoint = waypoints[0];
      for (let i = 1; i < waypoints.length; i++) {
        const validation = validateDeliveryArea(startPoint, waypoints[i]);
        if (!validation.canDeliver) {
          return {
            success: false,
            message: `Ponto ${i} está fora da área de cobertura (${validation.distance}km)`,
            error: 'WAYPOINT_OUT_OF_RANGE'
          };
        }
      }

      // Aqui você pode integrar com Google Directions API
      // Por agora, retorna uma rota simples
      return {
        success: true,
        data: {
          waypoints,
          distance: 'Calculando...',
          duration: 'Calculando...',
          route: waypoints // Simplified route
        }
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro ao calcular rota', {
        error: error.message,
        waypoints
      });

      return {
        success: false,
        message: 'Erro ao calcular rota otimizada',
        error: error.message
      };
    }
  }
}

export default new AreaValidationService();