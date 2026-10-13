"use client";

import { useState } from 'react';
import Link from 'next/link';

// Servicios secundarios: lista a la izquierda, detalle a la derecha (apilado en móvil).
export default function ServiciosInteractivos({ lang, items }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const active = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <div className="master-detail">
      <div className="master-detail__list" role="tablist" aria-orientation="vertical" aria-label={lang === 'es' ? 'Servicios' : 'Services'}>
        {items.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={item.id === activeId}
            aria-controls="service-panel"
            className={`master-detail__item ${item.id === activeId ? 'master-detail__item--active' : ''}`}
            onClick={() => setActiveId(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {active && (
        <div id="service-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="master-detail__panel card glass-card">
          <h3 className="text-secondary mb-3">{active.title}</h3>
          <h4 className="text-primary text-sm mb-2 uppercase">{lang === 'es' ? 'Qué incluye' : 'What it includes'}</h4>
          <p className="text-text-muted mb-4">{active.includes}</p>
          <h4 className="text-primary text-sm mb-2 uppercase">{lang === 'es' ? 'Beneficio para usted' : 'Benefit to you'}</h4>
          <p className="text-text-muted mb-4">{active.benefit}</p>
          <Link href={`/${lang}/contacto`} className="btn btn--secondary text-sm">
            {lang === 'es' ? 'Solicitar información' : 'Request information'}
          </Link>
        </div>
      )}
    </div>
  );
}
