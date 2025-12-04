/**
 * src/site/pages/mobile.jsx
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import './mobile.css';

function Mobile() {
  const { t } = useTranslation();
  return (
    <section id="mobile">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <img
              src="images/mobile.png"
              width="700"
              height="auto"
              alt="Aplicativo mobile DeliveryBairro"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <div className="bloco">
              <h1>{t('mobile.title')}</h1>
              <h4>{t('mobile.subtitle')}</h4>
              <a
                href="https://drive.google.com/file/d/11qKl9gFYk-DO2J4MzYcoQKgpH_u7Cdai/view?usp=sharing"
                className="btn btn-success btn-lg btn-app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('mobile.download_button')} - Versão Android`}
              >
                {t('mobile.download_button')}
                <i className="fa fa-android" aria-hidden="true"></i>
                <br />
                Build · 13-11-2025-09:55
              </a>
              <p className="text-white">{t('mobile.ios_note')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mobile;
