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
  saveAviso,
  removeAviso,
} from './actions';

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
                  'Cuenta/IP bloqueada temporalmente por 15 minutos tras 5 intentos fallidos consecutivos (Política RNF-03).',
                  'Account/IP locked for 15 minutes after 5 consecutive failed attempts (Policy RNF-03).'
                )}
              </p>
            )}
            {sp.error === 'inactivity' && (
              <p className="alert alert--error mb-4" role="alert">
                {L(
                  'Su sesión se cerró automáticamente tras 15 minutos de inactividad continua (Política RNF-04).',
                  'Your session was automatically closed after 15 minutes of continuous inactivity (Policy RNF-04).'
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
  };

  const activeTab = ['blog', 'avisos', 'promotions', 'logs'].includes(sp.tab) ? sp.tab : 'blog';

  const editingBlog = sp.editBlog ? dashboard.blogPosts.find((b) => b.id === sp.editBlog) : null;
  const editingPromo = sp.editPromo ? dashboard.promotions.find((p) => p.id === sp.editPromo) : null;
  const editingAviso = sp.edit ? dashboard.avisos.find((a) => a.id === sp.edit) : null;

  return (
    <main className="page-wrapper section">
      <div className="container">
        <div className="admin-head" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
              {L('Sistema de Gestión de Contenidos (CMS)', 'Content Management System (CMS)')}
            </h1>
            <AdminInactivityMonitor lang={lang} logoutAction={logout} />
          </div>
          <form action={logout}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn btn--secondary text-sm">{L('Cerrar sesión', 'Sign out')}</button>
          </form>
        </div>

        {/* Barra de navegación de módulos del CMS */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.75rem', borderBottom: '1px solid rgba(148,163,184,0.25)', paddingBottom: '0.85rem' }}>
          <Link
            href={`/${lang}/admin?tab=blog`}
            className={`btn text-sm ${activeTab === 'blog' ? 'btn--primary' : 'btn--secondary'}`}
          >
            {L('Artículos del Blog', 'Blog Articles')} ({dashboard.blogPosts.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=avisos`}
            className={`btn text-sm ${activeTab === 'avisos' ? 'btn--primary' : 'btn--secondary'}`}
          >
            {L('Noticias, Leyes y Avisos', 'News, Laws & Notices')} ({dashboard.avisos.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=promotions`}
            className={`btn text-sm ${activeTab === 'promotions' ? 'btn--primary' : 'btn--secondary'}`}
          >
            {L('Banner Promocional (RF-02)', 'Promo Banner (RF-02)')} ({dashboard.promotions.length})
          </Link>
          <Link
            href={`/${lang}/admin?tab=logs`}
            className={`btn text-sm ${activeTab === 'logs' ? 'btn--primary' : 'btn--secondary'}`}
          >
            {L('Historial de Cotizaciones (Log)', 'Quotation History (Log)')} ({dashboard.quotationLogs.length})
          </Link>
        </div>

        {sp.ok === 'saved' && (
          <p className="alert alert--success mb-4" role="status">
            {L('Cambios guardados y sincronizados con el sitio público (Webhook SSG ejecutado).', 'Changes saved and synced with the public site (SSG Webhook triggered).')}
          </p>
        )}
        {sp.ok === 'deleted' && (
          <p className="alert alert--success mb-4" role="status">
            {L('Registro eliminado correctamente.', 'Record deleted successfully.')}
          </p>
        )}
        {sp.error === 'validation' && (
          <p className="alert alert--error mb-4" role="alert">
            {L('Verifique los campos obligatorios o que el texto no incluya etiquetas <script> no permitidas (RF-07).', 'Check required fields or ensure no forbidden <script> tags are present (RF-07).')}
          </p>
        )}
        {sp.error === 'upload' && (
          <p className="alert alert--error mb-4" role="alert">
            {L('Error al subir archivo: verifique que sea una imagen válida (.webp, .jpg, .png, .svg) menor a 2 MB (RF-09).', 'Upload error: ensure it is a valid image (.webp, .jpg, .png, .svg) under 2 MB (RF-09).')}
          </p>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 1: GESTIÓN DE ARTÍCULOS DEL BLOG (RF-07, RF-09, RF-10)      */}
        {/* ================================================================== */}
        {activeTab === 'blog' && (
          <div className="grid-2-col" style={{ alignItems: 'start' }}>
            <div className="card glass-card">
              <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>
                {editingBlog ? L('Editar artículo del Blog', 'Edit Blog Article') : L('Nuevo artículo del Blog', 'New Blog Article')}
              </h2>
              <form action={saveBlogPost} className="form" key={editingBlog?.id ?? 'new-blog'}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={editingBlog?.id ?? ''} />

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_title_es">{L('Título del artículo (Español)', 'Article Title (Spanish)')} *</label>
                  <input id="blog_title_es" name="title_es" className="form__input" defaultValue={editingBlog?.title_es ?? ''} required maxLength={140} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_title_en">{L('Título del artículo (Inglés)', 'Article Title (English)')}</label>
                  <input id="blog_title_en" name="title_en" className="form__input" defaultValue={editingBlog?.title_en ?? ''} maxLength={140} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_excerpt_es">{L('Resumen / Extracto (Español)', 'Excerpt (Spanish)')} *</label>
                  <textarea id="blog_excerpt_es" name="excerpt_es" rows={2} className="form__input" defaultValue={editingBlog?.excerpt_es ?? ''} required maxLength={300} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_excerpt_en">{L('Resumen / Extracto (Inglés)', 'Excerpt (English)')}</label>
                  <textarea id="blog_excerpt_en" name="excerpt_en" rows={2} className="form__input" defaultValue={editingBlog?.excerpt_en ?? ''} maxLength={300} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_content_es">
                    {L('Contenido completo en Español (separe párrafos con salto de línea)', 'Full Spanish Content (separate paragraphs with a newline)')} *
                  </label>
                  <textarea
                    id="blog_content_es"
                    name="content_es"
                    rows={6}
                    className="form__input"
                    defaultValue={Array.isArray(editingBlog?.content_es) ? editingBlog.content_es.join('\n\n') : ''}
                    required
                  />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_content_en">
                    {L('Contenido completo en Inglés (opcional)', 'Full English Content (optional)')}
                  </label>
                  <textarea
                    id="blog_content_en"
                    name="content_en"
                    rows={5}
                    className="form__input"
                    defaultValue={Array.isArray(editingBlog?.content_en) ? editingBlog.content_en.join('\n\n') : ''}
                  />
                </div>

                <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                  <div className="form__group">
                    <label className="form__label" htmlFor="blog_cat_es">{L('Categoría (ES)', 'Category (ES)')}</label>
                    <input id="blog_cat_es" name="category_es" className="form__input" defaultValue={editingBlog?.category_es ?? 'Regulaciones'} />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="blog_cat_en">{L('Categoría (EN)', 'Category (EN)')}</label>
                    <input id="blog_cat_en" name="category_en" className="form__input" defaultValue={editingBlog?.category_en ?? 'Regulations'} />
                  </div>
                </div>

                <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                  <div className="form__group">
                    <label className="form__label" htmlFor="blog_author">{L('Autor', 'Author')}</label>
                    <input id="blog_author" name="author" className="form__input" defaultValue={editingBlog?.author ?? 'Equipo Legal Servi Proce'} />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="blog_read_es">{L('Tiempo de lectura (ES)', 'Read time (ES)')}</label>
                    <input id="blog_read_es" name="read_time_es" className="form__input" defaultValue={editingBlog?.read_time_es ?? '5 min de lectura'} />
                  </div>
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_image_file">
                    {L('Subir imagen destacada (RF-09: máx. 2 MB, se normaliza automáticamente a [a-z0-9-])', 'Upload featured image (RF-09: max 2 MB, auto-normalized to [a-z0-9-])')}
                  </label>
                  <input id="blog_image_file" name="image_file" type="file" accept=".webp,.jpg,.jpeg,.png,.svg" className="form__input" />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="blog_image_url">
                    {L('O URL de imagen (Si se deja vacío usa el Fallback /logo.png según RF-10)', 'Or Image URL (Defaults to /logo.png fallback per RF-10)')}
                  </label>
                  <input id="blog_image_url" name="image_url" className="form__input" defaultValue={editingBlog?.image_url ?? ''} placeholder="https://... o /logo.png" />
                </div>

                <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                  <div className="form__group">
                    <label className="form__label" htmlFor="seo_title_es">{L('Título SEO ES (máx. 60 car. RF-10)', 'SEO Title ES (max 60 chars RF-10)')}</label>
                    <input id="seo_title_es" name="seo_title_es" className="form__input" defaultValue={editingBlog?.seo_title_es ?? ''} maxLength={60} />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="seo_desc_es">{L('Descripción SEO ES (máx. 160 car. RF-10)', 'SEO Desc ES (max 160 chars RF-10)')}</label>
                    <input id="seo_desc_es" name="seo_desc_es" className="form__input" defaultValue={editingBlog?.seo_desc_es ?? ''} maxLength={160} />
                  </div>
                </div>

                <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn--primary">
                    {editingBlog ? L('Guardar cambios', 'Save changes') : L('Publicar artículo', 'Publish article')}
                  </button>
                  {editingBlog && (
                    <Link className="btn btn--secondary" href={`/${lang}/admin?tab=blog`}>
                      {L('Cancelar', 'Cancel')}
                    </Link>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>
                {L('Artículos publicados en el Blog', 'Published Blog Articles')} ({dashboard.blogPosts.length})
              </h2>
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
                      <Link className="btn btn--secondary text-sm" href={`/${lang}/admin?tab=blog&editBlog=${b.id}`}>
                        {L('Editar', 'Edit')}
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
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 2: NOTICIAS, LEYES Y AVISOS                                 */}
        {/* ================================================================== */}
        {activeTab === 'avisos' && (
          <div className="grid-2-col" style={{ alignItems: 'start' }}>
            <div className="card glass-card">
              <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>
                {editingAviso ? L('Editar publicación', 'Edit post') : L('Nueva publicación', 'New post')}
              </h2>
              <form action={saveAviso} className="form" key={editingAviso?.id ?? 'new-aviso'}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={editingAviso?.id ?? ''} />
                <div className="form__group">
                  <label className="form__label" htmlFor="type">{L('Tipo', 'Type')} *</label>
                  <select id="type" name="type" className="form__input" defaultValue={editingAviso?.type ?? 'aviso'}>
                    {AVISO_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, lang)}</option>)}
                  </select>
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="title_es">{L('Título (español)', 'Title (Spanish)')} *</label>
                  <input id="title_es" name="title_es" className="form__input" defaultValue={editingAviso?.title_es ?? ''} required maxLength={160} />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="body_es">{L('Texto (español)', 'Text (Spanish)')} *</label>
                  <textarea id="body_es" name="body_es" rows={4} className="form__input" defaultValue={editingAviso?.body_es ?? ''} required maxLength={4000} />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="title_en">{L('Título (inglés, opcional)', 'Title (English, optional)')}</label>
                  <input id="title_en" name="title_en" className="form__input" defaultValue={editingAviso?.title_en ?? ''} maxLength={160} />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="body_en">{L('Texto (inglés, opcional)', 'Text (English, optional)')}</label>
                  <textarea id="body_en" name="body_en" rows={3} className="form__input" defaultValue={editingAviso?.body_en ?? ''} maxLength={4000} />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="sourceUrl">{L('Enlace a la fuente oficial (opcional)', 'Official source link (optional)')}</label>
                  <input id="sourceUrl" name="sourceUrl" type="url" className="form__input" defaultValue={editingAviso?.sourceUrl ?? ''} placeholder="https://" maxLength={500} />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="expiresAt">{L('Ocultar a partir de (máx. 1 año según RF-02)', 'Hide after (max 1 year per RF-02)')}</label>
                  <input id="expiresAt" name="expiresAt" type="date" className="form__input" defaultValue={editingAviso?.expiresAt ?? ''} />
                </div>
                <div className="form__group">
                  <label className="quote-check">
                    <input type="checkbox" name="pinned" defaultChecked={Boolean(editingAviso?.pinned)} /> {L('Destacar al inicio', 'Pin to the top')}
                  </label>
                </div>
                <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn--primary">{editingAviso ? L('Guardar cambios', 'Save changes') : L('Publicar', 'Publish')}</button>
                  {editingAviso && <Link className="btn btn--secondary" href={`/${lang}/admin?tab=avisos`}>{L('Cancelar', 'Cancel')}</Link>}
                </div>
              </form>
            </div>

            <div>
              <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>{L('Publicaciones', 'Posts')} ({dashboard.avisos.length})</h2>
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
                      <Link className="btn btn--secondary text-sm" href={`/${lang}/admin?tab=avisos&edit=${a.id}`}>{L('Editar', 'Edit')}</Link>
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
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 3: BANNER PROMOCIONAL CON CADUCIDAD DE 365 DÍAS (RF-02)     */}
        {/* ================================================================== */}
        {activeTab === 'promotions' && (
          <div className="grid-2-col" style={{ alignItems: 'start' }}>
            <div className="card glass-card">
              <h2 className="mb-2" style={{ fontSize: '1.4rem' }}>
                {editingPromo ? L('Editar Promoción', 'Edit Promotion') : L('Nueva Promoción (RF-02)', 'New Promotion (RF-02)')}
              </h2>
              <p className="text-sm text-text-muted mb-4">
                {L(
                  'Por regla de negocio (RF-02), toda promoción es auditada por el Cron Job del servidor y se oculta automáticamente al cumplir exactamente 1 año (365 días) desde su publicación original.',
                  'By business rule (RF-02), every promotion is audited by the server Cron Job and automatically hidden after 1 year (365 days) from its initial publication.'
                )}
              </p>
              <form action={savePromotion} className="form" key={editingPromo?.id ?? 'new-promo'}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={editingPromo?.id ?? ''} />

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_title_es">{L('Título del Banner (Español)', 'Banner Title (Spanish)')} *</label>
                  <input id="promo_title_es" name="title_es" className="form__input" defaultValue={editingPromo?.title_es ?? ''} required maxLength={160} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_title_en">{L('Título del Banner (Inglés)', 'Banner Title (English)')}</label>
                  <input id="promo_title_en" name="title_en" className="form__input" defaultValue={editingPromo?.title_en ?? ''} maxLength={160} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_desc_es">{L('Descripción (Español)', 'Description (Spanish)')} *</label>
                  <textarea id="promo_desc_es" name="description_es" rows={3} className="form__input" defaultValue={editingPromo?.description_es ?? ''} required maxLength={400} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_desc_en">{L('Descripción (Inglés)', 'Description (English)')}</label>
                  <textarea id="promo_desc_en" name="description_en" rows={3} className="form__input" defaultValue={editingPromo?.description_en ?? ''} maxLength={400} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_expires">{L('Fecha de caducidad (máx. 365 días obligatorios)', 'Expiration date (mandatory max 365 days)')}</label>
                  <input id="promo_expires" name="expires_at" type="date" className="form__input" defaultValue={editingPromo?.expires_at ? editingPromo.expires_at.slice(0, 10) : ''} />
                </div>

                <div className="form__group">
                  <label className="form__label" htmlFor="promo_status">{L('Estado', 'Status')}</label>
                  <select id="promo_status" name="status" className="form__input" defaultValue={editingPromo?.status ?? 'Publicado'}>
                    <option value="Publicado">{L('Publicado', 'Published')}</option>
                    <option value="Oculto">{L('Oculto', 'Hidden')}</option>
                  </select>
                </div>

                <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn--primary">
                    {editingPromo ? L('Guardar cambios', 'Save changes') : L('Publicar promoción', 'Publish promotion')}
                  </button>
                  {editingPromo && (
                    <Link className="btn btn--secondary" href={`/${lang}/admin?tab=promotions`}>
                      {L('Cancelar', 'Cancel')}
                    </Link>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 className="mb-4" style={{ fontSize: '1.4rem' }}>
                {L('Promociones Registradas', 'Registered Promotions')} ({dashboard.promotions.length})
              </h2>
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
                        {L('Publicado (t0):', 'Published (t0):')} {String(p.published_at).slice(0, 10)} → {L('Caduca (365d):', 'Expires (365d):')} {String(p.expires_at).slice(0, 10)}
                      </p>
                    </div>
                    <div className="admin-list__actions">
                      <Link className="btn btn--secondary text-sm" href={`/${lang}/admin?tab=promotions&editPromo=${p.id}`}>
                        {L('Editar', 'Edit')}
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
          </div>
        )}

        {/* ================================================================== */}
        {/* MÓDULO 4: TABLA DE REGISTROS (LOG) DE COTIZACIONES (SOLO LECTURA)  */}
        {/* Cumple Sección 3.1.1 Interfaces de Usuario y Sección 2.1.8.3       */}
        {/* ================================================================== */}
        {activeTab === 'logs' && (
          <div className="card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                  {L('Historial de Solicitudes de Cotización (Modo Sólo Lectura)', 'Quotation Requests History (Read-Only Log)')}
                </h2>
                <p className="text-sm text-text-muted">
                  {L(
                    'Respaldo inmutable en Base de Datos de todos los formularios enviados (Sección 2.1.8.3 y 3.1.1 del ERS).',
                    'Immutable database backup of all submitted quotation forms (ERS Section 2.1.8.3 & 3.1.1).'
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(148,163,184,0.3)' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>{L('Folio', 'Ref')}</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>{L('Fecha', 'Date')}</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>{L('Prospecto', 'Lead')}</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>{L('Servicio (RF-01)', 'Service (RF-01)')}</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>{L('Detalles / Archivos', 'Details / Files')}</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>reCAPTCHA</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>SMTP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.quotationLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{log.reference}</td>
                        <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{String(log.createdAt).slice(0, 16).replace('T', ' ')}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <div><strong>{log.name}</strong></div>
                          <div><a href={`mailto:${log.email}`} className="text-primary">{log.email}</a></div>
                          {log.phone && <div className="text-sm text-text-muted">{log.phone}</div>}
                          {log.company && <div className="text-sm text-text-muted">{log.company}</div>}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span className="aviso__tag aviso__tag--noticia">{log.service}</span>
                          {log.operation && <div className="text-sm text-text-muted mt-1">{log.operation} / {log.mode} ({log.country})</div>}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', maxWidth: '280px' }}>
                          {log.description && <div className="mb-1">{log.description}</div>}
                          {log.files?.length > 0 && (
                            <div className="text-sm text-primary">
                              📎 {log.files.join(', ')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{Number(log.recaptchaScore).toFixed(1)}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <code>{log.smtpStatus}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
