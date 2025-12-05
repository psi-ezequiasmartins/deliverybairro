import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../../components/admin/AdminMenu';
import api from '../../../config/apiAxios';
import '../../../style/admin-orders.css';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    loadOrders();
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filterData = useCallback(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.PEDIDO_ID?.toString().includes(searchTerm) ||
        order.USER_ID?.toString().includes(searchTerm) ||
        order.DELIVERY_NOME?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(order => order.STATUS === filterStatus);
    }

    if (filterDelivery) {
      filtered = filtered.filter(order => order.DELIVERY_ID?.toString() === filterDelivery);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, filterStatus, filterDelivery]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadOrders = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔑 Token:', adminToken ? 'Presente' : 'Ausente');

      const response = await api.get('/admin/orders', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      console.log('🛍️ Resposta orders:', response.data);
      console.log('📊 Total de orders:', response.data.orders?.length || 0);

      setOrders(response.data.orders || []);
      setFilteredOrders(response.data.orders || []);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      console.error('📋 Detalhes:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await api.get('/admin/deliveries', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      console.error('Erro ao carregar deliveries:', error);
    }
  };

  const viewDetails = async (order) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/orders/${order.PEDIDO_ID}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setSelectedOrder(response.data.order);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDENTE': 'Pendente',
      'CONFIRMADO': 'Confirmado',
      'PREPARANDO': 'Preparando',
      'PRONTO': 'Pronto',
      'SAIU_ENTREGA': 'Saiu p/ Entrega',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      'PENDENTE': 'pending',
      'CONFIRMADO': 'confirmed',
      'PREPARANDO': 'preparing',
      'PRONTO': 'ready',
      'SAIU_ENTREGA': 'delivering',
      'ENTREGUE': 'delivered',
      'CANCELADO': 'cancelled'
    };
    return classes[status] || '';
  };

  return (
    <div className="admin-layout">
      <AdminMenu />

      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Gerenciar Pedidos</h1>
            <p>Visualize todos os pedidos do sistema</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar por ID, usuário ou delivery..."
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
              <option value="PENDENTE">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="PRONTO">Pronto</option>
              <option value="SAIU_ENTREGA">Saiu p/ Entrega</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
            >
              <option value="">Todos os Deliveries</option>
              {deliveries.map(d => (
                <option key={d.DELIVERY_ID} value={d.DELIVERY_ID}>
                  {d.NOME}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando pedidos...</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filteredOrders.length} pedidos encontrados</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Delivery</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.PEDIDO_ID}>
                      <td className="order-id">#{order.PEDIDO_ID}</td>
                      <td>{formatDate(order.DATA)}</td>
                      <td>{order.USUARIO_NOME || 'Não informado'}</td>
                      <td>{order.DELIVERY_NOME}</td>
                      <td className="value-cell">{formatCurrency(order.VALOR_TOTAL)}</td>
                      <td>
                        <span className="payment-badge">
                          {order.FORMA_PAGAMENTO}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.STATUS)}`}>
                          {getStatusLabel(order.STATUS)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => viewDetails(order)}
                            title="Ver detalhes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Pedido #{selectedOrder.PEDIDO_ID}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-status-timeline">
                <span className={`status-badge large ${getStatusClass(selectedOrder.STATUS)}`}>
                  {getStatusLabel(selectedOrder.STATUS)}
                </span>
                <span className="order-date">{formatDate(selectedOrder.DATA)}</span>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <h4><i className="fas fa-user"></i> Cliente</h4>
                  <p><strong>{selectedOrder.USUARIO_NOME}</strong></p>
                  <p>{selectedOrder.USUARIO_TELEFONE}</p>
                  <p className="address">
                    <i className="fas fa-map-marker-alt"></i>
                    {selectedOrder.ENDERECO_ENTREGA}
                  </p>
                </div>

                <div className="info-card">
                  <h4><i className="fas fa-store"></i> Delivery</h4>
                  <p><strong>{selectedOrder.DELIVERY_NOME}</strong></p>
                  <p>{selectedOrder.DELIVERY_TELEFONE}</p>
                </div>

                {selectedOrder.COURIER_NOME && (
                  <div className="info-card">
                    <h4><i className="fas fa-motorcycle"></i> Entregador</h4>
                    <p><strong>{selectedOrder.COURIER_NOME}</strong></p>
                    <p>{selectedOrder.COURIER_TELEFONE}</p>
                  </div>
                )}
              </div>

              {selectedOrder.itens && selectedOrder.itens.length > 0 && (
                <div className="items-section">
                  <h4>Itens do Pedido</h4>
                  <div className="items-list">
                    {selectedOrder.itens.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <div className="item-info">
                          <span className="item-qty">{item.QUANTIDADE}x</span>
                          <span className="item-name">{item.PRODUTO_NOME}</span>
                        </div>
                        <span className="item-price">{formatCurrency(item.VALOR_UNITARIO)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.SUBTOTAL)}</span>
                </div>
                <div className="summary-row">
                  <span>Taxa de Entrega:</span>
                  <span>{formatCurrency(selectedOrder.TAXA_ENTREGA)}</span>
                </div>
                {selectedOrder.TAXA_SERVICO > 0 && (
                  <div className="summary-row">
                    <span>Taxa de Serviço:</span>
                    <span>{formatCurrency(selectedOrder.TAXA_SERVICO)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <strong>TOTAL:</strong>
                  <strong>{formatCurrency(selectedOrder.VALOR_TOTAL)}</strong>
                </div>
                <div className="payment-method">
                  <i className="fas fa-credit-card"></i>
                  <span>{selectedOrder.FORMA_PAGAMENTO}</span>
                </div>
              </div>

              {selectedOrder.OBSERVACOES && (
                <div className="observations">
                  <h4>Observações</h4>
                  <p>{selectedOrder.OBSERVACOES}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
