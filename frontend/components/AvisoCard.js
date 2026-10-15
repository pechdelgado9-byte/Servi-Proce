const TYPE_LABEL = {
  noticia: { es: 'Noticia Oficial', en: 'Official News' },
  ley: { es: 'Ley / Regulación', en: 'Law / Regulation' },
  aviso: { es: 'Aviso Operativo', en: 'Operational Notice' },
};

export function typeLabel(type, lang) {
  return TYPE_LABEL[type]?.[lang] ?? type;
}

function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

// Iconos temáticos según el tipo de publicación
function TypeIcon({ type }) {
  if (type === 'ley') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v18"></path>
        <path d="M5 8l7-5 7 5"></path>
        <path d="M5 8v6a3 3 0 0 0 6 0V8"></path>
        <path d="M13 8v6a3 3 0 0 0 6 0V8"></path>
      </svg>
    );
  }
  if (type === 'aviso') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
      <path d="M18 14h-8"></path>
      <path d="M15 18h-5"></path>
      <path d="M10 6h8v4h-8V6Z"></path>
    </svg>
  );
}

export default function AvisoCard({ aviso, lang }) {
  const href = aviso.sourceUrl ? safeUrl(aviso.sourceUrl) : null;
  const isPinned = aviso.pinned;
  
  return (
    <article className={`aviso-card aviso-card--${aviso.type} ${isPinned ? 'aviso-card--pinned' : ''} hover-elevate`}>
      {/* Indicador de categoría y metadata */}
      <div className="aviso-card__header">
        <div className="aviso-card__badges">
          <span className={`aviso-badge aviso-badge--${aviso.type}`}>
            <TypeIcon type={aviso.type} />
            <span>{typeLabel(aviso.type, lang)}</span>
          </span>

          {isPinned && (
            <span className="aviso-badge aviso-badge--featured">
              ★ {lang === 'es' ? 'Destacado' : 'Featured'}
            </span>
          )}
        </div>

        <time dateTime={aviso.publishedAt} className="aviso-card__date">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{aviso.publishedAt}</span>
        </time>
      </div>

      {/* Contenido principal */}
      <h3 className="aviso-card__title">
        {aviso.title}
      </h3>

      <div className="aviso-card__body">
        {String(aviso.body || '').split('\n').filter(Boolean).map((p, i) => (
          <p key={i} className="aviso-card__paragraph">{p}</p>
        ))}
      </div>

      {/* Pie de tarjeta con enlace directo */}
      <div className="aviso-card__footer">
        {href ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="aviso-card__link"
          >
            <span>{lang === 'es' ? 'Consultar fuente oficial' : 'View official source'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        ) : (
          <span className="aviso-card__badge-tag">
            {lang === 'es' ? 'Verificado por Servi Proce' : 'Verified by Servi Proce'}
          </span>
        )}
      </div>
    </article>
  );
}
