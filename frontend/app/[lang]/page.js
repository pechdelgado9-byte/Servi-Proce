import Link from 'next/link';
import { fetchPromotions } from '@/lib/api';
import { fetchAvisos } from '@/lib/avisos';
import { despachoSubservices, pick } from '@/lib/services-data';
import AvisoCard from '../../components/AvisoCard';
import AnimatedCounter from '../../components/AnimatedCounter';
import ServicesCarousel from '../../components/ServicesCarousel';

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
        <div 
          className="promo-banner fade-in-up" 
          style={{ 
            background: 'linear-gradient(135deg, #0b1120 0%, #161f38 50%, #0b1120 100%)', 
            borderBottom: '1px solid rgba(157, 0, 0, 0.35)',
            padding: '2.25rem 1rem', 
            textAlign: 'center', 
            position: 'relative' 
          }}
        >
          <div className="container relative z-10 text-white">
            <span className="priority-badge mb-2" style={{ background: 'rgba(157, 0, 0, 0.25)', border: '1px solid rgba(220, 38, 38, 0.5)', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
              {lang === 'es' ? 'Atención Personalizada' : 'Tailored Advisory'}
            </span>
            <h2 className="mb-2" style={{ color: '#ffffff', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{promo.title}</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.5' }}>{promo.description}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        className="hero text-center" 
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '7rem 0 6.5rem 0'
        }}
      >
        <div className="hero__overlay" style={{ zIndex: 1, background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(157, 0, 0, 0.55) 55%, rgba(15, 23, 42, 0.88) 100%)' }}></div>
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
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10">
          <h2 className="text-center text-secondary mb-4 fade-in-up">
            {lang === 'es' ? 'Nuestros Servicios' : 'Our Services'}
          </h2>

          <div className="fade-in-up delay-1">
            <ServicesCarousel lang={lang} />
          </div>
        </div>
      </section>

      {/* Noticias, leyes y avisos (publicados por el administrador) */}
      {avisos.length > 0 && (
        <section className="section bg-background">
          <div className="container">
            <div className="text-center mb-5" style={{ marginBottom: '3.75rem' }}>
              <span className="priority-badge fade-in-up">
                {lang === 'es' ? 'Actualidad y Normativa' : 'Updates & Regulations'}
              </span>
              <h2 className="text-secondary mt-2 mb-3 fade-in-up delay-1">
                {lang === 'es' ? 'Noticias, Leyes y Avisos' : 'News, Laws and Notices'}
              </h2>
              <p className="text-text-muted fade-in-up delay-2" style={{ maxWidth: '640px', margin: '0 auto' }}>
                {lang === 'es'
                  ? 'Manténgase al día con las disposiciones del SAT, reglas de comercio exterior y avisos operativos para sus operaciones aduanales.'
                  : 'Stay informed on SAT regulations, foreign trade rules, and operational notices for your customs operations.'}
              </p>
            </div>
            <div className="grid-3-col">
              {avisos.map((a) => <AvisoCard key={a.id} aviso={a} lang={lang} />)}
            </div>
            <div className="text-center mt-5" style={{ marginTop: '3.75rem' }}>
              <Link href={`/${lang}/avisos`} className="btn btn--secondary" style={{ padding: '0.9rem 2.25rem', fontSize: '0.98rem', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                {lang === 'es' ? 'Ver todas las publicaciones →' : 'View all posts →'}
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
