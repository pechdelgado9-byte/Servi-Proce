"use client";

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { industries, pick } from '@/lib/services-data';

// Solicitud de cotización: recoge datos de contacto y documentos.
// No muestra ni calcula precios; el asesor da seguimiento con el cliente.

const T = {
  es: {
    title: 'Solicitud de cotización',
    intro: 'Suba su factura comercial y los datos de su carga. Un asesor le contactará por el medio de contacto que nos indique para dar seguimiento a su cotización.',
    name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono / WhatsApp (opcional)', company: 'Empresa (opcional)',
    operation: 'Operación', import: 'Importación', export: 'Exportación',
    mode: 'Medio de transporte', air: 'Aéreo', sea: 'Marítimo', land: 'Terrestre',
    country: { import: 'País de origen', export: 'País de destino' },
    industry: 'Industria', other: 'Otra', select: '-- Seleccione --',
    description: 'Descripción de la mercancía', hazmat: 'La mercancía es peligrosa o química (requiere MSDS)',
    invoice: 'Factura comercial', specs: 'Especificaciones técnicas (opcional)', msds: 'MSDS / hoja de seguridad',
    fileHint: 'PDF, JPG, PNG, DOCX, XLSX o XML. Máx. 5 MB.',
    submit: 'Enviar solicitud', loading: 'Enviando...',
    doneTitle: '¡Solicitud enviada!', ref: 'Folio',
    doneText: 'Recibimos su información y documentos. Un asesor se pondrá en contacto con usted para dar seguimiento a su cotización.',
    again: 'Enviar otra solicitud', talk: 'Ver datos de contacto',
    notSaved: 'No pudimos guardar su solicitud en el servidor; contáctenos por correo o WhatsApp para dar seguimiento.',
    errors: {
      default: 'No se pudo procesar su solicitud. Revise los datos e intente de nuevo.',
      rate_limited: 'Demasiadas solicitudes. Intente de nuevo más tarde.',
      file_invoice_required: 'Debe subir la factura comercial.',
      file_msds_required: 'Para mercancía peligrosa debe subir el MSDS.',
      file_type: 'Algún archivo no es válido (use PDF, JPG, PNG, DOCX, XLSX o XML).',
      file_size: 'Algún archivo supera los 5 MB.',
      recaptcha: 'No pudimos verificar que usted es una persona. Intente de nuevo.',
    },
  },
  en: {
    title: 'Quote request',
    intro: 'Upload your commercial invoice and cargo details. An advisor will contact you through the contact method you provide to follow up on your quote.',
    name: 'Full name', email: 'Email address', phone: 'Phone / WhatsApp (optional)', company: 'Company (optional)',
    operation: 'Operation', import: 'Import', export: 'Export',
    mode: 'Transport mode', air: 'Air', sea: 'Ocean', land: 'Land',
    country: { import: 'Country of origin', export: 'Destination country' },
    industry: 'Industry', other: 'Other', select: '-- Select --',
    description: 'Goods description', hazmat: 'Goods are hazardous or chemical (MSDS required)',
    invoice: 'Commercial invoice', specs: 'Technical specifications (optional)', msds: 'MSDS / safety data sheet',
    fileHint: 'PDF, JPG, PNG, DOCX, XLSX or XML. Max. 5 MB.',
    submit: 'Send request', loading: 'Sending...',
    doneTitle: 'Request sent!', ref: 'Reference',
    doneText: 'We received your information and documents. An advisor will contact you to follow up on your quote.',
    again: 'Send another request', talk: 'See contact details',
    notSaved: 'We could not store your request on the server; please contact us by email or WhatsApp to follow up.',
    errors: {
      default: 'Your request could not be processed. Please check the data and try again.',
      rate_limited: 'Too many requests. Please try again later.',
      file_invoice_required: 'You must upload the commercial invoice.',
      file_msds_required: 'For hazardous goods you must upload the MSDS.',
      file_type: 'A file is not valid (use PDF, JPG, PNG, DOCX, XLSX or XML).',
      file_size: 'A file exceeds 5 MB.',
      recaptcha: 'We could not verify that you are human. Please try again.',
    },
  },
};

const initial = {
  name: '', email: '', phone: '', company: '', operation: 'import', mode: 'air', country: '', industry: '',
  description: '', hazmat: false, website: '',
};
const noFiles = { invoice: null, specs: null, msds: null };

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
  const setFile = (e) => setFiles((p) => ({ ...p, [e.target.name]: e.target.files?.[0] ?? null }));

  const valid =
    f.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && f.country.trim() && f.industry &&
    f.description.trim() && files.invoice && (!f.hazmat || files.msds);

  const errText = (code) => {
    if (t.errors[code]) return t.errors[code];
    if (code?.startsWith('file_') && code.endsWith('_required')) return code.includes('msds') ? t.errors.file_msds_required : t.errors.file_invoice_required;
    if (code?.startsWith('file_') && code.endsWith('_type')) return t.errors.file_type;
    if (code?.startsWith('file_') && code.endsWith('_size')) return t.errors.file_size;
    return t.errors.default;
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (!valid) return;
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
      <h2 className="text-secondary mb-2">{t.title}</h2>
      <p className="text-text-muted mb-4">{t.intro}</p>
      <form className="form quote-form" onSubmit={onSubmit} noValidate>
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
            <label className="form__label" htmlFor="q-phone">{t.phone}</label>
            <input id="q-phone" name="phone" type="tel" className="form__input" value={f.phone} onChange={set} maxLength={40} autoComplete="tel" />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="q-company">{t.company}</label>
            <input id="q-company" name="company" className="form__input" value={f.company} onChange={set} maxLength={160} autoComplete="organization" />
          </div>
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

        <div className="form__group">
          <label className="form__label" htmlFor="q-desc">{t.description} *</label>
          <textarea id="q-desc" name="description" rows={3} className="form__input" value={f.description} onChange={set} required maxLength={500} />
        </div>

        <div className="form__group">
          <label className="quote-check">
            <input type="checkbox" name="hazmat" checked={f.hazmat} onChange={set} /> {t.hazmat}
          </label>
        </div>

        <div className="form-grid">
          <div className="form__group">
            <label className="form__label" htmlFor="q-invoice">{t.invoice} *</label>
            <input id="q-invoice" name="invoice" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.xml" className="form__input" onChange={setFile} required />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="q-specs">{t.specs}</label>
            <input id="q-specs" name="specs" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.xml" className="form__input" onChange={setFile} />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="q-msds">{t.msds}{f.hazmat ? ' *' : ''}</label>
            <input id="q-msds" name="msds" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.xml" className="form__input" onChange={setFile} required={f.hazmat} />
          </div>
        </div>
        <p className="text-sm text-text-muted mb-4">{t.fileHint}</p>

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

        {status === 'error' && <p className="alert alert--error mb-4" role="alert">{error}</p>}

        <button type="submit" className={`btn btn--primary form__submit ${!valid ? 'btn--disabled' : ''}`} disabled={!valid || status === 'loading'} style={{ width: '100%' }}>
          {status === 'loading' ? t.loading : t.submit}
        </button>
      </form>
    </>
  );
}
