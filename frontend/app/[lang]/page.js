import Link from 'next/link';
import { fetchPromotions } from '@/lib/api';
import { fetchAvisos } from '@/lib/avisos';
import { despachoSubservices, pick } from '@/lib/services-data';
import AvisoCard from '../../components/AvisoCard';
import AnimatedCounter from '../../components/AnimatedCounter';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Inicio | Servi Proce' : 'Home | Servi Proce',
    description: lang === 'es'
      ? 'Soluciones Globales de Logística y Despacho Aduanal.'
      : 'Global Logistics and Customs Clearance Solutions.',
  };
}

export default async function Home({ params }) {
  const { lang } = await params;

  // Consumo de banner promocional (RF-02)
  const promo = await fetchPromotions(lang);
  const avisos = await fetchAvisos(lang, { limit: 3 });

  return (
    <main className="page-wrapper">
      {/* Promotional Banner */}
      {promo && (
        <div className="promo-banner fade-in-up" style={{ backgroundImage: `url(${promo.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '2rem 1rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
          <div className="container relative z-10 text-white">
            <h2 className="mb-2" style={{ color: 'white' }}>{promo.title}</h2>
            <p>{promo.description}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-commercial-container-ship-in-the-sea-aerial-view-43093-large.mp4" type="video/mp4" />
        </video>
        <div className="hero__overlay" style={{ zIndex: 1, backgroundColor: 'rgba(17, 24, 39, 0.75)' }}></div>
        <div className="container hero__content relative z-10">
          <h1 className="hero__title fade-in-up text-white">
            {lang === 'es' ? 'Soluciones Globales de Logística' : 'Global Logistics Solutions'}
          </h1>
          <p className="hero__subtitle fade-in-up delay-1 text-white opacity-90">
            {lang === 'es'
              ? 'Servicios Profesionales en Materia de Comercio Exterior para Emprendedores y Empresas'
              : 'Professional Foreign Trade Services for Entrepreneurs and Companies'}
          </p>
          <div className="hero__actions fade-in-up delay-2 mt-4 flex-center gap-4">
            <Link href={`/${lang}/contacto`} className="btn btn--primary">
              {lang === 'es' ? 'Solicitar Asesoría' : 'Request Consultation'}
            </Link>
            <Link href={`/${lang}/despachos-aduanales`} className="btn btn--secondary btn--outline-white">
              {lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Marquee */}
      <section className="marquee-container">
        <div className="marquee-content">
          <span className="marquee-item">IATA CERTIFIED</span>
          <span className="marquee-item">OEA PARTNER</span>
          <span className="marquee-item">C-TPAT COMPLIANT</span>
          <span className="marquee-item">ISO 9001:2015</span>
          <span className="marquee-item">WCA MEMBER</span>
          <span className="marquee-item">AMACARGA</span>
          <span className="marquee-item">IATA CERTIFIED</span>
          <span className="marquee-item">OEA PARTNER</span>
          <span className="marquee-item">C-TPAT COMPLIANT</span>
          <span className="marquee-item">ISO 9001:2015</span>
          <span className="marquee-item">WCA MEMBER</span>
          <span className="marquee-item">AMACARGA</span>
        </div>
      </section>

      {/* Servicios: Despachos Aduanales (prioridad) + Freight Forwarder + Servicios secundarios */}
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10">
          <h2 className="text-center text-secondary mb-4 fade-in-up">
            {lang === 'es' ? 'Nuestros Servicios' : 'Our Services'}
          </h2>

          {/* Prioridad: Despachos Aduanales */}
          <div className="card hover-elevate glass-card priority-card fade-in-up delay-1">
            <span className="priority-badge">{lang === 'es' ? 'Servicio principal' : 'Core service'}</span>
            <h3 className="text-primary mb-2">{lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}</h3>
            <p className="text-text-muted mb-3">
              {lang === 'es'
                ? 'Tramitamos la entrada y salida legal de su mercancía en las 50 aduanas del país.'
                : 'We handle the legal entry and exit of your goods at all 50 customs offices in Mexico.'}
            </p>
            <ul className="list-styled text-text-muted mb-4">
              {despachoSubservices.map((sv) => <li key={sv.id}>{pick(sv.title, lang)}</li>)}
            </ul>
            <div className="flex-center gap-4" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              <Link href={`/${lang}/despachos-aduanales`} className="btn btn--primary">
                {lang === 'es' ? 'Conocer el servicio' : 'Learn about the service'}
              </Link>
              <Link href={`/${lang}/despachos-aduanales#cotizador`} className="btn btn--secondary">
                {lang === 'es' ? 'Solicitar cotización' : 'Request a quote'}
              </Link>
            </div>
          </div>

          <div className="grid-2-col mt-4">
            <div className="card hover-elevate glass-card fade-in-up delay-2">
              <div className="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3 className="text-primary mb-2">Freight Forwarder</h3>
              <p className="text-text-muted mb-4">
                {lang === 'es'
                  ? 'Servicios de transportación nacional e internacional (Marítimo, Aéreo y Terrestre).'
                  : 'National and international transportation services (Maritime, Air, and Land).'}
              </p>
              <Link href={`/${lang}/freight-forwarder`} className="btn btn--secondary text-sm">
                {lang === 'es' ? 'Ver servicio' : 'View service'}
              </Link>
            </div>
            <div className="card hover-elevate glass-card fade-in-up delay-3">
              <div className="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h3 className="text-primary mb-2">{lang === 'es' ? 'Servicios complementarios' : 'Complementary services'}</h3>
              <p className="text-text-muted mb-4">
                {lang === 'es'
                  ? 'Clasificación arancelaria, NOM, IMMEX/PROSEC, tratados de libre comercio, seguros y más.'
                  : 'Tariff classification, NOM, IMMEX/PROSEC, free trade agreements, insurance and more.'}
              </p>
              <Link href={`/${lang}/servicios`} className="btn btn--secondary text-sm">
                {lang === 'es' ? 'Explorar servicios' : 'Explore services'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Noticias, leyes y avisos (publicados por el administrador) */}
      {avisos.length > 0 && (
        <section className="section bg-background">
          <div className="container">
            <h2 className="text-center text-secondary mb-4 fade-in-up">
              {lang === 'es' ? 'Noticias, Leyes y Avisos' : 'News, Laws and Notices'}
            </h2>
            <div className="grid-3-col">
              {avisos.map((a) => <AvisoCard key={a.id} aviso={a} lang={lang} />)}
            </div>
            <div className="text-center mt-4">
              <Link href={`/${lang}/avisos`} className="btn btn--secondary">
                {lang === 'es' ? 'Ver todas las publicaciones' : 'View all posts'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="section bg-background">
        <div className="container grid-3-col">
          <div className="stat-box fade-in-up">
            <div className="stat-number text-primary"><AnimatedCounter end={10} suffix="+" /></div>
            <div className="text-secondary">{lang === 'es' ? 'Años de Experiencia' : 'Years of Experience'}</div>
          </div>
          <div className="stat-box fade-in-up delay-1">
            <div className="stat-number text-primary"><AnimatedCounter end={500} suffix="+" duration={2500} /></div>
            <div className="text-secondary">{lang === 'es' ? 'Clientes Satisfechos' : 'Satisfied Clients'}</div>
          </div>
          <div className="stat-box fade-in-up delay-2">
            <div className="stat-number text-primary"><AnimatedCounter end={30} suffix="+" /></div>
            <div className="text-secondary">{lang === 'es' ? 'Países Conectados' : 'Connected Countries'}</div>
          </div>
        </div>
      </section>

      {/* Compromiso / Tratos Section */}
      <section className="section bg-surface">
        <div className="container split-section">
          <div className="split-image zoom-in">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
              alt="Tratos Comerciales"
              className="img-fluid"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="split-content slide-in-right delay-1">
            <h2 className="text-secondary mb-4">
              {lang === 'es' ? 'Compromiso y Tratos Comerciales' : 'Commitment and Business Deals'}
            </h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Nos enfocamos en construir relaciones a largo plazo con nuestros clientes, asegurando que cada trato se ejecute con la máxima transparencia y eficiencia. Su éxito es nuestra prioridad.'
                : 'We focus on building long-term relationships with our clients, ensuring that every deal is executed with maximum transparency and efficiency. Your success is our priority.'}
            </p>
            <ul className="list-styled text-text-muted mb-4">
              <li>{lang === 'es' ? 'Atención personalizada 24/7' : '24/7 personalized attention'}</li>
              <li>{lang === 'es' ? 'Soluciones a la medida de su empresa' : 'Custom solutions for your business'}</li>
              <li>{lang === 'es' ? 'Red global de agentes certificados' : 'Global network of certified agents'}</li>
            </ul>
            <Link href={`/${lang}/nosotros`} className="btn btn--primary mt-2">
              {lang === 'es' ? 'Conocer Más' : 'Learn More'}
            </Link>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="section bg-background">
        <div className="container split-section reverse">
          <div className="split-image zoom-in delay-1">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070&auto=format&fit=crop"
              alt="Transporte Global"
              className="img-fluid"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="split-content slide-in-right">
            <h2 className="text-secondary mb-4">
              {lang === 'es' ? 'Alcance Global, Experiencia Local' : 'Global Reach, Local Expertise'}
            </h2>
            <p className="text-text-muted mb-4">
              {lang === 'es'
                ? 'Ya sea por aire, mar o tierra, garantizamos que su mercancía llegará a su destino en tiempo y forma, cumpliendo con todas las regulaciones aduaneras internacionales.'
                : 'Whether by air, sea, or land, we guarantee your merchandise will reach its destination on time, complying with all international customs regulations.'}
            </p>
            <Link href={`/${lang}/servicios`} className="btn btn--secondary mt-2">
              {lang === 'es' ? 'Ver Catálogo Completo' : 'View Full Catalog'}
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container fade-in-up">
          <h2 className="mb-4" style={{ color: 'white' }}>
            {lang === 'es' ? '¿Listo para optimizar su cadena de suministro?' : 'Ready to optimize your supply chain?'}
          </h2>
          <p className="mb-4 opacity-90 mx-auto" style={{ maxWidth: '600px', textAlign: 'center' }}>
            {lang === 'es'
              ? 'Contacte a uno de nuestros asesores hoy mismo y reciba una cotización personalizada.'
              : 'Contact one of our advisors today and receive a personalized quote.'}
          </p>
          <Link href={`/${lang}/contacto`} className="btn btn--secondary btn--outline-white animate-pulse">
            {lang === 'es' ? 'Contactar Ahora' : 'Contact Now'}
          </Link>
        </div>
      </section>
    </main>
  );
}
