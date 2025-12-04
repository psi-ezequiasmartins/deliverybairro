/**
 * DeliveryApp\src\app\menu\delivery\index.jsx
 */

import React, { useState, useEffect } from "react";
import InputMask from 'react-input-mask';
import { useTranslation } from 'react-i18next';
import Menu from "../../../components/menu";
import api from "../../../config/apiAxios";
import './index.css';

export default function Delivery() {
  const { t } = useTranslation();
  const vID = localStorage.getItem("vID");
  const [delivery_nome, setDelivery_nome] = useState("");
  const [plano, setPlano] = useState("FREE");
  const [categoria, setCategoria] = useState("101");
  const [responsavel, setResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [horario, setHorario] = useState("");
  const [min_delivery_time, setMin_delivery_time] = useState("15");
  const [max_delivery_time, setMax_delivery_time] = useState("45");
  const [taxa_entrega, setTaxa_entrega] = useState("5.0");
  const [rating, setRating] = useState("4.9");
  const [url_imagem, setUrl_imagem] = useState("https://placeholder.co/640x400");
  const [CEP, setCEP] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [UF, setUF] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [message, setMessage] = useState({ text: '', type: 0 });
  const [saveLoading, setSaveLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  async function loadDeliveryInfo() {
    if (vID) {
      try {
        const response = await api.get(`/api/delivery/${vID}`);
        const data = response.data;
        setDelivery_nome(data.DELIVERY_NOME || "");
        setPlano(data.PLANO || "FREE");
        setCategoria(data.CATEGORIA_ID || "101");
        setResponsavel(data.RESPONSAVEL || "");
        setEmail(data.EMAIL || "");
        setTelefone(data.TELEFONE || "");
        setHorario(data.HORARIO || "");
        setMin_delivery_time(data.MIN_DELIVERY_TIME || "15");
        setMax_delivery_time(data.MAX_DELIVERY_TIME || "45");
        setRating(data.RATING || "4.9");
        setTaxa_entrega(data.TAXA_ENTREGA || "5.0");
        setUrl_imagem(data.URL_IMAGEM || "https://placeholder.co/640x400");
        setEndereco(data.ENDERECO || "");
        setNumero(data.NUMERO || "");
        setComplemento(data.COMPLEMENTO || "");
        setBairro(data.BAIRRO || "");
        setCidade(data.CIDADE || "");
        setUF(data.UF || "");
        setCEP(data.CEP || "");
        setLatitude(data.LATITUDE);
        setLongitude(data.LONGITUDE);
      } catch (error) {
        console.error('Erro ao carregar informações do delivery:', error);
      }
    }
  }

  useEffect(() => {
    loadDeliveryInfo(); // eslint-disable-next-line
  }, [vID])

  function phoneMask(value) {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
  }

  async function SearchAddressByCEP(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  function handleInputPhone(e) {
    setTelefone(phoneMask(e.target.value));
  }

  const handleSearchCEP = async () => {
    if (CEP.length < 9) {
      setMessage({ text: 'Digite um CEP válido com 8 dígitos', type: 1 });
      return;
    }

    setCepLoading(true);
    setMessage({ text: '', type: 0 });

    try {
      const cleanedCEP = CEP.replace(/\D/g, '');
      const addressData = await SearchAddressByCEP(cleanedCEP);

      if (addressData) {
        setEndereco(addressData.logradouro || '');
        setNumero('');
        setComplemento('');
        setBairro(addressData.bairro || '');
        setCidade(addressData.localidade || '');
        setUF(addressData.uf || '');
        setMessage({ text: 'Endereço encontrado com sucesso!', type: 0 });
      } else {
        setMessage({ text: 'CEP não encontrado ou inválido', type: 1 });
      }
    } catch (error) {
      setMessage({ text: 'Erro ao buscar CEP. Tente novamente.', type: 1 });
    } finally {
      setCepLoading(false);
    }
  };

  // useEffect para mensagem de feedback
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: 0 });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Função de salvar delivery
  async function saveDeliveryInfo() {
    if (delivery_nome.length === 0) {
      setMessage({ text: 'Favor preencher o campo Nome do Delivery', type: 1 });
      return;
    }

    setSaveLoading(true);

    const jsonData = {
      "DELIVERY_NOME": delivery_nome,
      "PLANO": plano,
      "CATEGORIA_ID": categoria,
      "RESPONSAVEL": responsavel,
      "EMAIL": email,
      "TELEFONE": telefone,
      "HORARIO": horario,
      "MIN_DELIVERY_TIME": min_delivery_time,
      "MAX_DELIVERY_TIME": max_delivery_time,
      "RATING": rating,
      "TAXA_ENTREGA": taxa_entrega,
      "URL_IMAGEM": url_imagem,
      "CEP": CEP,
      "ENDERECO": endereco,
      "NUMERO": numero,
      "COMPLEMENTO": complemento,
      "BAIRRO": bairro,
      "CIDADE": cidade,
      "UF": UF
    };

    try {
      const response = await api.put(`/api/update/delivery/${vID}`, jsonData);
      setLatitude(response.data.LATITUDE);
      setLongitude(response.data.LONGITUDE);
      setMessage({ text: 'Dados salvos com sucesso!', type: 0 });
    } catch (error) {
      setMessage({ text: 'Erro ao salvar dados.', type: 1 });
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
          <Menu page="delivery" />
        </div>
        <div className="col py-3 me-3">
          <div className='shadow-sm delivery'>
            <h1>{t('app.delivery.title')}</h1>
            <form>
              <div className="row">
                <div className="mb-2">
                  <label htmlFor="delivery_nome" className="form-label">{t('app.delivery.form.delivery_name')}</label>
                  <input type="text" id="delivery_nome" name="DELIVERY_NOME" value={delivery_nome} className="form-control text-primary" onChange={e => setDelivery_nome(e.target.value)} />
                </div>
                <div className="mb-2">
                  <label htmlFor="plano" className="form-label">{t('app.delivery.form.plan')}*</label>
                  <select id="plano" name="PLANO" value={plano} className="form-select text-primary" onChange={e => setPlano(e.target.value)}  >
                    <option value="FREE">{t('app.delivery.form.plans.basic')}</option>
                    <option value="PRO">{t('app.delivery.form.plans.pro')}</option>
                    <option value="PREMIUM">{t('app.delivery.form.plans.premium')}</option>
                  </select>
                </div>
                <div className="row text-center">
                  <div className="titulo">
                    <h1>{t('app.delivery.plans_section.title')}</h1>
                    <p>{t('app.delivery.plans_section.subtitle')}</p>
                  </div>
                </div>
                <div className="container">
                  <div className="row text-center">
                    <div className="col-lg-4">
                      <div className="card">
                        <div className="card-header">
                          <h1>{t('app.delivery.plans_section.free.title')}</h1>
                        </div>
                        <div className="card-body">
                          <h2>{t('app.delivery.plans_section.free.price')}</h2>
                          <h5>{t('app.delivery.plans_section.free.fee')}</h5>
                          <p>{t('app.delivery.plans_section.free.products')}</p>
                          <p>{t('app.delivery.plans_section.free.description')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="card">
                        <div className="card-header">
                          <h1>{t('app.delivery.plans_section.pro.title')}</h1>
                        </div>
                        <div className="card-body">
                          <h2>{t('app.delivery.plans_section.pro.price')}</h2>
                          <h5>{t('app.delivery.plans_section.pro.fee')}</h5>
                          <p>{t('app.delivery.plans_section.pro.products')}</p>
                          <p>{t('app.delivery.plans_section.pro.description')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="card">
                        <div className="card-header">
                          <h1>{t('app.delivery.plans_section.premium.title')}</h1>
                        </div>
                        <div className="card-body">
                          <h2>{t('app.delivery.plans_section.premium.price')}</h2>
                          <h5>{t('app.delivery.plans_section.premium.fee')}</h5>
                          <p>{t('app.delivery.plans_section.premium.products')}</p>
                          <p>{t('app.delivery.plans_section.premium.description')}</p>
                        </div>
                      </div>
                    </div>
                    <p></p>
                    <strong>(*) Cardápio Online personalizado c/ a Logo do Delivery</strong><br />
                    <strong>(**) Campanha de Publicidade no Google Ads</strong>
                    <p>Promova o seu Delivery em sua região através da nossa campanha no Google Ads,<br />para saber mais a respeito, entre em contato por favor.</p>
                  </div>
                </div>
                <div className="mb-2">
                  <label htmlFor="categoria" className="form-label">{t('app.delivery.form.category')}*</label>
                  <select id="categoria" name="CATEGORIA" value={categoria} className="form-select text-primary" readOnly>
                    <option value="101">{t('app.delivery.form.categories.101')}</option>
                    <option value="102">{t('app.delivery.form.categories.102')}</option>
                    <option value="103">{t('app.delivery.form.categories.103')}</option>
                    <option value="104">{t('app.delivery.form.categories.104')}</option>
                    <option value="105">{t('app.delivery.form.categories.105')}</option>
                    <option value="106">{t('app.delivery.form.categories.106')}</option>
                    <option value="107">{t('app.delivery.form.categories.107')}</option>
                    <option value="108">{t('app.delivery.form.categories.108')}</option>
                    <option value="109">{t('app.delivery.form.categories.109')}</option>
                    <option value="110">{t('app.delivery.form.categories.110')}</option>
                    <option value="111">{t('app.delivery.form.categories.111')}</option>
                    <option value="112">{t('app.delivery.form.categories.112')}</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label htmlFor="responsavel" className="form-label">{t('app.delivery.form.responsible')}</label>
                  <input type="text" id="responsavel" name="RESPONSAVEL" value={responsavel} className="form-control text-primary" onChange={e => setResponsavel(e.target.value)} />
                </div>
                <div className="row mb-2">
                  <div className="col-8">
                    <label htmlFor="email" className="form-label">{t('app.delivery.form.email')}</label>
                    <input type="email" id="email" name="EMAIL" value={email} className="form-control text-primary" onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label htmlFor="telefone" className="form-label">{t('app.delivery.form.phone')}</label>
                    <input type="text" id="telefone" name="TELEFONE" value={telefone} className="form-control text-primary" onChange={((e) => handleInputPhone(e))} />
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-8">
                    <label htmlFor="horario" className="form-label">{t('app.delivery.form.hours')}</label>
                    <input type="text" id="horario" name="HORARIO" value={horario} className="form-control text-primary" onChange={e => setHorario(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label htmlFor="rating" className="form-label">{t('app.delivery.form.rating')}*</label>
                    <select id="rating" name="RATING" value={rating} className="form-select text-primary" readOnly>
                      <option value="4.9">Ótima</option>
                      <option value="3.5">Muito Boa</option>
                      <option value="2.5">Regular</option>
                      <option value="1.0">Fraca</option>
                      <option value="0.5">Ruim</option>
                      <option value="0.1">Péssima</option>
                    </select>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-4">
                    <label htmlFor="mindeliverytime" className="form-label">{t('app.delivery.form.min_time')}</label>
                    <input type="text" id="mindeliverytime" name="MIN_DELIVERY_TIME" value={min_delivery_time} className="form-control text-primary" onChange={e => setMin_delivery_time(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label htmlFor="maxdeliverytime" className="form-label">{t('app.delivery.form.max_time')}</label>
                    <input type="text" id="maxdeliverytime" name="MAX_DELIVERY_TIME" value={max_delivery_time} className="form-control text-primary" onChange={e => setMax_delivery_time(e.target.value)} />
                  </div>
                  <div className="col-4">
                    <label htmlFor="taxaentrega" className="form-label">{t('app.delivery.form.delivery_fee')}</label>
                    <input type="text" id="taxaentrega" name="TAXA_ENTREGA" value={taxa_entrega} className="form-control text-primary" onChange={e => setTaxa_entrega(e.target.value)} />
                    <input type="hidden" id="urlimagem" name="URL_IMAGEM" value={url_imagem} onChange={e => setUrl_imagem(e.target.value)} />
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-3">
                    <label htmlFor="CEP" className="form-label">
                      <i className="fas fa-map-marker-alt text-primary me-2"></i>
                      {t('app.delivery.form.cep')}
                    </label>
                    <div className="input-group">
                      <InputMask
                        mask="99999-999"
                        id="CEP"
                        name="CEP"
                        value={CEP}
                        className="form-control text-primary"
                        onChange={e => setCEP(e.target.value)}
                        disabled={cepLoading}
                        placeholder="00000-000"
                        style={{ height: '38px' }}
                      />
                      <button
                        className={`btn ${CEP.length === 9 ? 'btn-primary' : 'btn-outline-secondary'}`}
                        type="button"
                        onClick={handleSearchCEP}
                        disabled={cepLoading || CEP.length < 9}
                        title={CEP.length < 9 ? 'Digite um CEP válido' : 'Clique para buscar o endereço'}
                        style={{ height: '38px', minWidth: '100px' }}
                      >
                        {cepLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Buscando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search me-1"></i>
                            BUSCAR
                          </>
                        )}
                      </button>
                    </div>
                    {cepLoading && (
                      <small className="text-muted">
                        <i className="fas fa-search me-1"></i>
                        Buscando endereço...
                      </small>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      <i className="fas fa-map-pin text-success me-2"></i>
                      Latitude
                    </label>
                    <input
                      type="text"
                      className="form-control text-muted bg-light"
                      value={latitude !== null ? latitude.toFixed(7) : 'Não disponível'}
                      disabled
                      readOnly
                      style={{ cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">
                      <i className="fas fa-map-pin text-danger me-2"></i>
                      Longitude
                    </label>
                    <input
                      type="text"
                      className="form-control text-muted bg-light"
                      value={longitude !== null ? longitude.toFixed(7) : 'Não disponível'}
                      disabled
                      readOnly
                      style={{ cursor: 'not-allowed' }}
                    />
                    {(latitude === null || longitude === null) && (
                      <small className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Atualize o endereço para gerar coordenadas
                      </small>
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <label htmlFor="endereco" className="form-label">{t('app.delivery.form.address')}</label>
                    <input type="text" id="endereco" name="ENDERECO" value={endereco} className="form-control text-primary" onChange={e => setEndereco(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="numero" className="form-label">{t('app.delivery.form.number')}</label>
                    <input type="text" id="numero" name="NUMERO" value={numero} className="form-control text-primary" onChange={e => setNumero(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="complemento" className="form-label">{t('app.delivery.form.complement')}</label>
                    <input type="text" id="complemento" name="COMPLEMENTO" value={complemento} className="form-control text-primary" onChange={e => setComplemento(e.target.value)} />
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <label htmlFor="bairro" className="form-label">{t('app.delivery.form.neighborhood')}</label>
                    <input type="text" id="bairro" name="BAIRRO" value={bairro} className="form-control text-primary" onChange={e => setBairro(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="cidade" className="form-label">{t('app.delivery.form.city')}</label>
                    <input type="text" id="cidade" name="CIDADE" value={cidade} className="form-control text-primary" onChange={e => setCidade(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="UF" className="form-label">{t('app.delivery.form.state')}</label>
                    <input type="text" id="UF" name="UF" value={UF} className="form-control text-primary" onChange={e => setUF(e.target.value)} />
                  </div>
                </div>
              </div>
            </form>
            <button
              type="button"
              className="btn btn-dark d-flex align-items-center"
              onClick={saveDeliveryInfo}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {t('app.delivery.form.save') || 'Salvar Alterações'}
                </>
              )}
            </button>
            {message.text && (
              <div className={message.type !== 0 ? "alert alert-danger" : "alert alert-info"} role="alert">
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
