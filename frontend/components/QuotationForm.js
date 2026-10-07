"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function QuotationForm({ lang }) {
  const [formData, setFormData] = useState({ name: '', email: '', service: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  // Validación estructural en tiempo real (Frontend)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email);
  const isNameValid = formData.name.trim().length > 0;
  const isServiceValid = formData.service !== '';
  const isValid = isEmailValid && isNameValid && isServiceValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus('loading');

    // Integración de validación criptográfica Google reCAPTCHA v3
    if (typeof window !== 'undefined' && window.grecaptcha) {
      try {
        window.grecaptcha.ready(async () => {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
          const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
          
          // Aquí enviaríamos el vector V = <n, e, s, c> al servidor
          // const payload = { ...formData, recaptchaToken: token };
          
          // Simulación de respuesta exitosa asíncrona para la maqueta
          setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', service: '' });
          }, 1000);
        });
      } catch (error) {
        console.error("Error validando reCAPTCHA:", error);
        setStatus('error');
      }
    } else {
      // Fallback temporal en caso de que reCAPTCHA no cargue
      setTimeout(() => setStatus('success'), 1000);
    }
  };

  if (status === 'success') {
    return (
      <div className="alert alert--success fade-in-up" role="status" aria-live="polite">
        <h3 className="text-primary mb-2">
          {lang === 'es' ? '¡Solicitud Enviada!' : 'Request Sent!'}
        </h3>
        <p className="text-text-muted mb-4">
          {lang === 'es' 
            ? 'Hemos recibido su información. Un asesor comercial se pondrá en contacto con usted por correo electrónico a la brevedad.'
            : 'We have received your information. A sales advisor will contact you via email shortly.'}
        </p>
        <button onClick={() => setStatus('idle')} className="btn btn--secondary">
          {lang === 'es' ? 'Enviar nueva solicitud' : 'Send new request'}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Script nativo de Google reCAPTCHA */}
      <Script 
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} 
        strategy="afterInteractive" 
      />
      
      <form className="form fade-in-up" onSubmit={handleSubmit}>
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

          {/* Forzado de opciones válidas según RF-01 */}
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
              <option value="Despacho">{lang === 'es' ? 'Despacho de aduana' : 'Customs Clearance'}</option>
              <option value="Seguro">{lang === 'es' ? 'Seguro de carga' : 'Cargo Insurance'}</option>
              <option value="NOM">{lang === 'es' ? 'Norma Oficial Mexicana (NOM)' : 'Official Mexican Standard (NOM)'}</option>
              <option value="Asesoría">{lang === 'es' ? 'Asesoría' : 'Consulting'}</option>
              <option value="Otros">{lang === 'es' ? 'Otros' : 'Other'}</option>
            </select>
          </div>
        </fieldset>

        <div className="form__legal mb-4">
          <p className="text-sm text-text-muted">
            {lang === 'es' ? 'Al enviar este formulario, usted acepta nuestro ' : 'By submitting this form, you accept our '}
            <Link href={`/${lang}/privacidad`} className="text-primary" style={{textDecoration: 'underline'}}>
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
            ? (lang === 'es' ? 'Validando seguridad...' : 'Validating security...') 
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
