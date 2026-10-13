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
  aviso: { es: 'Avisos', en: 'Notices' },
  ley: { es: 'Leyes y regulaciones actualizadas', en: 'Updated laws and regulations' },
  noticia: { es: 'Noticias', en: 'News' },
};

export default async function Avisos({ params }) {
  const { lang } = await params;
  const all = await fetchAvisos(lang);
  const groups = SECTION_ORDER.filter((t) => AVISO_TYPES.includes(t)).map((t) => ({ type: t, items: all.filter((a) => a.type === t) }));

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8ed7c1590f?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Noticias, Leyes y Avisos' : 'News, Laws and Notices'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '650px', margin: '0 auto 1.5rem auto' }}>
            {lang === 'es'
              ? 'Información vigente de comercio exterior publicada por nuestro equipo.'
              : 'Current foreign trade information published by our team.'}
          </p>
          <ul className="chips" role="list">
            {groups.map((g) => (
              <li key={g.type}><a className="chip" href={`#${g.type}`}>{typeLabel(g.type, lang)} ({g.items.length})</a></li>
            ))}
          </ul>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.type} id={g.type} className="section bg-background" style={{ scrollMarginTop: '90px' }}>
          <div className="container">
            <h2 className="text-secondary mb-4">{SECTION_TITLE[g.type][lang]}</h2>
            {g.items.length === 0 ? (
              <p className="text-text-muted">{lang === 'es' ? 'Por ahora no hay publicaciones vigentes.' : 'There are no current posts right now.'}</p>
            ) : (
              <div className="grid-2-col">
                {g.items.map((a) => <AvisoCard key={a.id} aviso={a} lang={lang} />)}
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="section bg-surface text-center">
        <div className="container">
          <Link href={`/${lang}/blog`} className="btn btn--secondary">{lang === 'es' ? 'Ir al Blog' : 'Go to Blog'}</Link>
        </div>
      </section>
    </main>
  );
}
