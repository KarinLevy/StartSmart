import React from 'react';
import PageShell from '../../components/PageShell/PageShell';
import './Profile.css';

// Placeholder/dummy user — replaced by real account data once the backend is connected.
const user = {
  firstName: 'Maya',
  lastName: 'Cohen',
  username: 'maya_c',
  email: 'maya@example.com',
  phone: '050-123-4567',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8GuD2wPPDTlH7P0VxUJXoUCMroXZ0feEIyxxQbesa8F9FVMkARnJqI_E48IKMpYPnVJz47Yvo8Wrt2-drYftGKXDi6FZge3Of65zB3ugt1dX-yyKN28MjiGPKVSw72dPbI2LNkaMpoqAFscvc-4CLyoLPo0luZbYAbfqDjhtTXNAgAFtGq7XZuX6PrMmS31sX21Pk1P4tayMZG0cJKAB3zszct7hr5UpOFaFsJLju2OuLgllb60g0iyl-1bgGCK8luQZURHSbdf4',
};

const Profile = () => {
  return (
    <PageShell narrow title="Profile" subtitle="Manage your personal details and account info.">
      <div className="surface-card pr-card">
        <div className="pr-head">
          <div className="pr-avatar">
            <img src={user.avatar} alt={`${user.firstName}'s avatar`} />
          </div>
          <div className="pr-head-info">
            <h3 className="pr-name">{user.firstName} {user.lastName}</h3>
            <span className="pr-username">@{user.username}</span>
          </div>
          <button className="auth-avatar-btn pr-change-avatar">Change photo</button>
        </div>

        <form className="pr-form" onSubmit={(e) => e.preventDefault()}>
          <div className="pr-grid">
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-first">First name</label>
              <input className="auth-input" id="pr-first" defaultValue={user.firstName} />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-last">Last name</label>
              <input className="auth-input" id="pr-last" defaultValue={user.lastName} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-username">Username</label>
            <input className="auth-input" id="pr-username" defaultValue={user.username} />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-email">Email</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon">mail</span>
              <input className="auth-input" id="pr-email" type="email" defaultValue={user.email} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-phone">Phone</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon">call</span>
              <input className="auth-input" id="pr-phone" type="tel" defaultValue={user.phone} />
            </div>
          </div>

          <div className="pr-actions">
            <button type="button" className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined">check</span>
              Save changes
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default Profile;
