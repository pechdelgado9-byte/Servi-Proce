"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer({ lang }) {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear().toString());

  useEffect(() => {
    // RF-08: Extracción dinámica del año en curso para Derechos Reservados
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

          {/* Columna 2: Enlaces Rápidos (Mapa de sitio - Sin vacantes según RF-03) */}
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

          {/* Columna 3: Legal, Contactos y Redes Sociales (RF-05 y RF-08) */}
          <div className="footer__col">
            <h4 className="footer__subtitle">
              {lang === 'es' ? 'Legal y Contacto' : 'Legal & Contact'}
            </h4>
            <ul className="footer__links">
              <li><Link href={`/${lang}/privacidad`}>{lang === 'es' ? 'Aviso de Privacidad' : 'Privacy Policy'}</Link></li>
              <li><Link href={`/${lang}/terminos`}>{lang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</Link></li>
            </ul>
            <div className="footer__contact-info" style={{ marginTop: '1.25rem' }}>
              <p>
                <a href="mailto:customerservice@serviproce.com.mx" className="footer__contact-link">
                  customerservice@serviproce.com.mx
                </a>
              </p>
              <p>
                <a href="mailto:jorgebarrios@serviproce.com.mx" className="footer__contact-link">
                  jorgebarrios@serviproce.com.mx
                </a>
              </p>
              <p>
                <a href="tel:+523311402745" className="footer__contact-link">
                  +52 (33) 1140-2745
                </a>
              </p>
              <p>
                <a href="tel:+523321837862" className="footer__contact-link">
                  +52 (33) 2183-7862
                </a>
              </p>
            </div>

            {/* RF-05: Esquemas URI estrictos y redirección a entidades corporativas */}
            <div className="footer__social-links" style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {/* WhatsApp */}
              <a
                href="https://wa.me/523311402745"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Servi Proce"
                style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', transition: 'all 0.2s ease' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                </svg>
              </a>

              {/* LinkedIn Corporativo */}
              <a
                href="https://www.linkedin.com/company/serviproce-em/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Servi Proce"
                style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A66C2', transition: 'all 0.2s ease' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/serviproce/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Servi Proce"
                style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E4405F', transition: 'all 0.2s ease' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/SERVIPROCE.EM/#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Servi Proce"
                style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877F2', transition: 'all 0.2s ease' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Dinámico (RF-08) */}
        <div className="footer__bottom">
          <p>&copy; <span>{currentYear}</span> Serviproce. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
