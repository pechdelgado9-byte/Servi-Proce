import { Inter } from 'next/font/google';
import '../../styles/globals.css';
import '../../styles/components.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FloatingContact from '../../components/FloatingContact';
import ScrollObserver from '../../components/ScrollObserver';
import Particles from '../../components/Particles';

// Configuración de fuente Inter
const inter = Inter({ subsets: ['latin'], variable: '--font-base' });

// Generar metadatos dinámicos base para todas las páginas (RF-10)
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://serviproce.com.mx'),
    title: lang === 'es' ? 'Servi Proce | Servicios Profesionales en Comercio Exterior' : 'Servi Proce | Professional Services in Foreign Trade',
    description: lang === 'es' 
      ? 'Especialistas en logística internacional, despacho aduanal y cadena de suministro en México.'
      : 'Specialists in international logistics, customs clearance, and supply chain in Mexico.',
    icons: {
      icon: [
        { url: '/icon.png', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: '/icon.png',
      apple: '/apple-icon.png',
    },
    openGraph: {
      images: ['/logo.png'],
    },
  };
}

// Generar rutas estáticas para los idiomas soportados (SSG)
export function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }];
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  
  return (
    <html lang={lang} className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Particles />
        <Navbar lang={lang} />
        <div style={{ minHeight: 'calc(100vh - 80px)' /* offset for navbar and footer */, position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        <FloatingContact />
        <Footer lang={lang} />
        <ScrollObserver />
      </body>
    </html>
  );
}
