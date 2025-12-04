/**
 * src/routes/App.Routes.js
 * Navegação principal do CourierApp após autenticação
 */

import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Pages imports
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/Orders/OrderDetails';
import Navigation from '../pages/Navigation';
import Profile from '../pages/Profile';

// Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  const { t } = useTranslation();

  // Stack Navigator para Orders (lista + detalhes)
  function OrdersStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#FFF',
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="OrdersList"
          component={Orders}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetails}
          options={{ title: 'Detalhes do Pedido' }}
        />
        <Stack.Screen
          name="Navigation"
          component={Navigation}
          options={{ title: 'Navegação' }}
        />
      </Stack.Navigator>
    );
  }

  // Função para definir títulos do header baseado na rota
  function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'DashboardTab';
    switch (routeName) {
      case 'DashboardTab': return t('dashboard.title');
      case 'OrdersTab': return t('orders.title');
      case 'ProfileTab': return t('common.profile');
      default: return t('app.name');
    }
  }

  // Tab Navigator principal
  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let IconComponent = FontAwesome5;

            switch (route.name) {
              case 'DashboardTab':
                iconName = 'chart-line';
                break;
              case 'OrdersTab':
                iconName = 'list-alt';
                break;
              case 'ProfileTab':
                IconComponent = Ionicons;
                iconName = 'person';
                break;
            }

            return <IconComponent name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
            height: Platform.OS === 'ios' ? 90 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#1a1a1a',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen
          name="DashboardTab"
          component={Dashboard}
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen
          name="OrdersTab"
          component={OrdersStack}
          options={({ route }) => ({
            title: getHeaderTitle(route),
            tabBarLabel: 'Pedidos',
          })}
        />
        <Tab.Screen
          name="ProfileTab"
          component={Profile}
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
          }}
        />
      </Tab.Navigator>
    );
  }

  return <MainTabs />;
}