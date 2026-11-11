"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const API_CLIENT_URL = '/api/backend';

export default function UnsubscribeForm({ lang = 'es' }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | not_found | error
  const [errorMessage, setErrorMessage] = useState('');

  const isEn = lang === 'en';

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setStatus('error');
      setErrorMessage(
        isEn
          ? 'Please enter a valid corporate email address.'
          : 'Por favor ingrese un correo electrónico corporativo válido.'
      );
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_CLIENT_URL}/newsletter/unsubscribe?locale=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, locale: lang }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(
          isEn
            ? 'Unable to process your request. Please check the email and try again.'
            : 'No fue posible procesar la solicitud. Verifique el correo o intente más tarde.'
        );
        return;
      }

      if (data.removed) {
        setStatus('success');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        isEn
          ? 'Network error. Please try again later.'
          : 'Error de red. Por favor intente más tarde.'
      );
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  if (status === 'success') {
    return (
      <div className="card glass-card fade-in-up" style={{ padding: '2.5rem', borderRadius: '1.25rem', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '0.75rem' }}>
          {isEn ? 'Subscription Successfully Canceled' : 'Suscripción Cancelada con Éxito'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
          {isEn
            ? `Your email (${email}) has been permanently removed from our newsletter distribution list. You will no longer receive foreign trade alerts from Servi Proce.`
            : `Su correo (${email}) ha sido removido definitivamente de nuestra lista de difusión. Ya no recibirá circulares ni avisos de comercio exterior de Servi Proce.`}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn--secondary text-sm"
          style={{ padding: '0.55rem 1.25rem' }}
        >
          {isEn ? 'Cancel another email address' : 'Cancelar otro correo electrónico'}
        </button>
      </div>
    );
  }

  return (
    <div className="card glass-card fade-in-up" style={{ padding: '2.75rem 2.25rem', borderRadius: '1.25rem' }}>
      <form onSubmit={handleUnsubscribe} noValidate>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="unsub-email"
            style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '0.5rem' }}
          >
            {isEn ? 'Registered Email Address' : 'Correo Electrónico Registrado'}
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '1rem', color: '#94a3b8', pointerEvents: 'none', display: 'flex' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              id="unsub-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder={isEn ? 'example@company.com' : 'ejemplo@empresa.com.mx'}
              className="newsletter-input"
              style={{ width: '100%', paddingLeft: '2.85rem' }}
              required
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {status === 'not_found' && (
          <div className="newsletter-feedback newsletter-feedback--already fade-in-up" style={{ marginBottom: '1.25rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                {isEn ? 'Email not currently subscribed' : 'El correo no se encuentra suscrito'}
              </div>
              <div style={{ fontSize: '0.84rem' }}>
                {isEn
                  ? 'This address was not found in our active subscriber list or has already been canceled.'
                  : 'Esta dirección no figura en nuestra lista activa o ya fue cancelada previamente.'}
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="newsletter-feedback newsletter-feedback--error fade-in-up" style={{ marginBottom: '1.25rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary w-full"
          style={{ width: '100%', padding: '0.85rem 1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', boxShadow: '0 4px 16px rgba(185, 28, 28, 0.35)' }}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? (isEn ? 'Canceling subscription...' : 'Cancelando suscripción...')
            : (isEn ? 'Confirm Unsubscription' : 'Confirmar Cancelación de Suscripción')}
        </button>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
          {isEn
            ? 'Complies with LFPDPPP and CAN-SPAM regulations. Unsubscription is immediate.'
            : 'Cumplimiento normativo LFPDPPP y CAN-SPAM. La baja se aplica en tiempo real.'}
        </p>
      </form>
    </div>
  );
}

