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
    { 
      href: `/${lang}/servicios`, 
      label: lang === 'es' ? 'Servicios' : 'Services',
      subLinks: [
        { href: `/${lang}/transporte/aereo`, label: lang === 'es' ? 'Aéreo' : 'Air Transport' },
        { href: `/${lang}/transporte/maritimo`, label: lang === 'es' ? 'Marítimo' : 'Ocean Freight' },
        { href: `/${lang}/transporte/terrestre`, label: lang === 'es' ? 'Terrestre' : 'Ground Transport' },
      ]
    },
    { href: `/${lang}/blog`, label: 'Blog' },
    { href: `/${lang}/contacto`, label: lang === 'es' ? 'Contacto' : 'Contact' },
  ];

  return (
    <header className="navbar">
      <div className="navbar__container container">
        {/* Logotipo adaptativo */}
        <Link href={`/${lang}`} className="navbar__logo">
          <img src="/logo.png" alt="Servi Proce Logo" style={{ height: '40px', width: 'auto' }} className="fade-in-up" />
        </Link>

        {/* Navegación Desktop */}
        <nav className="navbar__nav">
          <ul className="navbar__list">
            {navLinks.map((link) => (
              <li key={link.href} className={`navbar__item ${link.subLinks ? 'has-dropdown' : ''}`}>
                <Link href={link.href} className="navbar__link">
                  {link.label}
                  {link.subLinks && <span className="dropdown-arrow">▼</span>}
                </Link>
                {link.subLinks && (
                  <ul className="navbar__dropdown">
                    {link.subLinks.map(sub => (
                      <li key={sub.href}>
                        <Link href={sub.href} className="navbar__dropdown-link">
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
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
          {navLinks.map((link) => (
            <li key={link.href} className="navbar__mobile-item">
              <Link 
                href={link.href} 
                className="navbar__mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
              {link.subLinks && (
                <ul className="navbar__mobile-sublist">
                  {link.subLinks.map(sub => (
                    <li key={sub.href}>
                      <Link 
                        href={sub.href} 
                        className="navbar__mobile-link navbar__mobile-link--sub"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        - {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
