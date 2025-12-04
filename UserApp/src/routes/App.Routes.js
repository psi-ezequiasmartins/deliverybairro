/**
 * src/routes/App.Routes.js
 * Navegação reorganizada para melhor UX e compatibilidade Android 15
 */

import React from 'react';
import { Platform, Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { FontAwesome5, Entypo, Fontisto } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Pages imports
import Groups from '../pages/Groups';
import Deliveries from '../pages/Deliveries';
import DeliveryInfo from '../pages/Deliveries/DeliveryInfo';
import DeliveryItemToSelect from '../pages/Deliveries/DeliveryItemToSelect';
import Cart from '../pages/Cart';
import Orders from '../pages/Orders';
import Profile from '../pages/User';

// Components
import SideBar from '../components/SideBar';
import OrderDetailsNavigator from '../pages/Orders/OrderDetailsNavigator';

// Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export default function AppRoutes() {
  const { t } = useTranslation();

  // Função para definir títulos do header baseado na rota
  function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'GroupsTab';
    switch (routeName) {
      case 'GroupsTab': return t('headers.groups');
      case 'OrdersTab': return t('headers.orders');
      case 'ProfileTab': return t('headers.profile');
      case 'Groups': return t('headers.groups');
      case 'Deliveries': return t('headers.deliveriesList');
      case 'DeliveryInfo': return t('headers.deliveryInfo');
      case 'Cart': return t('headers.cart');
      case 'OrderDetails': return t('headers.orderDetails');
      default: return t('headers.groups');
    }
  }

  // 1. FLUXO DE PEDIDOS - Stack Navigator
  function OrderFlowStack() {
    return (
      <Stack.Navigator
        initialRouteName="Groups"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF' },
        }}
      >
        <Stack.Screen
          name="Groups"
          component={Groups}
          options={{ title: t('headers.groups') }}
        />
        <Stack.Screen
          name="Deliveries"
          component={Deliveries}
          options={{ title: t('headers.deliveriesList') }}
        />
        <Stack.Screen
          name="DeliveryInfo"
          component={DeliveryInfo}
          options={{ title: t('headers.deliveryInfo') }}
        />
        <Stack.Screen
          name="DeliveryItemToSelect"
          component={DeliveryItemToSelect}
          options={{ title: t('headers.selectItem') }}
        />
        <Stack.Screen
          name="Cart"
          component={Cart}
          options={{ title: t('headers.cart') }}
        />
      </Stack.Navigator>
    );
  }

  // 2. FLUXO DE PEDIDOS (Orders) - Stack Navigator
  function OrdersFlowStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF' },
        }}
      >
        <Stack.Screen
          name="OrdersList"
          component={Orders}
          options={{ title: t('headers.orders') }}
        />
        <Stack.Screen
          name="OrderDetailsNavigator"
          component={OrderDetailsNavigator}
          options={{ title: t('headers.orderDetails') }}
        />
      </Stack.Navigator>
    );
  }

  // 3. MENU PRINCIPAL - Bottom Tab Navigator  
  function MainTabNavigator() {
    const insets = useSafeAreaInsets();
    const { height: screenHeight } = Dimensions.get('window');
    // Calcular altura dinâmica do TabBar baseada no SafeArea
    const tabBarHeight = Platform.OS === 'android'
      ? Math.max(60, 75 - insets.bottom) // Mínimo 60px, máximo 75px
      : 90;
    const tabBarPaddingBottom = Platform.OS === 'android'
      ? Math.max(5, insets.bottom > 0 ? 8 : 12) // Ajusta baseado no SafeArea
      : 10;
    return (
      <Tab.Navigator
        initialRouteName="GroupsTab"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom, // Usar insets do SafeArea
            left: 0,
            right: 0,
            height: tabBarHeight,
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            paddingBottom: tabBarPaddingBottom,
            paddingTop: 8,
            elevation: Platform.OS === 'android' ? 8 : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#5D5D5D',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: Platform.OS === 'android' ? 2 : 4
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          tabBarHideOnKeyboard: Platform.OS === 'android',
          // Remove configuração manual de SafeArea (agora é automático)
        }}
      >
        <Tab.Screen
          name="GroupsTab"
          component={OrderFlowStack}
          options={{
            title: t('tabs.deliveries'),
            tabBarLabel: t('tabs.deliveries'),
            tabBarIcon: ({ focused, size }) => (
              <Entypo
                name="shop"
                size={focused ? size + 2 : size}
                color={focused ? '#000' : '#5D5D5D'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={OrdersFlowStack}
          options={{
            title: t('tabs.orders'),
            tabBarLabel: t('tabs.orders'),
            tabBarIcon: ({ focused, size }) => (
              <Fontisto
                name="shopping-bag-1"
                size={focused ? size + 1 : size - 1}
                color={focused ? '#000' : '#5D5D5D'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={Profile}
          options={{
            title: t('tabs.profile'),
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ focused, size }) => (
              <FontAwesome5
                name="user-cog"
                size={focused ? size + 1 : size - 1}
                color={focused ? '#000' : '#5D5D5D'}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // 4. DRAWER PRINCIPAL - SideBar + Header sempre visível
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          width: '90%', // Aumentado ligeiramente para melhor UX
          marginTop: Platform.OS === 'android' ? 80 : 35, // Ajuste para Android com StatusBar
          marginBottom: Platform.OS === 'android' ? 50 : 35,
          borderTopRightRadius: 25,
          borderBottomRightRadius: 25,
        },
        drawerLabelStyle: {
          color: '#000',
          fontWeight: 'bold',
          fontSize: 16,
        },
        drawerItemStyle: {
          marginVertical: 5,
          borderRadius: 10,
        },
        drawerInactiveBackgroundColor: 'transparent',
        // Header sempre visível
        headerStyle: {
          borderBottomWidth: 0,
          elevation: 4,
          shadowOpacity: 0.1,
          height: Platform.OS === 'android' ? 80 : 80, // Altura maior para Android
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#000',
        },
        headerTitleAlign: 'center',
        // SafeArea para status bar
        safeAreaInsets: {
          top: Platform.OS === 'android' ? 24 : undefined // Espaço para StatusBar
        },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={MainTabNavigator}
        options={({ route }) => ({
          headerTitle: getHeaderTitle(route),
          // Ícone do menu hambúrguer sempre visível
          headerLeft: undefined, // Usa o padrão do drawer
          // Botão do carrinho sempre visível (pode ser implementado no Header component)
          headerRight: undefined, // O Header component já gerencia isso
        })}
      />
    </Drawer.Navigator>
  );
}
