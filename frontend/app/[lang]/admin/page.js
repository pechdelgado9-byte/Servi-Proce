import { Suspense } from 'react';
import { adminEnabled, isAdmin } from '@/lib/auth';
import { AVISO_TYPES, readAllAvisos } from '@/lib/avisos';
import { typeLabel } from '../../../components/AvisoCard';
import { login, logout, saveAviso, removeAviso } from './actions';

export const metadata = { title: 'Administración | Servi Proce', robots: { index: false, follow: false } };

export default function AdminPage({ params, searchParams }) {
  // El contenido depende de cookies → se renderiza dinámicamente dentro de Suspense.
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

  if (!adminEnabled()) {
    return (
      <main className="page-wrapper section">
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card glass-card">
            <h1 style={{ fontSize: '1.75rem' }} className="mb-3">{L('Panel deshabilitado', 'Panel disabled')}</h1>
            <p className="text-text-muted">
              {L('Defina la variable de entorno ', 'Set the environment variable ')}<code>ADMIN_PASSWORD</code>
              {L(' (y opcionalmente ', ' (and optionally ')}<code>ADMIN_SESSION_SECRET</code>{L(') para habilitar el acceso.', ') to enable access.')}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="page-wrapper section">
        <div className="container" style={{ maxWidth: '480px' }}>
          <div className="card glass-card">
            <h1 style={{ fontSize: '1.75rem' }} className="mb-4">{L('Administración', 'Administration')}</h1>
            {sp.error === 'login' && <p className="alert alert--error mb-4" role="alert">{L('Contraseña incorrecta o demasiados intentos.', 'Wrong password or too many attempts.')}</p>}
            <form action={login} className="form">
              <input type="hidden" name="lang" value={lang} />
              <div className="form__group">
                <label className="form__label" htmlFor="password">{L('Contraseña', 'Password')}</label>
                <input id="password" name="password" type="password" className="form__input" required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn--primary">{L('Entrar', 'Sign in')}</button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const avisos = await readAllAvisos();
  const editing = sp.edit ? avisos.find((a) => a.id === sp.edit) : null;
  const v = (k, d = '') => editing?.[k] ?? d;

  return (
    <main className="page-wrapper section">
      <div className="container">
        <div className="admin-head">
          <h1 style={{ fontSize: '2rem' }}>{L('Noticias, leyes y avisos', 'News, laws and notices')}</h1>
          <form action={logout}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className="btn btn--secondary text-sm">{L('Cerrar sesión', 'Sign out')}</button>
          </form>
        </div>

        {sp.ok === 'saved' && <p className="alert alert--success mb-4" role="status">{L('Publicación guardada.', 'Post saved.')}</p>}
        {sp.ok === 'deleted' && <p className="alert alert--success mb-4" role="status">{L('Publicación eliminada.', 'Post deleted.')}</p>}
        {sp.error === 'validation' && <p className="alert alert--error mb-4" role="alert">{L('Revise los campos: tipo, título y texto en español son obligatorios; el enlace debe ser http(s).', 'Check the fields: type, Spanish title and text are required; the link must be http(s).')}</p>}
        {sp.error === 'notfound' && <p className="alert alert--error mb-4" role="alert">{L('La publicación ya no existe.', 'That post no longer exists.')}</p>}

        <div className="grid-2-col" style={{ alignItems: 'start' }}>
          <div className="card glass-card">
            <h2 className="mb-4" style={{ fontSize: '1.5rem' }}>{editing ? L('Editar publicación', 'Edit post') : L('Nueva publicación', 'New post')}</h2>
            <form action={saveAviso} className="form" key={editing?.id ?? 'new'}>
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="id" value={editing?.id ?? ''} />
              <div className="form__group">
                <label className="form__label" htmlFor="type">{L('Tipo', 'Type')} *</label>
                <select id="type" name="type" className="form__input" defaultValue={v('type', 'aviso')}>
                  {AVISO_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t, lang)}</option>)}
                </select>
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="title_es">{L('Título (español)', 'Title (Spanish)')} *</label>
                <input id="title_es" name="title_es" className="form__input" defaultValue={v('title_es')} required maxLength={160} />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="body_es">{L('Texto (español)', 'Text (Spanish)')} *</label>
                <textarea id="body_es" name="body_es" rows={5} className="form__input" defaultValue={v('body_es')} required maxLength={4000} />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="title_en">{L('Título (inglés, opcional)', 'Title (English, optional)')}</label>
                <input id="title_en" name="title_en" className="form__input" defaultValue={v('title_en')} maxLength={160} />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="body_en">{L('Texto (inglés, opcional)', 'Text (English, optional)')}</label>
                <textarea id="body_en" name="body_en" rows={4} className="form__input" defaultValue={v('body_en')} maxLength={4000} />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="sourceUrl">{L('Enlace a la fuente oficial (opcional)', 'Official source link (optional)')}</label>
                <input id="sourceUrl" name="sourceUrl" type="url" className="form__input" defaultValue={v('sourceUrl')} placeholder="https://" maxLength={500} />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="expiresAt">{L('Ocultar a partir de (opcional)', 'Hide after (optional)')}</label>
                <input id="expiresAt" name="expiresAt" type="date" className="form__input" defaultValue={v('expiresAt')} />
              </div>
              <div className="form__group">
                <label className="quote-check"><input type="checkbox" name="pinned" defaultChecked={Boolean(editing?.pinned)} /> {L('Destacar al inicio', 'Pin to the top')}</label>
              </div>
              <div className="flex-center gap-4" style={{ justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn--primary">{editing ? L('Guardar cambios', 'Save changes') : L('Publicar', 'Publish')}</button>
                {editing && <a className="btn btn--secondary" href={`/${lang}/admin`}>{L('Cancelar', 'Cancel')}</a>}
              </div>
            </form>
          </div>

          <div>
            <h2 className="mb-4" style={{ fontSize: '1.5rem' }}>{L('Publicaciones', 'Posts')} ({avisos.length})</h2>
            {avisos.length === 0 && <p className="text-text-muted">{L('Aún no hay publicaciones.', 'No posts yet.')}</p>}
            <ul className="admin-list" role="list">
              {avisos.map((a) => (
                <li key={a.id} className="admin-list__item card glass-card">
                  <div>
                    <span className={`aviso__tag aviso__tag--${a.type}`}>{typeLabel(a.type, lang)}</span>{' '}
                    {a.pinned && <span className="aviso__pin">{L('Destacado', 'Pinned')}</span>}
                    <p className="mt-2 mb-2"><strong>{a.title_es}</strong></p>
                    <p className="text-sm text-text-muted">{a.publishedAt}{a.expiresAt ? ` → ${a.expiresAt}` : ''}</p>
                  </div>
                  <div className="admin-list__actions">
                    <a className="btn btn--secondary text-sm" href={`/${lang}/admin?edit=${a.id}`}>{L('Editar', 'Edit')}</a>
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
      </div>
    </main>
  );
}
