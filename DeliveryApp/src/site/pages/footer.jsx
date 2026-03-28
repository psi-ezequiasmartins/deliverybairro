/**
 * src/site/pages/footer.jsx
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import logomarca from '../../assets/logomarca.png';

function Footer() {
  const { t } = useTranslation();
  var ano = new Date().getFullYear();

  return (
    <section id="contato">
      <div>
        {/* me ajuda a localizar o arquivo em assets/logomarca.png */}
        <img src={logomarca} alt="deliverybairro.com" height="60" />
        <p>&nbsp;</p>
      </div>
      <p>
        <strong>{t('footer.company_name')}</strong> {t('footer.cnpj')}
        <br /><i className="fa fa-map-marker" style={{ fontSize: '18px', fontStyle: 'bold', color: '#FF0000' }}></i> {t('footer.address')}
        <br /><i className="fa fa-envelope" style={{ fontSize: '18px', fontStyle: 'bold', color: 'blue' }}></i> <a href="mailto:#">{t('footer.email')}</a>
        <br /><i className="fa fa-phone" style={{ fontSize: '18px', fontStyle: 'bold', color: '#25D366' }}></i> {t('footer.phone')} <i className="fa fa-whatsapp" style={{ fontSize: '18px', fontStyle: 'bold', color: '#25D366' }}></i>
      </p>

      <p><small>
        <a href="https://www.easycounter.com/">
          <img src="https://www.easycounter.com/counter.php?ezequiasmartins,index-paginainicial" border="0" alt="Free Hit Counter" /></a><br />
        {t('footer.visits_since')}
        <br />© 2021-{ano} deliverybairro.com<br />
      </small></p>
      
    </section>
  );
}

export default Footer;