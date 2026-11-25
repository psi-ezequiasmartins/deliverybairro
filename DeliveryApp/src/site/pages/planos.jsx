import React from 'react';
import { useTranslation } from 'react-i18next';
// import { Navigate } from 'react-router-dom';

// import api from '../../config/apiAxios';
// import { showSuccess, showError } from '../components/SweetAlert2';

function Planos() {
  const { t } = useTranslation();
  return (
    <section id="planos-e-precos">
      <div className="row text-center">
        <div className="titulo">
          <h1>{t('plans.title')}</h1>
          <p>{t('plans.subtitle')}</p>
        </div>
      </div>

      <div className="container">
        <div className="row text-center">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h1>{t('plans.free.title')}</h1>
              </div>
              <div className="card-body">
                {/* <h2>{t('plans.free.price')}</h2> */}
                <h3>{t('plans.free.tax')}</h3>
                <h5>{t('plans.free.fee')}</h5>
                <p>{t('plans.free.products')}</p>
                <p>{t('plans.free.description')}</p>
                <a className="btn btn-lg btn-outline-primary" href="/pre-cadastro">{t('plans.free.button')}</a>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h1>{t('plans.pro.title')}</h1>
              </div>
              <div className="card-body">
                {/* <h2>{t('plans.pro.price')}</h2> */}
                <h3>{t('plans.pro.tax')}</h3>
                <h5>{t('plans.pro.fee')}</h5>
                <p>{t('plans.pro.products')}</p>
                <p>{t('plans.pro.description')}</p>
                <a className="btn btn-lg btn-outline-primary" href="/pre-cadastro">{t('plans.pro.button')}</a>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h1>{t('plans.premium.title')}</h1>
              </div>
              <div className="card-body">
                {/* <h2>{t('plans.premium.price')}</h2> */}
                <h3>{t('plans.premium.tax')}</h3>
                <h5>{t('plans.premium.fee')}</h5>
                <p>{t('plans.premium.products')}</p>
                <p>{t('plans.premium.description')}</p>
                <a className="btn btn-lg btn-outline-primary" href="/pre-cadastro">{t('plans.premium.button')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row text-center">
        <div className="titulo">
          <h3>{t('plans.notes.digital_menu')}</h3>
          <h3>{t('plans.notes.google_ads')}</h3>
          <p>{t('plans.notes.google_ads_description')}</p>
        </div>
      </div>

    </section>
  );
}

export default Planos;
