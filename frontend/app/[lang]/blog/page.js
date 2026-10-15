import Link from 'next/link';
import { fetchBlogPosts } from '@/lib/api';
import NewsletterForm from '../../../components/NewsletterForm';

// RF-10: Inyección Dinámica de Metadatos SEO y Open Graph
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === 'es' ? 'Blog Corporativo | Servi Proce' : 'Corporate Blog | Servi Proce',
    description: lang === 'es' 
      ? 'Noticias, artículos y actualizaciones sobre comercio exterior y logística en México.'
      : 'News, articles, and updates on foreign trade and logistics in Mexico.',
    openGraph: {
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default async function Blog({ params }) {
  const { lang } = await params;
  
  // Consumo de la API simulada (Strapi Backend)
  const posts = await fetchBlogPosts(lang);

  return (
    <main className="page-wrapper">
      <section className="section bg-surface" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundAttachment: 'fixed', position: 'relative' }}>
        <div className="section-overlay"></div>
        <div className="container relative z-10 text-center">
          <h1 className="page-title fade-in-up" style={{ color: 'var(--color-primary)' }}>
            {lang === 'es' ? 'Blog y Noticias' : 'Blog & News'}
          </h1>
          <p className="page-subtitle fade-in-up delay-1 text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {lang === 'es' 
              ? 'Manténgase informado con las últimas actualizaciones, normativas y tendencias del sector logístico y aduanero global.' 
              : 'Stay informed with the latest updates, regulations, and trends in the global logistics and customs sector.'}
          </p>
        </div>
      </section>

      <section className="section bg-background">
        <div className="container">
          <div className="grid-2-col">
            {posts.map((post, index) => (
              <article key={post.id} className={`card glass-card hover-elevate fade-in-up delay-${index + 1}`}>
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="img-fluid mb-4"
                  style={{ height: '250px', width: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  decoding="async"
                />
                <div className="text-sm text-primary font-bold mb-2 uppercase tracking-wide">{post.date}</div>
                <h2 className="text-secondary mb-3" style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>{post.title}</h2>
                <p className="text-text-muted mb-4">{post.excerpt}</p>
                <Link href={`/${lang}/blog/${post.slug}`} className="btn btn--secondary text-sm w-full btn-blog-read">
                  <span>{lang === 'es' ? 'Leer Artículo Completo' : 'Read Full Article'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-blog-read__arrow">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Subscribe */}
      <section className="section bg-surface text-center">
        <div className="container fade-in-up">
          <h2 className="text-secondary mb-4">
            {lang === 'es' ? 'Suscríbase a nuestro boletín' : 'Subscribe to our newsletter'}
          </h2>
          <p className="text-text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            {lang === 'es' 
              ? 'Reciba las últimas noticias de comercio exterior directamente en su bandeja de entrada.' 
              : 'Receive the latest foreign trade news directly in your inbox.'}
          </p>
          <NewsletterForm lang={lang} />
        </div>
      </section>
    </main>
  );
}
