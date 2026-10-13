import Link from 'next/link';
import DespachoBullets from '../../../components/DespachoBullets';
import ProcessSteps from '../../../components/ProcessSteps';
import Industries from '../../../components/Industries';
import QuickQuoteForm from '../../../components/QuickQuoteForm';
import AvisoCard from '../../../components/AvisoCard';
import { fetchAvisos } from '@/lib/avisos';
import { despachoSubservices, despachoValueAdded, pick } from '@/lib/services-data';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Despachos Aduanales | Servi Proce' : 'Customs Clearance | Servi Proce',
    description: lang === 'es'
      ? 'Despacho aduanal de importación y exportación en las 50 aduanas del país. Envíe su solicitud en línea.'
      : 'Import and export customs clearance at all 50 customs offices in Mexico. Send your request online.',
  };
}

export default async function DespachosAduanales({ params }) {
  const { lang } = await params;
  const avisos = await fetchAvisos(lang, { limit: 3 });

  const items = despachoSubservices.map((s) => ({
    id: s.id,
    title: pick(s.title, lang),
    includes: pick(s.includes, lang),
    forWho: pick(s.forWho, lang),
  }));

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <span className="priority-badge fade-in-up">{lang === 'es' ? 'Servicio principal' : 'Core service'}</span>
          <h1 className="page-title fade-in-up delay-1" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-secondary" style={{ maxWidth: '700px', margin: '0 auto 2rem auto' }}>
            {lang === 'es'
              ? 'Tramitamos la entrada y salida legal de su mercancía en las 50 aduanas del país, cuidando que pague lo justo en impuestos y que su carga no se detenga.'
              : 'We handle the legal entry and exit of your goods at all 50 customs offices in Mexico, making sure you pay only what is due and your cargo keeps moving.'}
          </p>
          <Link href="#cotizador" className="btn btn--primary fade-in-up delay-3">
            {lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}
          </Link>
        </div>
      </section>

      {/* Subservicios en viñetas + valor agregado */}
      <section className="section bg-background">
        <div className="container grid-2-col" style={{ alignItems: 'start' }}>
          <div className="fade-in-up">
            <h2 className="text-secondary mb-4">{lang === 'es' ? 'Qué hacemos por usted' : 'What we do for you'}</h2>
            <DespachoBullets lang={lang} items={items} />
          </div>
          <div className="card glass-card fade-in-up delay-1">
            <h3 className="text-primary mb-3">{lang === 'es' ? 'Valor agregado en Serviproce' : 'Added value at Serviproce'}</h3>
            <ul className="list-styled text-text-muted">
              {despachoValueAdded.map((v, i) => <li key={i}>{pick(v, lang)}</li>)}
            </ul>
            <p className="text-sm text-text-muted mt-4">
              {lang === 'es'
                ? '¿Necesita también clasificación arancelaria, NOM o programas IMMEX/PROSEC?'
                : 'Do you also need tariff classification, NOM or IMMEX/PROSEC programs?'}
            </p>
            <Link href={`/${lang}/servicios`} className="btn btn--secondary text-sm mt-2">
              {lang === 'es' ? 'Ver servicios complementarios' : 'See complementary services'}
            </Link>
          </div>
        </div>
      </section>

      {/* ¿Cómo trabajamos? */}
      <section className="section bg-surface">
        <div className="container">
          <h2 className="text-center text-secondary mb-4 fade-in-up">{lang === 'es' ? '¿Cómo trabajamos?' : 'How do we work?'}</h2>
          <ProcessSteps lang={lang} />
        </div>
      </section>

      {/* Industrias */}
      <section className="section bg-background">
        <div className="container text-center">
          <h2 className="text-secondary mb-4 fade-in-up">{lang === 'es' ? 'Industrias que atendemos' : 'Industries we serve'}</h2>
          <Industries lang={lang} />
        </div>
      </section>

      {/* Cotizador rápido */}
      <section id="cotizador" className="section bg-surface">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="card glass-card fade-in-up">
            <QuickQuoteForm lang={lang} />
          </div>
        </div>
      </section>

      {/* Últimos avisos */}
      {avisos.length > 0 && (
        <section className="section bg-background">
          <div className="container">
            <h2 className="text-center text-secondary mb-4">{lang === 'es' ? 'Leyes, noticias y avisos' : 'Laws, news and notices'}</h2>
            <div className="grid-3-col">
              {avisos.map((a) => <AvisoCard key={a.id} aviso={a} lang={lang} />)}
            </div>
            <div className="text-center mt-4">
              <Link href={`/${lang}/avisos`} className="btn btn--secondary">{lang === 'es' ? 'Ver todos' : 'View all'}</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
