"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { industries, pick } from '@/lib/services-data';

// Solicitud de cotización: recoge datos de contacto y documentos.
// No muestra ni calcula precios; el asesor da seguimiento con el cliente.

const T = {
  es: {
    title: 'Solicitud de cotización',
    intro: 'Comparta los datos de su carga. Si cuenta con factura comercial puede adjuntarla de manera opcional para agilizar la cotización; de lo contrario, un asesor le orientará paso a paso.',
    block1Title: '1. Información de Contacto',
    block1Sub: 'Datos del solicitante o representante para la emisión de su cotización formal',
    block2Title: '2. Operación y Mercancía',
    block2Sub: 'Régimen aduanero, modalidad logística y características del embarque',
    block3Title: '3. Documentación Digital (Opcional)',
    block3Sub: 'Adjunte archivos si dispone de ellos (Factura, ficha técnica o MSDS. Máx. 1 GB c/u)',
    hazmatAlert: 'Requerimiento normativo: Al ser mercancía peligrosa o química, es indispensable adjuntar la Hoja de Seguridad (MSDS) en el apartado siguiente para verificar regulaciones no arancelarias.',
    stepContact: 'Datos de Contacto',
    stepCargo: 'Operación y Carga',
    stepDocs: 'Documentación',
    sslBadge: 'Cifrado SSL 256-bit',
    speedBadge: 'Respuesta en < 2 Horas',
    ndaBadge: 'Confidencialidad bajo NDA',
    name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp', company: 'Empresa (opcional)',
    operation: 'Operación', import: 'Importación', export: 'Exportación',
    mode: 'Medio de transporte', air: 'Aéreo', sea: 'Marítimo', land: 'Terrestre',
    country: { import: 'País de origen', export: 'País de destino' },
    industry: 'Industria', other: 'Otra', select: '-- Seleccione --',
    description: 'Descripción de la mercancía', hazmat: 'La mercancía es peligrosa o química (requiere MSDS)',
    invoice: 'Factura comercial (Opcional)', specs: 'Especificaciones técnicas (opcional)', msds: 'MSDS / hoja de seguridad',
    fileHint: 'Documentación opcional: PDF, JPG, PNG, DOCX, XLSX o XML. Máx. 1 GB por archivo. Puede enviar su cotización sin adjuntar archivos si aún no los tiene.',
    submit: 'Enviar solicitud', loading: 'Enviando...',
    doneTitle: '¡Solicitud enviada!', ref: 'Folio',
    doneText: 'Recibimos su información. Un asesor se pondrá en contacto con usted por su medio preferido para darle seguimiento puntual a su cotización.',
    again: 'Enviar otra solicitud', talk: 'Ver datos de contacto',
    notSaved: 'No pudimos guardar su solicitud en el servidor; contáctenos por correo o WhatsApp para dar seguimiento.',
    errors: {
      default: 'No se pudo procesar su solicitud. Revise los datos e intente de nuevo.',
      rate_limited: 'Demasiadas solicitudes. Intente de nuevo más tarde.',
      name_required: 'Por favor ingrese su nombre completo.',
      email_invalid: 'Por favor ingrese un correo electrónico válido.',
      phone_required: 'Por favor ingrese su número de teléfono o WhatsApp (mínimo 7 dígitos).',
      country_required: 'Por favor ingrese el país correspondiente.',
      industry_required: 'Por favor seleccione una industria.',
      desc_required: 'Por favor describa la mercancía.',
      file_msds_required: 'Para mercancía peligrosa o química debe subir la hoja de seguridad (MSDS).',
      file_type: 'Algún archivo no es válido (use PDF, JPG, PNG, DOCX, XLSX o XML).',
      file_size: 'Algún archivo supera el límite de 1 GB.',
      recaptcha: 'No pudimos verificar que usted es una persona. Intente de nuevo.',
    },
  },
  en: {
    title: 'Quote request',
    intro: 'Share your cargo details. If you have a commercial invoice you can optionally attach it to expedite your quote; otherwise, an advisor will guide you step-by-step.',
    block1Title: '1. Contact Information',
    block1Sub: 'Applicant or representative details for official quotation dispatch',
    block2Title: '2. Cargo & Operation Details',
    block2Sub: 'Customs regime, transport logistics mode, and cargo specifications',
    block3Title: '3. Digital Documentation (Optional)',
    block3Sub: 'Attach supporting files if available (Invoice, technical sheet or MSDS. Max. 1 GB each)',
    hazmatAlert: 'Regulatory notice: For hazardous or chemical cargo, attaching the Safety Data Sheet (MSDS) below is required to verify customs requirements.',
    stepContact: 'Contact Details',
    stepCargo: 'Cargo & Route',
    stepDocs: 'Documents',
    sslBadge: '256-bit SSL Encryption',
    speedBadge: 'Response in < 2 Hours',
    ndaBadge: 'NDA Confidentiality',
    name: 'Full name', email: 'Email address', phone: 'Phone / WhatsApp', company: 'Company (optional)',
    operation: 'Operation', import: 'Import', export: 'Export',
    mode: 'Transport mode', air: 'Air', sea: 'Ocean', land: 'Land',
    country: { import: 'Country of origin', export: 'Destination country' },
    industry: 'Industry', other: 'Other', select: '-- Select --',
    description: 'Goods description', hazmat: 'Goods are hazardous or chemical (MSDS required)',
    invoice: 'Commercial invoice (Optional)', specs: 'Technical specifications (optional)', msds: 'MSDS / safety data sheet',
    fileHint: 'Optional documentation: PDF, JPG, PNG, DOCX, XLSX or XML. Max. 1 GB per file. You can submit without attachments if you do not have them yet.',
    submit: 'Send request', loading: 'Sending...',
    doneTitle: 'Request sent!', ref: 'Reference',
    doneText: 'We received your information. An advisor will contact you to follow up on your quote.',
    again: 'Send another request', talk: 'See contact details',
    notSaved: 'We could not store your request on the server; please contact us by email or WhatsApp to follow up.',
    errors: {
      default: 'Your request could not be processed. Please check the data and try again.',
      rate_limited: 'Too many requests. Please try again later.',
      name_required: 'Please enter your full name.',
      email_invalid: 'Please enter a valid email address.',
      phone_required: 'Please enter your phone or WhatsApp number (at least 7 digits).',
      country_required: 'Please enter the country.',
      industry_required: 'Please select an industry.',
      desc_required: 'Please describe the cargo.',
      file_msds_required: 'For hazardous goods you must upload the MSDS sheet.',
      file_type: 'A file is not valid (use PDF, JPG, PNG, DOCX, XLSX or XML).',
      file_size: 'A file exceeds the 1 GB limit.',
      recaptcha: 'We could not verify that you are human. Please try again.',
    },
  },
};

const initial = {
  name: '', email: '', phone: '', company: '', operation: 'import', mode: 'air', country: '', industry: '',
  description: '', hazmat: false, website: '',
};
const noFiles = { invoice: null, specs: null, msds: null };

function FileUploadBox({ id, name, label, file, onChange, onRemove, required, hint, lang }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = 'copy';
    } catch {}
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      try {
        if (typeof window !== 'undefined' && window.DataTransfer && inputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(droppedFile);
          inputRef.current.files = dt.files;
        }
      } catch {}
      onChange({ target: { name, files: [droppedFile] } });
    }
  };

  const handleZoneClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleZoneClick();
    }
  };

  const handleRemove = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove(name);
  };

  return (
    <div className="modern-file-dropzone">
      <div className="modern-file-dropzone__label-row">
        <label className="form__label" htmlFor={id} style={{ marginBottom: 0, fontWeight: 700 }}>
          {label}
        </label>
        {required && <span className="modern-file-dropzone__req">*</span>}
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.xml"
        className="modern-file-dropzone__native-input"
        onChange={onChange}
        required={required && !file}
      />

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          className="modern-file-dropzone__box"
          onClick={handleZoneClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={isDragging ? { borderColor: 'var(--color-primary)', background: 'rgba(157, 0, 0, 0.15)', transform: 'scale(1.01)' } : undefined}
        >
          <div className="modern-file-dropzone__icon-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div className="modern-file-dropzone__texts">
            <span className="modern-file-dropzone__action">
              {lang === 'es' ? 'Seleccionar o arrastrar archivo' : 'Choose or drag file'}
            </span>
            <span className="modern-file-dropzone__hint">
              {hint || (lang === 'es' ? 'PDF, imagen o doc' : 'PDF, image or doc')}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="modern-file-dropzone__selected"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={isDragging ? { borderColor: 'var(--color-primary)', background: 'rgba(157, 0, 0, 0.15)' } : undefined}
        >
          <div className="modern-file-dropzone__file-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <polyline points="9 15 11 17 15 13"></polyline>
            </svg>
          </div>
          <div className="modern-file-dropzone__file-info">
            <span className="modern-file-dropzone__filename" title={file.name}>
              {file.name}
            </span>
            <span className="modern-file-dropzone__filesize">
              {formatSize(file.size)} • {lang === 'es' ? 'Listo para adjuntar' : 'Ready to attach'}
            </span>
          </div>
          <button
            type="button"
            className="modern-file-dropzone__remove-btn"
            onClick={handleRemove}
            title={lang === 'es' ? 'Quitar archivo' : 'Remove file'}
            aria-label={lang === 'es' ? 'Quitar archivo' : 'Remove file'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function QuickQuoteForm({ lang }) {
  const t = T[lang] ?? T.es;
  const [f, setF] = useState(initial);
  const [files, setFiles] = useState(noFiles);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const set = (e) => {
    const { name, type, checked, value } = e.target;
    setF((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };
  const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB
  const setFile = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      setError(t.errors.file_size);
      setStatus('error');
      return;
    }
    setError('');
    setFiles((p) => ({ ...p, [e.target.name]: file }));
  };
  const removeFile = (fieldName) => setFiles((p) => ({ ...p, [fieldName]: null }));

  const valid =
    f.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && f.phone.trim().length >= 7 && f.country.trim() && f.industry &&
    f.description.trim() && (!f.hazmat || files.msds);

  const errText = (code) => {
    if (t.errors[code]) return t.errors[code];
    if (code?.startsWith('file_') && code.endsWith('_required')) return code.includes('msds') ? t.errors.file_msds_required : t.errors.default;
    if (code?.startsWith('file_') && code.endsWith('_type')) return t.errors.file_type;
    if (code?.startsWith('file_') && code.endsWith('_size')) return t.errors.file_size;
    return t.errors.default;
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (!f.name.trim()) {
      setError(t.errors.name_required);
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      setError(t.errors.email_invalid);
      setStatus('error');
      return;
    }
    if (!f.phone.trim() || f.phone.trim().length < 7) {
      setError(t.errors.phone_required);
      setStatus('error');
      return;
    }
    if (!f.country.trim()) {
      setError(t.errors.country_required);
      setStatus('error');
      return;
    }
    if (!f.industry) {
      setError(t.errors.industry_required);
      setStatus('error');
      return;
    }
    if (!f.description.trim()) {
      setError(t.errors.desc_required);
      setStatus('error');
      return;
    }
    if (f.hazmat && !files.msds) {
      setError(t.errors.file_msds_required);
      setStatus('error');
      return;
    }

    for (const fObj of Object.values(files)) {
      if (fObj && fObj.size > MAX_FILE_SIZE) {
        setError(t.errors.file_size);
        setStatus('error');
        return;
      }
    }

    setStatus('loading');
    setError('');
    try {
      const body = new FormData();
      Object.entries(f).forEach(([k, v]) => body.append(k, String(v)));
      if (files.invoice) body.append('invoice', files.invoice);
      if (files.specs) body.append('specs', files.specs);
      if (files.msds) body.append('msds', files.msds);

      if (siteKey && typeof window !== 'undefined' && window.grecaptcha) {
        const token = await new Promise((resolve) =>
          window.grecaptcha.ready(() => window.grecaptcha.execute(siteKey, { action: 'quote' }).then(resolve))
        );
        body.append('recaptchaToken', token);
      }

      const res = await fetch('/api/cotizador', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(errText(json.error));
        setStatus('error');
        return;
      }
      setResult(json);
      setStatus('done');
    } catch {
      setError(t.errors.default);
      setStatus('error');
    }
  }

  if (status === 'done' && result) {
    return (
      <div className="alert alert--success fade-in-up" role="status" aria-live="polite">
        <h3 className="text-primary mb-2">{t.doneTitle}</h3>
        <p className="text-sm text-text-muted mb-2">{t.ref}: <strong>{result.ref}</strong></p>
        <p className="text-text-muted mb-4">{t.doneText}</p>
        {!result.saved && <p className="text-sm text-text-muted mb-4">{t.notSaved}</p>}
        <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
          <Link href={`/${lang}/contacto`} className="btn btn--primary">{t.talk}</Link>
          <button type="button" className="btn btn--secondary" onClick={() => { setResult(null); setF(initial); setFiles(noFiles); setStatus('idle'); }}>
            {t.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {siteKey && <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} strategy="afterInteractive" />}
      
      {/* Header moderno con badge */}
      <div className="quote-form-header text-center mb-4">
        <span className="priority-badge mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
          {lang === 'es' ? 'COTIZACIÓN DIRECTA EN LÍNEA' : 'DIRECT ONLINE QUOTATION'}
        </span>
        <h2 className="text-secondary mb-2" style={{ fontSize: '1.85rem', fontWeight: 800 }}>{t.title}</h2>
        <p className="text-text-muted" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {t.intro}
        </p>

        {/* Indicadores visuales de paso modernos */}
        <div className="quote-stepper">
          <div className="quote-stepper__step">
            <span className="quote-stepper__circle">1</span>
            <span className="quote-stepper__label">{t.stepContact}</span>
          </div>
          <span className="quote-stepper__arrow" aria-hidden="true">→</span>
          <div className="quote-stepper__step">
            <span className="quote-stepper__circle">2</span>
            <span className="quote-stepper__label">{t.stepCargo}</span>
          </div>
          <span className="quote-stepper__arrow" aria-hidden="true">→</span>
          <div className="quote-stepper__step">
            <span className="quote-stepper__circle">3</span>
            <span className="quote-stepper__label">{t.stepDocs}</span>
          </div>
        </div>
      </div>

      <form className="form quote-form" onSubmit={onSubmit} noValidate>
        {/* BLOQUE 1: Datos de Contacto */}
        <div className="quote-block">
          <div className="quote-block__header">
            <div className="quote-block__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="quote-block__titles">
              <h3 className="quote-block__title">{t.block1Title}</h3>
              <p className="quote-block__subtitle">{t.block1Sub}</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form__group">
              <label className="form__label" htmlFor="q-name">{t.name} *</label>
              <input id="q-name" name="name" className="form__input" value={f.name} onChange={set} required maxLength={120} autoComplete="name" />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-email">{t.email} *</label>
              <input id="q-email" name="email" type="email" className="form__input" value={f.email} onChange={set} required maxLength={160} autoComplete="email" />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-phone">{t.phone} *</label>
              <input id="q-phone" name="phone" type="tel" className="form__input" value={f.phone} onChange={set} required aria-required="true" maxLength={40} autoComplete="tel" />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-company">{t.company}</label>
              <input id="q-company" name="company" className="form__input" value={f.company} onChange={set} maxLength={160} autoComplete="organization" />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: Detalles de la Operación y Carga */}
        <div className="quote-block">
          <div className="quote-block__header">
            <div className="quote-block__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="quote-block__titles">
              <h3 className="quote-block__title">{t.block2Title}</h3>
              <p className="quote-block__subtitle">{t.block2Sub}</p>
            </div>
          </div>

          <div className="form-grid mb-4">
            <div className="form__group">
              <label className="form__label" htmlFor="q-operation">{t.operation} *</label>
              <select id="q-operation" name="operation" className="form__input" value={f.operation} onChange={set}>
                <option value="import">{t.import}</option>
                <option value="export">{t.export}</option>
              </select>
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-mode">{t.mode} *</label>
              <select id="q-mode" name="mode" className="form__input" value={f.mode} onChange={set}>
                <option value="air">{t.air}</option>
                <option value="sea">{t.sea}</option>
                <option value="land">{t.land}</option>
              </select>
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-country">{t.country[f.operation]} *</label>
              <input id="q-country" name="country" className="form__input" value={f.country} onChange={set} required maxLength={80} />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="q-industry">{t.industry} *</label>
              <select id="q-industry" name="industry" className="form__input" value={f.industry} onChange={set} required>
                <option value="" disabled>{t.select}</option>
                {industries.map((i) => <option key={i.id} value={i.id}>{pick(i.label, lang)}</option>)}
                <option value="otro">{t.other}</option>
              </select>
            </div>
          </div>

          <div className="form__group mb-3">
            <label className="form__label" htmlFor="q-desc">{t.description} *</label>
            <textarea id="q-desc" name="description" rows={3} className="form__input" value={f.description} onChange={set} required maxLength={500} />
          </div>

          <div className="form__group" style={{ marginBottom: 0 }}>
            <label className="quote-check">
              <input type="checkbox" name="hazmat" checked={f.hazmat} onChange={set} /> {t.hazmat}
            </label>
            {f.hazmat && (
              <div className="quote-hazmat-alert" role="alert">
                <svg className="quote-hazmat-alert__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="quote-hazmat-alert__text">{t.hazmatAlert}</p>
              </div>
            )}
          </div>
        </div>

        {/* BLOQUE 3: Documentación de Soporte */}
        <div className="quote-block">
          <div className="quote-block__header">
            <div className="quote-block__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="quote-block__titles">
              <h3 className="quote-block__title">{t.block3Title}</h3>
              <p className="quote-block__subtitle">{t.block3Sub}</p>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <FileUploadBox
              id="q-invoice"
              name="invoice"
              label={t.invoice}
              file={files.invoice}
              onChange={setFile}
              onRemove={() => removeFile('invoice')}
              required={false}
              hint={lang === 'es' ? 'PDF, XML o imagen' : 'PDF, XML or image'}
              lang={lang}
            />
            <FileUploadBox
              id="q-specs"
              name="specs"
              label={t.specs}
              file={files.specs}
              onChange={setFile}
              onRemove={() => removeFile('specs')}
              required={false}
              hint={lang === 'es' ? 'Ficha técnica / packing' : 'Tech sheet / packing'}
              lang={lang}
            />
            <FileUploadBox
              id="q-msds"
              name="msds"
              label={t.msds}
              file={files.msds}
              onChange={setFile}
              onRemove={() => removeFile('msds')}
              required={f.hazmat}
              hint={lang === 'es' ? 'Hoja de seguridad' : 'Safety data sheet'}
              lang={lang}
            />
          </div>
          <p className="text-sm text-text-muted mb-0">{t.fileHint}</p>
        </div>

        {/* Honeypot anti-bot (oculto para personas) */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set} /></label>
        </div>

        <div className="form__legal mb-4">
          <p className="text-sm text-text-muted">
            {lang === 'es' ? 'Al enviar acepta nuestro ' : 'By submitting you accept our '}
            <Link href={`/${lang}/privacidad`} className="text-primary" style={{ textDecoration: 'underline' }}>
              {lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy'}
            </Link>
            {lang === 'es' ? ' (LFPDPPP).' : '.'}
          </p>
        </div>

        {status === 'error' && (
          <div className="alert alert--error mb-4" role="alert" style={{ padding: '0.85rem 1.25rem', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn--primary quote-submit-btn" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20"></circle>
              </svg>
              <span>{t.loading}</span>
            </>
          ) : (
            <>
              <span>{t.submit}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </>
          )}
        </button>

        {/* Sellos de confianza y seguridad con iconos vectoriales */}
        <div className="quote-trust-row">
          <span className="quote-trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            {t.sslBadge}
          </span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span className="quote-trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            {t.speedBadge}
          </span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span className="quote-trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            {t.ndaBadge}
          </span>
        </div>
      </form>
    </>
  );
}
