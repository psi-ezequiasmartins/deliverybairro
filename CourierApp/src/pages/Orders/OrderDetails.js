/**
 * src/pages/Orders/OrderDetails.js
 * Tela de detalhes de um pedido específico
 */

import React, { useState, useContext, useEffect } from 'react';
import socket from '../../services/socket';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderContext } from '../../contexts/OrderContext';
import Logger from '../../utils/logger';

export default function OrderDetails({ route, navigation }) {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const {
    fetchOrderDetails,
    startPickup,
    confirmPickup,
    startDelivery,
    completeDelivery
  } = useContext(OrderContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrderDetails();

    // Escuta atualização em tempo real para este pedido
    const handler = (data) => {
      if (data?.id === orderId && data?.status) {
        setOrder(prev => prev ? { ...prev, STATUS: data.status } : prev);
        Logger.info('OrderDetails', 'Status atualizado via websocket', data);
      }
    };
    socket.on('orderStatusUpdated', handler);

    return () => {
      socket.off('orderStatusUpdated', handler);
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await fetchOrderDetails(orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        Alert.alert('Erro', 'Pedido não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      Logger.error('OrderDetails', 'Erro ao carregar pedido', { error: error.message, orderId });
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPickup = async () => {
    Alert.alert(
      'Iniciar Coleta',
      'Confirma que está se dirigindo para o local de coleta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            const result = await startPickup(orderId);
            setActionLoading(false);

            if (result.success) {
              setOrder(prev => ({ ...prev, STATUS: 'picking_up' }));
              Alert.alert('Sucesso', 'Coleta iniciada!');
            } else {
              Alert.alert('Erro', result.message || 'Não foi possível iniciar a coleta');
            }
          }
        }
      ]
    );
  };

  const handleConfirmPickup = async () => {
    Alert.alert(
      'Confirmar Coleta',
      'Confirma que coletou o pedido no restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            const result = await confirmPickup(orderId);
            setActionLoading(false);

            if (result.success) {
              setOrder(prev => ({ ...prev, STATUS: 'in_delivery' }));
              Alert.alert('Sucesso', 'Coleta confirmada! Agora vá entregar ao cliente.');
            } else {
              Alert.alert('Erro', result.message || 'Não foi possível confirmar a coleta');
            }
          }
        }
      ]
    );
  };

  const handleStartDelivery = async () => {
    setActionLoading(true);
    const result = await startDelivery(orderId);
    setActionLoading(false);

    if (result.success) {
      setOrder(prev => ({ ...prev, STATUS: 'delivering' }));
      navigation.navigate('Navigation', { orderId, order });
    } else {
      Alert.alert('Erro', result.message || 'Não foi possível iniciar a entrega');
    }
  };

  const handleCompleteDelivery = async () => {
    Alert.alert(
      'Finalizar Entrega',
      'Confirma que o pedido foi entregue ao cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            const result = await completeDelivery(orderId);
            setActionLoading(false);

            if (result.success) {
              Alert.alert('Sucesso', 'Entrega finalizada!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Erro', result.message || 'Não foi possível finalizar a entrega');
            }
          }
        }
      ]
    );
  };

  const formatValue = (value) => {
    return `R$ ${parseFloat(value || 0).toFixed(2)}`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#3B82F6';
      case 'picking_up': return '#8B5CF6';
      case 'in_delivery': return '#FF6B35';
      case 'delivered': return '#22C55E';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Aceito';
      case 'picking_up': return 'Coletando';
      case 'in_delivery': return 'Entregando';
      case 'delivered': return 'Entregue';
      default: return 'Desconhecido';
    }
  };

  const renderActionButton = () => {
    if (!order) return null;

    switch (order.STATUS) {
      case 'accepted':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={handleStartPickup}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome5 name="play" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Iniciar Coleta</Text>
              </>
            )}
          </TouchableOpacity>
        );

      case 'picking_up':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF6B35' }]}
            onPress={handleConfirmPickup}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome5 name="check" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Confirmar Coleta</Text>
              </>
            )}
          </TouchableOpacity>
        );

      case 'in_delivery':
        return (
          <View style={styles.deliveryActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3B82F6', flex: 1, marginRight: 10 }]}
              onPress={handleStartDelivery}
              disabled={actionLoading}
            >
              <FontAwesome5 name="map-marked-alt" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Navegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#22C55E', flex: 1 }]}
              onPress={handleCompleteDelivery}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <FontAwesome5 name="flag-checkered" size={16} color="#FFF" />
                  <Text style={styles.actionButtonText}>Finalizar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <FontAwesome5 name="exclamation-triangle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Pedido não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header do pedido */}
        <View style={styles.orderHeader}>
          <View style={styles.orderBasicInfo}>
            <Text style={styles.orderNumber}>Pedido #{order.ORDER_ID}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.STATUS) }]}>
              <Text style={styles.statusText}>{getStatusText(order.STATUS)}</Text>
            </View>
          </View>
          <Text style={styles.orderValue}>{formatValue(order.TOTAL_AMOUNT)}</Text>
          <Text style={styles.orderDate}>{formatDateTime(order.CREATED_AT)}</Text>
        </View>

        {/* Informações do restaurante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="store" size={16} color="#FF6B35" /> Restaurante
          </Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{order.RESTAURANT_NAME || 'Nome não informado'}</Text>
            <Text style={styles.infoText}>{order.PICKUP_ADDRESS || 'Endereço não informado'}</Text>
            {order.RESTAURANT_PHONE && (
              <View style={styles.contactRow}>
                <FontAwesome5 name="phone" size={14} color="#888" />
                <Text style={styles.contactText}>{order.RESTAURANT_PHONE}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Informações do cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="user" size={16} color="#FF6B35" /> Cliente
          </Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{order.CUSTOMER_NAME || 'Nome não informado'}</Text>
            <Text style={styles.infoText}>{order.DELIVERY_ADDRESS || 'Endereço não informado'}</Text>
            {order.CUSTOMER_PHONE && (
              <View style={styles.contactRow}>
                <FontAwesome5 name="phone" size={14} color="#888" />
                <Text style={styles.contactText}>{order.CUSTOMER_PHONE}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Itens do pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="list" size={16} color="#FF6B35" /> Itens do Pedido
          </Text>
          <View style={styles.infoCard}>
            {order.ITEMS && order.ITEMS.length > 0 ? (
              order.ITEMS.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemQuantity}>{item.QUANTITY}x</Text>
                  <Text style={styles.itemName}>{item.NAME}</Text>
                  <Text style={styles.itemPrice}>{formatValue(item.PRICE)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>Itens não disponíveis</Text>
            )}
          </View>
        </View>

        {/* Informações de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="truck" size={16} color="#FF6B35" /> Informações de Entrega
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.deliveryRow}>
              <FontAwesome5 name="route" size={14} color="#888" />
              <Text style={styles.deliveryText}>
                {order.DISTANCE ? `${(order.DISTANCE / 1000).toFixed(1)} km` : 'Distância N/A'}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <FontAwesome5 name="clock" size={14} color="#888" />
              <Text style={styles.deliveryText}>
                {order.ESTIMATED_TIME || 'N/A'} min estimado
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <FontAwesome5 name="money-bill-wave" size={14} color="#888" />
              <Text style={styles.deliveryText}>
                {order.PAYMENT_METHOD || 'Pagamento não informado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Instruções especiais */}
        {order.DELIVERY_INSTRUCTIONS && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="comment" size={16} color="#FF6B35" /> Instruções
            </Text>
            <View style={styles.infoCard}>
              <Text style={styles.instructionsText}>{order.DELIVERY_INSTRUCTIONS}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botão de ação */}
      <View style={styles.actionContainer}>
        {renderActionButton()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  orderHeader: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  orderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    width: 40,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#CCC',
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  deliveryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 10,
  },
});