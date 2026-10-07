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
              <img src="/logo.png" alt="Servi Proce Logo" style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }} className="fade-in-up" />
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
              <li><Link href={`/${lang}/servicios`}>{lang === 'es' ? 'Servicios' : 'Services'}</Link></li>
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
