/**
 * src/pages/Orders/index.js
 * Tela de listagem de pedidos disponíveis e aceitos
 */

import React, { useState, useContext, useEffect } from 'react';
import socket from '../../services/socket';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderContext } from '../../contexts/OrderContext';
import Logger from '../../utils/logger';

export default function Orders({ navigation }) {
  const { t } = useTranslation();
  const {
    availableOrders,
    acceptedOrders,
    loading,
    fetchAvailableOrders,
    fetchAcceptedOrders,
    acceptOrder,
    rejectOrder
  } = useContext(OrderContext);

  const [activeTab, setActiveTab] = useState('available'); // 'available' ou 'accepted'
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'available') {
        await fetchAvailableOrders();
      } else {
        await fetchAcceptedOrders();
      }
    } catch (error) {
      Logger.error('Orders', 'Erro ao atualizar pedidos', { error: error.message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    Alert.alert(
      'Aceitar Pedido',
      'Deseja aceitar este pedido para entrega?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            const result = await acceptOrder(orderId);
            if (result.success) {
              Alert.alert('Sucesso', 'Pedido aceito com sucesso!');
            } else {
              Alert.alert('Erro', result.message || 'Não foi possível aceitar o pedido');
            }
          }
        }
      ]
    );
  };

  const handleRejectOrder = async (orderId) => {
    Alert.alert(
      'Rejeitar Pedido',
      'Deseja rejeitar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          onPress: async () => {
            const result = await rejectOrder(orderId, 'Entregador não disponível');
            if (result.success) {
              Alert.alert('Sucesso', 'Pedido rejeitado');
            }
          }
        }
      ]
    );
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  const formatValue = (value) => {
    return `R$ ${parseFloat(value || 0).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#3B82F6';
      case 'picking_up': return '#8B5CF6';
      case 'in_delivery': return '#FF6B35';
      case 'delivered': return '#22C55E';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'picking_up': return 'Coletando';
      case 'in_delivery': return 'Entregando';
      case 'delivered': return 'Entregue';
      default: return 'Desconhecido';
    }
  };

  const renderOrderItem = ({ item }) => {
    const isAvailable = activeTab === 'available';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.ORDER_ID })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Pedido #{item.ORDER_ID}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.STATUS) }]}>
              <Text style={styles.statusText}>{getStatusText(item.STATUS)}</Text>
            </View>
          </View>
          <Text style={styles.orderValue}>{formatValue(item.TOTAL_AMOUNT)}</Text>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="store" size={14} color="#888" />
            <Text style={styles.detailText}>
              {item.RESTAURANT_NAME || 'Restaurante não informado'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#888" />
            <Text style={styles.detailText}>
              {item.DELIVERY_ADDRESS || 'Endereço não informado'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="route" size={14} color="#888" />
            <Text style={styles.detailText}>
              {formatDistance(item.DISTANCE)} • {item.ESTIMATED_TIME || 'N/A'} min
            </Text>
          </View>
        </View>

        {isAvailable && (
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectOrder(item.ORDER_ID)}
            >
              <FontAwesome5 name="times" size={16} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                Rejeitar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptOrder(item.ORDER_ID)}
            >
              <FontAwesome5 name="check" size={16} color="#22C55E" />
              <Text style={[styles.actionButtonText, { color: '#22C55E' }]}>
                Aceitar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchAvailableOrders();
    fetchAcceptedOrders();

    // Escuta atualizações de status de pedidos via websocket
    socket.on('orderStatusUpdated', (data) => {
      // Atualiza pedidos disponíveis e aceitos conforme ID
      // Estrutura esperada: { id: ORDER_ID, status: 'novo_status' }
      if (data?.id) {
        // Atualiza arrays em contexto se presente
        // Como o contexto gerencia o estado, aqui apenas força refetch simples
        // Alternativamente, poderia atualizar diretamente se tivéssemos setters
        Logger.info('Orders', 'Atualização recebida via websocket', data);
        // Refetch leve para sincronizar
        fetchAvailableOrders();
        fetchAcceptedOrders();
      }
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, []);

  const currentOrders = activeTab === 'available' ? availableOrders : acceptedOrders;

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Disponíveis ({availableOrders?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Aceitos ({acceptedOrders?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={currentOrders}
        keyExtractor={(item) => item.ORDER_ID.toString()}
        renderItem={renderOrderItem}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="inbox" size={48} color="#666" />
            <Text style={styles.emptyStateText}>
              {activeTab === 'available'
                ? 'Nenhum pedido disponível no momento'
                : 'Nenhum pedido aceito'
              }
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#FFF',
  },
  ordersList: {
    flex: 1,
    padding: 15,
  },
  ordersListContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});