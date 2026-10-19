import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPostBySlug, fetchBlogPosts } from '@/lib/api';
import ReadingProgressBar from '../../../../components/ReadingProgressBar';

// RF-10: Inyección Dinámica de Metadatos SEO (<=60 / <=160) y Fallback Automático Open Graph (/logo.png)
export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const post = await fetchBlogPostBySlug(slug, lang);
  if (!post) {
    return {
      title: 'Blog | Servi Proce',
      openGraph: { images: ['/logo.png'] },
    };
  }

  const seoTitle = (post.seo?.title || `${post.title} | Servi Proce`).slice(0, 60);
  const seoDesc = (post.seo?.description || post.excerpt || post.title).slice(0, 160);
  const ogImage = post.seo?.ogImage || post.imageUrl || '/logo.png';

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const lang of ['es', 'en']) {
    const posts = await fetchBlogPosts(lang);
    for (const post of posts) {
      params.push({ lang, slug: post.slug });
    }
  }
  return params;
}

export default async function BlogPostPage({ params }) {
  const { lang, slug } = await params;
  const post = await fetchBlogPostBySlug(slug, lang);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-wrapper">
      <ReadingProgressBar />

      {/* Hero del Artículo */}
      <section 
        className="section bg-surface" 
        style={{ 
          backgroundImage: `url("${post.imageUrl}")`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          position: 'relative',
          padding: '5.5rem 0 4.5rem 0'
        }}
      >
        <div className="section-overlay" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(157, 0, 0, 0.65) 60%, rgba(15, 23, 42, 0.95) 100%)' }}></div>
        <div className="container relative z-10 text-center" style={{ maxWidth: '850px' }}>
          <div className="mb-3 flex-center gap-2" style={{ justifyContent: 'center' }}>
            <Link href={`/${lang}/blog`} className="text-sm text-white" style={{ opacity: 0.85, textDecoration: 'underline' }}>
              ← {lang === 'es' ? 'Volver al Blog' : 'Back to Blog'}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span className="priority-badge" style={{ marginBottom: 0 }}>{post.category}</span>
          </div>

          <h1 className="page-title fade-in-up text-white" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', lineHeight: '1.25', marginBottom: '1.25rem' }}>
            {post.title}
          </h1>

          <div className="flex-center gap-4 text-sm mt-3" style={{ flexWrap: 'wrap', color: 'rgba(255,255,255,0.88)', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {post.date}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {post.readTime}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {post.author}
            </span>
          </div>
        </div>
      </section>

      {/* Contenido del Artículo */}
      <section className="section bg-background" style={{ padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <article className="card glass-card fade-in-up" style={{ padding: '3.25rem 2.75rem', borderRadius: '1.5rem', boxShadow: '0 16px 45px rgba(0,0,0,0.06)' }}>
            
            {/* Párrafo destacado / Lead */}
            <div className="article-lead" style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.25rem', marginBottom: '2rem' }}>
              <p className="text-secondary font-bold" style={{ fontSize: '1.25rem', lineHeight: '1.65', margin: 0 }}>
                {post.excerpt}
              </p>
            </div>

            {/* Puntos clave / Key Takeaways Box */}
            <div className="article-takeaways" style={{ 
              background: 'rgba(157, 0, 0, 0.05)', 
              border: '1px solid rgba(157, 0, 0, 0.18)', 
              borderRadius: '1rem', 
              padding: '1.5rem 1.75rem', 
              marginBottom: '2.5rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                  {lang === 'es' ? 'Puntos Clave del Análisis' : 'Key Strategic Takeaways'}
                </h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text)' }}>
                <li>{lang === 'es' ? 'Adecuación anticipada de documentación para evitar detenciones en aduana.' : 'Advance document validation to eliminate entry point holds.'}</li>
                <li>{lang === 'es' ? 'Trazabilidad digital integral y cumplimiento fiscal regulatorio.' : 'Comprehensive digital traceability and compliance safeguards.'}</li>
                <li>{lang === 'es' ? 'Acompañamiento especializado con ejecutivos aduanales certificados.' : 'Direct oversight by licensed foreign trade specialists.'}</li>
              </ul>
            </div>

            {/* Cuerpo del Artículo */}
            <div className="article-body">
              {post.content.map((paragraph, idx) => (
                <p key={idx} className="text-text" style={{ fontSize: '1.1rem', lineHeight: '1.85', marginBottom: '1.75rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Cita Editorial Destacada */}
            <blockquote style={{ 
              margin: '2.5rem 0', 
              padding: '1.5rem 2rem', 
              borderLeft: '4px solid var(--color-primary)', 
              background: 'var(--color-surface)', 
              borderRadius: '0 1rem 1rem 0',
              fontStyle: 'italic',
              fontSize: '1.15rem',
              color: 'var(--color-secondary)',
              lineHeight: '1.6'
            }}>
              &ldquo;{lang === 'es' 
                ? 'La prevención y la auditoría documental previa cuestan una fracción de lo que representa un solo día de demora o almacenaje extraordinario en puerto o frontera.' 
                : 'Proactive compliance and pre-clearance audits cost a fraction of a single day of port demurrage or border delays.'}&rdquo;
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, fontStyle: 'normal', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                — Servi Proce Advisory Team
              </span>
            </blockquote>

            {/* Banner de Consulta y Asesoría */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(157, 0, 0, 0.1) 0%, rgba(15, 23, 42, 0.05) 100%)',
              border: '1px solid rgba(157, 0, 0, 0.2)',
              borderRadius: '1.25rem',
              padding: '2rem 2.25rem',
              margin: '3rem 0 2rem 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(157, 0, 0, 0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '0.4rem' }}>
                  {lang === 'es' ? '¿Requiere asesoría especializada para su empresa?' : 'Need tailored foreign trade advisory for your business?'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '600px' }}>
                  {lang === 'es'
                    ? 'Nuestros agentes aduanales y especialistas en logística están listos para analizar su operación y optimizar sus tiempos y aranceles.'
                    : 'Our licensed customs brokers and freight specialists are ready to evaluate your operations and optimize timing and duties.'}
                </p>
              </div>
              <Link href={`/${lang}/contacto`} className="btn btn--primary" style={{ padding: '0.85rem 2rem', fontSize: '0.98rem' }}>
                {lang === 'es' ? 'Solicitar Asesoría Directa →' : 'Request Direct Consultation →'}
              </Link>
            </div>

            {/* Pie del artículo: Compartir y Retorno con amplio espaciado */}
            <div style={{ marginTop: '3.75rem', paddingTop: '2.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <Link href={`/${lang}/blog`} className="btn btn--secondary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}>
                ← {lang === 'es' ? 'Volver al Blog' : 'Back to Blog'}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="text-sm text-text-muted" style={{ fontWeight: 600 }}>
                  {lang === 'es' ? 'Compartir:' : 'Share:'}
                </span>
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-share-btn"
                  aria-label="Compartir en WhatsApp"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://serviproce.com.mx')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-share-btn"
                  aria-label="Compartir en LinkedIn"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0A66C2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://serviproce.com.mx')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-share-btn"
                  aria-label="Compartir en Facebook"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877F2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

          </article>
        </div>
      </section>
    </main>
  );
}

