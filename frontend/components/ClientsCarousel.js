"use client";

import { useState, useEffect, useRef } from 'react';

export default function ClientsCarousel({ lang }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const clients = [
    {
      id: 'startups',
      tag: lang === 'es' ? 'Startups & Emprendedores' : 'Startups & New Ventures',
      title: lang === 'es' ? 'Startups en Fase de Despegue' : 'Early-Stage Startups',
      desc: lang === 'es'
        ? 'Acompañamos a nuevos emprendedores y startups tecnológicas en sus primeras operaciones de importación y exportación, protegiendo su inversión desde el inicio.'
        : 'We partner with entrepreneurs and tech startups on their first import and export operations, protecting their capital from day one.',
      bullets: lang === 'es' ? [
        'Asesoría técnica para evitar multas y clasificar correctamente sus productos.',
        'Esquemas de flete consolidado (LCL) para importar pequeños lotes de prueba.',
        'Gestión del Padrón de Importadores y cumplimiento de regulaciones mexicanas.'
      ] : [
        'Technical guidance to avoid customs fines and classify goods accurately.',
        'Consolidated freight (LCL) solutions for test batches and small initial orders.',
        'Importer registry filing and Mexican regulatory compliance.'
      ],
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Equipo de emprendedores trabajando en comercio exterior' : 'Startup team collaborating on international trade',
    },
    {
      id: 'pymes',
      tag: lang === 'es' ? 'PYMES en Expansión' : 'Growing SMEs',
      title: lang === 'es' ? 'Pequeñas y Medianas Empresas' : 'Small & Medium Enterprises',
      desc: lang === 'es'
        ? 'Impulsamos a PYMES mexicanas que buscan escalar su negocio a nivel global, optimizando sus costos de flete y reduciendo los tiempos de despacho.'
        : 'We empower Mexican SMEs looking to scale globally by optimizing freight costs and minimizing customs clearance transit times.',
      bullets: lang === 'es' ? [
        'Tarifas negociadas de flete marítimo, aéreo y terrestre con cobertura mundial.',
        'Revisión documental previa para garantizar liberación en menos de 24 horas.',
        'Atención personalizada con un ejecutivo de cuenta senior dedicado.'
      ] : [
        'Negotiated ocean, air, and ground freight rates with global coverage.',
        'Pre-clearance document audit ensuring cargo release within 24 hours.',
        'Dedicated senior account executive for responsive day-to-day support.'
      ],
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Almacén logístico y distribución regional para PYMES' : 'Regional logistics warehouse and distribution for SMEs',
    },
    {
      id: 'extranjeras',
      tag: lang === 'es' ? 'Compañías Extranjeras' : 'Foreign Enterprises',
      title: lang === 'es' ? 'Empresas sin Entidad Legal en México' : 'Non-Resident Foreign Companies',
      desc: lang === 'es'
        ? 'Brindamos la infraestructura aduanal y logística necesaria para empresas del exterior que desean comercializar en territorio mexicano sin constituir empresa local.'
        : 'We provide customs and logistics infrastructure for international corporations trading in Mexico without establishing a local legal entity.',
      bullets: lang === 'es' ? [
        'Servicio de comercializadora e importador registrado para ingreso legal al país.',
        'Cumplimiento y certificación de Normas Oficiales Mexicanas (NOMs) y etiquetado.',
        'Entregas DDP (Delivered Duty Paid) directas a clientes finales o distribuidores.'
      ] : [
        'Trading company representation and importer of record services.',
        'Official Mexican Standards (NOM) certification and compliant labeling.',
        'DDP (Delivered Duty Paid) fulfillment directly to end buyers or distributors.'
      ],
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Corporativo internacional y negocios multinacionales' : 'Multinational corporate headquarters and trade hub',
    },
    {
      id: 'corporativos',
      tag: lang === 'es' ? 'Grandes Corporativos' : 'Industrial Enterprises',
      title: lang === 'es' ? 'Corporativos e Industria Manufacturera' : 'Manufacturing & Tier-1 Corporates',
      desc: lang === 'es'
        ? 'Soluciones logísticas robustas para la industria maquiladora, automotriz y manufacturera con altos requerimientos de volumen y trazabilidad continua.'
        : 'Robust logistics architectures for maquiladora, automotive, and manufacturing plants with high volume and precision timing requirements.',
      bullets: lang === 'es' ? [
        'Administración integral de programas IMMEX, PROSEC y Regla 8ª.',
        'Cruces fronterizos prioritarios y corredores aduanales dedicados con EE. UU.',
        'Expediente digital auditado 24/7 con trazabilidad de pedimentos en tiempo real.'
      ] : [
        'Comprehensive management of IMMEX, PROSEC, and Rule 8 export programs.',
        'Priority border crossings and dedicated customs lanes with the US.',
        '24/7 digital audit files and real-time electronic customs tracking.'
      ],
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
      alt: lang === 'es' ? 'Industria manufacturera y logística avanzada' : 'Advanced manufacturing and industrial logistics',
    }
  ];

  const total = clients.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setResetKey((k) => k + 1);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setResetKey((k) => k + 1);
  };

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
    setResetKey((k) => k + 1);
  };

  // Autoplay continuo e ininterrumpido cada 7.5s (sin importar que se pase el cursor)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setResetKey((k) => k + 1);
    }, 7500);

    return () => clearInterval(timer);
  }, [currentIndex, resetKey, total]);

  // Soporte táctil móvil
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
      className="clients-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={lang === 'es' ? 'Carrusel de nuestros clientes' : 'Our clients carousel'}
    >
      {/* Barra de progreso visual sincronizada */}
      <div className="services-slider__progress">
        <div 
          key={`${currentIndex}-${resetKey}`} 
          className="services-slider__progress-bar is-animating" 
        />
      </div>

      {/* Ventana con pista de deslizamiento animada */}
      <div className="clients-carousel__viewport">
        <div 
          className="clients-carousel__track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {clients.map((c, idx) => (
            <div key={c.id} className="clients-carousel__slide">
              <div className="clients-carousel__card glass-card hover-elevate">
                <div className="clients-carousel__grid">
                  {/* Fotografía de alta definición */}
                  <div className="clients-carousel__media">
                    <img 
                      src={c.image} 
                      alt={c.alt} 
                      className="clients-carousel__img"
                      loading="lazy"
                    />
                    <div className="clients-carousel__img-overlay"></div>
                    <span className="clients-carousel__tag">
                      {c.tag}
                    </span>
                  </div>

                  {/* Información y propuesta de valor */}
                  <div className="clients-carousel__content">
                    <span className="services-slider__counter mb-2">
                      0{idx + 1} / 0{total}
                    </span>
                    <h3 className="clients-carousel__title">
                      {c.title}
                    </h3>
                    <p className="clients-carousel__desc">
                      {c.desc}
                    </p>

                    <ul className="clients-carousel__bullets">
                      {c.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="clients-carousel__bullet">
                          <span className="clients-carousel__bullet-icon" aria-hidden="true">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="clients-carousel__controls">
        <button 
          onClick={prevSlide}
          className="services-slider__nav-btn"
          aria-label={lang === 'es' ? 'Cliente anterior' : 'Previous client'}
          title={lang === 'es' ? 'Anterior' : 'Previous'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Paginadores / Dots */}
        <div className="services-slider__dots" role="tablist">
          {clients.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => goToSlide(idx)}
              className={`services-slider__dot ${currentIndex === idx ? 'services-slider__dot--active' : ''}`}
              aria-label={`${lang === 'es' ? 'Ver cliente' : 'View client'} ${c.title}`}
              role="tab"
              aria-selected={currentIndex === idx}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="services-slider__nav-btn"
          aria-label={lang === 'es' ? 'Siguiente cliente' : 'Next client'}
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
