/**
 * src/utils/geolocation.js
 * Utilitários para cálculos de distância e área de cobertura
 */

import * as Location from 'expo-location';
import Logger from './logger';

// Constantes de configuração
export const DELIVERY_RADIUS_KM = 3; // Raio máximo de atuação em km
export const EARTH_RADIUS_KM = 6371; // Raio da Terra em km

/**
 * Calcula a distância entre duas coordenadas usando fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
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

/**
 * Converte graus para radianos
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Verifica se uma coordenada está dentro do raio de cobertura
 * @param {Object} centerPoint - Ponto central {latitude, longitude}
 * @param {Object} targetPoint - Ponto a verificar {latitude, longitude}
 * @param {number} radiusKm - Raio em km (padrão: 3km)
 * @returns {Object} {isWithinRadius: boolean, distance: number}
 */
export function isWithinDeliveryRadius(centerPoint, targetPoint, radiusKm = DELIVERY_RADIUS_KM) {
  if (!centerPoint?.latitude || !centerPoint?.longitude ||
    !targetPoint?.latitude || !targetPoint?.longitude) {
    return { isWithinRadius: false, distance: null, error: 'Coordenadas inválidas' };
  }

  const distance = calculateDistance(
    centerPoint.latitude,
    centerPoint.longitude,
    targetPoint.latitude,
    targetPoint.longitude
  );

  return {
    isWithinRadius: distance <= radiusKm,
    distance: Number(distance.toFixed(2)),
    error: null
  };
}

/**
 * Obtém coordenadas a partir de endereço usando geocoding
 * @param {string} address - Endereço para geocoding
 * @returns {Object|null} {latitude, longitude} ou null
 */
export async function getCoordinatesFromAddress(address) {
  try {
    if (!address || address.trim() === '') {
      throw new Error('Endereço inválido');
    }

    const geocodeResult = await Location.geocodeAsync(address);

    if (geocodeResult && geocodeResult.length > 0) {
      const { latitude, longitude } = geocodeResult[0];
      Logger.info('Geolocation', 'Coordenadas obtidas', { address, latitude, longitude });
      return { latitude, longitude };
    }

    throw new Error('Endereço não encontrado');
  } catch (error) {
    Logger.error('Geolocation', 'Erro ao obter coordenadas', { error: error.message, address });
    return null;
  }
}

/**
 * Obtém localização atual do usuário
 * @returns {Object|null} {latitude, longitude} ou null
 */
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Permissão de localização negada');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    Logger.info('Geolocation', 'Localização atual obtida', coords);
    return coords;
  } catch (error) {
    Logger.error('Geolocation', 'Erro ao obter localização atual', { error: error.message });
    return null;
  }
}

/**
 * Valida se um delivery pode atender determinada área
 * @param {Object} deliveryCoords - Coordenadas do delivery
 * @param {Object} customerCoords - Coordenadas do cliente
 * @returns {Object} Resultado da validação
 */
export function validateDeliveryArea(deliveryCoords, customerCoords) {
  const result = isWithinDeliveryRadius(deliveryCoords, customerCoords);

  return {
    ...result,
    canDeliver: result.isWithinRadius,
    message: result.isWithinRadius
      ? `Área de entrega disponível (${result.distance}km)`
      : `Fora da área de entrega. Distância: ${result.distance}km (máx. ${DELIVERY_RADIUS_KM}km)`
  };
}

/**
 * Valida se um entregador pode aceitar um pedido baseado na distância
 * @param {Object} courierCoords - Coordenadas do entregador
 * @param {Object} pickupCoords - Coordenadas do local de coleta
 * @param {Object} deliveryCoords - Coordenadas de entrega
 * @returns {Object} Resultado da validação
 */
export function validateCourierRange(courierCoords, pickupCoords, deliveryCoords) {
  // Verifica distância até o local de coleta
  const pickupValidation = isWithinDeliveryRadius(courierCoords, pickupCoords);

  // Verifica distância total da rota (coleta + entrega)
  let totalDistance = pickupValidation.distance;
  if (pickupCoords && deliveryCoords) {
    const deliveryDistance = calculateDistance(
      pickupCoords.latitude,
      pickupCoords.longitude,
      deliveryCoords.latitude,
      deliveryCoords.longitude
    );
    totalDistance += deliveryDistance;
  }

  const canAccept = pickupValidation.isWithinRadius && totalDistance <= DELIVERY_RADIUS_KM * 2; // Permite até 6km total

  return {
    canAccept,
    pickupDistance: pickupValidation.distance,
    totalDistance: Number(totalDistance.toFixed(2)),
    message: canAccept
      ? `Pedido dentro da área de atuação`
      : `Pedido fora da área de atuação. Distância total: ${totalDistance.toFixed(1)}km`
  };
}

/**
 * Gera coordenadas de círculo para desenhar área de cobertura no mapa
 * @param {Object} center - Centro do círculo {latitude, longitude}
 * @param {number} radiusKm - Raio em quilômetros
 * @param {number} points - Número de pontos do círculo (padrão: 64)
 * @returns {Array} Array de coordenadas {latitude, longitude}
 */
export function generateCircleCoordinates(center, radiusKm = DELIVERY_RADIUS_KM, points = 64) {
  if (!center?.latitude || !center?.longitude) {
    return [];
  }

  const coordinates = [];
  const radiusInDegrees = radiusKm / 111.32; // Aproximação: 1 grau ≈ 111.32 km

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360 / points) * (Math.PI / 180);
    const latitude = center.latitude + (radiusInDegrees * Math.cos(angle));
    const longitude = center.longitude + (radiusInDegrees * Math.sin(angle));

    coordinates.push({ latitude, longitude });
  }

  return coordinates;
}