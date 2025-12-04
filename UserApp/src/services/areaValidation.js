/**
 * src/services/areaValidation.js
 * Serviço para validação de área de cobertura para usuários
 */

import api from '../config/apiAxios';
import {
  getCurrentLocation,
  validateDeliveryArea,
  getCoordinatesFromAddress,
  DELIVERY_RADIUS_KM
} from '../utils/geolocation';
import Logger from '../utils/logger';

class AreaValidationService {
  /**
   * Valida se o endereço de entrega está dentro da área de cobertura do delivery
   */
  async validateDeliveryAddress(deliveryId, deliveryAddress) {
    try {
      // Busca coordenadas do delivery
      const deliveryResponse = await api.get(`/api/deliveries/${deliveryId}`);
      const delivery = deliveryResponse.data;

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

      // Obtém coordenadas do endereço de entrega
      const addressCoords = await getCoordinatesFromAddress(deliveryAddress);
      if (!addressCoords) {
        return {
          valid: false,
          message: 'Não foi possível localizar o endereço informado',
          error: 'ADDRESS_NOT_FOUND'
        };
      }

      const validation = validateDeliveryArea(deliveryCoords, addressCoords);

      Logger.info('AreaValidation', 'Validação de endereço', {
        deliveryId,
        deliveryAddress,
        canDeliver: validation.canDeliver,
        distance: validation.distance
      });

      return {
        valid: validation.canDeliver,
        message: validation.message,
        data: {
          deliveryCoords,
          addressCoords,
          distance: validation.distance,
          maxRadius: DELIVERY_RADIUS_KM,
          deliveryInfo: {
            name: delivery.NOME,
            address: delivery.ENDERECO
          }
        }
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro na validação de endereço', {
        error: error.message,
        deliveryId,
        deliveryAddress
      });

      return {
        valid: false,
        message: 'Erro ao validar área de entrega',
        error: error.message
      };
    }
  }

  /**
   * Busca deliveries disponíveis na área do usuário
   */
  async getAvailableDeliveries() {
    try {
      const userLocation = await getCurrentLocation();
      if (!userLocation) {
        // Se não conseguir a localização, retorna todos os deliveries
        Logger.warning('AreaValidation', 'Localização não disponível, retornando todos os deliveries');
        const response = await api.get('/api/deliveries');
        return {
          success: true,
          data: response.data,
          userLocation: null,
          filtered: false
        };
      }

      const response = await api.post('/api/deliveries/nearby', {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: DELIVERY_RADIUS_KM
      });

      Logger.info('AreaValidation', 'Deliveries próximos encontrados', {
        userLocation,
        count: response.data?.length || 0
      });

      return {
        success: true,
        data: response.data,
        userLocation,
        filtered: true
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro ao buscar deliveries disponíveis', {
        error: error.message
      });

      // Em caso de erro, tenta buscar todos os deliveries
      try {
        const fallbackResponse = await api.get('/api/deliveries');
        return {
          success: true,
          data: fallbackResponse.data,
          userLocation: null,
          filtered: false,
          warning: 'Não foi possível filtrar por localização'
        };
      } catch (fallbackError) {
        return {
          success: false,
          message: 'Erro ao carregar deliveries',
          error: error.message
        };
      }
    }
  }

  /**
   * Valida pedido antes da finalização
   */
  async validateOrder(orderData) {
    try {
      const { deliveryId, deliveryAddress } = orderData;

      if (!deliveryId || !deliveryAddress) {
        return {
          valid: false,
          message: 'Dados do pedido incompletos',
          error: 'MISSING_DATA'
        };
      }

      const addressValidation = await this.validateDeliveryAddress(deliveryId, deliveryAddress);

      if (!addressValidation.valid) {
        return addressValidation;
      }

      // Aqui você pode adicionar outras validações:
      // - Horário de funcionamento
      // - Disponibilidade do delivery
      // - Valor mínimo do pedido
      // etc.

      return {
        valid: true,
        message: 'Pedido válido para a área selecionada',
        data: addressValidation.data
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro na validação do pedido', {
        error: error.message,
        orderData
      });

      return {
        valid: false,
        message: 'Erro ao validar pedido',
        error: error.message
      };
    }
  }

  /**
   * Sugere deliveries próximos baseado no endereço
   */
  async suggestNearbyDeliveries(address) {
    try {
      const addressCoords = await getCoordinatesFromAddress(address);
      if (!addressCoords) {
        return {
          success: false,
          message: 'Não foi possível localizar o endereço'
        };
      }

      const response = await api.post('/api/deliveries/nearby', {
        latitude: addressCoords.latitude,
        longitude: addressCoords.longitude,
        radius: DELIVERY_RADIUS_KM
      });

      return {
        success: true,
        data: response.data,
        addressCoords
      };
    } catch (error) {
      Logger.error('AreaValidation', 'Erro ao sugerir deliveries', {
        error: error.message,
        address
      });

      return {
        success: false,
        message: 'Erro ao buscar deliveries próximos',
        error: error.message
      };
    }
  }
}

export default new AreaValidationService();