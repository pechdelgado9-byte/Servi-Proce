"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

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
          <img src="/logo-light.png" alt="Servi Proce Logo" style={{ height: '40px', width: 'auto' }} className="logo-img logo-img--light fade-in-up" />
          <img src="/logo.png" alt="Servi Proce Logo" style={{ height: '40px', width: 'auto' }} className="logo-img logo-img--dark fade-in-up" />
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
                  >
                    {link.priority && (
                      <span className="navbar__priority-icon" aria-hidden="true">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </span>
                    )}
                    <span>{link.label}</span>
                    {link.subLinks && <span className="dropdown-arrow">▼</span>}
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
                            {sub.label}
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
          <ThemeToggle />
          <Link href={toggleLanguage()} className="navbar__lang-switch">
            {lang === 'es' ? 'EN' : 'ES'}
          </Link>
          
          <button 
            className="navbar__toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
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
                            - {sub.label}
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
