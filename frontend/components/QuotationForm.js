"use client";

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

export default function QuotationForm({ lang }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    description: '',
    website: '', // honeypot anti-bots
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [reference, setReference] = useState('');

  // Validación estructural en tiempo real (RF-04 Precondición 1: len(n) > 0 ^ Regex_rfc5322(e) = True ^ s != empty)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const isEmailValid = emailRegex.test(formData.email);
  const isNameValid = formData.name.trim().length > 0;
  const isServiceValid = formData.service !== '';
  const isValid = isEmailValid && isNameValid && isServiceValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') setStatus('idle');
  };

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const sendToBackend = async (recaptchaToken = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        if (response.status === 403 && data.error === 'recaptcha') {
          setErrorMsg(
            lang === 'es'
              ? 'La validación de seguridad anti-spam (reCAPTCHA) rechazó la solicitud (HTTP 403).'
              : 'Anti-spam security validation (reCAPTCHA) rejected the request (HTTP 403).'
          );
        } else {
          setErrorMsg(
            lang === 'es'
              ? 'No se pudo procesar su solicitud. Por favor verifique los campos e intente nuevamente.'
              : 'Could not process your request. Please check the fields and try again.'
          );
        }
        setStatus('error');
        return;
      }

      setReference(data.ref || '');
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', service: '', description: '', website: '' });
    } catch {
      setErrorMsg(
        lang === 'es'
          ? 'No fue posible conectar con el servidor de cotizaciones. Puede contactarnos directamente por WhatsApp o correo.'
          : 'Could not connect to the quotation server. You may contact us directly via WhatsApp or email.'
      );
      setStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus('loading');
    setErrorMsg('');

    // RF-04: Validación criptográfica Google reCAPTCHA v3
    if (siteKey && typeof window !== 'undefined' && window.grecaptcha) {
      try {
        window.grecaptcha.ready(async () => {
          const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
          await sendToBackend(token);
        });
      } catch {
        setStatus('error');
      }
    } else {
      await sendToBackend('dev-human-token');
    }
  };

  if (status === 'success') {
    return (
      <div className="alert alert--success fade-in-up" role="status" aria-live="polite">
        <h3 className="text-primary mb-2">
          {lang === 'es' ? '¡Solicitud Enviada!' : 'Request Sent!'}
        </h3>
        {reference && (
          <p className="text-sm text-secondary mb-2">
            {lang === 'es' ? 'Folio de seguimiento:' : 'Tracking reference:'} <strong>{reference}</strong>
          </p>
        )}
        <p className="text-text-muted mb-4">
          {lang === 'es'
            ? 'Hemos registrado su información en nuestra base de datos y notificado a nuestro departamento comercial. Un asesor se pondrá en contacto con usted por correo electrónico a la brevedad.'
            : 'We have logged your information in our database and notified our sales department. An advisor will contact you via email shortly.'}
        </p>
        <button onClick={() => setStatus('idle')} className="btn btn--secondary">
          {lang === 'es' ? 'Enviar nueva solicitud' : 'Send new request'}
        </button>
      </div>
    );
  }

  return (
    <>
      {siteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      )}

      <form className="form fade-in-up" onSubmit={handleSubmit}>
        {/* Honeypot anti-bots */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        />

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only" style={{ display: 'none' }}>
            {lang === 'es' ? 'Datos de cotización' : 'Quotation Details'}
          </legend>

          <div className="form__group">
            <label htmlFor="name" className="form__label">
              {lang === 'es' ? 'Nombre Completo' : 'Full Name'} <span className="text-primary" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form__input"
              value={formData.name}
              onChange={handleChange}
              placeholder={lang === 'es' ? 'Ej. Juan Pérez' : 'E.g. John Doe'}
              required
              aria-required="true"
            />
          </div>

          <div className="form__group">
            <label htmlFor="email" className="form__label">
              {lang === 'es' ? 'Correo Electrónico' : 'Email Address'} <span className="text-primary" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form__input"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@empresa.com"
              required
              aria-required="true"
            />
          </div>

          {/* Selección obligatoria de servicio según RF-01 y Sección 3.1.1 del ERS */}
          <div className="form__group">
            <label htmlFor="service" className="form__label">
              {lang === 'es' ? 'Servicio de Interés' : 'Service of Interest'} <span className="text-primary" aria-hidden="true">*</span>
            </label>
            <select
              id="service"
              name="service"
              className="form__input"
              value={formData.service}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="" disabled>
                {lang === 'es' ? '-- Seleccione un servicio --' : '-- Select a service --'}
              </option>
              <option value="Despacho de Aduana">{lang === 'es' ? 'Despacho de aduana' : 'Customs Clearance'}</option>
              <option value="Seguro de Mercancía">{lang === 'es' ? 'Seguro de carga' : 'Cargo Insurance'}</option>
              <option value="Transporte Aéreo">{lang === 'es' ? 'Transporte Aéreo' : 'Air Freight'}</option>
              <option value="Transporte Terrestre">{lang === 'es' ? 'Transporte Terrestre' : 'Land Freight'}</option>
              <option value="Transporte Marítimo">{lang === 'es' ? 'Transporte Marítimo' : 'Sea Freight'}</option>
              <option value="Norma Oficial Mexicana (NOM)">{lang === 'es' ? 'Norma Oficial Mexicana (NOM)' : 'Official Mexican Standard (NOM)'}</option>
              <option value="Asesoría">{lang === 'es' ? 'Asesoría' : 'Consulting'}</option>
              <option value="Otros">{lang === 'es' ? 'Otros' : 'Other'}</option>
            </select>
          </div>

          <div className="form__group">
            <label htmlFor="description" className="form__label">
              {lang === 'es' ? 'Comentarios sobre su operación (Opcional)' : 'Operation details (Optional)'}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form__input"
              value={formData.description}
              onChange={handleChange}
              placeholder={lang === 'es' ? 'Describa brevemente su mercancía o requerimiento...' : 'Briefly describe your cargo or requirement...'}
              maxLength={500}
            />
          </div>
        </fieldset>

        {status === 'error' && errorMsg && (
          <div className="alert alert--error mb-4" role="alert">
            {errorMsg}
          </div>
        )}

        <div className="form__legal mb-4">
          <p className="text-sm text-text-muted">
            {lang === 'es' ? 'Al enviar este formulario, usted acepta nuestro ' : 'By submitting this form, you accept our '}
            <Link href={`/${lang}/privacidad`} className="text-primary" style={{ textDecoration: 'underline' }}>
              {lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy'}
            </Link>
            {lang === 'es' ? ' en cumplimiento con la LFPDPPP.' : '.'}
          </p>
        </div>

        <button
          type="submit"
          className={`btn btn--primary form__submit ${!isValid ? 'btn--disabled' : ''}`}
          disabled={!isValid || status === 'loading'}
          aria-disabled={!isValid || status === 'loading'}
          style={{ width: '100%' }}
        >
          {status === 'loading'
            ? (lang === 'es' ? 'Enviando solicitud...' : 'Sending request...')
            : (lang === 'es' ? 'Solicitar Cotización' : 'Request Quote')}
        </button>

        <p className="text-sm text-text-muted text-center mt-4">
          This site is protected by reCAPTCHA and the Google
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary"> Privacy Policy</a> and
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-primary"> Terms of Service</a> apply.
        </p>
      </form>
    </>
  );
}
