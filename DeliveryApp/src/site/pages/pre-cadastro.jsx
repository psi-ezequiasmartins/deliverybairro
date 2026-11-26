/**
 * DeliveryApp/src/site/pages/pre-cadastro.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { showSuccess, showError } from '../components/SweetAlert2';
import Header from './header';
import api from '../../config/apiAxios';
import '../../app/login/login.css'; // Import do CSS para o loading

export default function PreCadastro() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Recupera estado do sessionStorage se existir
  const savedState = sessionStorage.getItem('preCadastroState');
  const initialState = savedState ? JSON.parse(savedState) : null;

  const [step, setStep] = useState(initialState?.step || 1);
  const [deliveryId, setDeliveryId] = useState(initialState?.deliveryId || null);
  const [registrationToken, setRegistrationToken] = useState(initialState?.registrationToken || '');
  const [nome, setNome] = useState(initialState?.nome || "");
  const [planoassinatura, setPlanoAssinatura] = useState(initialState?.planoassinatura || "FREE");
  const [categoria, setCategoria] = useState(initialState?.categoria || 101);
  const [responsavel, setResponsavel] = useState(initialState?.responsavel || "");
  const [email, setEmail] = useState(initialState?.email || "");
  const [telefone, setTelefone] = useState(initialState?.telefone || "");
  const [CEP, setCEP] = useState(initialState?.CEP || "");
  const [endereco, setEndereco] = useState(initialState?.endereco || "");
  const [numero, setNumero] = useState(initialState?.numero || "");
  const [complemento, setComplemento] = useState(initialState?.complemento || "");
  const [bairro, setBairro] = useState(initialState?.bairro || "");
  const [cidade, setCidade] = useState(initialState?.cidade || "");
  const [UF, setUF] = useState(initialState?.UF || "");
  const [validationCode, setValidationCode] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [sendMethod, setSendMethod] = useState(initialState?.sendMethod || "whatsapp");

  // Salva estado no sessionStorage sempre que mudar
  useEffect(() => {
    const state = {
      step,
      deliveryId,
      registrationToken,
      nome,
      planoassinatura,
      categoria,
      responsavel,
      email,
      telefone,
      CEP,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      UF,
      sendMethod
    };
    sessionStorage.setItem('preCadastroState', JSON.stringify(state));
  }, [step, deliveryId, registrationToken, nome, planoassinatura, categoria, responsavel, email, telefone, CEP, endereco, numero, complemento, bairro, cidade, UF, sendMethod]);

  // Função para reiniciar o cadastro
  function handleReiniciarCadastro() {
    if (window.confirm('Tem certeza que deseja reiniciar o cadastro? Todos os dados serão perdidos.')) {
      sessionStorage.removeItem('preCadastroState');
      window.location.reload();
    }
  }

  function phoneMask(value) {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
  }

  function handleInputPhone(e) {
    setTelefone(phoneMask(e.target.value));
  }

  function formatPhoneForWhatsApp(phone) {
    if (!phone) return "";
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55')) {
      return '55' + cleanPhone;
    }
    return cleanPhone;
  }

  // Função para buscar endereço por CEP
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

  // Handler para busca de CEP
  const handleSearchCEP = async () => {
    if (CEP.length < 9) {
      showError('Digite um CEP válido com 8 dígitos');
      return;
    }

    setCepLoading(true);
    try {
      const cleanedCEP = CEP.replace(/\D/g, '');
      const addressData = await SearchAddressByCEP(cleanedCEP);

      if (addressData) {
        setEndereco(addressData.logradouro || '');
        setBairro(addressData.bairro || '');
        setCidade(addressData.localidade || '');
        setUF(addressData.uf || '');
      } else {
        showError('CEP não encontrado ou inválido');
      }
    } catch (error) {
      showError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  // Máscara de CEP
  function cepMask(value) {
    if (!value) return "";
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
  }

  function handleInputCEP(e) {
    setCEP(cepMask(e.target.value));
  }


  // Função para enviar código via WhatsApp
  function sendCodeViaWhatsApp(codigo) {
    const phoneNumber = formatPhoneForWhatsApp(telefone);
    const message = `🔐 *Código de Validação*
    
*Delivery:* ${nome}
*Responsável:* ${responsavel}

Seu código de validação é: *${codigo}*

Use este código para completar seu cadastro no sistema DeliveryBairro.

_Esta é uma mensagem automática. Não responda este número._`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  async function handlePreCadastro() {
    if (nome === "" || responsavel === "" || email === "" || telefone === "") {
      showError(t('plans.form.error_required') || 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/delivery/pre-cadastro', {
        DELIVERY_NOME: nome,
        PLANO: planoassinatura,
        CATEGORIA_ID: categoria,
        RESPONSAVEL: responsavel,
        EMAIL: email,
        TELEFONE: telefone,
        CHV: "0"
      });

      if (!data.DELIVERY_ID) throw new Error('DELIVERY_ID não retornado');

      setDeliveryId(data.DELIVERY_ID);

      const { data: codeData } = await api.post(`/api/delivery/send-validation-code/${data.DELIVERY_ID}`, {
        SEND_METHOD: sendMethod
      });

      if (sendMethod === "whatsapp" && codeData.codigo) {
        sendCodeViaWhatsApp(codeData.codigo);
      }

      setStep(2);
      showSuccess(sendMethod === "whatsapp"
        ? `Código enviado para o WhatsApp ${telefone}.`
        : 'Código enviado por e-mail.');

    } catch (error) {
      console.error('Erro no pré-cadastro:', error);
      showError(error.response?.data?.error || 'Erro ao enviar pré-cadastro.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!deliveryId) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/api/delivery/send-validation-code/${deliveryId}`, {
        SEND_METHOD: sendMethod
      });
      if (sendMethod === 'whatsapp' && data.codigo) {
        sendCodeViaWhatsApp(data.codigo);
      }
      showSuccess(t('app.auth.registration_code_resent'));
    } catch (error) {
      console.error('Erro ao reenviar código:', error.message);
      showError(t('app.auth.registration_error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAddress() {
    if (!CEP || !endereco || !numero || !bairro || !cidade || !UF) {
      showError('Preencha todos os campos obrigatórios do endereço.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/api/delivery/update-address-only/${deliveryId}`, {
        CEP, ENDERECO: endereco, NUMERO: numero, COMPLEMENTO: complemento,
        BAIRRO: bairro, CIDADE: cidade, UF
      });

      const message = data.geocoded
        ? `Endereço salvo! Coordenadas: ${data.latitude?.toFixed(6)}, ${data.longitude?.toFixed(6)}`
        : 'Endereço salvo. Geocodificação pendente.';

      showSuccess(message, () => setStep(4));
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      showError('Erro ao salvar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleValidarCodigo() {
    if (!validationCode || !email) {
      showError('Informe o código e o e-mail.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/delivery/validar-codigo-cadastro', { email, codigo: validationCode });
      if (response.data.valid && response.data.registrationToken) {
        setDeliveryId(response.data.DELIVERY_ID);
        setRegistrationToken(response.data.registrationToken);
        showSuccess(t('app.auth.registration_code_validated'), () => {
          setStep(3);
        });
      } else {
        showError(t('app.auth.invalid_registration_code'));
      }
    } catch (error) {
      console.error('Erro ao validar código:', error.message);
      showError(t('app.auth.registration_error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleValidarLogin() {
    if (!userPassword || userPassword !== userPasswordConfirm) {
      setUserMsg(t('app.auth.passwords_do_not_match'));
      return;
    }
    if (userPassword.length < 6) {
      setUserMsg(t('app.auth.password_too_short'));
      return;
    }
    if (!registrationToken) {
      setUserMsg(t('app.auth.registration_expired'));
      return;
    }
    setUserMsg('');
    try {
      setLoading(true);
      await api.post('/api/delivery/finalizar-cadastro', {
        PASSWORD: userPassword
      }, {
        headers: {
          Authorization: `Bearer ${registrationToken}`
        }
      });

      showSuccess(t('app.register.completed'), () => {
        sessionStorage.removeItem('preCadastroState'); // Limpa o estado salvo
        window.location.href = '/app/login';
      });
    } catch (error) {
      console.error('Erro ao finalizar cadastro:', error.message);
      const errorCode = error.response?.data?.error;
      if (errorCode === 'USER_ACCOUNT_PASSWORD_MISMATCH') {
        setUserMsg(t('app.auth.existing_account_password_mismatch'));
      } else if (errorCode === 'INVALID_REGISTRATION_TOKEN') {
        setRegistrationToken('');
        setValidationCode('');
        setStep(2);
        showError(t('app.auth.registration_expired'));
      } else {
        setUserMsg(t('app.auth.registration_error'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="container mt-4 d-flex flex-column align-items-center justify-content-center" style={{
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 100,
        paddingBottom: 40
      }}>
        {step === 1 && (
          <div className="wizard-step wizard-pre-cadastro">
            <form onSubmit={e => { e.preventDefault(); handlePreCadastro(); }}>
              <div className="mb-2">
                <label htmlFor="nome" className="form-label">{t('plans.form.delivery_name')}<font color="#FF0000">*</font></label>
                <input onChange={e => setNome(e.target.value)} type="text" className="form-control" id="delivery" value={nome} />
              </div>
              <div className="mb-2">
                <label htmlFor="plano" className="form-label">{t('plans.form.plan')}</label>
                <select onChange={e => setPlanoAssinatura(e.target.value)} className="form-select" id="plano" value={planoassinatura}>
                  <option value="FREE">{t('plans.form.plans.basic')}</option>
                  <option value="PRO">{t('plans.form.plans.pro')}</option>
                  <option value="PREMIUM">{t('plans.form.plans.premium')}</option>
                </select>
              </div>

              <div className="row mb-2">
                <div className="col-md-3">
                  <label htmlFor="categoria" className="form-label">{t('plans.form.category')}</label>
                  <select onChange={e => setCategoria(e.target.value)} className="form-select" id="categoria" value={categoria}>
                    <option value="101">{t('plans.form.categories.101')}</option>
                    <option value="102">{t('plans.form.categories.102')}</option>
                    <option value="103">{t('plans.form.categories.103')}</option>
                    <option value="104">{t('plans.form.categories.104')}</option>
                    <option value="105">{t('plans.form.categories.105')}</option>
                    <option value="106">{t('plans.form.categories.106')}</option>
                    <option value="107">{t('plans.form.categories.107')}</option>
                    <option value="108">{t('plans.form.categories.108')}</option>
                    <option value="109">{t('plans.form.categories.109')}</option>
                    <option value="110">{t('plans.form.categories.110')}</option>
                    <option value="111">{t('plans.form.categories.111')}</option>
                    <option value="112">{t('plans.form.categories.112')}</option>
                  </select>
                </div>
                <div className="col-md-9">
                  <label htmlFor="responsavel" className="form-label">{t('plans.form.responsible')}<font color="#FF0000">*</font></label>
                  <input onChange={e => setResponsavel(e.target.value)} type="text" className="form-control" id="responsavel" value={responsavel} />
                </div>
              </div>
              <div className="mb-2">
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope text-primary me-2"></i>
                    {t('plans.form.email')}<span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope text-muted"></i>
                    </span>
                    <input
                      onChange={e => setEmail(e.target.value)}
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="telefone" className="form-label">
                    {/* <i className="fas fa-phone text-success me-2"></i> */}
                    <i className="fab fa-whatsapp text-success me-2 fs-5"></i>
                    {t('plans.form.phone')}/WhatsApp<span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-phone text-muted"></i>
                    </span>
                    <input
                      onChange={((e) => handleInputPhone(e))}
                      type="text"
                      className="form-control"
                      id="telefone"
                      value={telefone}
                      placeholder="(31) 99999-9999"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label fw-bold">
                    <i className="fas fa-paper-plane text-info me-2"></i>
                    Método de envio do código de validação:
                  </label>
                  <div className="d-flex gap-4 mt-2">
                    <div className="form-check form-check-card">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sendMethod"
                        id="whatsappMethod"
                        value="whatsapp"
                        checked={sendMethod === "whatsapp"}
                        onChange={e => setSendMethod(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="whatsappMethod">
                        <i className="fab fa-whatsapp text-success me-2 fs-5"></i>
                        <div>
                          <small className="text-muted">Receber via WhatsApp</small>
                        </div>
                      </label>
                    </div>
                    <div className="form-check form-check-card">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sendMethod"
                        id="emailMethod"
                        value="email"
                        checked={sendMethod === "email"}
                        onChange={e => setSendMethod(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="emailMethod">
                        <i className="fas fa-envelope text-primary me-2 fs-5"></i>
                        <div>
                          <small className="text-muted">Receber por e-mail</small>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="alert alert-info mb-3">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Informação importante:</strong> Preencha corretamente todos os campos obrigatórios (*).
                Escolha como deseja receber o código de validação: por e-mail ou WhatsApp.
                Este código será necessário na próxima tela para completar seu cadastro.
              </div>
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center"
                  style={{ minWidth: 140 }}
                  type="button"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  {t('plans.form.back_to_site') && t('plans.form.back_to_site') !== 'plans.form.back_to_site' ? t('plans.form.back_to_site') : 'Voltar ao site'}
                </button>
                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center flex-fill"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      {t('plans.form.send') || 'Enviar Pré-cadastro'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        {step === 2 && (
          <div className="wizard-step wizard-validacao">
            <div className="text-center mb-4">
              <i className="fas fa-key text-warning fs-1 mb-3"></i>
              <h4 className="fw-bold">Validação do Código</h4>
              <p className="text-muted">Digite o código de validação que você recebeu</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleValidarCodigo(); }}>
              <div className="mb-4">
                <label htmlFor="validationCode" className="form-label fw-semibold">
                  <i className="fas fa-lock text-primary me-2"></i>
                  Código de validação (6 dígitos)
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-hashtag text-muted"></i>
                  </span>
                  <input
                    onChange={e => setValidationCode(e.target.value)}
                    type="text"
                    className="form-control form-control-lg text-center fw-bold"
                    id="validationCode"
                    value={validationCode}
                    placeholder="000000"
                    maxLength="6"
                    style={{ letterSpacing: '0.2em', fontSize: '1.2rem' }}
                  />
                </div>
              </div>

              {sendMethod === "email" ? (
                <div className="mb-4">
                  <div className="alert alert-primary border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-envelope text-primary fs-4 me-3"></i>
                      <div>
                        <div className="fw-semibold">E-mail enviado para:</div>
                        <div className="text-break">{email}</div>
                        <small className="text-muted">Verifique sua caixa de entrada e spam</small>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="btn btn-outline-primary" onClick={handleResendCode} disabled={loading}>
                    {t('app.auth.resend_code')}
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="alert alert-success border-0">
                    <div className="d-flex align-items-center">
                      <i className="fab fa-whatsapp text-success fs-4 me-3"></i>
                      <div>
                        <div className="fw-semibold">WhatsApp enviado para:</div>
                        <div>{telefone}</div>
                        <small className="text-muted">Verifique suas mensagens no WhatsApp</small>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-success d-flex align-items-center"
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    <i className="fab fa-whatsapp me-2"></i>
                    {t('app.auth.resend_code')}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                disabled={loading || !validationCode || validationCode.length < 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Validando código...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    Validar Código
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Problemas com o cadastro?{' '}
                  <button
                    type="button"
                    onClick={handleReiniciarCadastro}
                    className="btn btn-link btn-sm text-decoration-none p-0"
                    style={{ verticalAlign: 'baseline', fontSize: 'inherit' }}
                  >
                    Reiniciar do início
                  </button>
                </small>
              </div>
            </form>
          </div>
        )}
        {step === 3 && (
          <div className="wizard-step wizard-endereco">
            <div className="text-center mb-4">
              <i className="fas fa-map-marked-alt text-warning fs-1 mb-3"></i>
              <h4 className="fw-bold">Endereço do Estabelecimento</h4>
              <p className="text-muted">Informe o endereço completo para localizarmos seu delivery</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSaveAddress(); }}>
              <div className="row mb-2">
                <div className="col-md-4">
                  <label htmlFor="CEP" className="form-label">CEP<span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="CEP"
                      value={CEP}
                      onChange={handleInputCEP}
                      placeholder="00000-000"
                      maxLength="9"
                      disabled={cepLoading}
                      style={{ height: '38px' }}
                    />
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleSearchCEP}
                      disabled={cepLoading || CEP.length < 9}
                      style={{ height: '38px' }}
                    >
                      {cepLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Buscando...
                        </>
                      ) : (
                        'BUSCAR'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-7">
                  <label htmlFor="endereco" className="form-label">Endereço<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="endereco"
                    value={endereco}
                    onChange={e => setEndereco(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="numero" className="form-label">Número<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="numero"
                    value={numero}
                    onChange={e => setNumero(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="complemento" className="form-label">Complemento</label>
                  <input
                    type="text"
                    className="form-control"
                    id="complemento"
                    value={complemento}
                    onChange={e => setComplemento(e.target.value)}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-5">
                  <label htmlFor="bairro" className="form-label">Bairro<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="bairro"
                    value={bairro}
                    onChange={e => setBairro(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="cidade" className="form-label">Cidade<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="cidade"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="UF" className="form-label">UF<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    id="UF"
                    value={UF}
                    onChange={e => setUF(e.target.value.toUpperCase())}
                    maxLength="2"
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn btn-success flex-fill"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Salvando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        {step === 4 && (
          <div className="wizard-step wizard-cadastro-usuario">
            <div className="text-center mb-4">
              <i className="fas fa-user-shield text-success fs-1 mb-3"></i>
              <h4 className="fw-bold">{t('app.register.complete_title')}</h4>
              <p className="text-muted">{t('app.register.password')}</p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleValidarLogin(); }}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    <i className="fas fa-store me-2"></i>{t('app.register.delivery_name')}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-store text-muted"></i>
                    </span>
                    <input type="text" className="form-control" value={nome} disabled />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">
                    <i className="fas fa-envelope me-2"></i>{t('app.register.email')}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope text-muted"></i>
                    </span>
                    <input type="email" className="form-control" value={email} disabled />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="fas fa-lock text-primary me-2"></i>
                  {t('app.register.password')}
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-key text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    value={userPassword}
                    onChange={e => {
                      setUserPassword(e.target.value);
                      if (userMsg) setUserMsg('');
                    }}
                    disabled={loading}
                    placeholder={t('app.register.password')}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="fas fa-lock text-primary me-2"></i>
                  {t('app.register.confirm_password')}
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-check text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    value={userPasswordConfirm}
                    onChange={e => {
                      setUserPasswordConfirm(e.target.value);
                      if (userMsg) setUserMsg('');
                    }}
                    disabled={loading}
                    placeholder={t('app.register.confirm_password')}
                  />
                </div>
              </div>

              {userMsg && (
                <div className="alert alert-danger d-flex align-items-center mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {userMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                disabled={loading || !userPassword || !userPasswordConfirm}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {t('app.register.signup')}...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2"></i>
                    {t('app.register.signup')}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
        {step === 2 && !deliveryId && (
          <div className="wizard-step text-center">
            <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
            <h4 className="text-warning mb-3">Erro no Processo</h4>
            <p className="text-muted mb-4">
              Não foi possível recuperar as informações do cadastro.
              Por favor, reinicie o processo.
            </p>
            <button
              className="btn btn-primary d-flex align-items-center mx-auto"
              onClick={() => {
                setStep(1);
                setDeliveryId(null);
                setValidationCode("");
                setUserPassword("");
                setUserPasswordConfirm("");
                setUserMsg("");
              }}
            >
              <i className="fas fa-redo me-2"></i>
              Reiniciar Processo
            </button>
          </div>
        )}
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
}