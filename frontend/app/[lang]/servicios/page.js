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
  }));

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
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

      <section className="section bg-background text-center">
        <div className="container">
          <p className="text-text-muted mb-4">
            {lang === 'es' ? '¿Busca transporte de carga?' : 'Looking for cargo transportation?'}
          </p>
          <Link href={`/${lang}/freight-forwarder`} className="btn btn--secondary">Freight Forwarder</Link>
        </div>
      </section>
    </main>
  );
}
