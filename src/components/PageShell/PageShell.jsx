import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './PageShell.css';

const PageShell = ({ title, subtitle, actions, children, narrow = false }) => (
  <div className="page-shell">
    <Navbar />
    <main className="page-main">
      <div className={`page-container ${narrow ? 'narrow' : ''}`}>
        {(title || actions) && (
          <header className="page-head">
            <div className="page-head-text">
              {title && <h2 className="page-title">{title}</h2>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="page-head-actions">{actions}</div>}
          </header>
        )}
        {children}
      </div>
      <Footer />
    </main>
  </div>
);

export default PageShell;
