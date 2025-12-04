import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../../components/admin/AdminMenu';
import api from '../../../config/apiAxios';
import '../../../style/admin-deliveries.css';

export default function AdminDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    loadDeliveries();
  }, [navigate]);

  useEffect(() => {
    filterData();
  }, [searchTerm, filterCategoria, filterStatus, deliveries]);

  const loadDeliveries = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔑 Token:', adminToken ? 'Presente' : 'Ausente');

      const response = await api.get('/admin/deliveries', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      console.log('📦 Resposta deliveries:', response.data);
      console.log('📊 Total de deliveries:', response.data.deliveries?.length || 0);

      setDeliveries(response.data.deliveries || []);
      setFilteredDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error('❌ Erro ao carregar deliveries:', error);
      console.error('📋 Detalhes:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...deliveries];

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.NOME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.TELEFONE?.includes(searchTerm)
      );
    }

    if (filterCategoria) {
      filtered = filtered.filter(d => d.CATEGORIA === filterCategoria);
    }

    if (filterStatus !== '') {
      filtered = filtered.filter(d => d.SITUACAO === parseInt(filterStatus));
    }

    setFilteredDeliveries(filtered);
  };

  const toggleStatus = async (deliveryId, currentStatus) => {
    if (!window.confirm('Deseja alterar o status deste delivery?')) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      await api.put(`/admin/deliveries/${deliveryId}/toggle-status`, {}, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      loadDeliveries();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  const viewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowModal(true);
  };

  const categorias = [...new Set(deliveries.map(d => d.CATEGORIA))];

  return (
    <div className="admin-layout">
      <AdminMenu />

      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Gerenciar Deliveries</h1>
            <p>Visualize e gerencie todos os estabelecimentos cadastrados</p>
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
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

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
            <p>Carregando deliveries...</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filteredDeliveries.length} deliveries encontrados</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Logo</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map(delivery => (
                    <tr key={delivery.DELIVERY_ID}>
                      <td>#{delivery.DELIVERY_ID}</td>
                      <td>
                        <div className="logo-cell">
                          {delivery.LOGO ? (
                            <img src={delivery.LOGO} alt={delivery.NOME} />
                          ) : (
                            <div className="logo-placeholder">
                              <i className="fas fa-store"></i>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="name-cell">{delivery.NOME}</td>
                      <td>
                        <span className="category-badge">{delivery.CATEGORIA}</span>
                      </td>
                      <td>{delivery.EMAIL}</td>
                      <td>{delivery.TELEFONE}</td>
                      <td>
                        <span className={`status-badge ${delivery.SITUACAO === 1 ? 'active' : 'inactive'}`}>
                          {delivery.SITUACAO === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => viewDetails(delivery)}
                            title="Ver detalhes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`btn-action ${delivery.SITUACAO === 1 ? 'btn-disable' : 'btn-enable'}`}
                            onClick={() => toggleStatus(delivery.DELIVERY_ID, delivery.SITUACAO)}
                            title={delivery.SITUACAO === 1 ? 'Desativar' : 'Ativar'}
                          >
                            <i className={`fas fa-${delivery.SITUACAO === 1 ? 'ban' : 'check'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDeliveries.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhum delivery encontrado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Delivery</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-logo">
                  {selectedDelivery.LOGO ? (
                    <img src={selectedDelivery.LOGO} alt={selectedDelivery.NOME} />
                  ) : (
                    <div className="logo-placeholder-large">
                      <i className="fas fa-store"></i>
                    </div>
                  )}
                </div>
                <div className="detail-info">
                  <h3>{selectedDelivery.NOME}</h3>
                  <span className="category-badge">{selectedDelivery.CATEGORIA}</span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedDelivery.EMAIL}</span>
                </div>
                <div className="detail-item">
                  <label>Telefone:</label>
                  <span>{selectedDelivery.TELEFONE}</span>
                </div>
                <div className="detail-item">
                  <label>Endereço:</label>
                  <span>{selectedDelivery.ENDERECO}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedDelivery.SITUACAO === 1 ? 'active' : 'inactive'}`}>
                    {selectedDelivery.SITUACAO === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
