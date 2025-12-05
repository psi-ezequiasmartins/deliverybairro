import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminMenu from '../../../components/admin/AdminMenu';
import api from '../../../config/apiAxios';
import '../../../style/admin-users.css';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filterData = useCallback(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.USER_ID?.toString().includes(searchTerm) ||
        user.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.TELEFONE?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔑 Token:', adminToken ? 'Presente' : 'Ausente');

      const response = await api.get('/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      console.log('👥 Resposta users:', response.data);
      console.log('📊 Total de users:', response.data.users?.length || 0);

      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      console.error('📋 Detalhes:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, currentStatus) => {
    const action = currentStatus === 1 ? 'bloquear' : 'desbloquear';
    if (!window.confirm(`Deseja ${action} este usuário?`)) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      await api.post(`/admin/users/${userId}/block`, {}, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    }
  };

  const viewDetails = async (user) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/users/${user.USUARIO_ID}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setSelectedUser(response.data.user);
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
            <h1>Gerenciar Usuários</h1>
            <p>Visualize e gerencie todos os usuários cadastrados</p>
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
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filteredUsers.length} usuários encontrados</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Cadastro</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.USUARIO_ID}>
                      <td>#{user.USUARIO_ID}</td>
                      <td className="name-cell">
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.NOME ? user.NOME.charAt(0).toUpperCase() : 'U'}
                          </div>
                          {user.NOME}
                        </div>
                      </td>
                      <td>{user.EMAIL}</td>
                      <td>{user.TELEFONE || '-'}</td>
                      <td>{formatDate(user.CREATED_AT)}</td>
                      <td>
                        <span className={`status-badge ${user.ATIVO === 1 ? 'active' : 'inactive'}`}>
                          {user.ATIVO === 1 ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => viewDetails(user)}
                            title="Ver detalhes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`btn-action ${user.ATIVO === 1 ? 'btn-disable' : 'btn-enable'}`}
                            onClick={() => toggleBlock(user.USUARIO_ID, user.ATIVO)}
                            title={user.ATIVO === 1 ? 'Bloquear' : 'Desbloquear'}
                          >
                            <i className={`fas fa-${user.ATIVO === 1 ? 'ban' : 'check'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-inbox"></i>
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Usuário</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="user-avatar-large">
                  {selectedUser.NOME ? selectedUser.NOME.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="detail-info">
                  <h3>{selectedUser.NOME}</h3>
                  <p>{selectedUser.EMAIL}</p>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Telefone:</label>
                  <span>{selectedUser.TELEFONE || 'Não informado'}</span>
                </div>
                <div className="detail-item">
                  <label>Data de Cadastro:</label>
                  <span>{formatDate(selectedUser.CREATED_AT)}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedUser.ATIVO === 1 ? 'active' : 'inactive'}`}>
                    {selectedUser.ATIVO === 1 ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Total de Pedidos:</label>
                  <span>{selectedUser.totalPedidos || 0}</span>
                </div>
              </div>

              {selectedUser.enderecos && selectedUser.enderecos.length > 0 && (
                <div className="addresses-section">
                  <h4>Endereços Salvos</h4>
                  {selectedUser.enderecos.map((end, idx) => (
                    <div key={idx} className="address-card">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{end.ENDERECO}</span>
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
