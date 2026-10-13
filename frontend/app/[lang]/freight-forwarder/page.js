import Link from 'next/link';
import { freightModes, pick } from '@/lib/services-data';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: 'Freight Forwarder | Servi Proce',
    description: lang === 'es'
      ? 'Transportación nacional e internacional: marítima, aérea y terrestre.'
      : 'National and international transportation: ocean, air and land.',
  };
}

export default async function FreightForwarder({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>Freight Forwarder</h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '650px', margin: '0 auto' }}>
            {lang === 'es'
              ? 'Servicios de transportación nacional e internacional por aire, mar y tierra, coordinados con su despacho aduanal.'
              : 'National and international transportation by air, sea and land, coordinated with your customs clearance.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container grid-3-col">
          {freightModes.map((m, i) => (
            <div key={m.id} className={`card glass-card hover-elevate fade-in-up delay-${(i % 3) + 1}`}>
              <h3 className="text-secondary mb-2">{pick(m.title, lang)}</h3>
              <p className="text-text-muted mb-4">{pick(m.desc, lang)}</p>
              <Link href={`/${lang}/${m.href}`} className="btn btn--secondary text-sm">
                {lang === 'es' ? 'Ver detalle' : 'View details'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container fade-in-up">
          <h2 className="mb-4" style={{ color: 'white' }}>
            {lang === 'es' ? '¿Necesita mover su carga?' : 'Need to move your cargo?'}
          </h2>
          <p className="mb-4 opacity-90 mx-auto" style={{ maxWidth: '600px', textAlign: 'center' }}>
            {lang === 'es'
              ? 'Combine el transporte con el despacho aduanal. Envíe su solicitud y un asesor le dará seguimiento.'
              : 'Combine transport with customs clearance. Send your request and an advisor will follow up.'}
          </p>
          <Link href={`/${lang}/despachos-aduanales#cotizador`} className="btn btn--secondary btn--outline-white">
            {lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}
          </Link>
        </div>
      </section>
    </main>
  );
}
