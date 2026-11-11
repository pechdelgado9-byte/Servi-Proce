import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { fetchAdminDashboardData, isAdmin } from '@/lib/auth';
import { AVISO_TYPES } from '@/lib/avisos';
import { typeLabel } from '../../../components/AvisoCard';
import AdminInactivityMonitor from '../../../components/AdminInactivityMonitor';
import AdminFileDropzone from '../../../components/AdminFileDropzone';
import AdminPasswordInput from '../../../components/AdminPasswordInput';
import {
  login,
  logout,
  saveBlogPost,
  removeBlogPost,
  savePromotion,
  removePromotion,
  runCronAudit,
  saveAviso,
  removeAviso,
  saveHomeStat,
  removeHomeStat,
  toggleAllHomeStats,
  removeQuotationLog,
} from './actions';
import { API_BASE_URL } from '@/lib/api';

export const metadata = {
  title: 'Panel de Administración (CMS) | Servi Proce',
  robots: { index: false, follow: false },
};

/* ==========================================================================
   MODERN SVG VECTOR ICONS (Cero Emojis Artificiales)
   ========================================================================== */

function IconShield({ size = 20, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function IconLock({ size = 18, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

function IconMail({ size = 18, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function IconUser({ size = 18, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function IconPhone({ size = 14, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function IconBuilding({ size = 14, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="22.01"></line>
      <line x1="15" y1="22" x2="15" y2="22.01"></line>
      <line x1="9" y1="6" x2="9" y2="6.01"></line>
      <line x1="15" y1="6" x2="15" y2="6.01"></line>
      <line x1="9" y1="10" x2="9" y2="10.01"></line>
      <line x1="15" y1="10" x2="15" y2="10.01"></line>
      <line x1="9" y1="14" x2="9" y2="14.01"></line>
      <line x1="15" y1="14" x2="15" y2="14.01"></line>
    </svg>
  );
}

function IconEye({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function IconEyeOff({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function IconPencil({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

function IconTrash({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function IconPlus({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function IconClock({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function IconCheck({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function IconAlert({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

function IconExternalLink({ size = 14, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

function IconPaperclip({ size = 14, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
  );
}

function IconGlobe({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

function IconBook({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function IconFileText({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function IconMegaphone({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M3 11l18-5v12L3 14v-3z"></path>
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
    </svg>
  );
}

function IconSparkles({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M12 3l1.912 5.885L20 10.8l-5.088 3.915L16.824 21 12 17.185 7.176 21l1.912-6.285L4 10.8l6.088-1.915L12 3z"></path>
    </svg>
  );
}

function IconChart({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
      <line x1="2" y1="20" x2="22" y2="20"></line>
    </svg>
  );
}

function IconInbox({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    </svg>
  );
}

function IconLogOut({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

function IconMapPin({ size = 18, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function IconX({ size = 15, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function IconExcel({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="8" y1="13" x2="16" y2="13"></line>
      <line x1="8" y1="17" x2="16" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

export default function AdminPage({ params, searchParams }) {
  return (
    <Suspense fallback={<main className="page-wrapper section"><div className="container">…</div></main>}>
      <AdminContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminContent({ params, searchParams }) {
  await connection();
  const { lang } = await params;
  const sp = await searchParams;
  const L = (es, en) => (lang === 'es' ? es : en);

  // =========================================================================
  // VISTA 1: INICIO DE SESIÓN ADMINISTRATIVO (LOGIN MODERNO)
  // =========================================================================
  if (!(await isAdmin())) {
    return (
      <main className="page-wrapper section">
        <div className="admin-login-wrapper">
          <div className="admin-login-glow" aria-hidden="true" />
          <div className="admin-login-card">
            <div className="admin-login-header">
              <div className="admin-login-shield">
                <IconShield size={28} />
              </div>
              <h1 className="admin-login-title">{L('Panel de Administración', 'Administration Panel')}</h1>
              <p className="admin-login-subtitle">
                {L(
                  'Ingrese sus credenciales administrativas para gestionar Blog, Avisos, Banners y consultar Cotizaciones.',
                  'Enter your admin credentials to manage Blog, Notices, Banners and view Quotations.'
                )}
              </p>
            </div>

            {sp.error === 'login' && (
              <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <IconAlert size={18} />
                <span>{L('Credenciales incorrectas.', 'Invalid credentials.')}</span>
              </div>
            )}
            {sp.error === 'locked' && (
              <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <IconAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {L(
                    'Cuenta o dirección IP bloqueada temporalmente por 15 minutos tras 5 intentos fallidos consecutivos.',
                    'Account or IP locked for 15 minutes after 5 consecutive failed attempts.'
                  )}
                </span>
              </div>
            )}
            {sp.error === 'inactivity' && (
              <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <IconClock size={18} />
                <span>
                  {L(
                    'Su sesión se cerró automáticamente tras 15 minutos de inactividad continua.',
                    'Your session was automatically closed after 15 minutes of continuous inactivity.'
                  )}
                </span>
              </div>
            )}
            {sp.error === 'backend' && (
              <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <IconAlert size={18} />
                <span>
                  {L(
                    'El servidor Backend Headless (puerto 1337) no está encendido. Ejecute "npm run dev" dentro de /backend.',
                    'The Headless Backend server (port 1337) is offline. Run "npm run dev" inside /backend.'
                  )}
                </span>
              </div>
            )}

            <form action={login} className="form">
              <input type="hidden" name="lang" value={lang} />
              
              <div className="form__group">
                <label className="form__label" htmlFor="username">
                  {L('Usuario (Correo Corporativo)', 'Username (Corporate Email)')}
                </label>
                <div className="admin-input-wrap">
                  <div className="admin-input-icon">
                    <IconMail size={18} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    className="form__input admin-input"
                    defaultValue="admin@serviproce.com.mx"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form__group">
                <label className="form__label" htmlFor="password">
                  {L('Contraseña', 'Password')}
                </label>
                <AdminPasswordInput id="password" name="password" lang={lang} />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '10px',
                }}
              >
                <IconShield size={18} />
                <span>{L('Iniciar Sesión en CMS', 'Sign In to CMS')}</span>
              </button>
            </form>

            <div className="admin-login-meta">
              <span className="admin-login-security-tag">
                <IconLock size={13} />
                <span>{L('Cifrado SSL/TLS 256-bit • Conexión Segura', '256-bit SSL/TLS Encryption • Secure Connection')}</span>
              </span>
              <Link href={`/${lang}`} className="admin-back-btn">
                <span>← {L('Volver al sitio web principal', 'Return to main website')}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // VISTA 2: PANEL DE ADMINISTRACIÓN COMPLETO (DASHBOARD CMS)
  // =========================================================================
  const dashboard = (await fetchAdminDashboardData()) || {
    promotions: [],
    blogPosts: [],
    avisos: [],
    quotationLogs: [],
    newsletter: [],
    homeStats: [],
  };

  const homeStats = dashboard.homeStats || [];
  const activeTab = ['blog', 'avisos', 'promotions', 'stats', 'logs'].includes(sp.tab) ? sp.tab : 'blog';

  const editingBlog = sp.editBlog ? dashboard.blogPosts.find((b) => b.id === sp.editBlog) : null;
  const editingPromo = sp.editPromo ? dashboard.promotions.find((p) => p.id === sp.editPromo) : null;
  const editingAviso = sp.edit ? dashboard.avisos.find((a) => a.id === sp.edit) : null;
  const editingStat = sp.editStat ? homeStats.find((s) => s.id === sp.editStat) : null;

  const moduleGuides = {
    blog: {
      title: L('¿Dónde se ve este bloque en la web?', 'Where does this block appear on the website?'),
      desc: L(
        'Estos artículos aparecen en la página "Blog" del menú principal. Al publicar o editar un artículo, puedes hacer clic en "Ver" para ir directamente a su publicación.',
        'These articles appear on the "Blog" page in the main menu. After publishing or editing an article, click "View" to jump directly to it.'
      ),
      href: `/${lang}/blog`,
      btnLabel: L('Ver sección de Blog', 'View Blog section'),
    },
    avisos: {
      title: L('¿Dónde se ve este bloque en la web?', 'Where does this block appear on the website?'),
      desc: L(
        'Estas publicaciones aparecen en dos lugares: en la mitad de la Página de Inicio (sección "Noticias, Leyes y Avisos", debajo de Nuestros Servicios) y en la página dedicada "/avisos".',
        'These posts appear in two places: in the middle of the Home Page ("News, Laws and Notices" section, below Our Services) and on the dedicated "/avisos" page.'
      ),
      href: `/${lang}#seccion-avisos`,
      btnLabel: L('Ver bloque en Inicio', 'View block on Home'),
    },
    promotions: {
      title: L('¿Dónde se ve este bloque en la web?', 'Where does this block appear on the website?'),
      desc: L(
        'Este banner aparece hasta arriba de la Página de Inicio (franja superior destacada, justo encima de la imagen principal de portada). Si hay varias promociones con estado "Publicado", se mostrarán rotando automáticamente en un carrusel interactivo.',
        'This banner appears at the very top of the Home Page (featured top bar right above the main hero image). If multiple promotions have "Published" status, they rotate automatically in an interactive carousel.'
      ),
      href: `/${lang}#banner-promocional`,
      btnLabel: L('Ver Banner en Inicio', 'View Banner on Home'),
    },
    stats: {
      title: L('¿Dónde se ve este bloque en la web?', 'Where does this block appear on the website?'),
      desc: L(
        'Estos contadores numéricos animados (ej. 10+ Años de Experiencia) aparecen en la mitad de la Página de Inicio, justo arriba de "Compromiso y Tratos Comerciales". Puedes mostrarlos u ocultarlos cuando quieras.',
        'These animated counters (e.g. 10+ Years of Experience) appear in the middle of the Home Page, right above "Commitment and Business Deals". You can show or hide them anytime.'
      ),
      href: `/${lang}#metricas-inicio`,
      btnLabel: L('Ver Métricas en Inicio', 'View Metrics on Home'),
    },
    logs: {
      title: L('¿De dónde provienen estos registros?', 'Where do these records come from?'),
      desc: L(
        'Aquí se concentran todas las solicitudes enviadas por los clientes desde los formularios de "Despachos Aduanales (#cotizador)" y "Contacto", incluyendo sus documentos adjuntos y la vista previa del correo enviado.',
        'All quotation requests submitted by clients from the "Customs Clearance (#cotizador)" and "Contact" forms are collected here, including attachments and email previews.'
      ),
      href: `/${lang}/despachos-aduanales#cotizador`,
      btnLabel: L('Ver Formulario de Cotización', 'View Quotation Form'),
    },
  };

  const currentGuide = moduleGuides[activeTab] || moduleGuides.blog;
  const ghostBtnStyle = { background: 'rgba(148,163,184,0.16)', color: 'inherit', border: '1px solid rgba(148,163,184,0.35)' };

  return (
    <main className="page-wrapper section">
      {/* Contenedor con ancho amplio unificado (1420px) para que la barra nunca salte ni cambie de tamaño */}
      <div className="container admin-container">
        
        {/* Cabecera ejecutiva del CMS con monitor de inactividad */}
        <div className="admin-topbar">
          <div className="admin-topbar__title-group">
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>
              {L('Panel de Control Administrativo (CMS)', 'CMS Administration Panel')}
            </h1>
            <AdminInactivityMonitor lang={lang} logoutAction={logout} />
          </div>
          
          <form action={logout}>
            <input type="hidden" name="lang" value={lang} />
            <button
              type="submit"
              className="admin-btn-action admin-btn-action--delete"
              style={{ padding: '0.55rem 1rem', borderRadius: '10px' }}
            >
              <IconLogOut size={16} />
              <span>{L('Cerrar sesión', 'Sign out')}</span>
            </button>
          </form>
        </div>

        {/* Barra de navegación de módulos del CMS con ancho completo y sin bug de wrapping */}
        <nav className="admin-nav-tabs" aria-label="CMS Modules">
          <Link
            href={`/${lang}/admin?tab=blog`}
            className={`admin-nav-tab ${activeTab === 'blog' ? 'admin-nav-tab--active' : ''}`}
          >
            <IconBook size={16} />
            <span>{L('Artículos del Blog', 'Blog Articles')}</span>
            <span className="admin-nav-tab__count">{dashboard.blogPosts.length}</span>
          </Link>

          <Link
            href={`/${lang}/admin?tab=avisos`}
            className={`admin-nav-tab ${activeTab === 'avisos' ? 'admin-nav-tab--active' : ''}`}
          >
            <IconMegaphone size={16} />
            <span>{L('Noticias y Avisos', 'News & Notices')}</span>
            <span className="admin-nav-tab__count">{dashboard.avisos.length}</span>
          </Link>

          <Link
            href={`/${lang}/admin?tab=promotions`}
            className={`admin-nav-tab ${activeTab === 'promotions' ? 'admin-nav-tab--active' : ''}`}
          >
            <IconSparkles size={16} />
            <span>{L('Banners Promocionales', 'Promo Banners')}</span>
            <span className="admin-nav-tab__count">{dashboard.promotions.length}</span>
          </Link>

          <Link
            href={`/${lang}/admin?tab=stats`}
            className={`admin-nav-tab ${activeTab === 'stats' ? 'admin-nav-tab--active' : ''}`}
          >
            <IconChart size={16} />
            <span>{L('Métricas Inicio', 'Home Metrics')}</span>
            <span className="admin-nav-tab__count">{homeStats.filter((s) => s.active).length}/{homeStats.length}</span>
          </Link>

          <Link
            href={`/${lang}/admin?tab=logs`}
            className={`admin-nav-tab ${activeTab === 'logs' ? 'admin-nav-tab--active' : ''}`}
          >
            <IconInbox size={16} />
            <span>{L('Historial de Cotizaciones', 'Quotation Requests')}</span>
            <span className="admin-nav-tab__count">{dashboard.quotationLogs.length}</span>
          </Link>
        </nav>

        {/* Guía rápida de ubicación del bloque en el sitio web */}
        <div className="admin-guide-card">
          <div className="admin-guide-left">
            <div className="admin-guide-icon">
              <IconMapPin size={20} />
            </div>
            <div>
              <strong className="admin-guide-title">{currentGuide.title}</strong>
              <p className="admin-guide-desc">{currentGuide.desc}</p>
            </div>
          </div>
          <Link
            href={currentGuide.href}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-guide-btn"
          >
            <span>{currentGuide.btnLabel}</span>
            <IconExternalLink size={14} />
          </Link>
        </div>

        {/* Notificaciones de estado de guardado, auditoría y errores */}
        {sp.ok === 'saved' && (
          <div
            className="alert alert--success mb-4 admin-fade-in"
            role="status"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconCheck size={18} />
              <span>{L('¡Cambios guardados y actualizados en la página web!', 'Changes saved and updated on the website!')}</span>
            </span>
            <Link
              href={currentGuide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary text-sm"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
            >
              <IconEye size={14} />
              <span>{L('Ver apartado modificado en la página', 'View modified section on page')}</span>
              <IconExternalLink size={13} />
            </Link>
          </div>
        )}

        {sp.ok === 'cron' && (
          <div className="alert alert--success mb-4 admin-fade-in" role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconCheck size={18} />
            <span>{L('Auditoría ejecutada: las promociones vencidas han sido ocultadas automáticamente.', 'Audit executed: expired promotions have been automatically hidden.')}</span>
          </div>
        )}

        {sp.ok === 'deleted' && (
          <div className="alert alert--success mb-4 admin-fade-in" role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconCheck size={18} />
            <span>{L('Registro eliminado correctamente.', 'Record deleted successfully.')}</span>
          </div>
        )}

        {sp.error === 'validation' && (
          <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconAlert size={18} />
            <span>{L('Verifique los campos obligatorios o que el texto no incluya etiquetas HTML no permitidas.', 'Check required fields or ensure no forbidden HTML tags are present.')}</span>
          </div>
        )}

        {sp.error === 'upload' && (
          <div className="alert alert--error mb-4 admin-fade-in" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconAlert size={18} />
            <span>{L('Error al subir archivo: verifique que sea una imagen válida (.webp, .jpg, .png, .svg) menor a 2 MB.', 'Upload error: ensure it is a valid image (.webp, .jpg, .png, .svg) under 2 MB.')}</span>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 1: GESTIÓN DE ARTÍCULOS DEL BLOG (RF-07, RF-09, RF-10)      */}
        {/* ================================================================== */}
        {activeTab === 'blog' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                    {L('Artículos publicados en el Blog', 'Published Blog Articles')} ({dashboard.blogPosts.length})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {L('Selecciona "Editar" en cualquier artículo para modificarlo o presiona "Nuevo Artículo" para publicar uno.', 'Click "Edit" on any article to modify it or "New Article" to publish a new one.')}
                  </p>
                </div>
                {sp.newBlog !== '1' && !editingBlog && (
                  <Link
                    href={`/${lang}/admin?tab=blog&newBlog=1`}
                    className="btn btn--primary text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                  >
                    <IconPlus size={15} />
                    <span>{L('Nuevo Artículo del Blog', 'New Blog Article')}</span>
                  </Link>
                )}
              </div>

              {/* Panel de Edición / Creación Rediseñado */}
              {(sp.newBlog === '1' || editingBlog) && (
                <div className="admin-edit-panel">
                  <div className="admin-edit-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`admin-edit-badge ${editingBlog ? 'admin-edit-badge--edit' : 'admin-edit-badge--new'}`}>
                        {editingBlog ? (
                          <>
                            <IconPencil size={13} />
                            <span>{L('Modo Edición', 'Editing Mode')}</span>
                          </>
                        ) : (
                          <>
                            <IconPlus size={13} />
                            <span>{L('Nuevo Artículo', 'New Article')}</span>
                          </>
                        )}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                        {editingBlog ? editingBlog.title_es : L('Crear nuevo artículo para el Blog', 'Create new Blog article')}
                      </h3>
                    </div>
                    
                    <Link
                      href={`/${lang}/admin?tab=blog`}
                      className="admin-btn-action"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title={L('Cerrar editor', 'Close editor')}
                    >
                      <IconX size={15} />
                    </Link>
                  </div>

                  <form action={saveBlogPost} className="form" key={editingBlog?.id ?? 'new-blog'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingBlog?.id ?? ''} />

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconBook size={14} />
                        <span>{L('1. Información Principal', '1. Essential Information')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_title_es">{L('Título del artículo *', 'Article Title *')}</label>
                          <input id="blog_title_es" name="title_es" className="form__input" defaultValue={editingBlog?.title_es ?? ''} required maxLength={140} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_cat_es">{L('Categoría', 'Category')}</label>
                          <input id="blog_cat_es" name="category_es" className="form__input" defaultValue={editingBlog?.category_es ?? 'Regulaciones'} />
                        </div>
                      </div>
                      <div className="form__group" style={{ marginBottom: 0 }}>
                        <label className="form__label" htmlFor="blog_excerpt_es">{L('Resumen breve (aparece en la tarjeta del Blog) *', 'Short Excerpt *')}</label>
                        <textarea id="blog_excerpt_es" name="excerpt_es" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingBlog?.excerpt_es ?? ''} required maxLength={300} />
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconFileText size={14} />
                        <span>{L('2. Contenido Completo del Artículo', '2. Full Article Content')}</span>
                      </div>
                      <div className="form__group" style={{ marginBottom: 0 }}>
                        <label className="form__label" htmlFor="blog_content_es">
                          {L('Párrafos del artículo (separe párrafos con salto de línea) *', 'Article paragraphs (separate paragraphs with newline) *')}
                        </label>
                        <textarea
                          id="blog_content_es"
                          name="content_es"
                          rows={6}
                          style={{ resize: 'none' }}
                          className="form__input"
                          defaultValue={Array.isArray(editingBlog?.content_es) ? editingBlog.content_es.join('\n\n') : ''}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconSparkles size={14} />
                        <span>{L('3. Síntesis Ejecutiva y Frase Destacada (Opcional)', '3. Executive Summary & Quote (Optional)')}</span>
                      </div>
                      
                      <div className="form__group">
                        <label className="form__label" htmlFor="blog_synthesis_es">
                          {L('Puntos clave de la Síntesis Ejecutiva (un punto por renglón)', 'Executive Summary Key Points (one per line)')}
                        </label>
                        <textarea
                          id="blog_synthesis_es"
                          name="synthesis_es"
                          rows={3}
                          style={{ resize: 'none' }}
                          className="form__input"
                          placeholder={L('• Primer aspecto normativo o punto clave...\n• Segundo aspecto operativo...\n• Tercer beneficio para importadores...', '• First regulatory point or key takeaway...\n• Second operational aspect...\n• Third benefit for importers...')}
                          defaultValue={Array.isArray(editingBlog?.synthesis_es) ? editingBlog.synthesis_es.join('\n') : ''}
                        />
                        <p className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>
                          {L('Aparece en un recuadro destacado al inicio del artículo. Si se deja vacío, no se mostrará el bloque.', 'Appears in a highlighted box at the beginning of the article. If left blank, this block will not be shown.')}
                        </p>
                      </div>

                      <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                        <div className="form__group" style={{ marginBottom: 0 }}>
                          <label className="form__label" htmlFor="blog_quote_text_es">
                            {L('Frase o Cita Destacada (Opcional)', 'Featured Phrase / Quote (Optional)')}
                          </label>
                          <textarea
                            id="blog_quote_text_es"
                            name="quote_text_es"
                            rows={2}
                            style={{ resize: 'none' }}
                            className="form__input"
                            placeholder={L('Ej. La prevención y la auditoría previa marcan la diferencia en el despacho aduanal...', 'E.g. Prior audit and compliance check prevent costly customs downtime...')}
                            defaultValue={editingBlog?.quote_text_es ?? ''}
                          />
                          <p className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>
                            {L('Aparece en un recuadro elegante al final del artículo. Si se deja vacío, no se mostrará ninguna cita.', 'Appears in a styled quote box at the end of the article. If left blank, no quote box will be shown.')}
                          </p>
                        </div>

                        <div className="form__group" style={{ marginBottom: 0 }}>
                          <label className="form__label" htmlFor="blog_quote_author">
                            {L('Autor o Fuente de la Cita (Opcional)', 'Quote Author or Source (Optional)')}
                          </label>
                          <input
                            id="blog_quote_author"
                            name="quote_author"
                            className="form__input"
                            placeholder={L('Ej. Equipo Legal Servi Proce, Director Operativo, etc.', 'E.g. Servi Proce Legal Advisory, Operations Director, etc.')}
                            defaultValue={editingBlog?.quote_author ?? ''}
                          />
                          <p className="text-xs text-text-muted" style={{ marginTop: '0.25rem' }}>
                            {L('Si se deja vacío, utilizará el autor general del artículo.', 'If left blank, the general article author will be used.')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconPaperclip size={14} />
                        <span>{L('4. Multimedia y Autoría', '4. Media & Author')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem', alignItems: 'flex-start' }}>
                        <AdminFileDropzone
                          id="blog_image_file"
                          name="image_file"
                          label={L('Imagen destacada (Opcional, máx. 2 MB)', 'Featured image (Optional, max 2 MB)')}
                          accept=".webp,.jpg,.jpeg,.png,.svg"
                          maxSizeMB={2}
                          existingImageUrl={editingBlog?.image_url}
                          lang={lang}
                        />
                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_author">{L('Autor', 'Author')}</label>
                          <input id="blog_author" name="author" className="form__input" defaultValue={editingBlog?.author ?? 'Equipo Servi Proce'} placeholder={L('Ej. Equipo Servi Proce', 'E.g. Servi Proce Team')} />
                        </div>
                      </div>
                    </div>

                    {/* Opciones avanzadas colapsadas */}
                    <details className="admin-edit-details">
                      <summary>
                        <IconGlobe size={16} />
                        <span>{L('Opciones avanzadas: Traducción al Inglés, URL e información SEO (Opcional)', 'Advanced options: English translation, URL & SEO (Optional)')}</span>
                      </summary>
                      
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                        <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_title_en">{L('Título en Inglés', 'English Title')}</label>
                            <input id="blog_title_en" name="title_en" className="form__input" defaultValue={editingBlog?.title_en ?? ''} maxLength={140} />
                          </div>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_cat_en">{L('Categoría en Inglés', 'English Category')}</label>
                            <input id="blog_cat_en" name="category_en" className="form__input" defaultValue={editingBlog?.category_en ?? 'Regulations'} />
                          </div>
                        </div>

                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_excerpt_en">{L('Resumen en Inglés', 'English Excerpt')}</label>
                          <textarea id="blog_excerpt_en" name="excerpt_en" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingBlog?.excerpt_en ?? ''} maxLength={300} />
                        </div>

                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_content_en">{L('Contenido en Inglés', 'English Content')}</label>
                          <textarea
                            id="blog_content_en"
                            name="content_en"
                            rows={4}
                            style={{ resize: 'none' }}
                            className="form__input"
                            defaultValue={Array.isArray(editingBlog?.content_en) ? editingBlog.content_en.join('\n\n') : ''}
                          />
                        </div>

                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_synthesis_en">{L('Puntos clave de Síntesis en Inglés (un punto por renglón)', 'English Executive Summary Points (one per line)')}</label>
                          <textarea
                            id="blog_synthesis_en"
                            name="synthesis_en"
                            rows={3}
                            style={{ resize: 'none' }}
                            className="form__input"
                            placeholder="• First key takeaway in English...\n• Second point..."
                            defaultValue={Array.isArray(editingBlog?.synthesis_en) ? editingBlog.synthesis_en.join('\n') : ''}
                          />
                        </div>

                        <div className="form__group">
                          <label className="form__label" htmlFor="blog_quote_text_en">{L('Frase Destacada en Inglés', 'English Featured Phrase / Quote')}</label>
                          <textarea
                            id="blog_quote_text_en"
                            name="quote_text_en"
                            rows={2}
                            style={{ resize: 'none' }}
                            className="form__input"
                            placeholder="English quote text..."
                            defaultValue={editingBlog?.quote_text_en ?? ''}
                          />
                        </div>

                        <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_slug">{L('Slug URL', 'URL Slug')}</label>
                            <input id="blog_slug" name="slug" className="form__input" defaultValue={editingBlog?.slug ?? ''} placeholder="ej-guia-comercio-exterior-2026" />
                          </div>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_image_url">{L('O URL externa de imagen', 'Or external Image URL')}</label>
                            <input id="blog_image_url" name="image_url" className="form__input" defaultValue={editingBlog?.image_url ?? ''} placeholder="https://... o /logo.png" />
                          </div>
                        </div>

                        <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_read_es">{L('Tiempo de lectura (ES)', 'Read time (ES)')}</label>
                            <input id="blog_read_es" name="read_time_es" className="form__input" defaultValue={editingBlog?.read_time_es ?? '5 min de lectura'} />
                          </div>
                          <div className="form__group">
                            <label className="form__label" htmlFor="blog_read_en">{L('Tiempo de lectura (EN)', 'Read time (EN)')}</label>
                            <input id="blog_read_en" name="read_time_en" className="form__input" defaultValue={editingBlog?.read_time_en ?? '5 min read'} />
                          </div>
                        </div>

                        <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                          <div className="form__group">
                            <label className="form__label" htmlFor="seo_title_es">{L('Título SEO (ES)', 'SEO Title (ES)')}</label>
                            <input id="seo_title_es" name="seo_title_es" className="form__input" defaultValue={editingBlog?.seo_title_es ?? ''} maxLength={60} />
                          </div>
                          <div className="form__group">
                            <label className="form__label" htmlFor="seo_desc_es">{L('Descripción SEO (ES)', 'SEO Description (ES)')}</label>
                            <input id="seo_desc_es" name="seo_desc_es" className="form__input" defaultValue={editingBlog?.seo_desc_es ?? ''} maxLength={160} />
                          </div>
                        </div>

                        <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                          <div className="form__group">
                            <label className="form__label" htmlFor="seo_title_en">{L('Título SEO (EN)', 'SEO Title (EN)')}</label>
                            <input id="seo_title_en" name="seo_title_en" className="form__input" defaultValue={editingBlog?.seo_title_en ?? ''} maxLength={60} />
                          </div>
                          <div className="form__group">
                            <label className="form__label" htmlFor="seo_desc_en">{L('Descripción SEO (EN)', 'SEO Description (EN)')}</label>
                            <input id="seo_desc_en" name="seo_desc_en" className="form__input" defaultValue={editingBlog?.seo_desc_en ?? ''} maxLength={160} />
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Control de difusión al boletín */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.15rem', background: 'rgba(157, 0, 0, 0.06)', borderRadius: '12px', border: '1px solid rgba(157, 0, 0, 0.22)', margin: '1.25rem 0' }}>
                      <input
                        type="checkbox"
                        id="blog_notify_subscribers"
                        name="notify_subscribers"
                        defaultChecked={!editingBlog}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                      <label htmlFor="blog_notify_subscribers" style={{ cursor: 'pointer', fontSize: '0.92rem', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: 0 }}>
                        <IconMail size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>{L('Notificar automáticamente por correo a los suscriptores del Boletín', 'Automatically notify newsletter subscribers by email')}</span>
                        {dashboard.newsletter.length > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px', background: 'var(--color-primary)', color: '#ffffff' }}>
                            {dashboard.newsletter.length} {dashboard.newsletter.length === 1 ? L('suscriptor', 'subscriber') : L('suscriptores', 'subscribers')}
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px', padding: '0.75rem 1.4rem', fontWeight: 700 }}
                      >
                        <IconCheck size={16} />
                        <span>{editingBlog ? L('Guardar cambios', 'Save changes') : L('Publicar artículo', 'Publish article')}</span>
                      </button>
                      
                      <Link
                        className="btn text-sm"
                        style={{ ...ghostBtnStyle, borderRadius: '10px', padding: '0.75rem 1.25rem' }}
                        href={`/${lang}/admin?tab=blog`}
                      >
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Listado de Artículos */}
            <ul className="admin-list" role="list">
              {dashboard.blogPosts.map((b) => (
                <li key={b.id} className="admin-item-card">
                  <div>
                    <span className="aviso__tag aviso__tag--noticia">{b.category_es}</span>
                    <p className="mt-2 mb-1" style={{ fontSize: '1.05rem' }}><strong>{b.title_es}</strong></p>
                    <p className="text-sm text-text-muted mb-1">Slug: <code>/{lang}/blog/{b.slug}</code></p>
                    <p className="text-sm text-text-muted">{b.published_at} • {b.author}</p>
                  </div>
                  
                  <div className="admin-item-actions">
                    <Link
                      className="admin-btn-action admin-btn-action--view"
                      href={`/${lang}/blog/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconEye size={14} />
                      <span>{L('Ver', 'View')}</span>
                    </Link>

                    <Link
                      className="admin-btn-action admin-btn-action--edit"
                      href={`/${lang}/admin?tab=blog&editBlog=${b.id}`}
                    >
                      <IconPencil size={14} />
                      <span>{L('Editar', 'Edit')}</span>
                    </Link>

                    <form action={removeBlogPost}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={b.id} />
                      <button type="submit" className="admin-btn-action admin-btn-action--delete">
                        <IconTrash size={14} />
                        <span>{L('Eliminar', 'Delete')}</span>
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 2: NOTICIAS, LEYES Y AVISOS                                 */}
        {/* ================================================================== */}
        {activeTab === 'avisos' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                    {L('Publicaciones Registradas', 'Registered Posts')} ({dashboard.avisos.length})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {L('Selecciona "Editar" en una publicación existente o presiona "Nueva Publicación" para agregar una.', 'Click "Edit" on an existing post or "New Post" to add one.')}
                  </p>
                </div>
                {sp.newAviso !== '1' && !editingAviso && (
                  <Link
                    href={`/${lang}/admin?tab=avisos&newAviso=1`}
                    className="btn btn--primary text-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                  >
                    <IconPlus size={15} />
                    <span>{L('Nueva Publicación', 'New Post')}</span>
                  </Link>
                )}
              </div>

              {/* Panel de Edición / Creación Rediseñado */}
              {(sp.newAviso === '1' || editingAviso) && (
                <div className="admin-edit-panel">
                  <div className="admin-edit-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`admin-edit-badge ${editingAviso ? 'admin-edit-badge--edit' : 'admin-edit-badge--new'}`}>
                        {editingAviso ? (
                          <>
                            <IconPencil size={13} />
                            <span>{L('Modo Edición', 'Editing Mode')}</span>
                          </>
                        ) : (
                          <>
                            <IconPlus size={13} />
                            <span>{L('Nueva Publicación', 'New Post')}</span>
                          </>
                        )}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                        {editingAviso ? editingAviso.title_es : L('Crear nueva publicación / aviso', 'Create new post / notice')}
                      </h3>
                    </div>

                    <Link
                      href={`/${lang}/admin?tab=avisos`}
                      className="admin-btn-action"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title={L('Cerrar editor', 'Close editor')}
                    >
                      <IconX size={15} />
                    </Link>
                  </div>

                  <form action={saveAviso} className="form" key={editingAviso?.id ?? 'new-aviso'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingAviso?.id ?? ''} />

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconMegaphone size={14} />
                        <span>{L('1. Tipo y Título de la Publicación', '1. Type & Title')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="type">{L('Tipo de publicación *', 'Post Type *')}</label>
                          <select id="type" name="type" className="form__input" defaultValue={editingAviso?.type ?? 'aviso'}>
                            {AVISO_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, lang)}</option>)}
                          </select>
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="title_es">{L('Título *', 'Title *')}</label>
                          <input id="title_es" name="title_es" className="form__input" defaultValue={editingAviso?.title_es ?? ''} required maxLength={160} />
                        </div>
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconFileText size={14} />
                        <span>{L('2. Contenido del Aviso', '2. Notice Content')}</span>
                      </div>
                      <div className="form__group" style={{ marginBottom: 0 }}>
                        <label className="form__label" htmlFor="body_es">{L('Descripción / Contenido *', 'Description / Content *')}</label>
                        <textarea id="body_es" name="body_es" rows={5} style={{ resize: 'none' }} className="form__input" defaultValue={editingAviso?.body_es ?? ''} required maxLength={4000} />
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconClock size={14} />
                        <span>{L('3. Vigencia y Destacado', '3. Validity & Highlighting')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem', alignItems: 'center' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="expiresAt">{L('Fecha límite de vigencia (opcional)', 'Expiration date (optional)')}</label>
                          <input id="expiresAt" name="expiresAt" type="date" className="form__input" defaultValue={editingAviso?.expiresAt ?? ''} />
                        </div>
                        <div className="form__group" style={{ paddingTop: '1.1rem' }}>
                          <label className="quote-check" style={{ cursor: 'pointer', fontWeight: 600 }}>
                            <input type="checkbox" name="pinned" defaultChecked={Boolean(editingAviso?.pinned)} /> {L('Destacar al inicio', 'Pin to the top')}
                          </label>
                        </div>
                      </div>
                    </div>

                    <details className="admin-edit-details">
                      <summary>
                        <IconGlobe size={16} />
                        <span>{L('Opciones adicionales: Enlace a fuente oficial y traducción al Inglés (Opcional)', 'Additional options: Official source link & English translation (Optional)')}</span>
                      </summary>
                      
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="sourceUrl">{L('Enlace a la fuente oficial (DOF, SAT, etc.)', 'Official source link')}</label>
                          <input id="sourceUrl" name="sourceUrl" type="url" className="form__input" defaultValue={editingAviso?.sourceUrl ?? ''} placeholder="https://" maxLength={500} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="title_en">{L('Título en Inglés (opcional)', 'English Title (optional)')}</label>
                          <input id="title_en" name="title_en" className="form__input" defaultValue={editingAviso?.title_en ?? ''} maxLength={160} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="body_en">{L('Texto en Inglés (opcional)', 'English Text (optional)')}</label>
                          <textarea id="body_en" name="body_en" rows={3} style={{ resize: 'none' }} className="form__input" defaultValue={editingAviso?.body_en ?? ''} maxLength={4000} />
                        </div>
                      </div>
                    </details>

                    {/* Control de difusión al boletín */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.15rem', background: 'rgba(157, 0, 0, 0.06)', borderRadius: '12px', border: '1px solid rgba(157, 0, 0, 0.22)', margin: '1.25rem 0' }}>
                      <input
                        type="checkbox"
                        id="aviso_notify_subscribers"
                        name="notify_subscribers"
                        defaultChecked={!editingAviso}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                      />
                      <label htmlFor="aviso_notify_subscribers" style={{ cursor: 'pointer', fontSize: '0.92rem', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: 0 }}>
                        <IconMail size={16} style={{ color: 'var(--color-primary)' }} />
                        <span>{L('Notificar automáticamente por correo a los suscriptores del Boletín', 'Automatically notify newsletter subscribers by email')}</span>
                        {dashboard.newsletter.length > 0 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px', background: 'var(--color-primary)', color: '#ffffff' }}>
                            {dashboard.newsletter.length} {dashboard.newsletter.length === 1 ? L('suscriptor', 'subscriber') : L('suscriptores', 'subscribers')}
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px', padding: '0.75rem 1.4rem', fontWeight: 700 }}
                      >
                        <IconCheck size={16} />
                        <span>{editingAviso ? L('Guardar cambios', 'Save changes') : L('Publicar', 'Publish')}</span>
                      </button>
                      <Link
                        className="btn text-sm"
                        style={{ ...ghostBtnStyle, borderRadius: '10px', padding: '0.75rem 1.25rem' }}
                        href={`/${lang}/admin?tab=avisos`}
                      >
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Listado de Avisos */}
            <ul className="admin-list" role="list">
              {dashboard.avisos.map((a) => (
                <li key={a.id} className="admin-item-card">
                  <div>
                    <span className={`aviso__tag aviso__tag--${a.type}`}>{typeLabel(a.type, lang)}</span>{' '}
                    {a.pinned && <span className="aviso__pin">{L('Destacado', 'Pinned')}</span>}
                    <p className="mt-2 mb-2" style={{ fontSize: '1.05rem' }}><strong>{a.title_es}</strong></p>
                    <p className="text-sm text-text-muted">{a.publishedAt}{a.expiresAt ? ` → ${a.expiresAt}` : ''}</p>
                  </div>
                  
                  <div className="admin-item-actions">
                    <Link
                      className="admin-btn-action admin-btn-action--view"
                      href={`/${lang}/avisos#aviso-${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconEye size={14} />
                      <span>{L('Ver', 'View')}</span>
                    </Link>

                    <Link
                      className="admin-btn-action admin-btn-action--edit"
                      href={`/${lang}/admin?tab=avisos&edit=${a.id}`}
                    >
                      <IconPencil size={14} />
                      <span>{L('Editar', 'Edit')}</span>
                    </Link>

                    <form action={removeAviso}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="admin-btn-action admin-btn-action--delete">
                        <IconTrash size={14} />
                        <span>{L('Eliminar', 'Delete')}</span>
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 3: BANNER PROMOCIONAL                                       */}
        {/* ================================================================== */}
        {activeTab === 'promotions' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                    {L('Promociones Registradas', 'Registered Promotions')} ({dashboard.promotions.length})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {L(
                      'Todas las promociones con estado "Publicado" rotan automáticamente en el carrusel superior del Inicio.',
                      'All promotions with "Published" status rotate automatically in the top Home carousel.'
                    )}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {sp.newPromo !== '1' && !editingPromo && (
                    <Link
                      href={`/${lang}/admin?tab=promotions&newPromo=1`}
                      className="btn btn--primary text-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                    >
                      <IconPlus size={15} />
                      <span>{L('Nueva Promoción', 'New Promotion')}</span>
                    </Link>
                  )}
                  
                  <form action={runCronAudit}>
                    <input type="hidden" name="lang" value={lang} />
                    <button
                      type="submit"
                      className="admin-btn-action"
                      style={{ padding: '0.55rem 1rem', borderRadius: '8px' }}
                    >
                      <IconClock size={15} />
                      <span>{L('Ejecutar Auditoría de Vigencia', 'Run Expiration Audit')}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Panel de Edición / Creación Rediseñado */}
              {(sp.newPromo === '1' || editingPromo) && (
                <div className="admin-edit-panel">
                  <div className="admin-edit-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`admin-edit-badge ${editingPromo ? 'admin-edit-badge--edit' : 'admin-edit-badge--new'}`}>
                        {editingPromo ? (
                          <>
                            <IconPencil size={13} />
                            <span>{L('Modo Edición', 'Editing Mode')}</span>
                          </>
                        ) : (
                          <>
                            <IconPlus size={13} />
                            <span>{L('Nueva Promoción', 'New Promotion')}</span>
                          </>
                        )}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                        {editingPromo ? editingPromo.title_es : L('Crear nuevo banner promocional', 'Create new promo banner')}
                      </h3>
                    </div>

                    <Link
                      href={`/${lang}/admin?tab=promotions`}
                      className="admin-btn-action"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title={L('Cerrar editor', 'Close editor')}
                    >
                      <IconX size={15} />
                    </Link>
                  </div>

                  <form action={savePromotion} className="form" key={editingPromo?.id ?? 'new-promo'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingPromo?.id ?? ''} />

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconSparkles size={14} />
                        <span>{L('1. Datos del Banner', '1. Banner Details')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_title_es">{L('Título del Banner *', 'Banner Title *')}</label>
                          <input id="promo_title_es" name="title_es" className="form__input" defaultValue={editingPromo?.title_es ?? ''} required maxLength={160} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_status">{L('Estado', 'Status')}</label>
                          <select id="promo_status" name="status" className="form__input" defaultValue={editingPromo?.status ?? 'Publicado'}>
                            <option value="Publicado">{L('Publicado (Visible en carrusel)', 'Published (Visible in carousel)')}</option>
                            <option value="Oculto">{L('Oculto', 'Hidden')}</option>
                          </select>
                        </div>
                      </div>
                      <div className="form__group" style={{ marginBottom: 0 }}>
                        <label className="form__label" htmlFor="promo_desc_es">{L('Descripción *', 'Description *')}</label>
                        <textarea id="promo_desc_es" name="description_es" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingPromo?.description_es ?? ''} required maxLength={400} />
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconClock size={14} />
                        <span>{L('2. Imagen y Vigencia', '2. Image & Schedule')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '0.85rem', alignItems: 'flex-start' }}>
                        <AdminFileDropzone
                          id="promo_image_file"
                          name="image_file"
                          label={L('Imagen promocional (Opcional, máx. 2 MB)', 'Promotional image (Optional, max 2 MB)')}
                          accept=".webp,.jpg,.jpeg,.png,.svg"
                          maxSizeMB={2}
                          existingImageUrl={editingPromo?.image_url}
                          lang={lang}
                        />
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_expires">{L('Fecha de caducidad (opcional)', 'Expiration date (optional)')}</label>
                          <input id="promo_expires" name="expires_at" type="date" className="form__input" defaultValue={editingPromo?.expires_at ? editingPromo.expires_at.slice(0, 10) : ''} />
                        </div>
                      </div>
                    </div>

                    <details className="admin-edit-details">
                      <summary>
                        <IconGlobe size={16} />
                        <span>{L('Opciones adicionales: Traducción al Inglés o URL externa de imagen (Opcional)', 'Additional options: English translation or external image URL (Optional)')}</span>
                      </summary>
                      
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_title_en">{L('Título del Banner (Inglés)', 'Banner Title (English)')}</label>
                          <input id="promo_title_en" name="title_en" className="form__input" defaultValue={editingPromo?.title_en ?? ''} maxLength={160} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_desc_en">{L('Descripción (Inglés)', 'Description (English)')}</label>
                          <textarea id="promo_desc_en" name="description_en" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingPromo?.description_en ?? ''} maxLength={400} />
                        </div>
                        <div className="form__group">
                          <label className="form__label" htmlFor="promo_image_url">{L('O URL de imagen promocional', 'Or Promotional Image URL')}</label>
                          <input id="promo_image_url" name="image_url" className="form__input" defaultValue={editingPromo?.image_url ?? ''} placeholder="https://... o /uploads/..." />
                        </div>
                      </div>
                    </details>

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px', padding: '0.75rem 1.4rem', fontWeight: 700 }}
                      >
                        <IconCheck size={16} />
                        <span>{editingPromo ? L('Guardar cambios', 'Save changes') : L('Publicar promoción', 'Publish promotion')}</span>
                      </button>
                      <Link
                        className="btn text-sm"
                        style={{ ...ghostBtnStyle, borderRadius: '10px', padding: '0.75rem 1.25rem' }}
                        href={`/${lang}/admin?tab=promotions`}
                      >
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Listado de Promociones */}
            <ul className="admin-list" role="list">
              {dashboard.promotions.map((p) => (
                <li key={p.id} className="admin-item-card">
                  <div>
                    <span className={`aviso__tag ${p.status === 'Publicado' ? 'aviso__tag--ley' : 'aviso__tag--aviso'}`}>
                      {p.status}
                    </span>
                    <p className="mt-2 mb-1" style={{ fontSize: '1.05rem' }}><strong>{p.title_es}</strong></p>
                    <p className="text-sm text-text-muted mb-1">{p.description_es}</p>
                    <p className="text-sm text-text-muted">
                      {L('Publicado:', 'Published:')} {String(p.published_at).slice(0, 10)} → {L('Vigencia:', 'Expires:')} {String(p.expires_at).slice(0, 10)}
                    </p>
                  </div>
                  
                  <div className="admin-item-actions">
                    <Link
                      className="admin-btn-action admin-btn-action--view"
                      href={`/${lang}#banner-promocional`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconEye size={14} />
                      <span>{L('Ver', 'View')}</span>
                    </Link>

                    <Link
                      className="admin-btn-action admin-btn-action--edit"
                      href={`/${lang}/admin?tab=promotions&editPromo=${p.id}`}
                    >
                      <IconPencil size={14} />
                      <span>{L('Editar', 'Edit')}</span>
                    </Link>

                    <form action={removePromotion}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="admin-btn-action admin-btn-action--delete">
                        <IconTrash size={14} />
                        <span>{L('Eliminar', 'Delete')}</span>
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 4: MÉTRICAS / ESTADÍSTICAS DE INICIO (STATS)                */}
        {/* ================================================================== */}
        {activeTab === 'stats' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                    {L('Métricas Registradas', 'Registered Metrics')} ({homeStats.length} / 5 {L('máx.', 'max')})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {homeStats.some((s) => s.active) ? (
                      <>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                        <span>{L('La sección está VISIBLE en la página de Inicio.', 'The section is VISIBLE on the Home page.')}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
                        <span>{L('La sección está OCULTA en la página de Inicio.', 'The section is HIDDEN on the Home page.')}</span>
                      </>
                    )}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {homeStats.length < 5 ? (
                    <Link
                      href={`/${lang}/admin?tab=stats&newStat=1`}
                      className="btn btn--primary text-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                    >
                      <IconPlus size={15} />
                      <span>{L('Agregar Métrica', 'Add Metric')} ({homeStats.length}/5)</span>
                    </Link>
                  ) : (
                    <span className="aviso__tag aviso__tag--aviso" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                      {L('Límite máximo alcanzado (5/5)', 'Maximum limit reached (5/5)')}
                    </span>
                  )}

                  <form action={toggleAllHomeStats}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="active" value="true" />
                    <button
                      type="submit"
                      className="btn btn--primary text-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                    >
                      <IconEye size={15} />
                      <span>{L('Mostrar todas en Inicio', 'Show all on Home')}</span>
                    </button>
                  </form>

                  <form action={toggleAllHomeStats}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="active" value="false" />
                    <button
                      type="submit"
                      className="admin-btn-action"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px' }}
                    >
                      <IconEyeOff size={15} />
                      <span>{L('Ocultar sección de Inicio', 'Hide section from Home')}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Formulario para agregar nueva métrica */}
              {sp.newStat === '1' && !editingStat && homeStats.length < 5 && (
                <div className="admin-edit-panel">
                  <div className="admin-edit-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className="admin-edit-badge admin-edit-badge--new">
                        <IconPlus size={13} />
                        <span>{L('Nueva Métrica', 'New Metric')}</span>
                      </span>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                        {L('Agregar contador numérico a la Página de Inicio', 'Add animated counter to Home page')}
                      </h3>
                    </div>

                    <Link
                      href={`/${lang}/admin?tab=stats`}
                      className="admin-btn-action"
                      style={{ padding: '0.4rem 0.65rem' }}
                      title={L('Cerrar editor', 'Close editor')}
                    >
                      <IconX size={15} />
                    </Link>
                  </div>
                  
                  <form action={saveHomeStat} className="form" key="new-stat-form">
                    <input type="hidden" name="lang" value={lang} />

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconChart size={14} />
                        <span>{L('1. Cifras y Etiquetas', '1. Values & Labels')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '1rem' }}>
                        <div className="form__group">
                          <label className="form__label">{L('Número / Cantidad *', 'Number / Value *')}</label>
                          <input name="value" type="number" min="0" className="form__input" defaultValue={10} required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">{L('Sufijo (ej. +, %, K)', 'Suffix (e.g. +, %, K)')}</label>
                          <input name="suffix" type="text" maxLength={10} className="form__input" defaultValue="+" />
                        </div>
                      </div>

                      <div className="grid-2-col" style={{ gap: '1rem' }}>
                        <div className="form__group">
                          <label className="form__label">{L('Título en Español *', 'Spanish Label *')}</label>
                          <input name="label_es" type="text" className="form__input" placeholder="Ej. Años de Experiencia" required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">{L('Título en Inglés', 'English Label')}</label>
                          <input name="label_en" type="text" className="form__input" placeholder="E.g. Years of Experience" />
                        </div>
                      </div>
                    </div>

                    <div className="admin-edit-block">
                      <div className="admin-edit-block__title">
                        <IconClock size={14} />
                        <span>{L('2. Orden y Visibilidad', '2. Order & Visibility')}</span>
                      </div>
                      <div className="grid-2-col" style={{ gap: '1rem', alignItems: 'center' }}>
                        <div className="form__group">
                          <label className="form__label">{L('Orden de aparición', 'Display Order')}</label>
                          <input name="sortOrder" type="number" min="1" max="5" className="form__input" defaultValue={homeStats.length + 1} />
                        </div>
                        <div className="form__group" style={{ paddingTop: '1.2rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                            <input type="checkbox" name="active" defaultChecked={true} />
                            <span>{L('Visible en la página de Inicio', 'Visible on Home page')}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px', padding: '0.75rem 1.4rem', fontWeight: 700 }}
                      >
                        <IconCheck size={16} />
                        <span>{L('Guardar nueva métrica', 'Save new metric')}</span>
                      </button>
                      <Link
                        className="btn text-sm"
                        style={{ ...ghostBtnStyle, borderRadius: '10px', padding: '0.75rem 1.25rem' }}
                        href={`/${lang}/admin?tab=stats`}
                      >
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Listado de Métricas */}
            <ul className="admin-list" role="list">
              {homeStats.map((s) => {
                const isEditingThis = editingStat?.id === s.id;
                return (
                  <li
                    key={s.id}
                    className="admin-item-card"
                    style={isEditingThis ? { display: 'block', padding: '0 !important', background: 'transparent', border: 'none', boxShadow: 'none' } : undefined}
                  >
                    {!isEditingThis ? (
                      <>
                        <div>
                          <span className={`aviso__tag ${s.active ? 'aviso__tag--ley' : 'aviso__tag--aviso'}`}>
                            {s.active ? L('Visible en Inicio', 'Visible on Home') : L('Oculto', 'Hidden')}
                          </span>
                          <p className="mt-2 mb-1" style={{ fontSize: '1.25rem' }}>
                            <strong className="text-primary">{s.value}{s.suffix}</strong> — <strong>{s.label_es}</strong>
                          </p>
                          <p className="text-sm text-text-muted">
                            EN: {s.label_en} • {L('Orden:', 'Order:')} {s.sortOrder}
                          </p>
                        </div>
                        
                        <div className="admin-item-actions">
                          <Link
                            className="admin-btn-action admin-btn-action--view"
                            href={`/${lang}#metricas-inicio`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconEye size={14} />
                            <span>{L('Ver', 'View')}</span>
                          </Link>

                          <Link
                            className="admin-btn-action admin-btn-action--edit"
                            href={`/${lang}/admin?tab=stats&editStat=${s.id}`}
                          >
                            <IconPencil size={14} />
                            <span>{L('Editar', 'Edit')}</span>
                          </Link>

                          <form action={removeHomeStat}>
                            <input type="hidden" name="lang" value={lang} />
                            <input type="hidden" name="id" value={s.id} />
                            <button type="submit" className="admin-btn-action admin-btn-action--delete">
                              <IconTrash size={14} />
                              <span>{L('Eliminar', 'Delete')}</span>
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="admin-edit-panel" style={{ marginTop: 0 }}>
                        <div className="admin-edit-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span className="admin-edit-badge admin-edit-badge--edit">
                              <IconPencil size={13} />
                              <span>{L('Modo Edición', 'Editing Mode')}</span>
                            </span>
                            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>
                              {L('Editando Métrica:', 'Editing Metric:')} <strong className="text-primary">{s.value}{s.suffix} — {s.label_es}</strong>
                            </h3>
                          </div>

                          <Link
                            href={`/${lang}/admin?tab=stats`}
                            className="admin-btn-action"
                            style={{ padding: '0.4rem 0.65rem' }}
                            title={L('Cerrar editor', 'Close editor')}
                          >
                            <IconX size={15} />
                          </Link>
                        </div>
                        
                        <form action={saveHomeStat} className="form" key={s.id}>
                          <input type="hidden" name="lang" value={lang} />
                          <input type="hidden" name="id" value={s.id} />

                          <div className="admin-edit-block">
                            <div className="admin-edit-block__title">
                              <IconChart size={14} />
                              <span>{L('1. Cifras y Etiquetas', '1. Values & Labels')}</span>
                            </div>
                            <div className="grid-2-col" style={{ gap: '1rem' }}>
                              <div className="form__group">
                                <label className="form__label">{L('Número / Cantidad *', 'Number / Value *')}</label>
                                <input name="value" type="number" min="0" className="form__input" defaultValue={s.value} required />
                              </div>
                              <div className="form__group">
                                <label className="form__label">{L('Sufijo (ej. +, %, K)', 'Suffix (e.g. +, %, K)')}</label>
                                <input name="suffix" type="text" maxLength={10} className="form__input" defaultValue={s.suffix} />
                              </div>
                            </div>

                            <div className="grid-2-col" style={{ gap: '1rem' }}>
                              <div className="form__group">
                                <label className="form__label">{L('Título en Español *', 'Spanish Label *')}</label>
                                <input name="label_es" type="text" className="form__input" defaultValue={s.label_es} required />
                              </div>
                              <div className="form__group">
                                <label className="form__label">{L('Título en Inglés', 'English Label')}</label>
                                <input name="label_en" type="text" className="form__input" defaultValue={s.label_en} />
                              </div>
                            </div>
                          </div>

                          <div className="admin-edit-block">
                            <div className="admin-edit-block__title">
                              <IconClock size={14} />
                              <span>{L('2. Orden y Visibilidad', '2. Order & Visibility')}</span>
                            </div>
                            <div className="grid-2-col" style={{ gap: '1rem', alignItems: 'center' }}>
                              <div className="form__group">
                                <label className="form__label">{L('Orden de aparición', 'Display Order')}</label>
                                <input name="sortOrder" type="number" min="1" max="5" className="form__input" defaultValue={s.sortOrder} />
                              </div>
                              <div className="form__group" style={{ paddingTop: '1.2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                                  <input type="checkbox" name="active" defaultChecked={Boolean(s.active)} />
                                  <span>{L('Visible en la página de Inicio', 'Visible on Home page')}</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                            <button
                              type="submit"
                              className="btn btn--primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '10px', padding: '0.75rem 1.4rem', fontWeight: 700 }}
                            >
                              <IconCheck size={16} />
                              <span>{L('Guardar cambios', 'Save changes')}</span>
                            </button>
                            <Link
                              className="btn text-sm"
                              style={{ ...ghostBtnStyle, borderRadius: '10px', padding: '0.75rem 1.25rem' }}
                              href={`/${lang}/admin?tab=stats`}
                            >
                              {L('Cancelar', 'Cancel')}
                            </Link>
                          </div>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 5: TABLA DE REGISTROS DE COTIZACIONES Y BOLETÍN              */}
        {/* ================================================================== */}
        {activeTab === 'logs' && (
          <div className="card glass-card" style={{ borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                  {L('Historial de Solicitudes de Cotización', 'Quotation Requests History')}
                </h2>
                <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                  {L(
                    'Registro ordenado y gestión de todas las solicitudes recibidas desde los formularios web.',
                    'Ordered log and management of all requests received from web quotation forms.'
                  )}
                </p>
              </div>
              <div>
                <a
                  href={`/api/backend/admin/quotations/export?locale=${lang}`}
                  download
                  className="admin-btn-excel"
                  title={L('Descargar historial completo en formato Microsoft Excel (.xlsx)', 'Download full history in Microsoft Excel format (.xlsx)')}
                >
                  <IconExcel size={16} />
                  <span>{L('Exportar a Excel (.xlsx)', 'Export to Excel (.xlsx)')}</span>
                </a>
              </div>
            </div>

            {dashboard.quotationLogs.length === 0 ? (
              <p className="text-text-muted">{L('Aún no se han recibido solicitudes de cotización.', 'No quotation requests received yet.')}</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '160px' }}>{L('Folio', 'Ref')}</th>
                      <th style={{ minWidth: '130px' }}>{L('Fecha', 'Date')}</th>
                      <th style={{ minWidth: '220px' }}>{L('Prospecto', 'Lead')}</th>
                      <th style={{ minWidth: '190px', textAlign: 'center' }}>{L('Servicio', 'Service')}</th>
                      <th style={{ minWidth: '280px' }}>{L('Detalles y Archivos', 'Details & Files')}</th>
                      <th style={{ minWidth: '100px' }}>reCAPTCHA</th>
                      <th style={{ minWidth: '220px' }}>{L('Estado Notificación', 'Notification Status')}</th>
                      <th style={{ textAlign: 'center', minWidth: '110px' }}>{L('Acciones', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.quotationLogs.map((log) => (
                      <tr key={log.id}>
                        {/* Folio en tag monoespaciado */}
                        <td>
                          <span className="admin-folio-tag">
                            {log.reference}
                          </span>
                        </td>

                        {/* Fecha a dos líneas */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--color-secondary)' }}>
                              {String(log.createdAt).slice(0, 10)}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <IconClock size={12} />
                              <span>{String(log.createdAt).slice(11, 16)} hrs</span>
                            </span>
                          </div>
                        </td>

                        {/* Prospecto con iconos claros */}
                        <td>
                          <div>
                            <strong style={{ fontSize: '0.94rem' }}>{log.name}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                            <IconMail size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                            <a href={`mailto:${log.email}`} className="text-primary text-sm" style={{ textDecoration: 'none' }}>
                              {log.email}
                            </a>
                          </div>
                          {log.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                              <IconPhone size={13} style={{ flexShrink: 0 }} />
                              <span>{log.phone}</span>
                            </div>
                          )}
                          {log.company && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                              <IconBuilding size={13} style={{ flexShrink: 0 }} />
                              <span>{log.company}</span>
                            </div>
                          )}
                        </td>

                        {/* Servicio centrado con badge y operación estilizada */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="admin-service-badge">{log.service}</span>
                            {log.operation && (
                              <span className="admin-operation-tag">
                                <span className="admin-operation-tag__dot" aria-hidden="true" />
                                <span className="admin-operation-tag__op">{log.operation}</span>
                                <span className="admin-operation-tag__sep">•</span>
                                <span className="admin-operation-tag__mode">{log.mode}</span>
                                {log.country && (
                                  <span className="admin-operation-tag__country">({log.country})</span>
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Detalles y Archivos en chips interactivos */}
                        <td style={{ maxWidth: '340px' }}>
                          {log.description && <p className="mb-2 text-sm" style={{ lineHeight: '1.4', margin: '0 0 0.4rem 0' }}>{log.description}</p>}
                          {log.files?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                              {log.files.map((fileName) => (
                                <a
                                  key={fileName}
                                  href={`/api/backend/quotations/${encodeURIComponent(log.reference)}/files/${encodeURIComponent(fileName)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-file-chip"
                                  title={fileName}
                                >
                                  <IconPaperclip size={13} />
                                  <span>{fileName}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* reCAPTCHA con Badge Indicador */}
                        <td>
                          <span className="admin-score-badge">
                            <span className="admin-score-dot" />
                            <span>{Number(log.recaptchaScore).toFixed(1)}</span>
                          </span>
                        </td>

                        {/* Estado de Notificación y Previsualizaciones */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-start' }}>
                            <span
                              className={`admin-status-pill ${
                                log.smtpStatus === 'sent_all_smtp' || log.smtpStatus === 'sent_smtp'
                                  ? 'admin-status-pill--success'
                                  : log.smtpStatus === 'ready_html_outbox'
                                  ? 'admin-status-pill--info'
                                  : 'admin-status-pill--danger'
                              }`}
                            >
                              <IconCheck size={12} />
                              <span>
                                {log.smtpStatus === 'sent_all_smtp' || log.smtpStatus === 'sent_smtp'
                                  ? L('Enviado a Directivos y Cliente', 'Sent to Directors & Client')
                                  : log.smtpStatus === 'sent_directors_only'
                                  ? L('Enviado solo a Directivos', 'Sent to Directors only')
                                  : log.smtpStatus === 'ready_html_outbox'
                                  ? L('Listo en Outbox (Sin SMTP)', 'Ready in Outbox (No SMTP)')
                                  : log.smtpStatus}
                              </span>
                            </span>

                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <a
                                href={`/api/backend/quotations/${encodeURIComponent(log.reference)}/email-preview`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-btn-action"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem', whiteSpace: 'nowrap', borderRadius: '6px' }}
                                title={L('Ver correo despachado a directivos', 'View email sent to directors')}
                              >
                                <IconMail size={12} />
                                <span>{L('Directivos', 'Directors')}</span>
                              </a>
                              <a
                                href={`/api/backend/quotations/${encodeURIComponent(log.reference)}/email-preview?target=client`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-btn-action"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem', whiteSpace: 'nowrap', borderRadius: '6px' }}
                                title={L('Ver acuse de recibo del cliente', 'View client confirmation email')}
                              >
                                <IconUser size={12} />
                                <span>{L('Cliente', 'Client')}</span>
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Botón Eliminar Folio */}
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          <form action={removeQuotationLog}>
                            <input type="hidden" name="lang" value={lang} />
                            <input type="hidden" name="id" value={log.id} />
                            <button
                              type="submit"
                              className="admin-btn-action admin-btn-action--delete"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                              title={L('Eliminar folio', 'Delete quote')}
                            >
                              <IconTrash size={13} />
                              <span>{L('Eliminar', 'Delete')}</span>
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Listado de Suscriptores del Boletín */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(148,163,184,0.25)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <IconMail size={16} />
                <span>{L('Correos Suscritos al Boletín Informativo', 'Newsletter Subscribed Emails')} ({dashboard.newsletter?.length || 0})</span>
              </h3>
              
              {!dashboard.newsletter || dashboard.newsletter.length === 0 ? (
                <p className="text-sm text-text-muted">
                  {L('Aún no hay correos registrados en el boletín.', 'No emails subscribed to the newsletter yet.')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {dashboard.newsletter.map((sub) => (
                    <span
                      key={sub.id || sub.email}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '999px',
                        background: 'var(--color-surface)',
                        border: '1px solid rgba(148,163,184,0.3)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <IconMail size={13} style={{ color: 'var(--color-primary)' }} />
                      <a href={`mailto:${sub.email}`} className="text-primary" style={{ fontWeight: 600 }}>
                        {sub.email}
                      </a>
                      {sub.subscribed_at && (
                        <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>
                          ({String(sub.subscribed_at).slice(0, 10)})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
