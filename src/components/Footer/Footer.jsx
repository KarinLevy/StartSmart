import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-inner">
      <div className="footer-left">© 2026 StartSmart</div>
      <div className="footer-right">
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/contact">Contact</a>
        <a
          href="https://github.com/StartSmart"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
