"use client";

import { useState } from 'react';

export default function NewsletterForm({ lang }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    // Simulación de registro en el boletín informativo (Frontend)
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 600);
  };

  if (status === 'success') {
    return (
      <div className="alert alert--success fade-in-up" role="status" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <p className="font-bold text-secondary mb-1">
          {lang === 'es' ? '¡Gracias por suscribirse!' : 'Thank you for subscribing!'}
        </p>
        <p className="text-sm text-text-muted">
          {lang === 'es' 
            ? 'Recibirá nuestras actualizaciones de comercio exterior directamente en su bandeja de entrada.' 
            : 'You will receive our foreign trade updates directly in your inbox.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder={lang === 'es' ? 'Su correo electrónico' : 'Your email address'} 
          className="form__input" 
          style={{ flex: 1 }}
          required
          aria-label={lang === 'es' ? 'Correo electrónico para boletín' : 'Email address for newsletter'}
        />
        <button 
          type="submit" 
          className="btn btn--primary animate-pulse"
          disabled={status === 'loading'}
        >
          {status === 'loading' 
            ? (lang === 'es' ? 'Enviando...' : 'Sending...') 
            : (lang === 'es' ? 'Suscribir' : 'Subscribe')}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-primary text-left" role="alert">
          {lang === 'es' ? 'Por favor ingrese un correo electrónico válido.' : 'Please enter a valid email address.'}
        </p>
      )}
    </form>
  );
}
