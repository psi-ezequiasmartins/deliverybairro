/**
 * src/pages/Deliveries/index.js
 */

import { useState, useEffect } from 'react';
import SafeAreaViewAndroid from 'react-native-safe-area-view';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Fontisto, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { isDevelopment } from '../../config/apiAxios';

import Header from '../../components/Header';
import StarRating from '../../components/StarRating';
import NoDeliveriesInArea from '../../components/NoDeliveriesInArea';
import { isWithinDeliveryRadius } from '../../utils/geolocation';
import api from '../../config/apiAxios';

export default function Deliveries({ route }) {
  const navigation = useNavigation();
  const [deliveries, setDeliveries] = useState(null);
  const [filteredDeliveries, setFilteredDeliveries] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    async function requestLocationAndLoadDeliveries() {
      try {
        // Solicita permissão de localização
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão Necessária',
            'Para mostrar apenas deliveries em sua área de cobertura (3km), precisamos acessar sua localização.',
            [
              { text: 'Continuar sem localização', onPress: () => loadDeliveriesWithoutLocation() },
              { text: 'Tentar novamente', onPress: () => requestLocationAndLoadDeliveries() }
            ]
          );
          return;
        }

        // Obtém localização atual
        setLocationLoading(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(currentLocation);
        await loadDeliveries(currentLocation);

      } catch (error) {
        console.error('Erro ao obter localização:', error);
        Alert.alert(
          'Erro de Localização',
          'Não foi possível obter sua localização. Mostrando todos os deliveries.',
          [{ text: 'OK', onPress: () => loadDeliveriesWithoutLocation() }]
        );
      } finally {
        setLocationLoading(false);
      }
    }

    async function loadDeliveriesWithoutLocation() {
      setLocationLoading(false);
      await loadDeliveries(null);
    }

    async function loadDeliveries(currentLocation = null) {
      setLoading(true);
      try {
        let response;
        if (route.params.id === 101) {
          response = await api.get('/user-app/listar/deliveries');
        } else {
          response = await api.get(`/user-app/listar/deliveries/categoria/${route.params.id}`);
        }

        const allDeliveries = response?.data || [];
        setDeliveries(allDeliveries);

        // Filtra deliveries por área de cobertura se há localização
        if (currentLocation && allDeliveries.length > 0) {
          const deliveriesInRange = [];

          for (const delivery of allDeliveries) {
            if (delivery.LATITUDE && delivery.LONGITUDE) {
              const deliveryLocation = {
                latitude: parseFloat(delivery.LATITUDE),
                longitude: parseFloat(delivery.LONGITUDE)
              };

              const result = isWithinDeliveryRadius(currentLocation, deliveryLocation);
              if (result.isWithinRadius) {
                deliveriesInRange.push(delivery);
              }
            }
          }

          setFilteredDeliveries(deliveriesInRange);

          if (isDevelopment) {
            console.log(`Deliveries na área (3km): ${deliveriesInRange.length} de ${allDeliveries.length}`);
          }
        } else {
          setFilteredDeliveries(allDeliveries);
        }

      } catch (error) {
        console.error("Erro ao carregar deliveries: ", error);
        setDeliveries([]);
        setFilteredDeliveries([]);
      } finally {
        setLoading(false);
      }
    }

    requestLocationAndLoadDeliveries();
  }, [route.params.id]);

  function LinkTo(page, p) {
    navigation.navigate(page, p);
  }

  if (loading || locationLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size={80} color="orange" />
        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>
          {locationLoading ? 'Obtendo sua localização...' : 'Carregando deliveries...'}
        </Text>
      </View>
    );
  }

  // Renderiza componente de sugestão se não há deliveries na área
  const hasDeliveriesInArea = filteredDeliveries && filteredDeliveries.length > 0;
  const hasUserLocation = userLocation !== null;

  if (!hasDeliveriesInArea && hasUserLocation) {
    return (
      <SafeAreaViewAndroid style={{ flex: 1 }}>
        <View style={styles.container}>
          <Header />
          <NoDeliveriesInArea
            userLocation={userLocation}
            categoryName={route.params.categoria}
          />
        </View>
      </SafeAreaViewAndroid>
    );
  }

  return (
    <SafeAreaViewAndroid style={{ flex: 1 }}>
      <View style={styles.container}>
        <Header />
        <View style={styles.headerContainer}>
          <Text style={styles.categoria_title}>{route.params.categoria}</Text>
          {hasUserLocation && (
            <View style={styles.radiusInfo}>
              <MaterialIcons name="location-on" size={16} color="#22C55E" />
              <Text style={styles.radiusText}>Raio de 3km</Text>
            </View>
          )}
        </View>
        <FlatList
          style={{ marginTop: 10, marginBottom: 100, flex: 1 }}
          data={filteredDeliveries}
          keyExtractor={(item) => String(item.DELIVERY_ID)}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>
              {hasUserLocation
                ? 'Nenhum delivery encontrado em sua região (3km).'
                : 'Ainda não há deliveries nesta categoria.'}
            </Text>
          )}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => LinkTo("DeliveryInfo", { id: item?.DELIVERY_ID })}>
              <Text style={styles.delivery_title}>{item?.DELIVERY_NOME} - {item?.DELIVERY_ID}</Text>
              <Image style={styles.imagem} source={{ uri: (item?.URL_IMAGEM === "" ? "https://via.placeholder.com/540x300" : item?.URL_IMAGEM) }} />
              <View style={styles.row}>
                <View style={styles.infoContainer}>
                  <View style={styles.infoItem}>
                    <Fontisto name="motorcycle" size={14} color="#666" />
                    <Text style={styles.infoText}>
                      R$ {parseFloat(item?.TAXA_ENTREGA).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="access-time" size={14} color="#666" />
                    <Text style={styles.infoText}>
                      {item?.MIN_DELIVERY_TIME} a {item?.MAX_DELIVERY_TIME} min
                    </Text>
                  </View>
                </View>
                <StarRating
                  rating={item?.RATING}
                  size={12}
                  showNumber={true}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaViewAndroid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 5,
  },
  label: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#000',
  },
  imagem: {
    width: "100%",
    aspectRatio: 5 / 3,
    marginBottom: 5,
  },
  flatlist: {
    flex: 1,
    marginTop: 10,
    marginBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  categoria_title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "left",
    flex: 1,
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  radiusText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
    marginLeft: 4,
  },
  delivery_title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    color: "#000", // azul marinho
    fontSize: 14,
    marginTop: 2,
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  infoText: {
    color: "#666",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },
  empty: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10
  },
})
