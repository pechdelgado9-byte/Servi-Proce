import Link from 'next/link';
import { pick } from '@/lib/services-data';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Freight Forwarder Internacional | Servi Proce' : 'International Freight Forwarder | Servi Proce',
    description: lang === 'es'
      ? 'Soluciones logísticas multimodales: Transporte aéreo, marítimo y terrestre coordinado con su despacho aduanal en México.'
      : 'Multimodal logistics solutions: Ocean, air, and ground freight coordinated with customs clearance in Mexico.',
  };
}

export default async function FreightForwarder({ params }) {
  const { lang } = await params;

  const transportModes = [
    {
      id: 'aereo',
      title: lang === 'es' ? 'Transporte Aéreo' : 'Air Freight',
      badge: lang === 'es' ? 'Alta Prioridad & Tiempos Récord' : 'High Priority & Speed',
      desc: lang === 'es'
        ? 'Conexiones globales directas y vuelos de alta prioridad para cargas urgentes y de alto valor.'
        : 'Direct global connections and high-priority flights for urgent and high-value cargo.',
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop',
      features: lang === 'es' ? [
        'Vuelos comerciales regulares y charter dedicados.',
        'Manejo de carga peligrosa (Hazmat) y perecederos.',
        'Trazabilidad en tiempo real y certificación IATA.'
      ] : [
        'Scheduled commercial flights and dedicated charter.',
        'Dangerous goods (Hazmat) and perishable cargo.',
        'Real-time tracking and IATA certification.'
      ],
      href: `/${lang}/transporte/aereo`,
      btnText: lang === 'es' ? 'Explorar Aéreo' : 'Explore Air',
    },
    {
      id: 'maritimo',
      title: lang === 'es' ? 'Transporte Marítimo' : 'Ocean Freight',
      badge: lang === 'es' ? 'FCL, LCL & Gran Volumen' : 'FCL, LCL & High Volume',
      desc: lang === 'es'
        ? 'La alternativa más rentable y con mayor capacidad para embarques de gran volumen entre continentes.'
        : 'The most cost-effective and high-capacity alternative for intercontinental volume shipments.',
      image: '/images/maritimo-ship.jpg',
      features: lang === 'es' ? [
        'Contenedor completo (FCL) y carga consolidada (LCL).',
        'Contenedores refrigerados y proyectos sobredimensionados.',
        'Alianzas Tier-1 en Manzanillo, Veracruz y Altamira.'
      ] : [
        'Full container load (FCL) and consolidated cargo (LCL).',
        'Refrigerated containers and oversized project cargo.',
        'Tier-1 carrier alliances in Manzanillo, Veracruz, Altamira.'
      ],
      href: `/${lang}/transporte/maritimo`,
      btnText: lang === 'es' ? 'Explorar Marítimo' : 'Explore Ocean',
    },
    {
      id: 'terrestre',
      title: lang === 'es' ? 'Transporte Terrestre' : 'Ground Transport',
      badge: lang === 'es' ? 'Puerta a Puerta & Cruces' : 'Door to Door & Cross-Border',
      desc: lang === 'es'
        ? 'Cobertura en todo México y cruces fronterizos estratégicos con Estados Unidos y Canadá.'
        : 'Door-to-door coverage across Mexico and strategic border crossings with the US and Canada.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
      features: lang === 'es' ? [
        'Carga completa de camión (FTL) y servicio consolidado (LTL).',
        'Cajas secas de 48 y 53 pies, refrigerados y plataformas.',
        'Monitoreo satelital GPS 24/7 y cruce ágil en frontera.'
      ] : [
        'Full truckload (FTL) and less-than-truckload (LTL).',
        '48 and 53 ft dry vans, refrigerated units, and flatbeds.',
        '24/7 satellite GPS tracking and expedited border transit.'
      ],
      href: `/${lang}/transporte/terrestre`,
      btnText: lang === 'es' ? 'Explorar Terrestre' : 'Explore Ground',
    },
  ];

  const advantages = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
          <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
          <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"></path>
          <path d="M7 21h10"></path>
          <path d="M12 3v18"></path>
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
        </svg>
      ),
      title: lang === 'es' ? 'Sincronización Aduanal Total' : 'Customs Synchronization',
      desc: lang === 'es'
        ? 'Coordinamos fletes y despacho aduanal sin intermediarios para evitar demoras y costos portuarios.'
        : 'Coordinated freight and customs clearance without third-party delays or unexpected port demurrage.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
      ),
      title: lang === 'es' ? 'Trazabilidad y Ejecutivo Dedicado' : 'Tracking & Dedicated Executive',
      desc: lang === 'es'
        ? 'Reportes de estatus en tiempo real y atención directa con un ejecutivo especializado.'
        : 'Real-time status milestone reports with direct support from a dedicated account specialist.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      title: lang === 'es' ? 'Seguro y Respaldo Global' : 'Insurance & Global Backing',
      desc: lang === 'es'
        ? 'Pólizas de seguro puerta a puerta y alianzas internacionales (WCA) con tarifas preferenciales.'
        : 'Door-to-door cargo insurance policies and international WCA alliances with preferential rates.',
    },
  ];

  return (
    <main className="page-wrapper">
      {/* Hero Section Modernizado */}
      <section 
        className="section bg-surface" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', 
          position: 'relative',
          padding: '5.5rem 0'
        }}
      >
        <div className="section-overlay" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.90) 0%, rgba(157, 0, 0, 0.65) 55%, rgba(15, 23, 42, 0.92) 100%)' }}></div>
        <div className="container relative z-10 text-center">
          <span className="priority-badge fade-in-up" style={{ letterSpacing: '0.08em' }}>
            {lang === 'es' ? 'RED LOGÍSTICA MULTIMODAL' : 'MULTIMODAL LOGISTICS NETWORK'}
          </span>
          <h1 className="page-title fade-in-up delay-1 text-white" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Freight Forwarder Integral
          </h1>
          <p className="page-subtitle fade-in-up delay-2 text-white opacity-90" style={{ maxWidth: '720px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
            {lang === 'es'
              ? 'Conectamos a México con los principales centros de producción y consumo mundial por aire, mar y tierra, en estrecha sincronía con su despacho aduanal.'
              : 'Connecting Mexico with major global production and trade hubs by air, ocean, and ground, perfectly synchronized with your customs clearance.'}
          </p>
          <div className="flex-center gap-4 fade-in-up delay-3" style={{ flexWrap: 'wrap' }}>
            <Link href={`/${lang}/despachos-aduanales#cotizador`} className="btn btn--primary">
              {lang === 'es' ? 'Cotizar Transporte y Despacho' : 'Quote Freight & Customs'}
            </Link>
            <Link href={`/${lang}/contacto`} className="btn btn--secondary btn--outline-white">
              {lang === 'es' ? 'Hablar con un Ejecutivo' : 'Speak with an Advisor'}
            </Link>
          </div>
        </div>
      </section>

      {/* Grid Moderno de Modos de Transporte con Imágenes */}
      <section className="section bg-background">
        <div className="container">
          <div className="text-center mb-5">
            <span className="priority-badge fade-in-up">
              {lang === 'es' ? 'Modos de Transporte' : 'Transport Modes'}
            </span>
            <h2 className="text-secondary mt-2 fade-in-up delay-1">
              {lang === 'es' ? 'Soluciones Adaptadas a su Carga' : 'Solutions Tailored to Your Cargo'}
            </h2>
            <p className="text-text-muted mt-2 fade-in-up delay-2" style={{ maxWidth: '650px', margin: '0 auto' }}>
              {lang === 'es' 
                ? 'Seleccione el modo ideal según el tiempo de tránsito, volumen y naturaleza de su mercancía.'
                : 'Choose the ideal mode based on transit time, volume, and cargo requirements.'}
            </p>
          </div>

          <div className="grid-3-col">
            {transportModes.map((mode, i) => (
              <div key={mode.id} className={`card glass-card freight-card hover-elevate fade-in-up delay-${i + 1}`} style={{ padding: 0, overflow: 'hidden' }}>
                {/* Imagen con bordes redondeados y sin texto montado */}
                <div 
                  className="freight-card__media"
                  style={{ 
                    margin: '1.25rem 1.25rem 0 1.25rem', 
                    borderRadius: '1rem', 
                    overflow: 'hidden', 
                    height: '200px',
                    boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <img 
                    src={mode.image} 
                    alt={mode.title}
                    className="freight-card__img"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div className="freight-card__body" style={{ padding: '1.5rem 1.5rem 1.75rem 1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Badge temático ubicado limpiamente dentro del cuerpo */}
                  <span 
                    className="priority-badge mb-2" 
                    style={{ 
                      alignSelf: 'flex-start', 
                      fontSize: '0.72rem', 
                      letterSpacing: '0.04em',
                      padding: '0.25rem 0.65rem'
                    }}
                  >
                    {mode.badge}
                  </span>

                  <h3 className="text-secondary mb-2" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {mode.title}
                  </h3>
                  <p className="text-text-muted mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.55' }}>
                    {mode.desc}
                  </p>

                  <ul className="list-styled text-text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                    {mode.features.map((f, idx) => (
                      <li key={idx} style={{ marginBottom: '0.45rem' }}>{f}</li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 'auto' }}>
                    <Link href={mode.href} className="btn btn--secondary" style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem 1rem' }}>
                      {mode.btnText} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas Competitivas Multimodales Modernizadas */}
      <section className="section bg-surface">
        <div className="container">
          <div className="text-center mb-5">
            <span className="priority-badge fade-in-up" style={{ fontSize: '0.75rem' }}>
              {lang === 'es' ? 'Valor Agregado Servi Proce' : 'Servi Proce Added Value'}
            </span>
            <h2 className="text-secondary mt-2 fade-in-up delay-1">
              {lang === 'es' ? 'Ventajas de Nuestra Red Multimodal' : 'Advantages of Our Multimodal Network'}
            </h2>
            <p className="text-text-muted mt-2 fade-in-up delay-2" style={{ maxWidth: '650px', margin: '0 auto' }}>
              {lang === 'es'
                ? 'Optimizamos su cadena de suministro integrando fletes internacionales con el despacho aduanal sin intermediarios.'
                : 'We streamline your supply chain by seamlessly integrating international freight with customs brokerage.'}
            </p>
          </div>

          <div className="grid-3-col" style={{ gap: '1.75rem' }}>
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className={`card glass-card hover-elevate fade-in-up delay-${idx + 1}`} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.25rem', 
                  padding: '2rem 1.75rem',
                  borderRadius: '1.25rem',
                  border: '1px solid var(--glass-border)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '0.85rem', 
                  background: 'rgba(157, 0, 0, 0.12)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(157, 0, 0, 0.15)'
                }}>
                  {adv.icon}
                </div>
                <div>
                  <h3 className="text-secondary mb-2" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {adv.title}
                  </h3>
                  <p className="text-text-muted" style={{ fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                    {adv.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="container fade-in-up text-center">
          <h2 className="mb-3" style={{ color: 'white', fontSize: '2rem' }}>
            {lang === 'es' ? '¿Listo para coordinar su próximo embarque?' : 'Ready to coordinate your next shipment?'}
          </h2>
          <p className="mb-4 opacity-90 mx-auto" style={{ maxWidth: '600px', lineHeight: '1.6' }}>
            {lang === 'es'
              ? 'Envíe sus documentos y especificaciones de carga. Uno de nuestros ejecutivos especializados le responderá con una propuesta a la medida.'
              : 'Submit your shipping documents and cargo specs. One of our dedicated advisors will respond with a tailored proposal.'}
          </p>
          <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link href={`/${lang}/despachos-aduanales#cotizador`} className="btn btn--secondary btn--outline-white">
              {lang === 'es' ? 'Solicitar Cotización en Línea' : 'Request Online Quote'}
            </Link>
            <Link href={`/${lang}/contacto`} className="btn btn--primary">
              {lang === 'es' ? 'Contactar a Servi Proce' : 'Contact Servi Proce'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
