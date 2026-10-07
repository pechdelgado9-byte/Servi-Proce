import Link from 'next/link';

export default async function Servicios({ params }) {
  const { lang } = await params;

  const services = [
    {
      title: lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      desc: lang === 'es' 
        ? 'Importación y Exportación, y todo el soporte para el cálculo de impuestos, clasificación arancelaria y cumplir las regulaciones y restricciones no arancelarias.'
        : 'Import and Export, and full support for tax calculation, tariff classification, and complying with non-tariff regulations and restrictions.'
    },
    {
      title: lang === 'es' ? 'Custom Broker Americano' : 'US Customs Broker',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
      desc: lang === 'es'
        ? 'Preparación de documentos, cálculo y pago de impuestos, y facilitación de la comunicación entre autoridades estadounidenses y el exportador mexicano.'
        : 'Document preparation, tax calculation and payment, and facilitating communication between US authorities and the Mexican exporter.'
    },
    {
      title: lang === 'es' ? 'Programas de Fomento' : 'Promotion Programs',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
      desc: lang === 'es'
        ? 'Asesoramiento en IMMEX y PROSEC para la importación temporal de bienes y acceso a aranceles preferenciales.'
        : 'Advice on IMMEX and PROSEC for the temporary import of goods and access to preferential tariffs.'
    },
    {
      title: lang === 'es' ? 'Seguros de Carga' : 'Cargo Insurance',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
      desc: lang === 'es'
        ? 'La forma más eficaz para cubrir riesgos de su producto y que viaje totalmente segura su mercancía.'
        : 'The most effective way to cover risks for your product and ensure your merchandise travels completely safe.'
    },
    {
      title: lang === 'es' ? 'Asesoría y Certificados NOM' : 'Consulting and NOM Certificates',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
      desc: lang === 'es'
        ? 'Brindamos servicios relacionados con el cumplimiento NOM que requieran sus mercancías importadas o nacionales para su comercialización legal en México.'
        : 'We provide services related to NOM compliance required by your imported or national merchandise for legal commercialization in Mexico.'
    },
    {
      title: lang === 'es' ? 'Servicios Adicionales' : 'Additional Services',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
      desc: lang === 'es'
        ? 'Transporte, Almacenajes, Distribución y soluciones integrales en la Cadena de Suministro.'
        : 'Transport, Storage, Distribution, and comprehensive solutions in the Supply Chain.'
    }
  ];

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center mb-5">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Nuestros Servicios' : 'Our Services'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            {lang === 'es' 
              ? 'Soluciones integrales para la cadena de suministro internacional.' 
              : 'Comprehensive solutions for the international supply chain.'}
          </p>
        </div>
        <div className="container grid-3-col relative z-10">
          {services.map((service, index) => (
            <div key={index} className={`card hover-elevate glass-card fade-in-up delay-${(index % 3) + 1}`}>
              <div className="icon-wrapper">
                {service.icon}
              </div>
              <h3 className="text-secondary mb-2">{service.title}</h3>
              <p className="text-text-muted mb-4">{service.desc}</p>
              <Link href={`/${lang}/contacto`} className="btn btn--secondary text-sm">
                {lang === 'es' ? 'Saber Más' : 'Learn More'}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
