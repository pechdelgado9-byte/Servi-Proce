'use client';

import { useState, useEffect, useCallback } from 'react';

export default function PromoBannerCarousel({ initialPromotions = [], lang = 'es' }) {
  const [promotions, setPromotions] = useState(() =>
    Array.isArray(initialPromotions) ? initialPromotions.filter(Boolean) : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Sincronización en vivo contra el Backend Headless para evitar residuos de caché al agregar/eliminar promociones
  useEffect(() => {
    let active = true;
    fetch(`/api/backend/promotions?locale=${encodeURIComponent(lang)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return;
        const liveItems = Array.isArray(json.items)
          ? json.items.filter(Boolean)
          : json.data
          ? [json.data]
          : [];
        setPromotions(liveItems);
        setCurrentIndex((prev) => (liveItems.length > 0 ? prev % liveItems.length : 0));
      })
      .catch(() => {
        // Conservar las promociones iniciales renderizadas en servidor si falla la red
      });

    return () => {
      active = false;
    };
  }, [lang]);

  const total = promotions.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Rotación automática cada 5 segundos cuando hay 2 o más promociones activas
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  if (total === 0) return null;

  const safeIndex = currentIndex >= total ? 0 : currentIndex;
  const promo = promotions[safeIndex];
  if (!promo) return null;

  const navBtnStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    background: 'rgba(15, 23, 42, 0.75)',
    color: '#ffffff',
    fontSize: '1.35rem',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
    transition: 'all 0.2s ease',
  };

  return (
    <div
      id="banner-promocional"
      className="promo-banner fade-in-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: 'linear-gradient(135deg, #0b1120 0%, #161f38 50%, #0b1120 100%)',
        borderBottom: '1px solid rgba(157, 0, 0, 0.35)',
        padding: total > 1 ? '2.25rem 3.5rem 1.85rem' : '2.25rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label={lang === 'es' ? 'Promoción anterior' : 'Previous promotion'}
            style={{ ...navBtnStyle, left: '1rem' }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label={lang === 'es' ? 'Siguiente promoción' : 'Next promotion'}
            style={{ ...navBtnStyle, right: '1rem' }}
          >
            ›
          </button>
        </>
      )}

      <div key={promo.id || safeIndex} className="container relative z-10 text-white">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span
            className="priority-badge"
            style={{
              background: 'rgba(157, 0, 0, 0.25)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            {lang === 'es' ? 'Atención Personalizada' : 'Tailored Advisory'}
          </span>
          {total > 1 && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
              }}
            >
              {safeIndex + 1} / {total}
            </span>
          )}
        </div>

        <h2
          className="mb-2"
          style={{
            color: '#ffffff',
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {promo.title}
        </h2>
        <p
          style={{
            color: '#cbd5e1',
            fontSize: '0.98rem',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: '1.5',
          }}
        >
          {promo.description}
        </p>

        {promo.imageUrl && (
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src={promo.imageUrl}
              alt={promo.title}
              style={{
                maxHeight: '180px',
                width: 'auto',
                maxWidth: '100%',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.15)',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {total > 1 && (
          <div
            role="tablist"
            aria-label={lang === 'es' ? 'Selector de promociones' : 'Promotions selector'}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.1rem',
            }}
          >
            {promotions.map((item, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${lang === 'es' ? 'Ir a promoción' : 'Go to promotion'} ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: isActive ? '24px' : '9px',
                    height: '9px',
                    borderRadius: '9999px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: isActive ? '#dc2626' : 'rgba(255, 255, 255, 0.35)',
                    transition: 'all 0.25s ease',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
