"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleNotFound() {
  const pathname = usePathname();
  const lang = pathname?.startsWith('/en') ? 'en' : 'es';

  return (
    <main
      className="page-wrapper flex-center"
      style={{
        minHeight: 'calc(100vh - 80px)',
        backgroundImage: 'url("https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        position: 'relative',
      }}
    >
      <div className="section-overlay"></div>
      <div className="card glass-card relative z-10 fade-in-up" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '800px', margin: '2rem' }}>
        <h1 className="text-primary" style={{ fontSize: '6rem', fontWeight: '900', lineHeight: '1', margin: '0 0 1rem 0' }}>
          404
        </h1>
        <h2 className="text-secondary mb-4" style={{ fontSize: '2rem', margin: '0 0 1.5rem 0' }}>
          {lang === 'es' ? 'Página no encontrada' : 'Page not found'}
        </h2>
        <p className="text-text-muted mb-4" style={{ margin: '0 auto 2.5rem auto', fontSize: '1.125rem' }}>
          {lang === 'es'
            ? 'Lo sentimos, la ruta a la que intenta acceder no existe, ha sido movida o está fuera de servicio. Para continuar operando, por favor regrese a nuestra página principal o comuníquese directamente con nuestro equipo.'
            : 'Sorry, the path you are trying to access does not exist, has been moved, or is out of service. To continue operating, please return to our main page or contact our team directly.'}
        </p>
        <div className="flex-center gap-4">
          <Link href={`/${lang}`} className="btn btn--primary">
            {lang === 'es' ? 'Volver al Inicio' : 'Return Home'}
          </Link>
          <Link href={`/${lang}/contacto`} className="btn btn--secondary">
            {lang === 'es' ? 'Contactar Soporte' : 'Contact Support'}
          </Link>
        </div>
      </div>
    </main>
  );
}

