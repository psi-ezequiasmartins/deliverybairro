import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/apiAxios';
import AdminMenu from '../../../components/admin/AdminMenu';
import '../../../style/admin-taxas.css';

export default function AdminTaxas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [config, setConfig] = useState({
    TAXA_SERVICO: 0.99,
    TAXA_PSP_FIXA: 0.40,
    TAXA_PSP_PERCENTUAL: 3.99,
    TAXA_PSP_MIN: 3.99,
    TAXA_PSP_MAX: 4.99,
    OBSERVACOES: ''
  });

  const [simulator, setSimulator] = useState({
    subtotal: 50.00,
    deliveryFee: 5.00
  });

  const [calculatedFees, setCalculatedFees] = useState(null);

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Recalcular taxas quando valores mudarem
  useEffect(() => {
    calculateFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulator, config]);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/taxas/config', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.config) {
        setConfig(response.data.config);
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
      setError('Erro ao carregar configuração das taxas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccess('');
    setError('');
  };

  const handleSimulatorChange = (field, value) => {
    setSimulator(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const calculateFees = () => {
    const subtotal = simulator.subtotal;
    const deliveryFee = simulator.deliveryFee;
    const taxaServico = parseFloat(config.TAXA_SERVICO) || 0;
    const taxaPspFixa = parseFloat(config.TAXA_PSP_FIXA) || 0;
    const taxaPspPercentual = parseFloat(config.TAXA_PSP_PERCENTUAL) || 0;

    const subtotalComEntrega = subtotal + deliveryFee;
    const taxaPspVariavel = (subtotalComEntrega * taxaPspPercentual) / 100;
    const totalTaxas = taxaServico + taxaPspFixa + taxaPspVariavel;
    const totalFinal = subtotalComEntrega + totalTaxas;

    setCalculatedFees({
      subtotal,
      deliveryFee,
      taxaServico,
      taxaPspFixa,
      taxaPspVariavel,
      totalTaxas,
      totalFinal
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');

      // Validações
      const percentual = parseFloat(config.TAXA_PSP_PERCENTUAL);
      const min = parseFloat(config.TAXA_PSP_MIN);
      const max = parseFloat(config.TAXA_PSP_MAX);

      if (percentual < min || percentual > max) {
        setError(`Taxa PSP percentual deve estar entre ${min}% e ${max}%`);
        setSaving(false);
        return;
      }

      const response = await api.put(
        '/admin/taxas/config',
        config,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Configuração salva com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      if (err.response?.status === 401) {
        navigate('/admin/login');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao salvar configuração');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <AdminMenu />
        <div className="admin-content">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminMenu />

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            <i className="fas fa-cog"></i>
            Configuração de Taxas
          </h1>
          <p>Gerencie as taxas do sistema aplicadas a todos os pedidos</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        <div className="taxas-grid">
          {/* Configuração das Taxas */}
          <div className="taxas-card">
            <h2>
              <i className="fas fa-sliders-h"></i>
              Taxas do Sistema
            </h2>

            <div className="form-group">
              <label>
                <i className="fas fa-hand-holding-usd"></i>
                Taxa de Serviço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.TAXA_SERVICO}
                onChange={(e) => handleConfigChange('TAXA_SERVICO', e.target.value)}
              />
              <small>Taxa fixa cobrada por pedido</small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-credit-card"></i>
                Taxa PSP Fixa (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={config.TAXA_PSP_FIXA}
                onChange={(e) => handleConfigChange('TAXA_PSP_FIXA', e.target.value)}
              />
              <small>Taxa fixa do processador de pagamento</small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-percent"></i>
                Taxa PSP Percentual (%)
              </label>
              <input
                type="number"
                step="0.01"
                min={config.TAXA_PSP_MIN}
                max={config.TAXA_PSP_MAX}
                value={config.TAXA_PSP_PERCENTUAL}
                onChange={(e) => handleConfigChange('TAXA_PSP_PERCENTUAL', e.target.value)}
              />
              <small>
                Percentual do processador (entre {config.TAXA_PSP_MIN}% e {config.TAXA_PSP_MAX}%)
              </small>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-comment"></i>
                Observações
              </label>
              <textarea
                rows="3"
                value={config.OBSERVACOES || ''}
                onChange={(e) => handleConfigChange('OBSERVACOES', e.target.value)}
                placeholder="Notas sobre esta configuração..."
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Salvar Configuração
                </>
              )}
            </button>
          </div>

          {/* Simulador */}
          <div className="taxas-card">
            <h2>
              <i className="fas fa-calculator"></i>
              Simulador de Taxas
            </h2>

            <div className="form-group">
              <label>Subtotal do Pedido (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={simulator.subtotal}
                onChange={(e) => handleSimulatorChange('subtotal', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Taxa de Entrega (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={simulator.deliveryFee}
                onChange={(e) => handleSimulatorChange('deliveryFee', e.target.value)}
              />
            </div>

            {calculatedFees && (
              <div className="fees-breakdown">
                <h3>Cálculo Detalhado</h3>

                <div className="fee-row">
                  <span>Subtotal</span>
                  <span>R$ {calculatedFees.subtotal.toFixed(2)}</span>
                </div>

                <div className="fee-row">
                  <span>Taxa de Entrega</span>
                  <span>R$ {calculatedFees.deliveryFee.toFixed(2)}</span>
                </div>

                <div className="fee-divider"></div>

                <div className="fee-row highlight">
                  <span>Taxa de Serviço</span>
                  <span>R$ {calculatedFees.taxaServico.toFixed(2)}</span>
                </div>

                <div className="fee-row highlight">
                  <span>Taxa PSP Fixa</span>
                  <span>R$ {calculatedFees.taxaPspFixa.toFixed(2)}</span>
                </div>

                <div className="fee-row highlight">
                  <span>Taxa PSP Variável ({config.TAXA_PSP_PERCENTUAL}%)</span>
                  <span>R$ {calculatedFees.taxaPspVariavel.toFixed(2)}</span>
                </div>

                <div className="fee-divider"></div>

                <div className="fee-row total-fees">
                  <span>Total de Taxas</span>
                  <span>R$ {calculatedFees.totalTaxas.toFixed(2)}</span>
                </div>

                <div className="fee-row grand-total">
                  <span>TOTAL FINAL</span>
                  <span>R$ {calculatedFees.totalFinal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
