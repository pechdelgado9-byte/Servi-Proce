import Link from 'next/link';
import ServiciosInteractivos from '../../../components/ServiciosInteractivos';
import { secondaryServices, pick } from '@/lib/services-data';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Servicios | Servi Proce' : 'Services | Servi Proce',
    description: lang === 'es'
      ? 'Servicios complementarios de comercio exterior y cumplimiento.'
      : 'Complementary foreign trade and compliance services.',
  };
}

export default async function Servicios({ params }) {
  const { lang } = await params;

  const items = secondaryServices.map((s) => ({
    id: s.id,
    title: pick(s.title, lang),
    includes: pick(s.includes, lang),
    benefit: pick(s.benefit, lang),
    image: s.image,
  }));

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative', padding: '5rem 0' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center mb-5">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Servicios' : 'Services'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '650px', margin: '0 auto 2rem auto' }}>
            {lang === 'es'
              ? 'Servicios complementarios que respaldan su operación de comercio exterior. Elija uno para ver el detalle.'
              : 'Complementary services that support your foreign trade operation. Pick one to see the details.'}
          </p>
        </div>

        <div className="container relative z-10 mb-4">
          <div className="priority-banner fade-in-up">
            <div>
              <strong>{lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}</strong>
              <span className="text-sm"> — {lang === 'es' ? 'nuestro servicio principal, en su propia sección.' : 'our core service, in its own section.'}</span>
            </div>
            <Link href={`/${lang}/despachos-aduanales`} className="btn btn--primary text-sm">
              {lang === 'es' ? 'Ir a Despachos' : 'Go to Clearance'}
            </Link>
          </div>
        </div>

        <div className="container relative z-10">
          <ServiciosInteractivos lang={lang} items={items} />
        </div>
      </section>

      <section className="section bg-background">
        <div className="container">
          <div className="cargo-forwarder-banner fade-in-up">
            <div className="cargo-forwarder-banner__glow"></div>
            <div className="cargo-forwarder-banner__content">
              <div className="cargo-forwarder-banner__icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className="cargo-forwarder-banner__text">
                <span className="priority-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {lang === 'es' ? 'Transporte Internacional' : 'International Transportation'}
                </span>
                <h3 className="cargo-forwarder-banner__title">
                  {lang === 'es' ? '¿Busca transporte de carga y fletes internacionales?' : 'Looking for cargo transportation & international freight?'}
                </h3>
                <p className="cargo-forwarder-banner__desc">
                  {lang === 'es'
                    ? 'Conecte sus operaciones globales con nuestra red multimodal marítima, aérea y terrestre de puerta a puerta con tarifas competitivas y rastreo en tiempo real.'
                    : 'Connect your global operations with our door-to-door multimodal ocean, air, and ground network with competitive rates and real-time tracking.'}
                </p>
              </div>
            </div>
            <div className="cargo-forwarder-banner__action">
              <Link href={`/${lang}/freight-forwarder`} className="btn btn--primary cargo-forwarder-banner__btn">
                <span>{lang === 'es' ? 'Explorar Freight Forwarder' : 'Explore Freight Forwarder'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
