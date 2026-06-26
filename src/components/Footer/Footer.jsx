import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-inner">
      <div className="footer-left">© 2026 StartSmart</div>
      <nav className="footer-right" aria-label="Footer links">
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy-policy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/contact">Contact</Link>
        <a
          href="https://github.com/StartSmart"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="StartSmart on GitHub (opens in new tab)"
        >
          GitHub
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
