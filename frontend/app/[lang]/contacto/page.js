import QuotationForm from '../../../components/QuotationForm';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Contacto y Cotizaciones | Servi Proce' : 'Contact & Quotes | Servi Proce',
    description: lang === 'es'
      ? 'Contáctenos para recibir asesoría personalizada y cotizaciones directas en despacho aduanal y logística internacional.'
      : 'Contact us for personalized advice and direct quotations in customs clearance and international logistics.',
  };
}

export default async function Contacto({ params }) {
  const { lang } = await params;


  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative', padding: '5rem 0' }}>
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
              <h3 className="text-primary mb-2 text-sm">{lang === 'es' ? 'Teléfonos y WhatsApp Directo' : 'Phones & Direct WhatsApp'}</h3>
              <p className="text-text-muted">
                <a href="tel:+523321837862" className="hover-text-primary">011 52 (33) 2183-7862 (Oficina)</a>
              </p>
              <p className="text-text-muted mt-2">
                <a href="https://wa.me/523311402745" target="_blank" rel="noopener noreferrer" className="hover-text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  +52 1 33 1140 2745 (Jorge Barrios)
                </a>
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

        {/* Sección de Redes Sociales Oficiales */}
        <div className="container relative z-10" style={{ marginTop: '2.5rem' }}>
          <div className="card glass-card fade-in-up delay-3" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <span className="priority-badge" style={{ marginBottom: '0.65rem' }}>
              {lang === 'es' ? 'Comunidad y Canales Oficiales' : 'Community & Official Channels'}
            </span>
            <h3 className="text-secondary" style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {lang === 'es' ? 'Síganos en Nuestras Redes Sociales' : 'Follow Us on Our Social Networks'}
            </h3>
            <p className="text-text-muted" style={{ maxWidth: '620px', margin: '0 auto 1.85rem auto', fontSize: '0.95rem' }}>
              {lang === 'es'
                ? 'Conéctese con nosotros para conocer actualizaciones aduanales en tiempo real, análisis del marco normativo y novedades operativas.'
                : 'Connect with us for real-time customs updates, regulatory insights, and operational logistics news.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/SERVIPROCE.EM/#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-card-btn social-card-btn--facebook"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.6rem',
                  borderRadius: '1rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  minWidth: '280px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(24, 119, 242, 0.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-secondary)' }}>Facebook Oficial</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>@SERVIPROCE.EM</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/company/serviproce-em/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-card-btn social-card-btn--linkedin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.6rem',
                  borderRadius: '1rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  minWidth: '280px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(10, 102, 194, 0.35)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-secondary)' }}>LinkedIn Corporativo</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>serviproce-em</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
