import Link from 'next/link';
import AvisoCard, { typeLabel } from '../../../components/AvisoCard';
import { fetchAvisos, AVISO_TYPES } from '@/lib/avisos';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Noticias, Leyes y Avisos | Servi Proce' : 'News, Laws and Notices | Servi Proce',
    description: lang === 'es'
      ? 'Leyes actualizadas, noticias de comercio exterior y avisos para nuestros clientes.'
      : 'Updated laws, foreign trade news and notices for our clients.',
  };
}

const SECTION_ORDER = ['aviso', 'ley', 'noticia'];
const SECTION_TITLE = {
  aviso: { es: 'Avisos Operativos', en: 'Operational Notices' },
  ley: { es: 'Leyes y Regulaciones Actualizadas', en: 'Updated Laws & Regulations' },
  noticia: { es: 'Noticias del Sector', en: 'Industry News' },
};

export default async function Avisos({ params }) {
  const { lang } = await params;
  const all = await fetchAvisos(lang);
  const groups = SECTION_ORDER.filter((t) => AVISO_TYPES.includes(t)).map((t) => ({ type: t, items: all.filter((a) => a.type === t) }));

  return (
    <main className="page-wrapper">
      {/* Hero Banner con imagen de alta definición y gradiente oscuro de alto contraste */}
      <section 
        className="section bg-surface text-center" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(11, 17, 32, 0.75), rgba(11, 17, 32, 0.88)), url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          position: 'relative',
          padding: '5.5rem 0 4.5rem 0'
        }}
      >
        <div className="container relative z-10 text-center">
          <span className="priority-badge fade-in-up">
            {lang === 'es' ? 'Actualizaciones Oficiales & Normativas' : 'Official Updates & Regulations'}
          </span>
          <h1 
            className="fade-in-up delay-1" 
            style={{ 
              fontSize: 'clamp(2.25rem, 4.5vw, 3rem)', 
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              background: 'none',
              textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 0 35px rgba(0,0,0,0.6)'
            }}
          >
            {lang === 'es' ? 'Noticias, Leyes y Avisos' : 'News, Laws and Notices'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2" style={{ color: '#e2e8f0', maxWidth: '680px', margin: '0 auto 2rem auto', fontSize: '1.12rem', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {lang === 'es'
              ? 'Información vigente de comercio exterior, regulaciones aduanales y avisos operativos publicados por nuestro equipo.'
              : 'Current foreign trade information, customs regulations and operational notices published by our team.'}
          </p>
          <ul className="chips fade-in-up delay-3" role="list">
            {groups.map((g) => (
              <li key={g.type}>
                <a className="chip" href={`#${g.type}`}>
                  <span>{typeLabel(g.type, lang)}</span>
                  <span className="chip-count">{g.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Secciones por categoría */}
      {groups.map((g) => (
        <section key={g.type} id={g.type} className="section bg-background" style={{ scrollMarginTop: '100px', paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <span style={{ width: '4px', height: '24px', backgroundColor: 'var(--color-primary)', borderRadius: '2px', display: 'inline-block' }}></span>
              <h2 className="text-secondary" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700 }}>
                {SECTION_TITLE[g.type][lang]}
              </h2>
            </div>
            {g.items.length === 0 ? (
              <p className="text-text-muted">{lang === 'es' ? 'Por ahora no hay publicaciones vigentes en esta categoría.' : 'There are no active posts in this category right now.'}</p>
            ) : (
              <div className="grid-2-col">
                {g.items.map((a) => <AvisoCard key={a.id} aviso={a} lang={lang} />)}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* CTA al Blog */}
      <section className="section bg-surface text-center" style={{ padding: '4rem 0' }}>
        <div className="container">
          <p className="text-text-muted mb-3" style={{ fontSize: '1.05rem' }}>
            {lang === 'es' ? '¿Busca artículos detallados, guías y análisis de comercio internacional?' : 'Looking for detailed articles, guides and international trade analysis?'}
          </p>
          <Link href={`/${lang}/blog`} className="btn btn--secondary" style={{ padding: '0.85rem 2.25rem', fontSize: '0.98rem' }}>
            {lang === 'es' ? 'Explorar el Blog Corporativo →' : 'Explore Corporate Blog →'}
          </Link>
        </div>
      </section>
    </main>
  );
}
