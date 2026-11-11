import { Suspense } from 'react';
import Link from 'next/link';
import UnsubscribeForm from '../../../components/UnsubscribeForm';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === 'en';
  return {
    title: isEn
      ? 'Newsletter Unsubscribe | Servi Proce'
      : 'Cancelar Suscripción al Boletín | Servi Proce',
    description: isEn
      ? 'Manage or cancel your subscription to the Servi Proce official foreign trade circular.'
      : 'Gestione o cancele su suscripción al boletín oficial de comercio exterior de Servi Proce.',
  };
}

export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export default async function DesuscribirPage({ params }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  return (
    <main className="page-wrapper">
      <section
        className="section bg-surface text-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(11, 17, 32, 0.85), rgba(11, 17, 32, 0.94)), url("https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '5rem 0 4rem 0',
        }}
      >
        <div className="container relative z-10" style={{ maxWidth: '780px' }}>
          <span className="priority-badge fade-in-up" style={{ letterSpacing: '0.08em' }}>
            {isEn ? 'Newsletter Preferences' : 'Preferencias de Boletín'}
          </span>
          <h1
            className="fade-in-up delay-1"
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              background: 'none',
              textShadow: '0 2px 20px rgba(0,0,0,0.85)',
              margin: '0.75rem 0 1rem 0',
            }}
          >
            {isEn ? 'Cancel Newsletter Subscription' : 'Cancelar Suscripción al Boletín'}
          </h1>
          <p
            className="page-subtitle fade-in-up delay-2 text-white opacity-90"
            style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}
          >
            {isEn
              ? 'We are sorry to see you go. Confirm your email to remove it from our foreign trade broadcast list.'
              : 'Lamentamos verlo partir. Confirme su correo para removerlo de inmediato de nuestra lista de difusión de comercio exterior.'}
          </p>
        </div>
      </section>

      <section className="section bg-background" style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <Suspense fallback={<div className="text-center text-text-muted">{isEn ? 'Loading...' : 'Cargando...'}</div>}>
            <UnsubscribeForm lang={lang} />
          </Suspense>

          <div className="text-center mt-5">
            <Link
              href={`/${lang}`}
              className="btn btn--secondary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.92rem' }}
            >
              {isEn ? '← Return to Home Page' : '← Regresar a la Página de Inicio'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

