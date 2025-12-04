/**
 * src/rotas.jsx
 */

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/** rotas */

import Site from './site/index.jsx';

import Login from "./app/login/login.jsx";
import PreCadastro from "./site/pages/pre-cadastro.jsx";
import ValidarCadastroDelivery from "./app/login/validar.jsx";
import Reset from "./app/login/reset.jsx";

import Pedidos from "./app/menu/pedidos";
import Produtos from "./app/menu/produtos/index.jsx";
import Extras from "./app/menu/extras/index.jsx";
import Delivery from "./app/menu/delivery/index.jsx";

// Admin Routes
import AdminLogin from "./app/admin/login/index.jsx";
import AdminDashboard from "./app/admin/dashboard/index.jsx";
import AdminTaxas from "./app/admin/taxas/index.jsx";
import AdminDeliveries from "./app/admin/deliveries/index.jsx";
import AdminUsers from "./app/admin/users/index.jsx";
import AdminCouriers from "./app/admin/couriers/index.jsx";
import AdminOrders from "./app/admin/orders/index.jsx";

import SecureRoute from "./components/route/protected.js";

export default function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path='/app/login' element={<Login />} />
        <Route path='/pre-cadastro' element={<PreCadastro />} />
        <Route path='/app/login/reset' element={<Reset />} />
        <Route path='/app/login/validar' element={<ValidarCadastroDelivery />} />
        {/* SecureRoutes */}
        {/* <Route path="/app/dashboard" element={
              <SecureRoute>
                  <Dashboard />
              </SecureRoute>
          } />   */}
        <Route path="/app/pedidos" element={
          <SecureRoute>
            <Pedidos />
          </SecureRoute>
        } />
        <Route path="/app/produtos" element={
          <SecureRoute>
            <Produtos />
          </SecureRoute>
        } />
        <Route path="/app/extras" element={
          <SecureRoute>
            <Extras />
          </SecureRoute>
        } />
        <Route path="/app/delivery" element={
          <SecureRoute>
            <Delivery />
          </SecureRoute>
        } />
        {/* SecureRoutes */}

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/deliveries" element={<AdminDeliveries />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/couriers" element={<AdminCouriers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/taxas" element={<AdminTaxas />} />
        {/* Admin Routes */}
      </Routes>
    </BrowserRouter>
  )
}
