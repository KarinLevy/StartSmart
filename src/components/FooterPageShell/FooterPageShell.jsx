import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Footer from '../Footer/Footer';
import './FooterPageShell.css';

/*
 * Shared layout wrapper for all footer / public-info pages.
 * Renders the logo header and Back link so each page only needs to supply
 * its own main content — no logo markup is duplicated.
 */
const FooterPageShell = ({ children }) => (
  <div className="fp-shell">
    <header className="fp-shell-header">
      <div className="fp-shell-header-inner">
        <Logo to="/" size="sm" />
        <Link to="/" className="fp-shell-back" aria-label="Back to StartSmart home">
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Back to StartSmart
        </Link>
      </div>
    </header>

    <main className="fp-shell-content">
      {children}
    </main>

    <Footer />
  </div>
);

export default FooterPageShell;
