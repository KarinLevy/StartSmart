import React from 'react';
import { useProfile } from '../../context/ProfileContext';
import './Avatar.css';

const getInitials = (first, last) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

/**
 * Reusable avatar — shows uploaded photo or StartSmart-purple initials.
 * size: 'sm' | 'md' | 'lg' | 'xl'
 */
const Avatar = ({ size = 'md', className = '', style = {} }) => {
  const { profile, avatarSrc } = useProfile();
  const initials = getInitials(profile.firstName, profile.lastName);
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div
      className={`ss-avatar ss-avatar-${size} ${className}`}
      style={style}
      aria-label={`${fullName}'s avatar`}
      role="img"
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt={`${fullName}`} className="ss-avatar-img" />
      ) : (
        <span className="ss-avatar-initials" aria-hidden="true">{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
