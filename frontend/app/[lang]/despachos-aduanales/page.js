import Link from 'next/link';
import DespachoBullets from '../../../components/DespachoBullets';
import ProcessSteps from '../../../components/ProcessSteps';
import Industries from '../../../components/Industries';
import QuickQuoteForm from '../../../components/QuickQuoteForm';
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

  const items = despachoSubservices.map((s) => ({
    id: s.id,
    title: pick(s.title, lang),
    includes: pick(s.includes, lang),
    forWho: pick(s.forWho, lang),
  }));

  return (
    <main className="page-wrapper">
      {/* Hero */}
      <section 
        className="section bg-surface text-center" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundAttachment: 'fixed', 
          position: 'relative',
          padding: '5.5rem 0 4.5rem 0'
        }}
      >
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <span className="priority-badge fade-in-up" style={{ letterSpacing: '0.08em' }}>
            {lang === 'es' ? 'Servicio Principal Especializado' : 'Core Specialized Service'}
          </span>
          <h1 className="page-title fade-in-up delay-1" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-secondary" style={{ maxWidth: '720px', margin: '0 auto 2.25rem auto', lineHeight: '1.6' }}>
            {lang === 'es'
              ? 'Tramitamos la entrada y salida legal de su mercancía en las 50 aduanas del país, cuidando que pague lo justo en impuestos y que su carga no se detenga.'
              : 'We handle the legal entry and exit of your goods at all 50 customs offices in Mexico, making sure you pay only what is due and your cargo keeps moving.'}
          </p>

          {/* Floating animated trust badges */}
          <div className="fade-in-up delay-3" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginTop: '1.25rem', marginBottom: '2.5rem' }}>
            <span style={{ 
              background: 'rgba(157, 0, 0, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.35)', 
              color: 'var(--color-secondary)', 
              padding: '0.65rem 1.35rem', 
              borderRadius: '9999px', 
              fontSize: '0.9rem', 
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {lang === 'es' ? '50 Aduanas del País' : 'All 50 Customs Offices'}
            </span>
            <span style={{ 
              background: 'rgba(157, 0, 0, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.35)', 
              color: 'var(--color-secondary)', 
              padding: '0.65rem 1.35rem', 
              borderRadius: '9999px', 
              fontSize: '0.9rem', 
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              {lang === 'es' ? 'Liberación en < 24 Horas' : 'Clearance in < 24 Hours'}
            </span>
            <span style={{ 
              background: 'rgba(157, 0, 0, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.35)', 
              color: 'var(--color-secondary)', 
              padding: '0.65rem 1.35rem', 
              borderRadius: '9999px', 
              fontSize: '0.9rem', 
              fontWeight: 700,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem'
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              {lang === 'es' ? 'Certificaciones OEA & C-TPAT' : 'AEO & C-TPAT Certified'}
            </span>
          </div>

          <Link href="#cotizador" className="btn btn--primary fade-in-up delay-3" style={{ padding: '0.9rem 2.25rem' }}>
            {lang === 'es' ? 'Solicitar Cotización Inmediata' : 'Request Instant Quote'}
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
    </main>
  );
}
