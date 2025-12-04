import React, { useState } from 'react';
import api from '../../config/apiAxios';
import { showSuccess, showError } from '../../site/components/SweetAlert2';

function ValidarCadastroDelivery() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const handleValidar = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/delivery/validar-codigo', { email, codigo });
      showSuccess(response.data.message, () => {
        window.location.href = '/app/login';
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao validar código.';
      showError(errorMsg);
    }
  };
  return (
    <div className="container mt-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="col-12 col-md-6 col-lg-4">
        <h2 className="text-center mb-4">Validação de Cadastro do Delivery</h2>
        <form onSubmit={handleValidar} className="mt-2">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-mail para validação</label>
            <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label htmlFor="codigo" className="form-label">Código de validação</label>
            <input type="text" className="form-control" id="codigo" value={codigo} onChange={e => setCodigo(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success w-100">Validar Cadastro</button>
        </form>
      </div>
    </div>
  );
}

export default ValidarCadastroDelivery;
