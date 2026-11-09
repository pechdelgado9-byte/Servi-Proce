import { Suspense } from 'react';
import Link from 'next/link';
import { fetchAdminDashboardData, isAdmin } from '@/lib/auth';
import { AVISO_TYPES } from '@/lib/avisos';
import { typeLabel } from '../../../components/AvisoCard';
import AdminInactivityMonitor from '../../../components/AdminInactivityMonitor';
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

export default function AdminPage({ params, searchParams }) {
  return (
    <Suspense fallback={<main className="page-wrapper section"><div className="container">…</div></main>}>
      <AdminContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminContent({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const L = (es, en) => (lang === 'es' ? es : en);

  if (!(await isAdmin())) {
    return (
      <main className="page-wrapper section">
        <div className="container" style={{ maxWidth: '480px' }}>
          <div className="card glass-card">
            <h1 style={{ fontSize: '1.75rem' }} className="mb-3">{L('Panel de Administración (CMS)', 'CMS Administration Panel')}</h1>
            <p className="text-sm text-text-muted mb-4">
              {L(
                'Ingrese sus credenciales administrativas para gestionar el Blog, Promociones, Avisos y consultar el Historial de Cotizaciones.',
                'Enter your admin credentials to manage the Blog, Promotions, Notices, and view the Quotation Log.'
              )}
            </p>
            {sp.error === 'login' && (
              <p className="alert alert--error mb-4" role="alert">
                {L('Credenciales incorrectas.', 'Invalid credentials.')}
              </p>
            )}
            {sp.error === 'locked' && (
              <p className="alert alert--error mb-4" role="alert">
                {L(
                  'Cuenta o dirección IP bloqueada temporalmente por 15 minutos tras 5 intentos fallidos consecutivos.',
                  'Account or IP locked for 15 minutes after 5 consecutive failed attempts.'
                )}
              </p>
            )}
            {sp.error === 'inactivity' && (
              <p className="alert alert--error mb-4" role="alert">
                {L(
                  'Su sesión se cerró automáticamente tras 15 minutos de inactividad continua.',
                  'Your session was automatically closed after 15 minutes of continuous inactivity.'
                )}
              </p>
            )}
            {sp.error === 'backend' && (
              <p className="alert alert--error mb-4" role="alert">
                {L(
                  'El servidor Backend Headless (puerto 1337) no está encendido. Ejecute "npm run dev" dentro de /backend.',
                  'The Headless Backend server (port 1337) is offline. Run "npm run dev" inside /backend.'
                )}
              </p>
            )}
            <form action={login} className="form">
              <input type="hidden" name="lang" value={lang} />
              <div className="form__group">
                <label className="form__label" htmlFor="username">{L('Usuario (Correo)', 'Username (Email)')}</label>
                <input
                  id="username"
                  name="username"
                  type="email"
                  className="form__input"
                  defaultValue="admin@serviproce.com.mx"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="password">{L('Contraseña', 'Password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form__input"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
                {L('Iniciar Sesión', 'Sign In')}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

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
      title: L('📍 ¿Dónde se ve este bloque?', '📍 Where does this block appear?'),
      desc: L(
        'Estos artículos aparecen en la página "Blog" del menú principal. Al publicar o editar un artículo, puedes presionar "👁️ Ver" para ir directamente a su publicación.',
        'These articles appear on the "Blog" page in the main menu. After publishing or editing an article, click "👁️ View" to jump directly to it.'
      ),
      href: `/${lang}/blog`,
      btnLabel: L('👁️ Ver sección de Blog', '👁️ View Blog section'),
    },
    avisos: {
      title: L('📍 ¿Dónde se ve este bloque?', '📍 Where does this block appear?'),
      desc: L(
        'Estas publicaciones aparecen en dos lugares: en la mitad de la Página de Inicio (sección "Noticias, Leyes y Avisos", debajo de Nuestros Servicios) y en la página dedicada "/avisos".',
        'These posts appear in two places: in the middle of the Home Page ("News, Laws and Notices" section, below Our Services) and on the dedicated "/avisos" page.'
      ),
      href: `/${lang}#seccion-avisos`,
      btnLabel: L('👁️ Ver bloque en Inicio', '👁️ View block on Home'),
    },
    promotions: {
      title: L('📍 ¿Dónde se ve este bloque?', '📍 Where does this block appear?'),
      desc: L(
        'Este banner aparece hasta arriba de la Página de Inicio (franja superior destacada, justo encima de la imagen principal de portada). Si hay varias promociones con estado "Publicado", se mostrarán rotando automáticamente en un carrusel interactivo.',
        'This banner appears at the very top of the Home Page (featured top bar right above the main hero image). If multiple promotions have "Published" status, they rotate automatically in an interactive carousel.'
      ),
      href: `/${lang}#banner-promocional`,
      btnLabel: L('👁️ Ver Banner en Inicio', '👁️ View Banner on Home'),
    },
    stats: {
      title: L('📍 ¿Dónde se ve este bloque?', '📍 Where does this block appear?'),
      desc: L(
        'Estos contadores numéricos animados (ej. 10+ Años de Experiencia) aparecen en la mitad de la Página de Inicio, justo arriba de "Compromiso y Tratos Comerciales". Puedes mostrarlos u ocultarlos cuando quieras.',
        'These animated counters (e.g. 10+ Years of Experience) appear in the middle of the Home Page, right above "Commitment and Business Deals". You can show or hide them anytime.'
      ),
      href: `/${lang}#metricas-inicio`,
      btnLabel: L('👁️ Ver Métricas en Inicio', '👁️ View Metrics on Home'),
    },
    logs: {
      title: L('📍 ¿De dónde provienen estos registros?', '📍 Where do these records come from?'),
      desc: L(
        'Aquí se concentran todas las solicitudes enviadas por los clientes desde los formularios de "Despachos Aduanales (#cotizador)" y "Contacto", incluyendo sus documentos adjuntos y la vista previa del correo enviado.',
        'All quotation requests submitted by clients from the "Customs Clearance (#cotizador)" and "Contact" forms are collected here, including attachments and email previews.'
      ),
      href: `/${lang}/despachos-aduanales#cotizador`,
      btnLabel: L('👁️ Ver Formulario de Cotización', '👁️ View Quotation Form'),
    },
  };

  const currentGuide = moduleGuides[activeTab] || moduleGuides.blog;
  const ghostBtnStyle = { background: 'rgba(148,163,184,0.16)', color: 'inherit', border: '1px solid rgba(148,163,184,0.35)' };

  return (
    <main className="page-wrapper section">
      <div className="container" style={activeTab === 'logs' ? { maxWidth: '1440px', width: '100%' } : undefined}>
        <div className="admin-head" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
              {L('Sistema de Gestión de Contenidos (CMS)', 'Content Management System (CMS)')}
            </h1>
            <AdminInactivityMonitor lang={lang} logoutAction={logout} />
          </div>
          <form action={logout}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn text-sm" style={ghostBtnStyle}>{L('Cerrar sesión', 'Sign out')}</button>
          </form>
        </div>

        {/* Barra de navegación de módulos del CMS */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid rgba(148,163,184,0.25)', paddingBottom: '0.85rem' }}>
          <Link
            href={`/${lang}/admin?tab=blog`}
            className={`btn text-sm ${activeTab === 'blog' ? 'btn--primary' : ''}`}
            style={activeTab !== 'blog' ? ghostBtnStyle : undefined}
          >
            {L('Artículos del Blog', 'Blog Articles')} ({dashboard.blogPosts.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=avisos`}
            className={`btn text-sm ${activeTab === 'avisos' ? 'btn--primary' : ''}`}
            style={activeTab !== 'avisos' ? ghostBtnStyle : undefined}
          >
            {L('Noticias, Leyes y Avisos', 'News, Laws & Notices')} ({dashboard.avisos.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=promotions`}
            className={`btn text-sm ${activeTab === 'promotions' ? 'btn--primary' : ''}`}
            style={activeTab !== 'promotions' ? ghostBtnStyle : undefined}
          >
            {L('Banner Promocional', 'Promo Banner')} ({dashboard.promotions.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=stats`}
            className={`btn text-sm ${activeTab === 'stats' ? 'btn--primary' : ''}`}
            style={activeTab !== 'stats' ? ghostBtnStyle : undefined}
          >
            {L('Métricas de Inicio', 'Home Metrics')} ({homeStats.filter((s) => s.active).length}/{homeStats.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=logs`}
            className={`btn text-sm ${activeTab === 'logs' ? 'btn--primary' : ''}`}
            style={activeTab !== 'logs' ? ghostBtnStyle : undefined}
          >
            {L('Historial de Cotizaciones', 'Quotation Requests')} ({dashboard.quotationLogs.length})
          </Link>
        </div>

        {/* Guía rápida de ubicación del bloque en el sitio web + Botón directo "Ver" */}
        <div
          className="card glass-card"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.35rem',
            borderLeft: '4px solid var(--color-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ maxWidth: '760px' }}>
            <strong style={{ display: 'block', fontSize: '0.98rem', marginBottom: '0.2rem' }}>
              {currentGuide.title}
            </strong>
            <span className="text-sm text-text-muted">
              {currentGuide.desc}
            </span>
          </div>
          <Link
            href={currentGuide.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn text-sm"
            style={{ ...ghostBtnStyle, fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {currentGuide.btnLabel} ↗
          </Link>
        </div>

        {sp.ok === 'saved' && (
          <div
            className="alert alert--success mb-4"
            role="status"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}
          >
            <span>
              ✅ {L('¡Cambios guardados y actualizados en la página web!', 'Changes saved and updated on the website!')}
            </span>
            <Link
              href={currentGuide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary text-sm"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.84rem' }}
            >
              👁️ {L('Ver apartado modificado en la página ↗', 'View modified section on page ↗')}
            </Link>
          </div>
        )}
        {sp.ok === 'cron' && (
          <p className="alert alert--success mb-4" role="status">
            {L('Auditoría ejecutada: las promociones vencidas han sido ocultadas automáticamente.', 'Audit executed: expired promotions have been automatically hidden.')}
          </p>
        )}
        {sp.ok === 'deleted' && (
          <p className="alert alert--success mb-4" role="status">
            {L('Registro eliminado correctamente.', 'Record deleted successfully.')}
          </p>
        )}
        {sp.error === 'validation' && (
          <p className="alert alert--error mb-4" role="alert">
            {L('Verifique los campos obligatorios o que el texto no incluya etiquetas HTML no permitidas.', 'Check required fields or ensure no forbidden HTML tags are present.')}
          </p>
        )}
        {sp.error === 'upload' && (
          <p className="alert alert--error mb-4" role="alert">
            {L('Error al subir archivo: verifique que sea una imagen válida (.webp, .jpg, .png, .svg) menor a 2 MB.', 'Upload error: ensure it is a valid image (.webp, .jpg, .png, .svg) under 2 MB.')}
          </p>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 1: GESTIÓN DE ARTÍCULOS DEL BLOG (RF-07, RF-09, RF-10)      */}
        {/* ================================================================== */}
        {activeTab === 'blog' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                    {L('Artículos publicados en el Blog', 'Published Blog Articles')} ({dashboard.blogPosts.length})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {L('Selecciona "Editar" en cualquier artículo para modificarlo o presiona "Nuevo Artículo" para publicar uno.', 'Click "Edit" on any article to modify it or "New Article" to publish a new one.')}
                  </p>
                </div>
                {sp.newBlog !== '1' && !editingBlog && (
                  <Link href={`/${lang}/admin?tab=blog&newBlog=1`} className="btn btn--primary text-sm">
                    ➕ {L('Nuevo Artículo del Blog', 'New Blog Article')}
                  </Link>
                )}
              </div>

              {(sp.newBlog === '1' || editingBlog) && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                  <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>
                    {editingBlog ? `✏️ ${L('Editando artículo:', 'Editing article:')} ${editingBlog.title_es}` : `➕ ${L('Nuevo artículo del Blog', 'New Blog Article')}`}
                  </h3>
                  <form action={saveBlogPost} className="form" key={editingBlog?.id ?? 'new-blog'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingBlog?.id ?? ''} />

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

                    <div className="form__group">
                      <label className="form__label" htmlFor="blog_excerpt_es">{L('Resumen breve (aparece en la tarjeta del Blog) *', 'Short Excerpt *')}</label>
                      <textarea id="blog_excerpt_es" name="excerpt_es" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingBlog?.excerpt_es ?? ''} required maxLength={300} />
                    </div>

                    <div className="form__group">
                      <label className="form__label" htmlFor="blog_content_es">
                        {L('Contenido del artículo (separe párrafos con salto de línea) *', 'Full Article Content (separate paragraphs with a newline) *')}
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

                    <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                      <div className="form__group">
                        <label className="form__label" htmlFor="blog_image_file">
                          {L('Imagen destacada (Opcional, máx. 2 MB)', 'Featured image (Optional, max 2 MB)')}
                        </label>
                        <input id="blog_image_file" name="image_file" type="file" accept=".webp,.jpg,.jpeg,.png,.svg" className="form__input" />
                      </div>
                      <div className="form__group">
                        <label className="form__label" htmlFor="blog_author">{L('Autor', 'Author')}</label>
                        <input id="blog_author" name="author" className="form__input" defaultValue={editingBlog?.author ?? 'Equipo Legal Servi Proce'} />
                      </div>
                    </div>

                    {/* Campos opcionales colapsados para no saturar la pantalla con cuadros */}
                    <details style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148,163,184,0.2)' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                        🌐 {L('Opciones avanzadas: Traducción al Inglés, URL e información SEO (Opcional — se autogenera si se deja vacío)', 'Advanced options: English translation, URL & SEO (Optional — auto-generated if left blank)')}
                      </summary>
                      <div style={{ marginTop: '1rem' }}>
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

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button type="submit" className="btn btn--primary">
                        {editingBlog ? L('Guardar cambios', 'Save changes') : L('Publicar artículo', 'Publish article')}
                      </button>
                      <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=blog`}>
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <ul className="admin-list" role="list">
              {dashboard.blogPosts.map((b) => (
                <li key={b.id} className="admin-list__item card glass-card">
                  <div>
                    <span className="aviso__tag aviso__tag--noticia">{b.category_es}</span>
                    <p className="mt-2 mb-1"><strong>{b.title_es}</strong></p>
                    <p className="text-sm text-text-muted mb-1">Slug: <code>/{lang}/blog/{b.slug}</code></p>
                    <p className="text-sm text-text-muted">{b.published_at} • {b.author}</p>
                  </div>
                  <div className="admin-list__actions">
                    <Link
                      className="btn text-sm"
                      style={ghostBtnStyle}
                      href={`/${lang}/blog/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      👁️ {L('Ver', 'View')}
                    </Link>
                    <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=blog&editBlog=${b.id}`}>
                      ✏️ {L('Editar', 'Edit')}
                    </Link>
                    <form action={removeBlogPost}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={b.id} />
                      <button type="submit" className="btn text-sm btn--danger">{L('Eliminar', 'Delete')}</button>
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
            <div className="card glass-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                    {L('Publicaciones Registradas', 'Registered Posts')} ({dashboard.avisos.length})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {L('Selecciona "Editar" en una publicación existente o presiona "Nueva Publicación" para agregar una.', 'Click "Edit" on an existing post or "New Post" to add one.')}
                  </p>
                </div>
                {sp.newAviso !== '1' && !editingAviso && (
                  <Link href={`/${lang}/admin?tab=avisos&newAviso=1`} className="btn btn--primary text-sm">
                    ➕ {L('Nueva Publicación', 'New Post')}
                  </Link>
                )}
              </div>

              {(sp.newAviso === '1' || editingAviso) && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                  <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>
                    {editingAviso ? `✏️ ${L('Editando publicación:', 'Editing post:')} ${editingAviso.title_es}` : `➕ ${L('Nueva Publicación', 'New Post')}`}
                  </h3>
                  <form action={saveAviso} className="form" key={editingAviso?.id ?? 'new-aviso'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingAviso?.id ?? ''} />

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

                    <div className="form__group">
                      <label className="form__label" htmlFor="body_es">{L('Descripción / Contenido *', 'Description / Content *')}</label>
                      <textarea id="body_es" name="body_es" rows={4} style={{ resize: 'none' }} className="form__input" defaultValue={editingAviso?.body_es ?? ''} required maxLength={4000} />
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

                    <details style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148,163,184,0.2)' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                        🌐 {L('Opciones adicionales: Enlace a fuente oficial y traducción al Inglés (Opcional)', 'Additional options: Official source link & English translation (Optional)')}
                      </summary>
                      <div style={{ marginTop: '1rem' }}>
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

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button type="submit" className="btn btn--primary">{editingAviso ? L('Guardar cambios', 'Save changes') : L('Publicar', 'Publish')}</button>
                      <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=avisos`}>{L('Cancelar', 'Cancel')}</Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <ul className="admin-list" role="list">
              {dashboard.avisos.map((a) => (
                <li key={a.id} className="admin-list__item card glass-card">
                  <div>
                    <span className={`aviso__tag aviso__tag--${a.type}`}>{typeLabel(a.type, lang)}</span>{' '}
                    {a.pinned && <span className="aviso__pin">{L('Destacado', 'Pinned')}</span>}
                    <p className="mt-2 mb-2"><strong>{a.title_es}</strong></p>
                    <p className="text-sm text-text-muted">{a.publishedAt}{a.expiresAt ? ` → ${a.expiresAt}` : ''}</p>
                  </div>
                  <div className="admin-list__actions">
                    <Link
                      className="btn text-sm"
                      style={ghostBtnStyle}
                      href={`/${lang}/avisos#aviso-${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      👁️ {L('Ver', 'View')}
                    </Link>
                    <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=avisos&edit=${a.id}`}>
                      ✏️ {L('Editar', 'Edit')}
                    </Link>
                    <form action={removeAviso}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="btn text-sm btn--danger">{L('Eliminar', 'Delete')}</button>
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
            <div className="card glass-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
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
                    <Link href={`/${lang}/admin?tab=promotions&newPromo=1`} className="btn btn--primary text-sm">
                      ➕ {L('Nueva Promoción', 'New Promotion')}
                    </Link>
                  )}
                  <form action={runCronAudit}>
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="btn text-sm" style={ghostBtnStyle}>
                      ⏱️ {L('Ejecutar Auditoría de Vigencia', 'Run Expiration Audit')}
                    </button>
                  </form>
                </div>
              </div>

              {(sp.newPromo === '1' || editingPromo) && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                  <h3 className="mb-3" style={{ fontSize: '1.25rem' }}>
                    {editingPromo ? `✏️ ${L('Editando promoción:', 'Editing promotion:')} ${editingPromo.title_es}` : `➕ ${L('Nueva Promoción', 'New Promotion')}`}
                  </h3>
                  <form action={savePromotion} className="form" key={editingPromo?.id ?? 'new-promo'}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={editingPromo?.id ?? ''} />

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

                    <div className="form__group">
                      <label className="form__label" htmlFor="promo_desc_es">{L('Descripción *', 'Description *')}</label>
                      <textarea id="promo_desc_es" name="description_es" rows={2} style={{ resize: 'none' }} className="form__input" defaultValue={editingPromo?.description_es ?? ''} required maxLength={400} />
                    </div>

                    <div className="grid-2-col" style={{ gap: '0.85rem' }}>
                      <div className="form__group">
                        <label className="form__label" htmlFor="promo_image_file">
                          {L('Imagen promocional (Opcional, máx. 2 MB)', 'Promotional image (Optional, max 2 MB)')}
                        </label>
                        <input id="promo_image_file" name="image_file" type="file" accept=".webp,.jpg,.jpeg,.png,.svg" className="form__input" />
                      </div>
                      <div className="form__group">
                        <label className="form__label" htmlFor="promo_expires">{L('Fecha de caducidad (opcional)', 'Expiration date (optional)')}</label>
                        <input id="promo_expires" name="expires_at" type="date" className="form__input" defaultValue={editingPromo?.expires_at ? editingPromo.expires_at.slice(0, 10) : ''} />
                      </div>
                    </div>

                    <details style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '0.5rem', background: 'rgba(15, 23, 42, 0.35)', border: '1px solid rgba(148,163,184,0.2)' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                        🌐 {L('Opciones adicionales: Traducción al Inglés o URL externa de imagen (Opcional)', 'Additional options: English translation or external image URL (Optional)')}
                      </summary>
                      <div style={{ marginTop: '1rem' }}>
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
                      <button type="submit" className="btn btn--primary">
                        {editingPromo ? L('Guardar cambios', 'Save changes') : L('Publicar promoción', 'Publish promotion')}
                      </button>
                      <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=promotions`}>
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <ul className="admin-list" role="list">
              {dashboard.promotions.map((p) => (
                <li key={p.id} className="admin-list__item card glass-card">
                  <div>
                    <span className={`aviso__tag ${p.status === 'Publicado' ? 'aviso__tag--ley' : 'aviso__tag--aviso'}`}>
                      {p.status}
                    </span>
                    <p className="mt-2 mb-1"><strong>{p.title_es}</strong></p>
                    <p className="text-sm text-text-muted mb-1">{p.description_es}</p>
                    <p className="text-sm text-text-muted">
                      {L('Publicado:', 'Published:')} {String(p.published_at).slice(0, 10)} → {L('Vigencia:', 'Expires:')} {String(p.expires_at).slice(0, 10)}
                    </p>
                  </div>
                  <div className="admin-list__actions">
                    <Link
                      className="btn text-sm"
                      style={ghostBtnStyle}
                      href={`/${lang}#banner-promocional`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      👁️ {L('Ver', 'View')}
                    </Link>
                    <Link className="btn text-sm" style={ghostBtnStyle} href={`/${lang}/admin?tab=promotions&editPromo=${p.id}`}>
                      ✏️ {L('Editar', 'Edit')}
                    </Link>
                    <form action={removePromotion}>
                      <input type="hidden" name="lang" value={lang} />
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn text-sm btn--danger">{L('Eliminar', 'Delete')}</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO DE MÉTRICAS / ESTADÍSTICAS DE INICIO (STATS)                */}
        {/* Permite ocultar o mostrar toda la sección, agregar y editar cifras */}
        {/* ================================================================== */}
        {activeTab === 'stats' && (
          <div>
            <div className="card glass-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                    {L('Métricas Registradas', 'Registered Metrics')} ({homeStats.length} / 5 {L('máx.', 'max')})
                  </h2>
                  <p className="text-sm text-text-muted" style={{ margin: '0.25rem 0 0' }}>
                    {homeStats.some((s) => s.active)
                      ? L('🟢 La sección está VISIBLE en la página de Inicio.', '🟢 The section is VISIBLE on the Home page.')
                      : L('⚪ La sección está OCULTA en la página de Inicio.', '⚪ The section is HIDDEN on the Home page.')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {homeStats.length < 5 ? (
                    <Link
                      href={`/${lang}/admin?tab=stats&newStat=1`}
                      className="btn btn--primary text-sm"
                    >
                      ➕ {L('Agregar Métrica', 'Add Metric')} ({homeStats.length}/5)
                    </Link>
                  ) : (
                    <span className="aviso__tag aviso__tag--aviso" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                      {L('Límite máximo alcanzado (5/5)', 'Maximum limit reached (5/5)')}
                    </span>
                  )}

                  <form action={toggleAllHomeStats}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="active" value="true" />
                    <button type="submit" className="btn btn--primary text-sm">
                      👁️ {L('Mostrar todas en Inicio', 'Show all on Home')}
                    </button>
                  </form>
                  <form action={toggleAllHomeStats}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="active" value="false" />
                    <button type="submit" className="btn text-sm" style={{ background: 'rgba(148,163,184,0.16)', color: 'inherit', border: '1px solid rgba(148,163,184,0.35)' }}>
                      🚫 {L('Ocultar sección de Inicio', 'Hide section from Home')}
                    </button>
                  </form>
                </div>
              </div>

              {/* Formulario para agregar nueva métrica: solo aparece si se presionó Agregar Métrica y hay menos de 5 */}
              {sp.newStat === '1' && !editingStat && homeStats.length < 5 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                  <h3 style={{ fontSize: '1.2rem' }} className="mb-3">
                    ➕ {L('Nueva Métrica (Máx. 5)', 'New Metric (Max 5)')}
                  </h3>
                  <form action={saveHomeStat} className="form" key="new-stat-form">
                    <input type="hidden" name="lang" value={lang} />

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

                    <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                      <button type="submit" className="btn btn--primary">
                        {L('Guardar nueva métrica', 'Save new metric')}
                      </button>
                      <Link
                        className="btn text-sm"
                        style={{ background: 'rgba(148,163,184,0.16)', color: 'inherit', border: '1px solid rgba(148,163,184,0.35)' }}
                        href={`/${lang}/admin?tab=stats`}
                      >
                        {L('Cancelar', 'Cancel')}
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <ul className="admin-list" role="list">
              {homeStats.map((s) => {
                const isEditingThis = editingStat?.id === s.id;
                return (
                  <li
                    key={s.id}
                    className="admin-list__item card glass-card"
                    style={isEditingThis ? { display: 'block', border: '2px solid var(--color-primary)' } : undefined}
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
                        <div className="admin-list__actions">
                          <Link
                            className="btn text-sm"
                            style={ghostBtnStyle}
                            href={`/${lang}#metricas-inicio`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            👁️ {L('Ver', 'View')}
                          </Link>
                          <Link
                            className="btn text-sm"
                            style={ghostBtnStyle}
                            href={`/${lang}/admin?tab=stats&editStat=${s.id}`}
                          >
                            ✏️ {L('Editar', 'Edit')}
                          </Link>
                          <form action={removeHomeStat}>
                            <input type="hidden" name="lang" value={lang} />
                            <input type="hidden" name="id" value={s.id} />
                            <button type="submit" className="btn text-sm btn--danger">{L('Eliminar', 'Delete')}</button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div>
                        <h3 style={{ fontSize: '1.2rem' }} className="mb-3">
                          ✏️ {L('Editando Métrica:', 'Editing Metric:')} <span className="text-primary">{s.value}{s.suffix} — {s.label_es}</span>
                        </h3>
                        <form action={saveHomeStat} className="form" key={s.id}>
                          <input type="hidden" name="lang" value={lang} />
                          <input type="hidden" name="id" value={s.id} />

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

                          <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                            <button type="submit" className="btn btn--primary">
                              {L('Guardar cambios', 'Save changes')}
                            </button>
                            <Link
                              className="btn text-sm"
                              style={{ background: 'rgba(148,163,184,0.16)', color: 'inherit', border: '1px solid rgba(148,163,184,0.35)' }}
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
        {/* MÓDULO 4: TABLA DE REGISTROS DE COTIZACIONES                       */}
        {/* ================================================================== */}
        {activeTab === 'logs' && (
          <div className="card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                  {L('Historial de Solicitudes de Cotización', 'Quotation Requests History')}
                </h2>
                <p className="text-sm text-text-muted">
                  {L(
                    'Registro y gestión de todos los formularios de cotización recibidos.',
                    'Log and management of all received quotation forms.'
                  )}
                </p>
              </div>
              <span className="priority-badge">
                {L(`Suscriptores Boletín: ${dashboard.newsletter?.length || 0}`, `Newsletter Subscribers: ${dashboard.newsletter?.length || 0}`)}
              </span>
            </div>

            {dashboard.quotationLogs.length === 0 ? (
              <p className="text-text-muted">{L('Aún no se han recibido solicitudes de cotización.', 'No quotation requests received yet.')}</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(148,163,184,0.3)' }}>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Folio', 'Ref')}</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Fecha', 'Date')}</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Prospecto', 'Lead')}</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Servicio', 'Service')}</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Detalles y Archivos', 'Details & Files')}</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>reCAPTCHA</th>
                      <th style={{ padding: '0.85rem 0.75rem' }}>{L('Estado de Notificación', 'Notification Status')}</th>
                      <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>{L('Acciones', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.quotationLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{log.reference}</td>
                        <td style={{ padding: '0.85rem 0.75rem', whiteSpace: 'nowrap' }}>{String(log.createdAt).slice(0, 16).replace('T', ' ')}</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <div><strong>{log.name}</strong></div>
                          <div><a href={`mailto:${log.email}`} className="text-primary">{log.email}</a></div>
                          {log.phone && <div className="text-sm text-text-muted">{log.phone}</div>}
                          {log.company && <div className="text-sm text-text-muted">{log.company}</div>}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <span className="aviso__tag aviso__tag--noticia">{log.service}</span>
                          {log.operation && <div className="text-sm text-text-muted mt-1">{log.operation} / {log.mode} ({log.country})</div>}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', maxWidth: '320px' }}>
                          {log.description && <div className="mb-1">{log.description}</div>}
                          {log.files?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                              {log.files.map((fileName) => (
                                <a
                                  key={fileName}
                                  href={`/api/backend/quotations/${encodeURIComponent(log.reference)}/files/${encodeURIComponent(fileName)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary"
                                  style={{ textDecoration: 'underline', fontWeight: 600 }}
                                >
                                  📎 {fileName}
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>{Number(log.recaptchaScore).toFixed(1)}</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                            <code>{log.smtpStatus}</code>
                            <a
                              href={`/api/backend/quotations/${encodeURIComponent(log.reference)}/email-preview`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn--secondary text-sm"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              ✉️ {L('Ver Correo HTML', 'View HTML Email')}
                            </a>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <form action={removeQuotationLog}>
                            <input type="hidden" name="lang" value={lang} />
                            <input type="hidden" name="id" value={log.id} />
                            <button
                              type="submit"
                              className="btn btn--danger text-sm"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                              title={L('Eliminar folio', 'Delete quote')}
                            >
                              🗑️ {L('Eliminar', 'Delete')}
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
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                {L('Correos Suscritos al Boletín Informativo', 'Newsletter Subscribed Emails')} ({dashboard.newsletter?.length || 0})
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
