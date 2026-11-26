/**
 * src/app/menu/pedidos/pedido.jsx
 */

import React, { useState, useEffect } from 'react';
import api from '../../../config/apiAxios';
import './pedido.css';

export default function Pedido(props) {
  const [status, setStatus] = useState(props.STATUS);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function AlterarStatus(codigo) {
    setStatus(codigo);
    await api.put(`/delivery-app/update/status/pedido`, {
      orderId: props.PEDIDO_ID,
      status: codigo
    }).then(() => {
      if (status === 'FINALIZADO') {
        setVisible(false);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  return !visible ? null : (
    <div className={`shadow-sm pedido ${isMobile ? 'flex-column' : 'flex-row justify-content-between'}`}>

      {/* Bloco Superior: Dados do Cliente + Controles de Status */}
      <div className="row mb-3">
        {/* Dados do Cliente/Pedido - Esquerda */}
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="pedido-info-block">
            <text-black><b>{props.USER_ID} {props.CLIENTE}</b></text-black><br />
            <text-gray>{props.ENDERECO_ENTREGA}</text-gray><br />
            <text-black><b>PEDIDO #{props.PEDIDO_ID}</b></text-black>
            <span className='badge bg-dark ms-2'>{props.DATA}</span>
          </div>
        </div>

        {/* Controles de Status - Direita */}
        <div className="col-md-6">
          <div className="pedido-status-block d-flex gap-2 align-items-center flex-wrap">
            {/* Status do Pedido */}
            <div className="status-group">
              <label className="status-label">STATUS</label>
              <select
                value={['NOVO', 'AGUARDANDO', 'PREPARANDO', 'PRONTO_PARA_RETIRADA', 'SAIU_PARA_ENTREGA', 'ENTREGUE'].includes(status) ? status : ''}
                onChange={(e) => AlterarStatus(e.target.value)}
                className="status-select"
              >
                <option value="NOVO">🔴 Novo</option>
                <option value="AGUARDANDO">🟠 Aguardando</option>
                <option value="PREPARANDO">⚪ Preparando</option>
                <option value="PRONTO_PARA_RETIRADA">🟡 Pronto</option>
                <option value="SAIU_PARA_ENTREGA">🔵 Em Entrega</option>
                <option value="ENTREGUE">🟢 Entregue</option>
              </select>
            </div>

            {/* Pagamento */}
            <div className="status-group">
              <label className="status-label">PAGAMENTO</label>
              <select
                value={['PGTO_PENDENTE', 'PGTO_OK'].includes(status) ? status : ''}
                onChange={(e) => AlterarStatus(e.target.value)}
                className="status-select"
              >
                <option value="">-- Selecione --</option>
                <option value="PGTO_PENDENTE">🔴 Pendente</option>
                <option value="PGTO_OK">🟢 Pago</option>
              </select>
            </div>

            {/* Finalizar */}
            <div className="status-group">
              <label className="status-label">FINALIZAR</label>
              <select
                value={['FINALIZADO', 'CANCELADO'].includes(status) ? status : ''}
                onChange={(e) => AlterarStatus(e.target.value)}
                className="status-select"
              >
                <option value="">-- Selecione --</option>
                <option value="FINALIZADO">✅ Finalizado</option>
                <option value="CANCELADO">❌ Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco dos Itens do Pedido */}
      <div className="pedido-items-block">
        {props.itens.map((item) => (
          <div className='d-inline-block align-items-start' key={item.ITEM_ID}>
            <div className='text-left me-4 mt-2 card-pedido'>
              <img src={item.URL_IMAGEM} className='foto-item' alt='' />
              <small className='d-block text-dark'><b>( {item.QTD}x ) {item.PRODUTO_NOME}</b></small>
              {(item.ACRESCIMOS && item.ACRESCIMOS.length > 0) && (
                <>
                  <br />
                  <div className='text-dark acrescimos'>
                    <b>Acrescimos:</b>
                    <ul>
                      {item.ACRESCIMOS.map((acrescimo, index) => (
                        <li key={index}>
                          {acrescimo.DESCRICAO} - R$ {parseFloat(acrescimo.VR_UNITARIO).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {item.OBS && item.OBS.trim() && (
                <>
                  <br />
                  <text-orange>
                    <b>OBSERVAÇÕES:</b><br />
                    {item.OBS}
                  </text-orange>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

