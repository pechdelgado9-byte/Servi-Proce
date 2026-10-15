"use client";

import { useState } from 'react';
import Link from 'next/link';

// Servicios secundarios modernizados: selector dinámico con numeración, detalle visual con imagen y beneficios claros.
export default function ServiciosInteractivos({ lang, items }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const active = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <div className="master-detail">
      <div className="master-detail__list" role="tablist" aria-orientation="vertical" aria-label={lang === 'es' ? 'Lista de Servicios' : 'Services List'}>
        {items.map((item, idx) => {
          const isActive = item.id === (active?.id ?? items[0]?.id);
          const indexNum = String(idx + 1).padStart(2, '0');
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="service-panel"
              className={`master-detail__item ${isActive ? 'master-detail__item--active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="master-detail__index">{indexNum}</span>
                <span>{item.title}</span>
              </div>
              <svg className="master-detail__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          );
        })}
      </div>

      {active && (
        <div id="service-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="master-detail__panel">
          <div key={active.id} className="service-detail-anim">
            {active.image && (
              <div className="service-detail__media">
                <img src={active.image} alt={active.title} loading="lazy" />
                <span className="service-detail__badge-overlay">
                  {lang === 'es' ? 'Servicio Especializado' : 'Specialized Service'}
                </span>
              </div>
            )}

            <div className="service-detail__header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="text-secondary" style={{ fontSize: '1.5rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                {active.title}
              </h3>
              <div style={{ width: '45px', height: '3px', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
            </div>

            <div className="service-detail__block" style={{ marginBottom: '1.5rem' }}>
              <h4 className="text-primary uppercase" style={{ fontSize: '0.82rem', letterSpacing: '0.06em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                {lang === 'es' ? 'Alcance y Operación' : 'Scope and Operations'}
              </h4>
              <p className="text-text-muted" style={{ fontSize: '0.96rem', lineHeight: '1.65', margin: 0 }}>
                {active.includes}
              </p>
            </div>

            <div className="service-detail__callout">
              <h4 className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                {lang === 'es' ? 'Beneficio Estratégico para su Empresa' : 'Strategic Benefit for your Company'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
                {active.benefit}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginTop: '1.75rem' }}>
              <Link href={`/${lang}/contacto`} className="btn btn--primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{lang === 'es' ? 'Solicitar Asesoría para este Servicio' : 'Request Advice for this Service'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <span className="text-sm text-text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {lang === 'es' ? 'Diagnóstico aduanal sin costo inicial' : 'Free initial customs diagnosis'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

