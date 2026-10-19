import { SanitizationService } from '../services/SanitizationService.js';

/**
 * Modelo de Dominio: BlogPost (RF-07 y RF-10 del ERS)
 * Gestiona artículos bilingües (ES/EN) e inyección de metadatos SEO + Fallback Open Graph.
 */
export class BlogPost {
  static FALLBACK_OG_IMAGE = '/logo.png'; // RF-10: Constante I_fallback = URI del logotipo corporativo
  static SEO_TITLE_MAX = 60;              // RF-10 Precondición 2: 0 < len(t) <= 60
  static SEO_DESC_MAX = 160;              // RF-10 Precondición 2: 0 < len(d) <= 160

  constructor({
    id = null,
    slug = '',
    title_es = '',
    title_en = '',
    excerpt_es = '',
    excerpt_en = '',
    content_es = [],
    content_en = [],
    category_es = 'Comercio Exterior',
    category_en = 'Foreign Trade',
    read_time_es = '5 min de lectura',
    read_time_en = '5 min read',
    author = 'Equipo Servi Proce',
    image_url = '',
    seo_title_es = '',
    seo_title_en = '',
    seo_desc_es = '',
    seo_desc_en = '',
    og_image_url = '',
    published_at = null,
  }) {
    this.id = id;
    this.title_es = SanitizationService.sanitizeText(title_es);
    this.title_en = SanitizationService.sanitizeText(title_en);
    if (!this.title_es) {
      throw new Error('BLOG_TITLE_REQUIRED: El título en español es obligatorio (RF-07).');
    }

    // Normalización del slug según RF-09 (alfabeto seguro [a-z0-9-])
    const rawSlug = slug || this.title_es;
    this.slug = SanitizationService.normalizeFilename(rawSlug).baseName;

    this.excerpt_es = SanitizationService.sanitizeText(excerpt_es);
    this.excerpt_en = SanitizationService.sanitizeText(excerpt_en);

    this.content_es = BlogPost.#normalizeParagraphs(content_es);
    this.content_en = BlogPost.#normalizeParagraphs(content_en);
    if (this.content_es.length === 0) {
      throw new Error('BLOG_CONTENT_REQUIRED: El contenido del artículo en español es obligatorio (RF-07).');
    }

    this.category_es = SanitizationService.sanitizeText(category_es || 'Comercio Exterior');
    this.category_en = SanitizationService.sanitizeText(category_en || 'Foreign Trade');
    this.read_time_es = SanitizationService.sanitizeText(read_time_es || '5 min de lectura');
    this.read_time_en = SanitizationService.sanitizeText(read_time_en || '5 min read');
    this.author = SanitizationService.sanitizeText(author || 'Equipo Servi Proce');
    this.image_url = SanitizationService.sanitizeText(image_url) || BlogPost.FALLBACK_OG_IMAGE;

    // RF-10: Límites de indexabilidad SEO (0 < len(t) <= 60 y 0 < len(d) <= 160)
    const rawSeoTitleEs = SanitizationService.sanitizeText(seo_title_es || this.title_es);
    const rawSeoTitleEn = SanitizationService.sanitizeText(seo_title_en || this.title_en || this.title_es);
    const rawSeoDescEs = SanitizationService.sanitizeText(seo_desc_es || this.excerpt_es || this.content_es[0] || this.title_es);
    const rawSeoDescEn = SanitizationService.sanitizeText(seo_desc_en || this.excerpt_en || this.content_en[0] || rawSeoDescEs);

    this.seo_title_es = rawSeoTitleEs.slice(0, BlogPost.SEO_TITLE_MAX);
    this.seo_title_en = rawSeoTitleEn.slice(0, BlogPost.SEO_TITLE_MAX);
    this.seo_desc_es = rawSeoDescEs.slice(0, BlogPost.SEO_DESC_MAX);
    this.seo_desc_en = rawSeoDescEn.slice(0, BlogPost.SEO_DESC_MAX);

    // RF-10 Postcondición 1: Resolución de Fallback Automático para Open Graph
    const cleanOg = SanitizationService.sanitizeText(og_image_url || this.image_url);
    this.og_image_url = cleanOg || BlogPost.FALLBACK_OG_IMAGE;

    this.published_at = published_at || new Date().toISOString().slice(0, 10);
  }

  static #normalizeParagraphs(input) {
    if (Array.isArray(input)) {
      return input
        .map((p) => SanitizationService.sanitizeText(p))
        .filter(Boolean);
    }
    if (typeof input === 'string') {
      return input
        .split(/\r?\n\r?\n|\r?\n/)
        .map((p) => SanitizationService.sanitizeText(p))
        .filter(Boolean);
    }
    return [];
  }

  toPublicJSON(locale = 'es') {
    const isEn = locale === 'en';
    const title = (isEn && this.title_en) ? this.title_en : this.title_es;
    const excerpt = (isEn && this.excerpt_en) ? this.excerpt_en : this.excerpt_es;
    const content = (isEn && this.content_en?.length > 0) ? this.content_en : this.content_es;
    const seoTitle = (isEn && this.seo_title_en) ? this.seo_title_en : this.seo_title_es;
    const seoDesc = (isEn && this.seo_desc_en) ? this.seo_desc_en : this.seo_desc_es;

    return {
      id: this.id,
      slug: this.slug,
      title,
      excerpt,
      content,
      date: this.published_at,
      author: this.author,
      readTime: (isEn && this.read_time_en) ? this.read_time_en : this.read_time_es,
      category: (isEn && this.category_en) ? this.category_en : this.category_es,
      imageUrl: this.image_url || BlogPost.FALLBACK_OG_IMAGE,
      seo: {
        title: seoTitle.slice(0, BlogPost.SEO_TITLE_MAX),
        description: seoDesc.slice(0, BlogPost.SEO_DESC_MAX),
        ogImage: this.og_image_url || this.image_url || BlogPost.FALLBACK_OG_IMAGE,
      },
    };
  }
}
