import Link from 'next/link';

export default async function Aereo({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center mb-5">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Transporte Aéreo' : 'Air Transport'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            {lang === 'es' 
              ? 'Rapidez y disponibilidad para su carga internacional.' 
              : 'Speed and availability for your international cargo.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container grid-2-col">
          <div className="card hover-elevate glass-card fade-in-up">
            <div className="icon-wrapper">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-4 4-2.8-.9c-.4-.1-.8.1-1 .5L1 17l4.5 1.5L7 23l1.4-.2c.4-.2.6-.6.5-1L8 19l4-4 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"></path></svg>
            </div>
            <h2 className="mb-3 text-secondary">Priority & Comercial</h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Cuando su carga necesita moverse por los medios más rápidos posibles, nuestro equipo de expertos está listo para garantizarle la disponibilidad y ofrecerle un servicio de carga aérea completamente integral y rentable.'
                : 'When your cargo needs to move by the fastest possible means, our team of experts is ready to guarantee availability and offer you a comprehensive and profitable air freight service.'}
            </p>
            <ul className="list-styled text-text-muted mb-4">
              <li>{lang === 'es' ? 'Transporte de carga aéreo dentro de México.' : 'Air freight transport within Mexico.'}</li>
              <li>{lang === 'es' ? 'Movimientos aéreos de carga en Importación y Exportación.' : 'Air cargo movements in Import and Export.'}</li>
              <li>Charters & Hazmat.</li>
            </ul>
            <div className="mt-4">
              <Link href={`/${lang}/contacto`} className="btn btn--primary">
                {lang === 'es' ? 'Solicitar Cotización Aérea' : 'Request Air Quote'}
              </Link>
            </div>
          </div>
          
          <div className="split-image zoom-in delay-1">
            <img 
              src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop" 
              alt="Air Freight Logistics" 
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
