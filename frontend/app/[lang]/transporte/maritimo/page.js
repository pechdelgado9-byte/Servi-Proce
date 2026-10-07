import Link from 'next/link';

export default async function Maritimo({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center mb-5">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Transporte Marítimo' : 'Maritime Transport'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            {lang === 'es' 
              ? 'El tipo de transporte más rentable y conveniente para sus productos en todo el mundo.' 
              : 'The most profitable and convenient type of transport for your products worldwide.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container grid-2-col">
          <div className="card hover-elevate glass-card fade-in-up">
            <div className="icon-wrapper">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M20 12v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path><path d="M12 12v-5"></path><path d="M12 7l-4 5"></path><path d="M12 7l4 5"></path><path d="M22 22H2"></path></svg>
            </div>
            <h2 className="mb-3 text-secondary">FCL, LCL & Break Bulk</h2>
            <ul className="list-styled text-text-muted mb-4">
              <li>{lang === 'es' ? 'Transporte marítimo (LCL & FCL) Refrigerado.' : 'Refrigerated maritime transport (LCL & FCL).'}</li>
              <li>{lang === 'es' ? 'Transporte marítimo desde los principales puertos del mundo.' : 'Maritime transport from the main ports of the world.'}</li>
              <li>{lang === 'es' ? 'Proyectos en diferentes tipos de buques.' : 'Projects in different types of vessels.'}</li>
              <li>{lang === 'es' ? 'Cargas sobredimensionadas y Break Bulk.' : 'Oversized cargo and Break Bulk.'}</li>
            </ul>
            <div className="mt-4">
              <Link href={`/${lang}/contacto`} className="btn btn--primary">
                {lang === 'es' ? 'Solicitar Cotización Marítima' : 'Request Ocean Quote'}
              </Link>
            </div>
          </div>

          <div className="split-image zoom-in delay-1">
            <img 
              src="https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=2070&auto=format&fit=crop" 
              alt="Ocean Freight Ships" 
              className="img-fluid"
              loading="lazy"
              decoding="async"
              style={{ height: '100%', minHeight: '400px' }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
