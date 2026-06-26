import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLocale();
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-left">© 2026 StartSmart</div>
        <nav className="footer-right" aria-label="Footer links">
          <Link to="/about">{t('footer.about')}</Link>
          <Link to="/help">{t('footer.help')}</Link>
          <Link to="/faq">{t('footer.faq')}</Link>
          <Link to="/privacy-policy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
          <Link to="/cookies">{t('footer.cookies')}</Link>
          <Link to="/accessibility">{t('footer.accessibility')}</Link>
          <Link to="/contact">{t('footer.contact')}</Link>
          <a
            href="https://github.com/StartSmart"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="StartSmart on GitHub (opens in new tab)"
          >
            {t('footer.github')}
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
