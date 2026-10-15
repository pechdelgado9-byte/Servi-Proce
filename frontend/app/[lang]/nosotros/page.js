import ClientsCarousel from '@/components/ClientsCarousel';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Nosotros | Servi Proce' : 'About Us | Servi Proce',
    description: lang === 'es'
      ? 'Conozca la historia, misión, visión y valores de Servi Proce, su aliado en comercio exterior y logística internacional en México.'
      : 'Learn about the history, mission, vision and values of Servi Proce, your partner in foreign trade and logistics in Mexico.',
  };
}

export default async function Nosotros({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section 
        className="section bg-surface text-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          padding: '5rem 0'
        }}
      >
        <div className="section-overlay"></div>
        <div className="container relative z-10">
          <span className="priority-badge fade-in-up">
            {lang === 'es' ? 'Liderazgo & Experiencia' : 'Leadership & Heritage'}
          </span>
          <h1 className="page-title fade-in-up delay-1" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Nuestra Empresa' : 'Our Company'}
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-secondary" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {lang === 'es' 
              ? 'Impulsando y consolidando su negocio en comercio exterior y logística transfronteriza.' 
              : 'Helping to set up and scale your business in global trade and cross-border logistics.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container split-section">
          <div className="split-content slide-in-right delay-1">
            <span className="priority-badge mb-2">{lang === 'es' ? 'Propósito Estratégico' : 'Strategic Purpose'}</span>
            <h2 className="text-secondary mb-3">
              {lang === 'es' ? 'Nuestra Misión' : 'Our Mission'}
            </h2>
            <p className="text-text-muted mb-4" style={{ lineHeight: '1.6' }}>
              {lang === 'es'
                ? 'Nos esforzamos por ser el principal socio en servicios de logística apoyando el desarrollo y crecimiento de nuestros clientes, ofreciéndoles asesoría y capacitación para llevar a cabo nuevos proyectos de inversión al menor costo posible.'
                : 'We strive to be the main partner in logistics services, supporting the development and growth of our clients, offering advice and training to carry out new investment projects at the lowest possible risk.'}
            </p>
            <div className="feature-pillars">
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Acompañamiento Personalizado:' : 'Tailored Partnership:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Asesoría continua desde el análisis previo hasta la entrega final.' : ' Continuous advisory from pre-shipment to final delivery.'}
                  </span>
                </div>
              </div>
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Optimización de Costos:' : 'Cost Efficiency:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Estrategias aduanales legales para pagar lo justo en aranceles e impuestos.' : ' Legal customs strategies to pay only the fair share in taxes.'}
                  </span>
                </div>
              </div>
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Capacitación Continua:' : 'Continuous Training:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Formación para sus equipos en regulaciones, NOMs y normativas vigentes.' : ' Training for your teams on current regulations and trade compliance.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="split-image zoom-in">
            <img 
              src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=2070&auto=format&fit=crop" 
              alt={lang === 'es' ? 'Misión logística y comercio exterior' : 'Logistics mission and trade'} 
              className="img-fluid"
              loading="lazy"
              decoding="async"
              style={{ maxHeight: '310px', width: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container split-section reverse">
          <div className="split-content slide-in-right delay-2">
            <span className="priority-badge mb-2">{lang === 'es' ? 'Hacia Dónde Vamos' : 'Our Direction'}</span>
            <h2 className="text-secondary mb-3">
              {lang === 'es' ? 'Nuestra Visión' : 'Our Vision'}
            </h2>
            <p className="text-text-muted mb-4" style={{ lineHeight: '1.6' }}>
              {lang === 'es'
                ? 'Ser la mejor empresa de prestación de servicios de logística Internacional en la región, reconocida por nuestra calidad, confiabilidad y un excelente servicio a todos nuestros clientes.'
                : 'To be the best international logistics service provider in the region, recognized for our quality, reliability, and excellent service to all our clients.'}
            </p>
            <div className="feature-pillars">
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Liderazgo en la Región:' : 'Regional Leadership:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Referente de excelencia en despacho aduanal y transportación multimodal.' : ' Benchmark of excellence in customs brokerage and multimodal logistics.'}
                  </span>
                </div>
              </div>
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Estándares Internacionales:' : 'International Standards:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Procesos respaldados por certificaciones ISO 9001:2015, OEA y C-TPAT.' : ' Processes backed by ISO 9001:2015, AEO, and C-TPAT certifications.'}
                  </span>
                </div>
              </div>
              <div className="feature-pillar">
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong className="text-secondary">{lang === 'es' ? 'Confiabilidad y Agilidad:' : 'Reliability & Speed:'}</strong>
                  <span className="text-text-muted text-sm ml-1">
                    {lang === 'es' ? ' Liberación oportuna de carga y expediente digital de cada operación.' : ' Timely cargo clearance and electronic documentation for every operation.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="split-image zoom-in delay-1">
            <img 
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop" 
              alt={lang === 'es' ? 'Equipo de trabajo y visión Servi Proce' : 'Servi Proce team and vision'} 
              className="img-fluid"
              loading="lazy"
              decoding="async"
              style={{ maxHeight: '310px', width: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container">
          <div className="text-center mb-5">
            <span className="priority-badge fade-in-up">
              {lang === 'es' ? 'Sectores que Atendemos' : 'Sectors We Serve'}
            </span>
            <h2 className="text-center text-secondary mt-2 mb-3 fade-in-up delay-1">
              {lang === 'es' ? 'Nuestros Clientes B2B' : 'Our B2B Clients'}
            </h2>
            <p className="text-text-muted fade-in-up delay-2" style={{ maxWidth: '640px', margin: '0 auto' }}>
              {lang === 'es'
                ? 'Soluciones logísticas personalizadas según la escala, sector e infraestructura de cada organización.'
                : 'Tailored logistics solutions designed around the scale, industry, and infrastructure of each organization.'}
            </p>
          </div>
          <ClientsCarousel lang={lang} />
        </div>
      </section>
    </main>
  );
}
