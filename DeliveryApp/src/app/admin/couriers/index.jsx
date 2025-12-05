import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../../components/admin/AdminMenu';
import api from '../../../config/apiAxios';
import '../../../style/admin-couriers.css';

export default function AdminCouriers() {
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [filteredCouriers, setFilteredCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    loadCouriers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filterData = useCallback(() => {
    let filtered = couriers;

    if (searchTerm) {
      filtered = filtered.filter(courier =>
        courier.COURIER_NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courier.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courier.TELEFONE?.includes(searchTerm)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(courier => courier.STATUS === filterStatus);
    }

    setFilteredCouriers(filtered);
  }, [couriers, searchTerm, filterStatus]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadCouriers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔑 Token:', adminToken ? 'Presente' : 'Ausente');

      const response = await api.get('/admin/couriers', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      console.log('🏍️ Resposta couriers:', response.data);
      console.log('📊 Total de couriers:', response.data.couriers?.length || 0);

      setCouriers(response.data.couriers || []);
      setFilteredCouriers(response.data.couriers || []);
    } catch (error) {
      console.error('❌ Erro ao carregar entregadores:', error);
      console.error('📋 Detalhes:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (courierId, currentStatus) => {
    const action = currentStatus === 1 ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja ${action} este entregador?`)) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      await api.put(`/admin/couriers/${courierId}/toggle-status`, {}, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      loadCouriers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  const viewDetails = async (courier) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/couriers/${courier.COURIER_ID}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setSelectedCourier(response.data.courier);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="admin-layout">
      <AdminMenu />

      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Gerenciar Entregadores</h1>
            <p>Visualize e gerencie todos os entregadores cadastrados</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="1">Ativos</option>
              <option value="0">Inativos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando entregadores...</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filteredCouriers.length} entregadores encontrados</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Veículo</th>
                    <th>Entregas</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCouriers.map(courier => (
                    <tr key={courier.COURIER_ID}>
                      <td>#{courier.COURIER_ID}</td>
                      <td className="name-cell">
                        <div className="user-info">
                          <div className="courier-avatar">
                            <i className="fas fa-motorcycle"></i>
                          </div>
                          {courier.NOME}
                        </div>
                      </td>
                      <td>{courier.EMAIL}</td>
                      <td>{courier.TELEFONE}</td>
                      <td>{courier.VEICULO || 'Moto'}</td>
                      <td>{courier.totalEntregas || 0}</td>
                      <td>
                        <div className="rating">
                          <i className="fas fa-star"></i>
                          <span>{courier.rating ? courier.rating.toFixed(1) : '0.0'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${courier.ATIVO === 1 ? 'active' : 'inactive'}`}>
                          {courier.ATIVO === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => viewDetails(courier)}
                            title="Ver detalhes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`btn-action ${courier.ATIVO === 1 ? 'btn-disable' : 'btn-enable'}`}
                            onClick={() => toggleStatus(courier.COURIER_ID, courier.ATIVO)}
                            title={courier.ATIVO === 1 ? 'Desativar' : 'Ativar'}
                          >
                            <i className={`fas fa-${courier.ATIVO === 1 ? 'ban' : 'check'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCouriers.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhum entregador encontrado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && selectedCourier && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Entregador</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="courier-avatar-large">
                  <i className="fas fa-motorcycle"></i>
                </div>
                <div className="detail-info">
                  <h3>{selectedCourier.NOME}</h3>
                  <p>{selectedCourier.EMAIL}</p>
                  <div className="rating-large">
                    <i className="fas fa-star"></i>
                    <span>{selectedCourier.rating ? selectedCourier.rating.toFixed(1) : '0.0'}</span>
                    <span className="rating-count">({selectedCourier.totalAvaliacoes || 0} avaliações)</span>
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Telefone:</label>
                  <span>{selectedCourier.TELEFONE}</span>
                </div>
                <div className="detail-item">
                  <label>Veículo:</label>
                  <span>{selectedCourier.VEICULO || 'Moto'}</span>
                </div>
                <div className="detail-item">
                  <label>Total de Entregas:</label>
                  <span>{selectedCourier.totalEntregas || 0}</span>
                </div>
                <div className="detail-item">
                  <label>Cadastro:</label>
                  <span>{formatDate(selectedCourier.CREATED_AT)}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedCourier.ATIVO === 1 ? 'active' : 'inactive'}`}>
                    {selectedCourier.ATIVO === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {selectedCourier.ultimasEntregas && selectedCourier.ultimasEntregas.length > 0 && (
                <div className="deliveries-section">
                  <h4>Últimas Entregas</h4>
                  {selectedCourier.ultimasEntregas.map((ent, idx) => (
                    <div key={idx} className="delivery-item">
                      <div>
                        <strong>Pedido #{ent.PEDIDO_ID}</strong>
                        <p>{formatDate(ent.DATA)}</p>
                      </div>
                      <span className="status-badge active">{ent.STATUS}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
