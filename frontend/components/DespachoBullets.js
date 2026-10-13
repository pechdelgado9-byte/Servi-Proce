"use client";

import { useState } from 'react';
import Link from 'next/link';

// Subservicios de Despacho Aduanal como viñetas interactivas (una abierta a la vez).
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
              <span className="bullet__dot" aria-hidden="true" />
              <span className="bullet__title">{item.title}</span>
              <span className="bullet__chevron" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            <div id={`bullet-${item.id}`} className="bullet__body" hidden={!open}>
              <p className="mb-2"><strong>{lang === 'es' ? 'Qué incluye: ' : 'What it includes: '}</strong>{item.includes}</p>
              <p className="mb-3"><strong>{lang === 'es' ? 'Para quién: ' : 'Who it is for: '}</strong>{item.forWho}</p>
              <Link href="#cotizador" className="btn btn--primary text-sm">
                {lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
