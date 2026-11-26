import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/apiAxios';
import { showSuccess } from '../../site/components/SweetAlert2';

function ValidarCadastroDelivery() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [deliveryId, setDeliveryId] = useState(() => sessionStorage.getItem('deliveryRegistrationId') || null);
  const [registrationToken, setRegistrationToken] = useState(() => sessionStorage.getItem('deliveryRegistrationToken') || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleValidate(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/delivery/validar-codigo-cadastro', { email, codigo });
      if (!data.valid || !data.registrationToken) {
        setMessage('app.auth.invalid_registration_code');
        return;
      }
      setDeliveryId(data.DELIVERY_ID);
      sessionStorage.setItem('deliveryRegistrationId', data.DELIVERY_ID);
      sessionStorage.setItem('deliveryRegistrationToken', data.registrationToken);
      setRegistrationToken(data.registrationToken);
    } catch (error) {
      console.error('Erro ao validar código de cadastro:', error.message);
      setMessage('app.auth.registration_error');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish(event) {
    event.preventDefault();
    setMessage('');
    if (password.length < 6) {
      setMessage('app.auth.password_too_short');
      return;
    }
    if (password !== passwordConfirm) {
      setMessage('app.auth.passwords_do_not_match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/delivery/finalizar-cadastro', { PASSWORD: password }, {
        headers: { Authorization: `Bearer ${registrationToken}` }
      });
      sessionStorage.removeItem('deliveryRegistrationToken');
      sessionStorage.removeItem('deliveryRegistrationId');
      showSuccess(t('app.register.completed'), () => navigate('/app/login'));
    } catch (error) {
      const errorCode = error.response?.data?.error;
      if (errorCode === 'INVALID_REGISTRATION_TOKEN') {
        sessionStorage.removeItem('deliveryRegistrationToken');
        setRegistrationToken('');
        setMessage('app.auth.registration_expired');
      } else {
        setMessage(errorCode === 'USER_ACCOUNT_PASSWORD_MISMATCH'
          ? 'app.auth.existing_account_password_mismatch'
          : 'app.auth.registration_error');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!deliveryId) return;
    setLoading(true);
    setMessage('');
    try {
      await api.post(`/api/delivery/send-validation-code/${deliveryId}`, { SEND_METHOD: 'email' });
      setCodigo('');
      showSuccess(t('app.auth.registration_code_resent'));
    } catch (error) {
      console.error('Erro ao reenviar código:', error.message);
      setMessage('app.auth.registration_error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="col-12 col-md-6 col-lg-4">
        <h2 className="text-center mb-4">{t('app.register.complete_title')}</h2>
        {!registrationToken ? (
          <form onSubmit={handleValidate} className="mt-2">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">{t('app.login.email')}</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="codigo" className="form-label">{t('app.reset.code')}</label>
              <input
                type="text"
                className="form-control"
                id="codigo"
                value={codigo}
                onChange={event => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
            {deliveryId && (
              <button type="button" className="btn btn-link px-0 mb-3" onClick={handleResendCode} disabled={loading}>
                {t('app.auth.resend_code')}
              </button>
            )}
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {t('app.auth.verify_code')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="mt-2">
            <div className="mb-3">
              <label htmlFor="password" className="form-label">{t('app.register.password')}</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password-confirm" className="form-label">{t('app.register.confirm_password')}</label>
              <input
                type="password"
                className="form-control"
                id="password-confirm"
                value={passwordConfirm}
                onChange={event => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {t('app.auth.finalize_registration')}
            </button>
          </form>
        )}
        {message && <div className="alert alert-danger mt-3" role="alert">{t(message)}</div>}
      </div>
    </div>
  );
}

export default ValidarCadastroDelivery;
