/**
 * src/routes/Auth.Routes.js
 * Rotas de autenticação do CourierApp
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignIn from '../pages/Auth/SignIn';
import SignUp from '../pages/Auth/SignUp';
import Reset from '../pages/Auth/Reset';

const AuthStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 0,
  },
  headerTintColor: '#FFF',
  headerBackTitleVisible: false,
  headerTitle: 'Voltar',
};

export default function AuthRoutes() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={screenOptions}
      />
      <AuthStack.Screen
        name="Reset"
        component={Reset}
        options={screenOptions}
      />
    </AuthStack.Navigator>
  )
}