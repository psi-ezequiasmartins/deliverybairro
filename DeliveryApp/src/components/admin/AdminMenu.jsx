import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../style/admin-menu.css';

export default function AdminMenu() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <div className="admin-menu">
      <div className="admin-menu-header">
        <img src="/images/logo.png" alt="DeliveryBairro" className="admin-menu-logo" />
        <h2>Painel Admin</h2>
      </div>

      <div className="admin-menu-user">
        <div className="admin-avatar">
          <i className="fas fa-user-shield"></i>
        </div>
        <div className="admin-user-info">
          <strong>{adminUser.NOME || 'Administrador'}</strong>
          <span className={`role-badge role-${adminUser.ROLE?.toLowerCase()}`}>
            {adminUser.ROLE || 'ADMIN'}
          </span>
        </div>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <i className="fas fa-chart-line"></i>
          Dashboard
        </NavLink>

        <div className="nav-section">
          <h3>Gerenciamento</h3>

          <NavLink to="/admin/deliveries" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-store"></i>
            Deliveries
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-users"></i>
            Usuários
          </NavLink>

          <NavLink to="/admin/couriers" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-motorcycle"></i>
            Entregadores
          </NavLink>

          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-shopping-bag"></i>
            Pedidos
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Configurações</h3>

          <NavLink to="/admin/taxas" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-cog"></i>
            Taxas do Sistema
          </NavLink>

          <NavLink to="/admin/exceptions" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-tags"></i>
            Exceções de Taxas
          </NavLink>

          <NavLink to="/admin/admins" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-user-cog"></i>
            Administradores
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Relatórios</h3>

          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-file-alt"></i>
            Relatórios
          </NavLink>

          <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'active' : ''}>
            <i className="fas fa-history"></i>
            Logs do Sistema
          </NavLink>
        </div>
      </nav>

      <div className="admin-menu-footer">
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Sair
        </button>
      </div>
    </div>
  );
}
