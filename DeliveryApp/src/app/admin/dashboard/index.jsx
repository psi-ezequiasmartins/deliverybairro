import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../../components/admin/AdminMenu';
import api from '../../../config/apiAxios';
import '../../../style/admin-dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    deliveries: { total: 0, ativos: 0 },
    usuarios: 0,
    entregadores: 0,
    pedidos: { hoje: 0, semana: 0, mes: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Carregar estatísticas
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await api.get('/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className="admin-layout">
      <AdminMenu />

      <div className="admin-content">
        <div className="dashboard-header">
          <h1>Dashboard Administrativo</h1>
          <p>Bem-vindo(a), <strong>{adminUser.NOME || 'Administrador'}</strong></p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando estatísticas...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-deliveries">
                <div className="stat-icon">
                  <i className="fas fa-store"></i>
                </div>
                <div className="stat-info">
                  <h3>Deliveries</h3>
                  <p className="stat-number">{stats.deliveries.total}</p>
                  <span className="stat-label">{stats.deliveries.ativos} ativos</span>
                </div>
              </div>

              <div className="stat-card stat-users">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>Usuários</h3>
                  <p className="stat-number">{stats.usuarios}</p>
                  <span className="stat-label">Total cadastrados</span>
                </div>
              </div>

              <div className="stat-card stat-couriers">
                <div className="stat-icon">
                  <i className="fas fa-motorcycle"></i>
                </div>
                <div className="stat-info">
                  <h3>Entregadores</h3>
                  <p className="stat-number">{stats.entregadores}</p>
                  <span className="stat-label">Total cadastrados</span>
                </div>
              </div>

              <div className="stat-card stat-orders">
                <div className="stat-icon">
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <div className="stat-info">
                  <h3>Pedidos Hoje</h3>
                  <p className="stat-number">{stats.pedidos.hoje}</p>
                  <span className="stat-label">Realizados hoje</span>
                </div>
              </div>

              <div className="stat-card stat-active">
                <div className="stat-icon">
                  <i className="fas fa-calendar-week"></i>
                </div>
                <div className="stat-info">
                  <h3>Pedidos Semana</h3>
                  <p className="stat-number">{stats.pedidos.semana}</p>
                  <span className="stat-label">Esta semana</span>
                </div>
              </div>

              <div className="stat-card stat-revenue">
                <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-info">
                  <h3>Pedidos Mês</h3>
                  <p className="stat-number">{stats.pedidos.mes}</p>
                  <span className="stat-label">Este mês</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Ações Rápidas</h2>
              <div className="actions-grid">
                <button
                  className="action-btn"
                  onClick={() => navigate('/admin/deliveries')}
                >
                  <i className="fas fa-store"></i>
                  <span>Gerenciar Deliveries</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => navigate('/admin/taxas')}
                >
                  <i className="fas fa-cog"></i>
                  <span>Configurar Taxas</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => navigate('/admin/orders')}
                >
                  <i className="fas fa-shopping-bag"></i>
                  <span>Ver Pedidos</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => navigate('/admin/users')}
                >
                  <i className="fas fa-users"></i>
                  <span>Gerenciar Usuários</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
