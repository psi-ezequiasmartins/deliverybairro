import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/apiAxios';
import Logger from '../utils/logger';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar pedidos disponíveis para coleta
  async function fetchAvailableOrders() {
    setLoading(true);
    try {
      const response = await api.get('/api/courier/orders/available');
      setAvailableOrders(response.data || []);
      Logger.info('CourierOrders', 'Pedidos disponíveis carregados', { count: response.data?.length || 0 });
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao buscar pedidos disponíveis', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  // Buscar pedidos aceitos pelo entregador
  async function fetchAcceptedOrders() {
    setLoading(true);
    try {
      const response = await api.get('/api/courier/orders/accepted');
      setAcceptedOrders(response.data || []);
      Logger.info('CourierOrders', 'Pedidos aceitos carregados', { count: response.data?.length || 0 });
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao buscar pedidos aceitos', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  // Aceitar um pedido para entrega
  async function acceptOrder(orderId) {
    try {
      const response = await api.post(`/api/courier/orders/${orderId}/accept`);

      if (response.data?.success) {
        // Remove da lista de disponíveis e adiciona aos aceitos
        const acceptedOrder = availableOrders.find(order => order.ORDER_ID === orderId);
        if (acceptedOrder) {
          setAvailableOrders(prev => prev.filter(order => order.ORDER_ID !== orderId));
          setAcceptedOrders(prev => [...prev, { ...acceptedOrder, STATUS: 'accepted' }]);
        }

        Logger.success('CourierOrders', 'Pedido aceito com sucesso', { orderId });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao aceitar pedido', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  // Iniciar coleta do pedido
  async function startPickup(orderId) {
    try {
      const response = await api.put(`/api/courier/orders/${orderId}/pickup/start`);

      if (response.data?.success) {
        // Atualiza status do pedido
        setAcceptedOrders(prev =>
          prev.map(order =>
            order.ORDER_ID === orderId
              ? { ...order, STATUS: 'picking_up' }
              : order
          )
        );

        Logger.info('CourierOrders', 'Coleta iniciada', { orderId });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao iniciar coleta', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  // Confirmar coleta do pedido
  async function confirmPickup(orderId) {
    try {
      const response = await api.put(`/api/courier/orders/${orderId}/pickup/confirm`);

      if (response.data?.success) {
        const order = acceptedOrders.find(o => o.ORDER_ID === orderId);
        if (order) {
          setCurrentDelivery({ ...order, STATUS: 'in_delivery' });
          setAcceptedOrders(prev =>
            prev.map(o =>
              o.ORDER_ID === orderId
                ? { ...o, STATUS: 'in_delivery' }
                : o
            )
          );
        }

        Logger.info('CourierOrders', 'Coleta confirmada', { orderId });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao confirmar coleta', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  // Iniciar entrega
  async function startDelivery(orderId) {
    try {
      const response = await api.put(`/api/courier/orders/${orderId}/delivery/start`);

      if (response.data?.success) {
        setCurrentDelivery(prev =>
          prev ? { ...prev, STATUS: 'delivering' } : null
        );

        Logger.info('CourierOrders', 'Entrega iniciada', { orderId });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao iniciar entrega', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  // Finalizar entrega
  async function completeDelivery(orderId, deliveryData = {}) {
    try {
      const response = await api.put(`/api/courier/orders/${orderId}/delivery/complete`, {
        deliveredAt: new Date().toISOString(),
        ...deliveryData
      });

      if (response.data?.success) {
        // Remove da lista de aceitos e limpa entrega atual
        setAcceptedOrders(prev => prev.filter(order => order.ORDER_ID !== orderId));
        setCurrentDelivery(null);

        Logger.success('CourierOrders', 'Entrega finalizada', { orderId });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao finalizar entrega', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  // Atualizar localização durante a entrega
  async function updateDeliveryLocation(orderId, location) {
    try {
      await api.put(`/api/courier/orders/${orderId}/location`, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      });

      Logger.debug('CourierOrders', 'Localização atualizada', { orderId, location });
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao atualizar localização', { error: error.message });
    }
  }

  // Buscar detalhes de um pedido específico
  async function fetchOrderDetails(orderId) {
    try {
      const response = await api.get(`/api/courier/orders/${orderId}`);
      return response.data;
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao buscar detalhes do pedido', { error: error.message, orderId });
      return null;
    }
  }

  // Rejeitar um pedido
  async function rejectOrder(orderId, reason = '') {
    try {
      const response = await api.post(`/api/courier/orders/${orderId}/reject`, { reason });

      if (response.data?.success) {
        setAvailableOrders(prev => prev.filter(order => order.ORDER_ID !== orderId));
        Logger.info('CourierOrders', 'Pedido rejeitado', { orderId, reason });
        return { success: true };
      }
    } catch (error) {
      Logger.error('CourierOrders', 'Erro ao rejeitar pedido', { error: error.message, orderId });
      return { success: false, message: error.message };
    }
  }

  useEffect(() => {
    // Carrega dados iniciais ao montar o componente
    fetchAvailableOrders();
    fetchAcceptedOrders();
  }, []);

  return (
    <OrderContext.Provider value={{
      availableOrders,
      acceptedOrders,
      currentDelivery,
      loading,
      fetchAvailableOrders,
      fetchAcceptedOrders,
      acceptOrder,
      rejectOrder,
      startPickup,
      confirmPickup,
      startDelivery,
      completeDelivery,
      updateDeliveryLocation,
      fetchOrderDetails,
      setCurrentDelivery
    }}>
      {children}
    </OrderContext.Provider>
  );
}