/**
 * src/pages/Navigation/index.js
 * Tela de navegação simplificada sem mapas nativos
 */

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Linking,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderContext } from '../../contexts/OrderContext';
import Logger from '../../utils/logger';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function Navigation({ route, navigation }) {
  const { orderId, order } = route.params;
  const { t } = useTranslation();
  const { updateDeliveryLocation } = useContext(OrderContext);

  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    parseDestinationAddress();
  }, []);

  useEffect(() => {
    let locationSubscription;

    if (isNavigating && location) {
      // Atualiza localização a cada 10 segundos durante navegação
      locationSubscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 50, // 50 metros
        },
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);

          // Atualiza localização no backend
          updateDeliveryLocation(orderId, newLocation);
        }
      );
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isNavigating, location]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir o acesso à localização para usar a navegação.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      Logger.error('Navigation', 'Erro ao obter localização', { error: error.message });
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const parseDestinationAddress = () => {
    if (order?.DELIVERY_ADDRESS) {
      // Aqui você pode usar um serviço de geocodificação para converter endereço em coordenadas
      // Por agora, vamos usar coordenadas mock ou extrair se disponíveis
      setDestination({
        latitude: order.DELIVERY_LATITUDE || -23.550520, // Coordenadas de São Paulo como fallback
        longitude: order.DELIVERY_LONGITUDE || -46.633309,
        address: order.DELIVERY_ADDRESS
      });
    }
  };

  const getDirections = async () => {
    if (!location || !destination) {
      Alert.alert('Erro', 'Localização ou destino não disponível');
      return;
    }

    try {
      // Aqui você integraria com Google Directions API
      // Por agora, vamos simular uma rota
      const mockRoute = [
        location,
        {
          latitude: (location.latitude + destination.latitude) / 2,
          longitude: (location.longitude + destination.longitude) / 2,
        },
        destination,
      ];

      setRouteCoordinates(mockRoute);
      setDistance('2.5 km');
      setDuration('8 min');
      setIsNavigating(true);

      Logger.info('Navigation', 'Navegação iniciada', {
        from: location,
        to: destination,
        orderId
      });
    } catch (error) {
      Logger.error('Navigation', 'Erro ao obter direções', { error: error.message });
      Alert.alert('Erro', 'Não foi possível calcular a rota');
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setRouteCoordinates([]);
    Alert.alert('Navegação', 'Navegação interrompida');
  };

  const openExternalMaps = () => {
    const address = encodeURIComponent(destination?.address || '');
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    Logger.info('Navigation', 'Abrindo app externo de mapas', { url });
  };

  const recalculateRoute = () => {
    if (location && destination) {
      getDirections();
    }
  };

  // Função para abrir no Google Maps
  const openInGoogleMaps = () => {
    if (!destination) return;

    const url = Platform.select({
      ios: `maps:0,0?q=${destination.latitude},${destination.longitude}`,
      android: `geo:0,0?q=${destination.latitude},${destination.longitude}`
    });

    Linking.openURL(url).catch(() => {
      const webUrl = `https://maps.google.com/?q=${destination.latitude},${destination.longitude}`;
      Linking.openURL(webUrl);
    });
  };

  // Função para abrir no Waze
  const openInWaze = () => {
    if (!destination) return;

    const url = `waze://?ll=${destination.latitude},${destination.longitude}&navigate=yes`;

    Linking.openURL(url).catch(() => {
      const webUrl = `https://waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes`;
      Linking.openURL(webUrl);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com informações do pedido */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navegação</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Card com informações da entrega */}
      <ScrollView style={styles.content}>
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <FontAwesome5 name="clipboard-list" size={20} color="#FF6B35" />
            <Text style={styles.orderTitle}>Pedido #{orderId}</Text>
          </View>

          <View style={styles.addressSection}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#666" />
            <Text style={styles.addressText}>
              {destination?.address || order?.DELIVERY_ADDRESS || 'Endereço não disponível'}
            </Text>
          </View>

          {location && destination && (
            <View style={styles.routeInfo}>
              <View style={styles.routeDetail}>
                <FontAwesome5 name="route" size={16} color="#FF6B35" />
                <Text style={styles.routeText}>
                  {distance || 'Calculando...'}
                </Text>
              </View>
              <View style={styles.routeDetail}>
                <FontAwesome5 name="clock" size={16} color="#FF6B35" />
                <Text style={styles.routeText}>
                  {duration || 'Calculando...'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Botões de navegação */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, styles.googleMapsButton]}
            onPress={openInGoogleMaps}
          >
            <FontAwesome5 name="google" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>Abrir no Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.wazeButton]}
            onPress={openInWaze}
          >
            <FontAwesome5 name="location-arrow" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>Abrir no Waze</Text>
          </TouchableOpacity>
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Instruções de Entrega</Text>
          <Text style={styles.infoText}>
            • Confirme o endereço com o cliente antes de sair
          </Text>
          <Text style={styles.infoText}>
            • Mantenha contato durante a entrega
          </Text>
          <Text style={styles.infoText}>
            • Confirme a entrega no app após concluir
          </Text>
        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            Alert.alert(
              'Confirmar Entrega',
              'Deseja confirmar a conclusão da entrega?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => navigation.goBack() }
              ]
            );
          }}
        >
          <FontAwesome5 name="check-circle" size={18} color="#FFF" />
          <Text style={styles.completeButtonText}>Confirmar Entrega</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 15,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#CCC',
    lineHeight: 22,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  navigationButtons: {
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 12,
  },
  googleMapsButton: {
    backgroundColor: '#4285F4',
  },
  wazeButton: {
    backgroundColor: '#00D4FF',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
    marginBottom: 6,
  },
  bottomControls: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  completeButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});