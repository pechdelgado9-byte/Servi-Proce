import Link from 'next/link';

export default async function Terrestre({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center mb-5">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Transporte Terrestre' : 'Land Transport'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            {lang === 'es' 
              ? 'Eficiencia superior y mayor alcance con menores costos operativos.' 
              : 'Superior efficiency and wider reach with lower operating costs.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container grid-2-col">
          <div className="card hover-elevate glass-card fade-in-up">
            <div className="icon-wrapper">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h2 className="mb-3 text-secondary">LTL, FTL & MEX-USA-CAN</h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Le ayudamos a lograr una eficiencia superior y un alcance más amplio para su cadena de suministro terrestre en todo Norteamérica.'
                : 'We help you achieve superior efficiency and a wider reach for your land supply chain throughout North America.'}
            </p>
            <div className="grid-2-col mt-4 mb-4">
              <div className="feature-box">
                <h3 className="text-primary">LTL (Less Truck Load)</h3>
                <p className="text-text-muted">
                  {lang === 'es' ? 'Carga consolidada desde puertos y aeropuertos.' : 'Consolidated cargo from ports and airports.'}
                </p>
              </div>
              <div className="feature-box">
                <h3 className="text-primary">FTL (Full Truck Load)</h3>
                <p className="text-text-muted">
                  {lang === 'es' ? 'Unidades directas dedicadas para máxima seguridad.' : 'Dedicated direct units for maximum security.'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/${lang}/contacto`} className="btn btn--primary">
                {lang === 'es' ? 'Cotizar Ruta Terrestre' : 'Quote Ground Route'}
              </Link>
            </div>
          </div>

          <div className="split-image zoom-in delay-1">
            <img 
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075&auto=format&fit=crop" 
              alt="Ground Logistics Highway" 
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
