import QuotationForm from '../../../components/QuotationForm';

export default async function Contacto({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Contacto y Cotizaciones' : 'Contact & Quotes'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {lang === 'es' 
              ? 'Déjenos sus datos y un asesor especializado se comunicará con usted en breve.' 
              : 'Leave us your details and a specialized advisor will contact you shortly.'}
          </p>
        </div>
      </section>

      <section className="section bg-background" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container grid-2-col relative z-10">
          {/* Información de Contacto */}
          <div className="card glass-card fade-in-up delay-1">
            <h2 className="text-secondary mb-4">
              {lang === 'es' ? 'Información Directa' : 'Direct Information'}
            </h2>
            <div className="mb-4">
              <h3 className="text-primary mb-2 text-sm">{lang === 'es' ? 'Ventas y Atención al Cliente' : 'Sales & Customer Service'}</h3>
              <p className="text-text-muted">
                <a href="mailto:customerservice@serviproce.com.mx" className="hover-text-primary">
                  customerservice@serviproce.com.mx
                </a>
              </p>
              <p className="text-text-muted mt-2">
                <a href="mailto:jorgebarrios@serviproce.com.mx" className="hover-text-primary">
                  jorgebarrios@serviproce.com.mx
                </a>
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-primary mb-2 text-sm">{lang === 'es' ? 'Teléfonos' : 'Phones'}</h3>
              <p className="text-text-muted">
                <a href="tel:+523321837862" className="hover-text-primary">011 52 (33) 2183-7862</a>
              </p>
              <p className="text-text-muted mt-2">
                <a href="tel:+523311402745" className="hover-text-primary">+52 (33) 11402745</a>
              </p>
            </div>
          </div>

          {/* Formulario de Cotización */}
          <div className="card glass-card fade-in-up delay-2">
            <h2 className="text-secondary mb-4">
              {lang === 'es' ? 'Solicitar Cotización' : 'Request a Quote'}
            </h2>
            <QuotationForm lang={lang} />
          </div>
        </div>
      </section>
    </main>
  );
}
