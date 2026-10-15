"use client";

import { useState } from 'react';
import Link from 'next/link';

function SubserviceIcon({ id }) {
  if (id === 'importacion') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    );
  }
  if (id === 'exportacion') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    );
  }
  if (id === 'temporales') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.5 2v6h-6"></path>
        <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

// Subservicios de Despacho Aduanal modernizados
export default function DespachoBullets({ lang, items }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? null);

  return (
    <ul className="bullets" role="list">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <li key={item.id} className={`bullet ${open ? 'bullet--open' : ''}`}>
            <button
              type="button"
              className="bullet__head"
              aria-expanded={open}
              aria-controls={`bullet-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <div className="bullet__icon-box">
                <SubserviceIcon id={item.id} />
              </div>
              <span className="bullet__title">{item.title}</span>
              <span className="bullet__chevron" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {open && (
              <div id={`bullet-${item.id}`} className="bullet__body">
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                      <strong style={{ color: 'var(--color-secondary)' }}>{lang === 'es' ? 'Qué incluye: ' : 'What it includes: '}</strong>
                      {item.includes}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                      <strong style={{ color: 'var(--color-secondary)' }}>{lang === 'es' ? 'Para quién es: ' : 'Who it is for: '}</strong>
                      {item.forWho}
                    </p>
                  </div>
                </div>
                <Link href="#cotizador" className="btn btn--primary text-sm" style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem' }}>
                  <span>{lang === 'es' ? 'Cotizar este despacho' : 'Quote this clearance'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

