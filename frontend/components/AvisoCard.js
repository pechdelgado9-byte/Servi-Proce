const TYPE_LABEL = {
  noticia: { es: 'Noticia', en: 'News' },
  ley: { es: 'Ley / Regulación', en: 'Law / Regulation' },
  aviso: { es: 'Aviso', en: 'Notice' },
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

export default function AvisoCard({ aviso, lang }) {
  const href = aviso.sourceUrl ? safeUrl(aviso.sourceUrl) : null;
  return (
    <article className={`card glass-card aviso aviso--${aviso.type}`}>
      <div className="aviso__meta">
        <span className={`aviso__tag aviso__tag--${aviso.type}`}>{typeLabel(aviso.type, lang)}</span>
        {aviso.pinned && <span className="aviso__pin">{lang === 'es' ? 'Destacado' : 'Pinned'}</span>}
        <time dateTime={aviso.publishedAt} className="text-sm text-text-muted">{aviso.publishedAt}</time>
      </div>
      <h3 className="text-secondary mb-2">{aviso.title}</h3>
      {String(aviso.body || '').split('\n').filter(Boolean).map((p, i) => (
        <p key={i} className="text-text-muted mb-2">{p}</p>
      ))}
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary text-sm" style={{ textDecoration: 'underline' }}>
          {lang === 'es' ? 'Ver fuente oficial' : 'View official source'}
        </a>
      )}
    </article>
  );
}
