/**
 * src/routes/index.js
 * Sistema de rotas principal do CourierApp
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AuthRoutes from './Auth.Routes';
import AppRoutes from './App.Routes';

function Routes() {
  const { authenticated } = useContext(AuthContext);

  return authenticated ? <AppRoutes /> : <AuthRoutes />;
}

export default Routes;