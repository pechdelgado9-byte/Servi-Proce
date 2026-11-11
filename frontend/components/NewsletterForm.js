"use client";

import { useState } from 'react';
import Link from 'next/link';

const API_CLIENT_URL = '/api/backend';

export default function NewsletterForm({ lang = 'es', variant = 'section' }) {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('subscribe'); // 'subscribe' | 'unsubscribe'
  const [status, setStatus] = useState('idle'); // idle | loading | success | already | unsubscribed | not_found | error
  const [errorMessage, setErrorMessage] = useState('');

  const isEn = lang === 'en';

  const handleSubmit = async (e) => {
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
      if (mode === 'unsubscribe') {
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
              ? 'Could not process unsubscription. Please try again later.'
              : 'No fue posible procesar la baja. Por favor intente más tarde.'
          );
          return;
        }

        if (data.removed) {
          setStatus('unsubscribed');
        } else {
          setStatus('not_found');
        }
        return;
      }

      // Modo suscripción
      const res = await fetch(`${API_CLIENT_URL}/newsletter?locale=${lang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(
          isEn
            ? 'Unable to complete your subscription. Please verify your email or try again.'
            : 'No fue posible completar su registro. Verifique el correo o intente más tarde.'
        );
        return;
      }

      if (data.alreadySubscribed) {
        setStatus('already');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMessage(
        isEn
          ? 'Connection error. Please check your network and try again.'
          : 'Error de conexión con el servidor. Por favor intente más tarde.'
      );
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
  };

  /* =========================================================================
     COMPACT VARIANT (FOR FOOTER)
     ========================================================================= */
  if (variant === 'compact') {
    return (
      <div className="newsletter-compact">
        <h4 className="newsletter-compact__title">
          {isEn ? 'Foreign Trade Newsletter' : 'Boletín Informativo'}
        </h4>
        <p className="newsletter-compact__desc">
          {isEn
            ? 'Get customs regulatory updates, SAT rules, and operational alerts in your inbox.'
            : 'Reciba cambios normativos del SAT, reglas aduanales y alertas operativas en su correo.'}
        </p>

        {status === 'success' ? (
          <div className="newsletter-feedback newsletter-feedback--success fade-in-up" style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>{isEn ? '¡Subscription confirmed!' : '¡Suscripción confirmada!'}</div>
              <div style={{ color: '#cbd5e1' }}>{isEn ? 'Check your inbox for our welcome notice.' : 'Le enviamos un correo de confirmación.'}</div>
              <button type="button" onClick={handleReset} className="newsletter-feedback__reset">
                {isEn ? 'Subscribe another' : 'Registrar otro'}
              </button>
            </div>
          </div>
        ) : status === 'already' ? (
          <div className="newsletter-feedback newsletter-feedback--already fade-in-up" style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>{isEn ? 'Already subscribed' : 'Correo ya registrado'}</div>
              <div style={{ color: '#cbd5e1' }}>{isEn ? 'This email is already part of our official list.' : 'Su correo ya forma parte de nuestra lista oficial.'}</div>
              <button type="button" onClick={handleReset} className="newsletter-feedback__reset">
                {isEn ? 'Change email' : 'Cambiar correo'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="newsletter-compact__form">
              <div className="newsletter-compact__input-wrap">
                <span className="newsletter-compact__icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={isEn ? 'corporate@company.com' : 'correo@empresa.com'}
                  className="newsletter-compact__input"
                  required
                  aria-label={isEn ? 'Corporate email for newsletter' : 'Correo corporativo para boletín'}
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                className="newsletter-compact__submit"
                disabled={status === 'loading'}
                aria-label={isEn ? 'Subscribe to newsletter' : 'Suscribirse al boletín'}
                title={isEn ? 'Subscribe' : 'Suscribirse'}
              >
                {status === 'loading' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm mt-2" role="alert" style={{ color: '#ef4444', fontSize: '0.78rem' }}>
                {errorMessage}
              </p>
            )}
            <div className="newsletter-compact__trust" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>{isEn ? 'Zero spam' : 'Cero spam'}</span>
              </span>
              <Link
                href={`/${lang}/desuscribir`}
                style={{ color: '#94a3b8', fontSize: '0.74rem', textDecoration: 'underline' }}
              >
                {isEn ? 'Cancel subscription' : 'Cancelar suscripción'}
              </Link>
            </div>
          </form>
        )}
      </div>
    );
  }

  /* =========================================================================
     SECTION VARIANT (FEATURED HERO/FOOTER CARD FOR HOME, AVISOS, BLOG)
     ========================================================================= */
  return (
    <div className="newsletter-card fade-in-up">
      {/* Badge con Radar Pulsante */}
      <div className="newsletter-card__badge">
        <span className="newsletter-card__badge-dot" aria-hidden="true"></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>
          {mode === 'unsubscribe'
            ? (isEn ? 'Newsletter Unsubscribe' : 'Cancelación de Boletín Informativo')
            : (isEn ? 'Official Foreign Trade Newsletter' : 'Boletín Oficial de Comercio Exterior')}
        </span>
      </div>

      {/* Título de Alto Impacto */}
      <h2 className="newsletter-card__title">
        {mode === 'unsubscribe'
          ? (isEn
              ? 'Cancel Your Newsletter Subscription'
              : '¿Desea cancelar su suscripción a nuestro boletín?')
          : (isEn
              ? 'Stay Ahead with Foreign Trade Notices & Customs Regulations'
              : '¿Desea recibir actualizaciones normativas y avisos de comercio exterior?')}
      </h2>

      {/* Descripción Ejecutiva */}
      <p className="newsletter-card__desc">
        {mode === 'unsubscribe'
          ? (isEn
              ? 'Enter your registered email below. You will immediately stop receiving our trade alerts and operational circulars.'
              : 'Ingrese su correo electrónico registrado. Dejará de recibir de inmediato nuestras circulares de comercio exterior y avisos operativos.')
          : (isEn
              ? 'Subscribe to our official circular. Receive crucial updates on SAT regulations, tariff modifications, logistics operational alerts, and international trade decrees directly in your email.'
              : 'Suscríbase a nuestro boletín informativo oficial. Reciba cambios normativos del SAT, reglas generales de comercio exterior, circulares aduanales y avisos operativos directamente en su bandeja de entrada.')}
      </p>

      {/* Estados de Éxito / Duplicado / Desuscrito */}
      {status === 'success' ? (
        <div className="newsletter-feedback newsletter-feedback--success fade-in-up" role="status">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div style={{ flex: 1 }}>
            <div className="newsletter-feedback__title">
              {isEn ? 'Subscription Confirmed Successfully!' : '¡Suscripción Confirmada con Éxito!'}
            </div>
            <div className="newsletter-feedback__desc">
              {isEn
                ? 'We have dispatched a welcome notification to your inbox. You are now registered to receive official bulletins from Servi Proce.'
                : 'Hemos enviado un acuse corporativo de bienvenida a su correo. A partir de ahora recibirá las circulares oficiales y avisos aduanales de Servi Proce.'}
            </div>
            <button type="button" onClick={handleReset} className="newsletter-feedback__reset">
              {isEn ? '← Register another email address' : '← Registrar otro correo electrónico'}
            </button>
          </div>
        </div>
      ) : status === 'unsubscribed' ? (
        <div className="newsletter-feedback newsletter-feedback--success fade-in-up" role="status">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <div style={{ flex: 1 }}>
            <div className="newsletter-feedback__title">
              {isEn ? 'Subscription Canceled' : 'Suscripción Cancelada Exitosamente'}
            </div>
            <div className="newsletter-feedback__desc">
              {isEn
                ? `Your email (${email}) has been removed from our distribution list. You will no longer receive foreign trade emails.`
                : `Su correo (${email}) ha sido removido de nuestra lista de difusión. Ya no recibirá comunicados de comercio exterior.`}
            </div>
            <button
              type="button"
              onClick={() => { setMode('subscribe'); handleReset(); }}
              className="newsletter-feedback__reset"
            >
              {isEn ? '← Subscribe again' : '← Volver a suscribirme'}
            </button>
          </div>
        </div>
      ) : status === 'not_found' ? (
        <div className="newsletter-feedback newsletter-feedback--already fade-in-up" role="status">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style={{ flex: 1 }}>
            <div className="newsletter-feedback__title">
              {isEn ? 'Email Not Found in List' : 'Correo no encontrado en la lista'}
            </div>
            <div className="newsletter-feedback__desc">
              {isEn
                ? 'This email address is not active in our database or has already been canceled.'
                : 'Esta dirección no se encuentra activa en nuestra base de datos o ya fue dada de baja con anterioridad.'}
            </div>
            <button type="button" onClick={handleReset} className="newsletter-feedback__reset">
              {isEn ? 'Try another email' : 'Probar con otro correo'}
            </button>
          </div>
        </div>
      ) : status === 'already' ? (
        <div className="newsletter-feedback newsletter-feedback--already fade-in-up" role="status">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div style={{ flex: 1 }}>
            <div className="newsletter-feedback__title">
              {isEn ? 'Email Already Subscribed' : 'Correo ya se encuentra registrado'}
            </div>
            <div className="newsletter-feedback__desc">
              {isEn
                ? 'This email address is already active on our distribution list. If you are not receiving our notices, please check your spam folder or contact us.'
                : 'Esta dirección ya forma parte de nuestra lista activa de suscriptores. Si no ha recibido nuestras circulares, revise su carpeta de spam o comuníquese con nosotros.'}
            </div>
            <button type="button" onClick={handleReset} className="newsletter-feedback__reset">
              {isEn ? '← Register another email address' : '← Registrar otro correo electrónico'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="newsletter-form-group">
            <div className="newsletter-input-wrap">
              <span className="newsletter-input-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder={isEn ? 'corporate.email@company.com' : 'ejemplo@empresa.com.mx'}
                className="newsletter-input"
                required
                aria-label={isEn ? 'Corporate email' : 'Correo electrónico'}
                disabled={status === 'loading'}
              />
            </div>
            <button
              type="submit"
              className="newsletter-submit-btn"
              disabled={status === 'loading'}
              style={mode === 'unsubscribe' ? { background: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)' } : {}}
            >
              {status === 'loading' ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                  </svg>
                  <span>{isEn ? 'Processing...' : 'Procesando...'}</span>
                </>
              ) : mode === 'unsubscribe' ? (
                <>
                  <span>{isEn ? 'Cancel Subscription' : 'Cancelar Suscripción'}</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Subscribe Now' : 'Suscribirme'}</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>

          {status === 'error' && (
            <div className="newsletter-feedback newsletter-feedback--error fade-in-up" role="alert" style={{ marginTop: '1.25rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>{errorMessage}</div>
            </div>
          )}
        </form>
      )}

      {/* Sellos de Confianza y Privacidad Corporativa */}
      <div className="newsletter-trust-tags">
        <div className="newsletter-trust-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>{isEn ? 'Zero Spam Policy' : 'Cero Spam garantizado'}</span>
        </div>
        <div className="newsletter-trust-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>{isEn ? 'Protected under Privacy Notice' : 'Protección bajo Aviso de Privacidad'}</span>
        </div>
        <div className="newsletter-trust-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {mode === 'subscribe' ? (
            <button
              type="button"
              onClick={() => { setMode('unsubscribe'); handleReset(); }}
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {isEn ? 'Cancel subscription anytime' : 'Cancele cuando lo desee'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('subscribe'); handleReset(); }}
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {isEn ? 'Want to subscribe? Click here' : '¿Desea suscribirse? Haga clic aquí'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
