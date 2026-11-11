"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

function SubLinkIcon({ href }) {
  if (href.includes('/transporte/aereo')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
      </svg>
    );
  }
  if (href.includes('/transporte/maritimo')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
        <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
        <path d="M12 10V4"/>
        <path d="M12 2v3"/>
      </svg>
    );
  }
  if (href.includes('/transporte/terrestre')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    );
  }
  if (href.includes('/blog')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    );
  }
  return null;
}

export default function Navbar({ lang }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cambiar el idioma manteniendo la ruta actual
  const toggleLanguage = () => {
    const newLang = lang === 'es' ? 'en' : 'es';
    if (!pathname) return `/${newLang}`;
    const segments = pathname.split('/');
    segments[1] = newLang; // el índice 1 es el idioma porque la ruta empieza con '/'
    return segments.join('/') || '/';
  };

  const navLinks = [
    { href: `/${lang}`, label: lang === 'es' ? 'Inicio' : 'Home' },
    { href: `/${lang}/nosotros`, label: lang === 'es' ? 'Nosotros' : 'About Us' },
    // Servicio aparte
    {
      href: `/${lang}/freight-forwarder`,
      label: 'Freight Forwarder',
      subLinks: [
        { href: `/${lang}/transporte/aereo`, label: lang === 'es' ? 'Aéreo' : 'Air Transport' },
        { href: `/${lang}/transporte/maritimo`, label: lang === 'es' ? 'Marítimo' : 'Ocean Freight' },
        { href: `/${lang}/transporte/terrestre`, label: lang === 'es' ? 'Terrestre' : 'Ground Transport' },
      ]
    },
    // Servicio principal (prioridad) - Centrado en la barra
    { href: `/${lang}/despachos-aduanales`, label: lang === 'es' ? 'Despachos Aduanales' : 'Customs Clearance', priority: true },
    // Servicios secundarios (interactivos)
    { href: `/${lang}/servicios`, label: lang === 'es' ? 'Servicios' : 'Services' },
    {
      href: `/${lang}/avisos`,
      label: lang === 'es' ? 'Noticias y Avisos' : 'News & Notices',
      subLinks: [
        { href: `/${lang}/blog`, label: 'Blog' },
      ]
    },
    { href: `/${lang}/contacto`, label: lang === 'es' ? 'Contacto' : 'Contact' },
  ];

  return (
    <header className="navbar">
      <div className="navbar__container container">
        {/* Logotipo adaptativo */}
        <Link href={`/${lang}`} className="navbar__logo">
          <img src="/logo-light.png" alt="Servi Proce Logo" width={171} height={50} style={{ height: '40px', width: 'auto', flexShrink: 0, aspectRatio: '171/50' }} className="logo-img logo-img--light fade-in-up" />
          <img src="/logo.png" alt="Servi Proce Logo" width={171} height={50} style={{ height: '40px', width: 'auto', flexShrink: 0, aspectRatio: '171/50' }} className="logo-img logo-img--dark fade-in-up" />
        </Link>

        {/* Navegación Desktop */}
        <nav className="navbar__nav" aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>
          <ul className="navbar__list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.subLinks && link.subLinks.some(s => pathname === s.href));
              return (
                <li key={link.href} className={`navbar__item ${link.subLinks ? 'has-dropdown' : ''}`}>
                  <Link 
                    href={link.href} 
                    className={`navbar__link ${link.priority ? 'navbar__link--priority' : ''} ${isActive ? 'navbar__link--active' : ''}`}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    aria-haspopup={link.subLinks ? 'true' : undefined}
                  >
                    {link.priority && (
                      <span className="navbar__priority-icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                      </span>
                    )}
                    <span>{link.label}</span>
                    {link.subLinks && (
                      <span className="dropdown-arrow-svg" aria-hidden="true">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    )}
                  </Link>
                  {link.subLinks && (
                    <ul className="navbar__dropdown">
                      {link.subLinks.map(sub => (
                        <li key={sub.href}>
                          <Link 
                            href={sub.href} 
                            className={`navbar__dropdown-link ${pathname === sub.href ? 'navbar__dropdown-link--active' : ''}`}
                            aria-current={pathname === sub.href ? 'page' : undefined}
                          >
                            <span className="navbar__dropdown-icon" aria-hidden="true">
                              <SubLinkIcon href={sub.href} />
                            </span>
                            <span>{sub.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>


        {/* Acciones e Interfaz Móvil */}
        <div className="navbar__actions">
          <ThemeToggle lang={lang} />
          <Link href={toggleLanguage()} className="navbar__lang-switch">
            {lang === 'es' ? 'EN' : 'ES'}
          </Link>
          
          <button 
            className="navbar__toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={
              lang === 'es'
                ? (isMenuOpen ? 'Cerrar menú' : 'Abrir menú')
                : (isMenuOpen ? 'Close menu' : 'Open menu')
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className={`navbar__hamburger ${isMenuOpen ? 'navbar__hamburger--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      <div 
        id="mobile-menu"
        className={`navbar__mobile ${isMenuOpen ? 'navbar__mobile--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <ul className="navbar__mobile-list">
          {navLinks.map((link) => {
            const isMobileActive = pathname === link.href;
            return (
              <li key={link.href} className="navbar__mobile-item">
                <Link 
                  href={link.href} 
                  className={`navbar__mobile-link ${isMobileActive ? 'navbar__mobile-link--active' : ''} ${link.priority ? 'navbar__mobile-link--priority' : ''}`}
                  aria-current={isMobileActive ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.subLinks && (
                  <ul className="navbar__mobile-sublist">
                    {link.subLinks.map(sub => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <li key={sub.href}>
                          <Link 
                            href={sub.href} 
                            className={`navbar__mobile-link navbar__mobile-link--sub ${isSubActive ? 'navbar__mobile-link--active' : ''}`}
                            aria-current={isSubActive ? 'page' : undefined}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="navbar__dropdown-icon" aria-hidden="true">
                              <SubLinkIcon href={sub.href} />
                            </span>
                            <span>{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

      </div>
    </header>
  );
}
