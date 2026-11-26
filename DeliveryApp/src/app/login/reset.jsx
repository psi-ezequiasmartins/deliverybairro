import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './reset.css';

export default function Reset() {
  const { t } = useTranslation();
  const { message, messageType, loading, changePassword, resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [formError, setFormError] = useState('');
  const ano = new Date().getFullYear();

  async function handleRequestCode(event) {
    event.preventDefault();
    setFormError('');
    if (await changePassword(email)) {
      setCodeSent(true);
    }
  }

  async function handleResendCode() {
    setCode('');
    await changePassword(email);
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setFormError('');
    if (password.length < 6) {
      setFormError('app.auth.password_too_short');
      return;
    }
    if (password !== passwordConfirm) {
      setFormError('app.auth.passwords_do_not_match');
      return;
    }
    await resetPassword(email, code, password);
  }

  return (
    <div className="d-flex align-items-center text-center form-container">
      <form className="form-login" onSubmit={codeSent ? handleResetPassword : handleRequestCode}>
        <a href="/#">
          <img className="mb-4" src="/images/logo.png" alt="" />
        </a>
        <h1 className="h3 mb-2 fw-normal">{t('app.reset.title')}</h1>
        <div className="form-floating mt-2">
          <input
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="form-control"
            id="email"
            placeholder={t('app.reset.email')}
            value={email}
            disabled={codeSent}
            required
          />
          <label htmlFor="email">{t('app.reset.email')}</label>
        </div>
        {codeSent && (
          <>
            <div className="form-floating mt-2">
              <input
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                type="text"
                className="form-control"
                id="reset-code"
                placeholder={t('app.reset.code')}
                value={code}
                inputMode="numeric"
                maxLength={6}
                required
              />
              <label htmlFor="reset-code">{t('app.reset.code')}</label>
            </div>
            <button type="button" className="btn btn-link px-0 mt-1" onClick={handleResendCode} disabled={loading}>
              {t('app.auth.resend_code')}
            </button>
            <div className="form-floating mt-2">
              <input
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="form-control"
                id="new-password"
                placeholder={t('app.reset.new_password')}
                value={password}
                autoComplete="new-password"
                required
              />
              <label htmlFor="new-password">{t('app.reset.new_password')}</label>
            </div>
            <div className="form-floating mt-2">
              <input
                onChange={(event) => setPasswordConfirm(event.target.value)}
                type="password"
                className="form-control"
                id="confirm-password"
                placeholder={t('app.reset.confirm_password')}
                value={passwordConfirm}
                autoComplete="new-password"
                required
              />
              <label htmlFor="confirm-password">{t('app.reset.confirm_password')}</label>
            </div>
          </>
        )}
        {formError && <div className="alert alert-danger mt-2" role="alert">{t(formError)}</div>}
        {message && (
          <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} mt-2`} role="alert">
            {t(message)}
          </div>
        )}
        <button className="w-150 btn btn-lg btn-dark mt-2" type="submit" disabled={loading}>
          {codeSent ? t('app.reset.update_password') : t('app.reset.send_link')}
        </button>
        <div className="form-links">
          <Link to="/app/login" className="mx-3">{t('app.reset.back_to_login')}</Link><br />
          <Link to="/pre-cadastro" className="mx-3">{t('app.reset.create_account')}</Link><br />
        </div>
        <small>&copy; {ano} {t('app.login.copyright')}</small>
      </form>
    </div>
  );
}
