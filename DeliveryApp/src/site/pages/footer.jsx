/**
 * src/site/pages/footer.jsx
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import logomarca from '../../assets/logomarca.png';

function Footer() {
  const { t } = useTranslation();
  var ano = new Date().getFullYear();

  useEffect(() => {
    // Statcounter configuration
    window.sc_project = 13189437;
    window.sc_invisible = 0;
    window.sc_security = "48d92042";

    // Load Statcounter script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://statcounter.com/counter/counter.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="contato">
      <div>
        {/* me ajuda a localizar o arquivo em assets/logomarca.png */}
        <img src={logomarca} alt="deliverybairro.com" height="60" />
        <p>&nbsp;</p>
      </div>
      <p>
        <strong>{t('footer.company_name')}</strong> {t('footer.cnpj')}
        <br /><i className="fa fa-map-marker"></i> {t('footer.address')}
        <br /><i className="fa fa-envelope"></i> <a href="mailto:#">{t('footer.email')}</a>
        <br /><i className="fa fa-phone"></i> {t('footer.phone')}
        <p>&nbsp;</p>
        <small>
          <a href="https://www.easycounter.com/">
            <img src="https://www.easycounter.com/counter.php?ezequiasmartins,index-paginainicial" border="0" alt="Free Hit Counter" /></a><br />
          <a href="https://www.easycounter.com/">{t('footer.visits_since')}</a>
          <br />
          {/* Statcounter */}
          <div className="statcounter">
            <a title="Web Analytics" href="https://statcounter.com/" target="_blank" rel="noopener noreferrer">
              <img
                className="statcounter"
                src="https://c.statcounter.com/13189437/0/48d92042/0/"
                alt="Web Analytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
          <a href="https://statcounter.com/p13189437/?guest=1" target="_blank" rel="noopener noreferrer">View My Stats</a>
          <br />© {ano} deliverybairro.com<br />
        </small>
      </p>
    </section>
  );
}

export default Footer;