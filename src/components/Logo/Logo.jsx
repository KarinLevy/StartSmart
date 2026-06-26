import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

/*
 * Shared Logo component — single source of truth for StartSmart branding.
 *
 * Props:
 *   to        — link destination (default '/')
 *   size      — 'sm' | 'md' | 'lg'  (default 'md')
 *   className — extra classes on the root <Link>
 *
 * Sizes:
 *   sm  — compact nav bars, footer-page headers
 *   md  — marketing nav, app Navbar  (matches original landing reference)
 *   lg  — auth card headers (Login, Register, ForgotPassword)
 */
const Logo = ({ to = '/', size = 'md', className = '' }) => (
  <Link
    to={to}
    className={`ss-logo ss-logo--${size}${className ? ` ${className}` : ''}`}
    aria-label="StartSmart home"
  >
    <div className="ss-logo__icon" aria-hidden="true">
      <span className="material-symbols-outlined">rocket_launch</span>
    </div>
    <span className="ss-logo__text">StartSmart</span>
  </Link>
);

export default Logo;
