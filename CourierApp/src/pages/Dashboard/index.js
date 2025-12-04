/**
 * src/pages/Dashboard/index.js
 * Dashboard principal do entregador
 */

import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { OrderContext } from '../../contexts/OrderContext';
import Logger from '../../utils/logger';

export default function Dashboard() {
  const { t } = useTranslation();
  const { courier, updateCourierStatus } = useContext(AuthContext);
  const { availableOrders, acceptedOrders, fetchAvailableOrders, fetchAcceptedOrders } = useContext(OrderContext);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAvailableOrders(),
        fetchAcceptedOrders()
      ]);
    } catch (error) {
      Logger.error('Dashboard', 'Erro ao atualizar dados', { error: error.message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateCourierStatus(newStatus);
      Alert.alert('Sucesso', `Status alterado para ${getStatusText(newStatus)}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status');
      Logger.error('Dashboard', 'Erro ao alterar status', { error: error.message });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'busy': return 'Ocupado';
      default: return 'Offline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#22C55E';
      case 'offline': return '#EF4444';
      case 'busy': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  useEffect(() => {
    fetchAvailableOrders();
    fetchAcceptedOrders();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header com informações do entregador */}
        <View style={styles.header}>
          <View style={styles.courierInfo}>
            <View style={styles.avatar}>
              <FontAwesome5 name="user" size={30} color="#FFF" />
            </View>
            <View style={styles.courierDetails}>
              <Text style={styles.courierName}>
                {courier?.NOME} {courier?.SOBRENOME}
              </Text>
              <Text style={styles.courierPhone}>{courier?.TELEFONE}</Text>
              <Text style={styles.vehicleType}>
                <FontAwesome5 name="motorcycle" size={14} color="#888" />
                {' '}{courier?.VEHICLE_TYPE?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Status do entregador */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.currentStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(courier?.STATUS) }]} />
              <Text style={styles.statusText}>{getStatusText(courier?.STATUS)}</Text>
            </View>
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  courier?.STATUS === 'online' && styles.statusButtonActive
                ]}
                onPress={() => handleStatusChange('online')}
              >
                <MaterialIcons name="radio-button-checked" size={20} color="#22C55E" />
                <Text style={styles.statusButtonText}>Online</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  courier?.STATUS === 'offline' && styles.statusButtonActive
                ]}
                onPress={() => handleStatusChange('offline')}
              >
                <MaterialIcons name="radio-button-unchecked" size={20} color="#EF4444" />
                <Text style={styles.statusButtonText}>Offline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <FontAwesome5 name="truck" size={24} color="#FF6B35" />
              <Text style={styles.statValue}>{courier?.TOTAL_DELIVERIES || 0}</Text>
              <Text style={styles.statLabel}>Entregas</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome5 name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{courier?.RATING || '0.0'}</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome5 name="clock" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{acceptedOrders?.length || 0}</Text>
              <Text style={styles.statLabel}>Em Andamento</Text>
            </View>
            <View style={styles.statCard}>
              <FontAwesome5 name="list" size={24} color="#10B981" />
              <Text style={styles.statValue}>{availableOrders?.length || 0}</Text>
              <Text style={styles.statLabel}>Disponíveis</Text>
            </View>
          </View>
        </View>

        {/* Resumo de pedidos */}
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Pedidos de Hoje</Text>
          <View style={styles.ordersSummary}>
            <View style={styles.orderSummaryItem}>
              <FontAwesome5 name="check-circle" size={20} color="#22C55E" />
              <Text style={styles.orderSummaryText}>0 Entregues</Text>
            </View>
            <View style={styles.orderSummaryItem}>
              <FontAwesome5 name="clock" size={20} color="#F59E0B" />
              <Text style={styles.orderSummaryText}>{acceptedOrders?.length || 0} Pendentes</Text>
            </View>
            <View style={styles.orderSummaryItem}>
              <FontAwesome5 name="times-circle" size={20} color="#EF4444" />
              <Text style={styles.orderSummaryText}>0 Cancelados</Text>
            </View>
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 name="refresh" size={20} color="#FF6B35" />
              <Text style={styles.actionButtonText}>Atualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 name="map-marked-alt" size={20} color="#FF6B35" />
              <Text style={styles.actionButtonText}>Localização</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 name="bell" size={20} color="#FF6B35" />
              <Text style={styles.actionButtonText}>Notificações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  courierPhone: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 14,
    color: '#888',
  },
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  statusContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    gap: 8,
  },
  statusButtonActive: {
    backgroundColor: '#FF6B35',
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  ordersSection: {
    padding: 20,
  },
  ordersSummary: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  orderSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  orderSummaryText: {
    color: '#FFF',
    fontSize: 14,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});