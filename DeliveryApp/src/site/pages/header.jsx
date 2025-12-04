/**
 * src/site/pages/header.jsx
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import logomarca from '../../assets/logomarca.png';
import FlagSelector from '../../components/FlagSelector';

export default function Header() {
  const { t } = useTranslation();

  return (
    <div>
      <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark"
        style={{ backgroundColor: '#000', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="container">
          <a className="navbar-brand" href="/#">
            <img src={logomarca} alt="deliverybairro.com" height="50" className="d-inline-block align-text-top" />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto" style={{ gap: '1rem' }}>
              <li className="nav-item ms-4 d-none d-lg-block" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <h4>{t('plans.form.modal_title')}</h4>
              </li>
              {/* Seletor de idiomas no final da navbar */}
              <li className="nav-item ms-4 d-none d-lg-block" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FlagSelector variant="buttons" />
              </li>
              {/* Link Admin */}
              <li className="nav-item ms-4" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <a
                  href="/admin/login"
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    color: '#aaa',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#aaa'}
                >
                  <i className="fas fa-user-shield"></i>
                  Admin
                </a>
              </li>
              {/* Seletor dropdown para mobile */}
              <li className="nav-item ms-2 d-lg-none" style={{ display: 'flex', alignItems: 'center' }}>
                <FlagSelector variant="dropdown" />
              </li>
            </ul>
          </div>
        </div>

      </nav>

    </div>
  );
}

