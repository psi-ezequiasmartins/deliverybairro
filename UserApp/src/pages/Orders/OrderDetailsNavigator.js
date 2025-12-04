/**
* src/pages/Pedidos/OrderDetailsNavigator.js
*/

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import api, { isDevelopment } from '../../config/apiAxios';

import OrderDetails from "./OrderDetails";
import OrderLiveUpdates from "./OrderLiveUpdates";
import OrderPayment from "./OrderPayment";

const Tab = createMaterialTopTabNavigator();

export default function OrderDetailsNavigator({ route }) {
  const [pedido, setPedido] = useState(null);
  const { orderId } = route.params || {};

  useEffect(() => {
    async function fetchPedido() {
      if (!orderId) return;

      try {
        const response = await api.get(`/user-app/pedido/${orderId}`);
        setPedido(response?.data);
      } catch (error) {
        console.error('Erro ao carregar pedido:', error);
        if (isDevelopment) {
          console.error('OrderId:', orderId, 'Error details:', error.message);
        }
      }
    }
    fetchPedido();
  }, [orderId]);

  if (!pedido) {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator size={80} color="orange" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="DETALHES"
      screenOptions={{
        tabIndicatorStyle: {
          backgroundColor: 'transparent', // Remove o indicador
          height: 0
        }
      }}
    >
      <Tab.Screen
        name="DETALHES"
        screenOptions={{
          tabIndicatorStyle: {
            backgroundColor: 'transparent', // Remove o indicador
            height: 0
          }
        }}
        children={() => <OrderDetails pedido={pedido} />}
      />
      <Tab.Screen
        name="LOCALIZAÇÃO"
        screenOptions={{
          tabIndicatorStyle: {
            backgroundColor: 'transparent', // Remove o indicador
            height: 0
          }
        }}
        children={() => <OrderLiveUpdates pedido={pedido} />}
      />
      <Tab.Screen
        name="PAGAMENTO"
        screenOptions={{
          tabIndicatorStyle: {
            backgroundColor: 'transparent', // Remove o indicador
            height: 0
          }
        }}
        children={() => <OrderPayment pedido={pedido} />}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    position: 'absolute',
    backgroundColor: '#000',
    opacity: 0.7,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
