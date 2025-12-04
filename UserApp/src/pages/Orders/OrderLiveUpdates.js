/**
* src/pages/Orders/OrderLiveUpdates.js
* Atualização em tempo real com área de cobertura e rastreamento
*/

import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { Fontisto, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { getCoordinatesFromAddress } from "../../components/gps/useGeolocation";
import {
  calculateDistance,
  DELIVERY_RADIUS_KM
} from "../../utils/geolocation";

import api, { isDevelopment } from "../../config/apiAxios";
import socket from "../../services/socket";
import { joinRoom, leaveRoom } from "../../services/socketRoomManager";

export default function OrderLiveUpdates({ pedido }) {
  const [courier, setCourier] = useState(null);
  const [delivery_coords, setDeliveryCoords] = useState(null);
  const [courier_coords, setCourierCoords] = useState(null);
  const [route_coords, setRouteCoords] = useState([]);
  const [showCoverageArea, setShowCoverageArea] = useState(true);
  const [orderStatus, setOrderStatus] = useState(pedido?.STATUS || 'pending');
  const [estimatedTime, setEstimatedTime] = useState('Calculando...');
  const [distance, setDistance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapRef = useRef(null);
  const locationUpdateInterval = useRef(null);

  const courierId = pedido?.COURIER_ID || 200001;

  useEffect(() => {
    // Configuração inicial
    setCourier(courierId);
    loadInitialData();

    if (!pedido?.PEDIDO_ID) {
      console.warn('⚠️ [OrderLiveUpdates] PEDIDO_ID não disponível');
      return;
    }

    // Log do estado do socket
    console.log('🔌 [WebSocket] Estado da conexão:', {
      connected: socket.connected,
      pedidoId: pedido?.PEDIDO_ID,
      status: pedido?.STATUS
    });

    // Garante conexão ao WebSocket
    if (!socket.connected) {
      console.log('🔌 [OrderLiveUpdates] Socket não conectado, conectando...');
      socket.connect();
    }

    // Entra na sala específica deste pedido
    const orderRoom = `order_${pedido.PEDIDO_ID}`;
    joinRoom(orderRoom, true); // true = aguarda conexão se necessário

    // Inicia atualização em tempo real se há pedido em andamento
    if (pedido?.STATUS && ['accepted', 'picking_up', 'in_delivery'].includes(pedido.STATUS)) {
      startLocationTracking();
    }

    // Listener websocket para atualização de status
    const handleOrderUpdate = (data) => {
      console.log('📡 [WebSocket] Atualização de pedido recebida:', data);
      console.log('📋 [WebSocket] Comparando orderId:', { recebido: data.orderId, esperado: pedido?.PEDIDO_ID });

      if (data.orderId === pedido?.PEDIDO_ID) {
        setOrderStatus(data.status);
        console.log('✅ Status atualizado via WebSocket:', data.status);

        // Reinicia tracking se necessário
        if (['accepted', 'picking_up', 'in_delivery'].includes(data.status)) {
          startLocationTracking();
        } else {
          stopLocationTracking();
        }
      } else {
        console.log('⚠️ [WebSocket] OrderId não corresponde, ignorando atualização');
      }
    };

    socket.on('orderStatusUpdated', handleOrderUpdate);
    console.log('👂 [WebSocket] Listener registrado para orderStatusUpdated');

    return () => {
      socket.off('orderStatusUpdated', handleOrderUpdate);
      console.log('🔇 [WebSocket] Listener removido');

      // Sai da sala ao desmontar componente
      leaveRoom(orderRoom);

      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [pedido?.PEDIDO_ID]); useEffect(() => {
    if (pedido?.STATUS !== orderStatus) {
      setOrderStatus(pedido.STATUS);

      // Reinicia tracking se necessário
      if (['accepted', 'picking_up', 'in_delivery'].includes(pedido.STATUS)) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    }
  }, [pedido?.STATUS]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Coordenadas do delivery
      if (pedido?.DELIVERY_ENDERECO) {
        const coords = await getCoordinatesFromAddress(pedido.DELIVERY_ENDERECO);
        if (coords?.latitude && coords?.longitude) {
          setDeliveryCoords(coords);
        }
      }

      // Localização inicial do entregador (mock para demonstração)
      const initialCourierCoords = {
        latitude: -19.82628,
        longitude: -43.98033,
      };
      setCourierCoords(initialCourierCoords);

      // Calcula distância inicial se temos ambas as coordenadas
      if (delivery_coords && initialCourierCoords) {
        const dist = calculateDistance(
          initialCourierCoords.latitude,
          initialCourierCoords.longitude,
          delivery_coords.latitude,
          delivery_coords.longitude
        );
        setDistance(dist.toFixed(1));
      }

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }

    // Atualiza localização a cada 10 segundos
    locationUpdateInterval.current = setInterval(() => {
      updateCourierLocation();
    }, 10000);
  };

  const stopLocationTracking = () => {
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
    }
  };

  const updateCourierLocation = async () => {
    try {
      if (!pedido?.ORDER_ID || !pedido?.COURIER_ID) return;

      // Busca localização atualizada do entregador
      const response = await api.get(`/api/orders/${pedido.ORDER_ID}/tracking`);

      if (response.data?.latitude && response.data?.longitude) {
        const newCourierCoords = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };

        setCourierCoords(newCourierCoords);

        // Atualiza distância
        if (delivery_coords) {
          const dist = calculateDistance(
            newCourierCoords.latitude,
            newCourierCoords.longitude,
            delivery_coords.latitude,
            delivery_coords.longitude
          );
          setDistance(dist.toFixed(1));

          // Estima tempo (assumindo velocidade média de 30km/h)
          const estimatedMinutes = Math.round((dist / 30) * 60);
          setEstimatedTime(`${estimatedMinutes} min`);
        }

        // Atualiza rota se há coordenadas de pickup e delivery
        updateRoute(newCourierCoords);
      }
    } catch (error) {
      console.error('Erro ao atualizar localização do entregador:', error);
    }
  };

  const updateRoute = (courierCoords) => {
    if (!courierCoords || !delivery_coords) return;

    // Rota simples - em produção, usar Google Directions API
    const route = [
      courierCoords,
      delivery_coords
    ];

    setRouteCoords(route);
  };

  const centerMapOnCourier = () => {
    if (courier_coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: courier_coords.latitude,
        longitude: courier_coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const fitMarkersToMap = () => {
    if (mapRef.current && courier_coords && delivery_coords) {
      mapRef.current.fitToCoordinates(
        [courier_coords, delivery_coords],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  };

  const toggleCoverageArea = () => {
    setShowCoverageArea(!showCoverageArea);
  };

  const getStatusInfo = () => {
    switch (orderStatus) {
      case 'accepted':
        return { text: 'Pedido Aceito', color: '#3B82F6', icon: 'check-circle' };
      case 'picking_up':
        return { text: 'Coletando Pedido', color: '#F59E0B', icon: 'clock-o' };
      case 'in_delivery':
        return { text: 'Em Entrega', color: '#FF6B35', icon: 'truck' };
      case 'delivered':
        return { text: 'Entregue', color: '#22C55E', icon: 'check' };
      default:
        return { text: 'Preparando', color: '#6B7280', icon: 'clock-o' };
    }
  };

  // Calcula região do mapa baseada nos pontos disponíveis
  const getInitialRegion = () => {
    if (pedido?.LATITUDE && pedido?.LONGITUDE) {
      return {
        latitude: parseFloat(pedido.LATITUDE),
        longitude: parseFloat(pedido.LONGITUDE),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      };
    } else if (delivery_coords?.latitude && delivery_coords?.longitude) {
      return {
        latitude: delivery_coords.latitude,
        longitude: delivery_coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      };
    } else {
      // Fallback para Belo Horizonte
      return {
        latitude: -19.82277,
        longitude: -43.98033,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      };
    }
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Carregando rastreamento...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Header com status */}
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <MaterialIcons name={statusInfo.icon} size={20} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          {distance && (
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceText}>
                {distance}km • {estimatedTime}
              </Text>
            </View>
          )}
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsTraffic={false}
          showsBuildings={false}
          showsPointsOfInterest={false}
          mapType="standard"
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Entregador */}
          {courier && courier_coords?.latitude && courier_coords?.longitude && (
            <Marker
              coordinate={{
                latitude: courier_coords.latitude,
                longitude: courier_coords.longitude,
              }}
              title="Entregador"
              description={`Pedido #${pedido?.ORDER_ID || 'N/A'}`}
            >
              <View style={styles.courierMarker}>
                <Fontisto name="motorcycle" size={28} color="white" />
              </View>
            </Marker>
          )}

          {/* Delivery/Restaurante */}
          {delivery_coords?.latitude && delivery_coords?.longitude && (
            <Marker
              coordinate={{
                latitude: delivery_coords.latitude,
                longitude: delivery_coords.longitude,
              }}
              title={pedido?.DELIVERY_NOME || "Delivery"}
              description="Ponto de coleta"
            >
              <View style={styles.deliveryMarker}>
                <AntDesign name="pushpin" size={28} color="white" />
              </View>
            </Marker>
          )}

          {/* Destino de entrega */}
          {pedido?.LATITUDE && pedido?.LONGITUDE && (
            <Marker
              coordinate={{
                latitude: parseFloat(pedido.LATITUDE),
                longitude: parseFloat(pedido.LONGITUDE)
              }}
              title={pedido?.CLIENTE_NOME || "Cliente"}
              description="Localização de entrega"
            >
              <View style={styles.customerMarker}>
                <Fontisto name="map-marker-alt" size={28} color="white" />
              </View>
            </Marker>
          )}

          {/* Área de cobertura */}
          {showCoverageArea && delivery_coords && (
            <Circle
              center={delivery_coords}
              radius={DELIVERY_RADIUS_KM * 1000} // Converter para metros
              fillColor="rgba(255, 107, 53, 0.1)"
              strokeColor="rgba(255, 107, 53, 0.3)"
              strokeWidth={2}
            />
          )}

          {/* Rota do entregador */}
          {route_coords.length > 1 && (
            <Polyline
              coordinates={route_coords}
              strokeWidth={4}
              strokeColor="#FF6B35"
              lineDashPattern={[5, 10]}
            />
          )}
        </MapView>

        {/* Controles do mapa */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerMapOnCourier}
          >
            <MaterialIcons name="my-location" size={24} color="#FF6B35" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={fitMarkersToMap}
          >
            <MaterialIcons name="zoom-out-map" size={24} color="#FF6B35" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, showCoverageArea && styles.activeControl]}
            onPress={toggleCoverageArea}
          >
            <MaterialIcons name="radio-button-checked" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  distanceInfo: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  activeControl: {
    backgroundColor: '#FFF3E8',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  courierMarker: {
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deliveryMarker: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  customerMarker: {
    backgroundColor: '#22C55E',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
