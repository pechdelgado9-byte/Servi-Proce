export default async function Nosotros({ params }) {
  const { lang } = await params;

  return (
    <main className="page-wrapper">
      <section className="section bg-surface text-center">
        <div className="container">
          <h1 className="page-title fade-in-up">
            {lang === 'es' ? 'Nuestra Empresa' : 'Our Company'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1">
            {lang === 'es' 
              ? 'Helping to set up your business' 
              : 'Helping to set up your business'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container split-section">
          <div className="split-content slide-in-right delay-1">
            <h2 className="text-secondary mb-3">
              {lang === 'es' ? 'Nuestra Misión' : 'Our Mission'}
            </h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Nos esforzamos por ser el principal socio en servicios de logística apoyando el desarrollo y crecimiento de nuestros clientes, ofreciéndoles asesoría y capacitación para llevar a cabo nuevos proyectos de inversión al menor costo posible.'
                : 'We strive to be the main partner in logistics services, supporting the development and growth of our clients, offering advice and training to carry out new investment projects at the lowest possible risk.'}
            </p>
          </div>
          <div className="split-image zoom-in">
            <img 
              src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=2070&auto=format&fit=crop" 
              alt="Mission Logistics" 
              className="img-fluid"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container split-section reverse">
          <div className="split-content slide-in-right delay-2">
            <h2 className="text-secondary mb-3">
              {lang === 'es' ? 'Nuestra Visión' : 'Our Vision'}
            </h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Ser la mejor empresa de prestación de servicios de logística Internacional en la región, reconocida por nuestra calidad, confiabilidad y un excelente servicio a todos nuestros clientes.'
                : 'To be the best international logistics service provider in the region, recognized for our quality, reliability, and excellent service to all our clients.'}
            </p>
          </div>
          <div className="split-image zoom-in delay-1">
            <img 
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop" 
              alt="Vision Teamwork" 
              className="img-fluid"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container">
          <h2 className="text-center text-secondary mb-4 fade-in-up">
            {lang === 'es' ? 'Nuestros Clientes B2B' : 'Our B2B Clients'}
          </h2>
          <div className="grid-3-col">
            <div className="card glass-card fade-in-up">
              <h3 className="text-primary mb-2">Startups</h3>
              <p className="text-text-muted mt-2">
                {lang === 'es' 
                  ? 'Empresas nuevas y/o emprendedores que deseen comenzar nuevos proyectos en México.' 
                  : 'New companies and/or entrepreneurs who wish to start new projects in Mexico.'}
              </p>
            </div>
            <div className="card glass-card fade-in-up delay-1">
              <h3 className="text-primary mb-2">PYMES</h3>
              <p className="text-text-muted mt-2">
                {lang === 'es' 
                  ? 'Empresas PYMES que quieran expandir su alcance de manera internacional con sus productos.' 
                  : 'SMEs that want to expand their reach internationally with their products.'}
              </p>
            </div>
            <div className="card glass-card fade-in-up delay-2">
              <h3 className="text-primary mb-2">{lang === 'es' ? 'Extranjeras' : 'Foreign Entities'}</h3>
              <p className="text-text-muted mt-2">
                {lang === 'es' 
                  ? 'Empresas extranjeras interesadas en realizar operaciones de comercio exterior en México y que no cuenten con entidad legal.' 
                  : 'Foreign companies interested in carrying out foreign trade operations in Mexico without a legal entity.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
