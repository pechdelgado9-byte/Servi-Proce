'use client';

import { useState } from 'react';

export default function AdminPasswordInput({ id = 'password', name = 'password', lang = 'es' }) {
  const [showPassword, setShowPassword] = useState(false);
  const isEn = lang === 'en';

  return (
    <div className="admin-input-wrap admin-input-wrap--password">
      <div className="admin-input-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        className="form__input admin-input admin-input--password"
        required
        autoComplete="current-password"
      />
      <button
        type="button"
        className="admin-password-toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
        title={showPassword ? (isEn ? 'Hide password' : 'Ocultar contraseña') : (isEn ? 'Show password' : 'Ver contraseña')}
        aria-label={showPassword ? (isEn ? 'Hide password' : 'Ocultar contraseña') : (isEn ? 'Show password' : 'Ver contraseña')}
      >
        {showPassword ? (
          /* Icono Ojo Tachado (Ocultar) */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        ) : (
          /* Icono Ojo Abierto (Ver) */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        )}
      </button>
    </div>
  );
}

