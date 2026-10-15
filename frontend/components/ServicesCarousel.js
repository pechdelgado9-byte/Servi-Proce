"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ServicesCarousel({ lang }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const services = [
    {
      id: 'despachos',
      badge: lang === 'es' ? 'Servicio Principal' : 'Core Service',
      isPriority: true,
      title: lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance',
      subtitle: lang === 'es' 
        ? 'Tramitamos la entrada y salida legal de su mercancía en las 50 aduanas del país.' 
        : 'We handle the legal entry and exit of your goods across all 50 customs offices in Mexico.',
      highlights: lang === 'es' ? [
        'Elaboración y validación de pedimento de importación y exportación.',
        'Cálculo exacto de impuestos y contribuciones (IGI, IVA, DTA).',
        'Operaciones en puertos (Manzanillo, Veracruz), aeropuertos y fronteras.',
        'Expediente electrónico completo y respuesta ante semáforo aduanero.'
      ] : [
        'Customs entry (pedimento) preparation and validation.',
        'Accurate tax and duty calculation (IGI, VAT, DTA).',
        'Operations at seaports (Manzanillo, Veracruz), airports and borders.',
        'Complete electronic compliance file and fast inspection support.'
      ],
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Despacho aduanal y terminal de contenedores' : 'Customs clearance container terminal',
      primaryBtn: {
        text: lang === 'es' ? 'Conocer el servicio' : 'Learn about the service',
        href: `/${lang}/despachos-aduanales`
      },
      secondaryBtn: {
        text: lang === 'es' ? 'Solicitar cotización' : 'Request quote',
        href: `/${lang}/despachos-aduanales#cotizador`
      }
    },
    {
      id: 'maritimo',
      badge: lang === 'es' ? 'Freight Forwarder' : 'Freight Forwarder',
      isPriority: false,
      title: lang === 'es' ? 'Transporte Marítimo (FCL & LCL)' : 'Ocean Freight (FCL & LCL)',
      subtitle: lang === 'es'
        ? 'La opción más rentable y de mayor volumen desde y hacia los principales puertos del mundo.'
        : 'The most cost-effective and highest volume transport to and from major world ports.',
      highlights: lang === 'es' ? [
        'Carga de contenedor completo (FCL) y contenedor consolidado (LCL).',
        'Transporte refrigerado y con control de temperatura.',
        'Proyectos en buques especializados y carga sobredimensionada (Break Bulk).',
        'Alianzas con navieras internacionales de primer nivel (WCA Member).'
      ] : [
        'Full container load (FCL) and consolidated cargo (LCL).',
        'Refrigerated and temperature-controlled maritime transport.',
        'Break bulk vessels and heavy lift project cargo.',
        'Tier-1 ocean carrier partnerships (WCA Member).'
      ],
      image: '/images/maritimo-ship.jpg',
      alt: lang === 'es' ? 'Buque portacontenedores de carga marítima internacional' : 'Ocean freight container ship',
      primaryBtn: {
        text: lang === 'es' ? 'Ver Transporte Marítimo' : 'View Ocean Freight',
        href: `/${lang}/transporte/maritimo`
      },
      secondaryBtn: {
        text: lang === 'es' ? 'Cotizar Marítimo' : 'Get Quote',
        href: `/${lang}/contacto`
      }
    },
    {
      id: 'aereo',
      badge: lang === 'es' ? 'Freight Forwarder' : 'Freight Forwarder',
      isPriority: false,
      title: lang === 'es' ? 'Transporte Aéreo' : 'Air Transport',
      subtitle: lang === 'es'
        ? 'Tiempos de tránsito reducidos y máxima seguridad para cargas urgentes y de alto valor.'
        : 'Minimal transit times and maximum security for urgent and high-value shipments.',
      highlights: lang === 'es' ? [
        'Conexiones con los aeropuertos más importantes a nivel global.',
        'Vuelos comerciales regulares, vuelos charter y servicio consolidado.',
        'Manejo de mercancía peligrosa (Hazmat con MSDS) y perecederos.',
        'Agente certificado IATA con trazabilidad continua.'
      ] : [
        'Connections with major international airports worldwide.',
        'Commercial scheduled flights, dedicated charter and consolidation.',
        'Dangerous goods handling (Hazmat with MSDS) and perishables.',
        'IATA certified freight forwarder with end-to-end tracking.'
      ],
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Transporte aéreo de carga internacional' : 'International air freight cargo plane',
      primaryBtn: {
        text: lang === 'es' ? 'Ver Transporte Aéreo' : 'View Air Transport',
        href: `/${lang}/transporte/aereo`
      },
      secondaryBtn: {
        text: lang === 'es' ? 'Solicitar Asesoría' : 'Contact Advisor',
        href: `/${lang}/contacto`
      }
    },
    {
      id: 'terrestre',
      badge: lang === 'es' ? 'Freight Forwarder' : 'Freight Forwarder',
      isPriority: false,
      title: lang === 'es' ? 'Transporte Terrestre' : 'Ground Transport',
      subtitle: lang === 'es'
        ? 'Distribución nacional y cruces fronterizos eficientes entre México, Estados Unidos y Canadá.'
        : 'National distribution and efficient border crossings between Mexico, USA, and Canada.',
      highlights: lang === 'es' ? [
        'Carga completa (FTL) y carga consolidada (LTL).',
        'Cajas secas de 48 y 53 pies, unidades refrigeradas y plataformas.',
        'Cruces expeditos en Nuevo Laredo, Nogales, Tijuana y Ciudad Juárez.',
        'Rastreo satelital GPS 24/7 y custodia para máxima seguridad.'
      ] : [
        'Full truckload (FTL) and less-than-truckload (LTL) services.',
        '48 & 53 ft dry vans, refrigerated units and flatbeds.',
        'Expedited border crossings in Nuevo Laredo, Nogales, Tijuana and Juarez.',
        '24/7 GPS satellite tracking and security monitoring.'
      ],
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Flota de transporte terrestre de carga' : 'Ground cargo transportation fleet',
      primaryBtn: {
        text: lang === 'es' ? 'Ver Transporte Terrestre' : 'View Ground Transport',
        href: `/${lang}/transporte/terrestre`
      },
      secondaryBtn: {
        text: lang === 'es' ? 'Cotizar Terrestre' : 'Get Quote',
        href: `/${lang}/contacto`
      }
    },
    {
      id: 'complementarios',
      badge: lang === 'es' ? 'Consultoría Aduanal' : 'Customs Consulting',
      isPriority: false,
      title: lang === 'es' ? 'Servicios Complementarios' : 'Complementary Services',
      subtitle: lang === 'es'
        ? 'Cumplimiento normativo y asesoría estratégica para que su carga nunca se detenga.'
        : 'Regulatory compliance and strategic advisory to keep your supply chain running without delays.',
      highlights: lang === 'es' ? [
        'Clasificación arancelaria y determinación correcta del código NICO.',
        'Cumplimiento y etiquetado de Normas Oficiales Mexicanas (NOM).',
        'Asesoría en programas IMMEX, PROSEC y Tratados de Libre Comercio (T-MEC).',
        'Pólizas de seguro internacional de mercancías puerta a puerta.'
      ] : [
        'Tariff classification and accurate NICO code determination.',
        'NOM (Mexican Official Standards) labeling and compliance.',
        'IMMEX, PROSEC and Free Trade Agreement (USMCA) advisory.',
        'Door-to-door international cargo insurance coverage.'
      ],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Asesoría y cumplimiento en comercio exterior' : 'Foreign trade compliance advisory',
      primaryBtn: {
        text: lang === 'es' ? 'Explorar Servicios' : 'Explore Services',
        href: `/${lang}/servicios`
      },
      secondaryBtn: {
        text: lang === 'es' ? 'Consultoría Directa' : 'Direct Consultation',
        href: `/${lang}/contacto`
      }
    }
  ];

  const total = services.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Autoplay continuo e ininterrumpido (cada 7.5s) sin detenerse al pasar el cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 7500);

    return () => clearInterval(interval);
  }, [total]);

  // Soporte táctil móvil (swipe)
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="services-slider"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={lang === 'es' ? 'Carrusel de servicios' : 'Services carousel'}
    >
      {/* Barra de progreso de cambio automático */}
      <div className="services-slider__progress">
        <div 
          key={currentIndex} 
          className="services-slider__progress-bar is-animating" 
        />
      </div>

      {/* Ventana de visualización con pista de desplazamiento animada */}
      <div className="services-slider__viewport">
        <div 
          className="services-slider__track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {services.map((item, idx) => (
            <div key={item.id} className="services-slider__slide">
              <div className="services-slider__card glass-card hover-elevate">
                <div className="services-slider__grid">
                  {/* Contenido izquierdo */}
                  <div className="services-slider__info">
                    <div className="services-slider__badge-row">
                      <span className={`priority-badge ${item.isPriority ? 'priority-badge--glow' : ''}`}>
                        {item.badge}
                      </span>
                      <span className="services-slider__counter">
                        0{idx + 1} / 0{total}
                      </span>
                    </div>

                    <h3 className="services-slider__title text-secondary">
                      {item.title}
                    </h3>

                    <p className="services-slider__subtitle text-text-muted">
                      {item.subtitle}
                    </p>

                    <ul className="services-slider__list">
                      {item.highlights.map((bullet, bIdx) => (
                        <li key={bIdx} className="services-slider__item">
                          <span className="services-slider__check" aria-hidden="true">✓</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="services-slider__actions">
                      <Link href={item.primaryBtn.href} className="btn btn--primary">
                        {item.primaryBtn.text}
                      </Link>
                      <Link href={item.secondaryBtn.href} className="btn btn--secondary">
                        {item.secondaryBtn.text}
                      </Link>
                    </div>
                  </div>

                  {/* Imagen derecha con marco y badge */}
                  <div className="services-slider__image-wrap">
                    <img 
                      src={item.image} 
                      alt={item.alt}
                      className="services-slider__img"
                      loading="lazy"
                    />
                    <div className="services-slider__img-overlay"></div>
                    <div className="services-slider__img-caption">
                      <span>{item.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="services-slider__controls">
        <button 
          onClick={prevSlide}
          className="services-slider__nav-btn"
          aria-label={lang === 'es' ? 'Servicio anterior' : 'Previous service'}
          title={lang === 'es' ? 'Anterior' : 'Previous'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Indicadores / Dots */}
        <div className="services-slider__dots" role="tablist">
          {services.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`services-slider__dot ${currentIndex === idx ? 'services-slider__dot--active' : ''}`}
              aria-label={`${lang === 'es' ? 'Ir al servicio' : 'Go to service'} ${s.title}`}
              role="tab"
              aria-selected={currentIndex === idx}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="services-slider__nav-btn"
          aria-label={lang === 'es' ? 'Siguiente servicio' : 'Next service'}
          title={lang === 'es' ? 'Siguiente' : 'Next'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
