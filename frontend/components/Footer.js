"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer({ lang }) {
  const [currentYear, setCurrentYear] = useState('2026');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__grid">
          {/* Columna 1: Branding y Descripción */}
          <div className="footer__col">
            <h3 className="footer__title">
              <Link href={`/${lang}`} style={{ display: 'inline-block' }}>
                <img src="/logo.png" alt="Servi Proce Logo" style={{ height: '42px', width: 'auto' }} className="fade-in-up" />
              </Link>
            </h3>
            <p className="footer__desc">
              {lang === 'es' 
                ? 'Expertos en logística internacional, despacho aduanal y cadena de suministro para su negocio.'
                : 'Experts in international logistics, customs clearance, and supply chain for your business.'}
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos (Mapa de sitio) */}
          <div className="footer__col">
            <h4 className="footer__subtitle">
              {lang === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
            </h4>
            <ul className="footer__links">
              <li><Link href={`/${lang}`}>{lang === 'es' ? 'Inicio' : 'Home'}</Link></li>
              <li><Link href={`/${lang}/nosotros`}>{lang === 'es' ? 'Nosotros' : 'About Us'}</Link></li>
              <li><Link href={`/${lang}/despachos-aduanales`}>{lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance'}</Link></li>
              <li><Link href={`/${lang}/freight-forwarder`}>Freight Forwarder</Link></li>
              <li><Link href={`/${lang}/servicios`}>{lang === 'es' ? 'Servicios' : 'Services'}</Link></li>
              <li><Link href={`/${lang}/avisos`}>{lang === 'es' ? 'Noticias y Avisos' : 'News & Notices'}</Link></li>
              <li><Link href={`/${lang}/blog`}>Blog</Link></li>
              <li><Link href={`/${lang}/contacto`}>{lang === 'es' ? 'Contacto' : 'Contact'}</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal y Contacto */}
          <div className="footer__col">
            <h4 className="footer__subtitle">
              {lang === 'es' ? 'Legal' : 'Legal'}
            </h4>
            <ul className="footer__links">
              <li><Link href={`/${lang}/privacidad`}>{lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy'}</Link></li>
              <li><Link href={`/${lang}/terminos`}>{lang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</Link></li>
            </ul>
            <div className="footer__contact-info" style={{ marginTop: '1.5rem' }}>
              <p>
                <a href="mailto:jorgebarrios@serviproce.com.mx" className="footer__contact-link">
                  jorgebarrios@serviproce.com.mx
                </a>
              </p>
              <p>
                <a href="tel:+523311402745" className="footer__contact-link">
                  +52 (33) 11402745
                </a>
              </p>
            </div>
            <div className="footer__social-links" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <a 
                href="https://www.facebook.com/SERVIPROCE.EM/#" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Servi Proce"
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877F2', transition: 'all 0.2s ease' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/serviproce-em/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn Servi Proce"
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A66C2', transition: 'all 0.2s ease' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer__bottom">
          <p>&copy; <span>{currentYear}</span> Servi Proce. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
