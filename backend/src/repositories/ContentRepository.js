import crypto from 'node:crypto';
import { dbManager } from '../database/DatabaseManager.js';
import { Promotion } from '../models/Promotion.js';
import { BlogPost } from '../models/BlogPost.js';
import { SanitizationService } from '../services/SanitizationService.js';

/**
 * Repositorio Orientado a Objetos para Promociones (RF-02, RNF-05)
 */
export class PromotionRepository {
  async findActive(locale = 'es') {
    const rows = await dbManager.query(
      'SELECT * FROM promotions WHERE status = $1 ORDER BY published_at DESC',
      ['Publicado']
    );
    const active = [];
    for (const row of rows) {
      const promo = new Promotion(row);
      if (!promo.isExpired()) {
        active.push(promo.toPublicJSON(locale));
      } else {
        await dbManager.query('UPDATE promotions SET status = $1 WHERE id = $2', ['Oculto', promo.id]);
      }
    }
    return active;
  }

  async findAllAdmin() {
    return dbManager.query('SELECT * FROM promotions ORDER BY published_at DESC');
  }

  async create(data) {
    const promo = new Promotion({
      id: data.id || `promo-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
    });
    await dbManager.query(
      `INSERT INTO promotions (id, title_es, title_en, description_es, description_en, image_url, published_at, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        promo.id,
        promo.title_es,
        promo.title_en,
        promo.description_es,
        promo.description_en,
        promo.image_url,
        promo.published_at,
        promo.expires_at,
        promo.status,
      ]
    );
    return promo;
  }

  async update(id, data) {
    const existingRows = await dbManager.query('SELECT * FROM promotions WHERE id = $1', [id]);
    if (existingRows.length === 0) return null;
    const prev = existingRows[0];

    const promo = new Promotion({
      ...prev,
      ...data,
      id: prev.id,
      published_at: prev.published_at, // RF-02: Se preserva t0 original
    });

    await dbManager.query(
      `UPDATE promotions
       SET title_es = $1, title_en = $2, description_es = $3, description_en = $4,
           image_url = $5, expires_at = $6, status = $7
       WHERE id = $8`,
      [
        promo.title_es,
        promo.title_en,
        promo.description_es,
        promo.description_en,
        promo.image_url,
        promo.expires_at,
        promo.status,
        promo.id,
      ]
    );
    return promo;
  }

  async delete(id) {
    await dbManager.query('DELETE FROM promotions WHERE id = $1', [id]);
    return true;
  }
}

/**
 * Repositorio Orientado a Objetos para Artículos del Blog (RF-07, RF-10, RNF-05)
 */
export class BlogRepository {
  static #rowToModel(row) {
    return new BlogPost({
      ...row,
      content_es: JSON.parse(row.content_es_json || '[]'),
      content_en: JSON.parse(row.content_en_json || '[]'),
    });
  }

  async findAllPublic(locale = 'es') {
    const rows = await dbManager.query('SELECT * FROM blog_posts ORDER BY published_at DESC');
    return rows.map((r) => BlogRepository.#rowToModel(r).toPublicJSON(locale));
  }

  async findBySlugPublic(slug, locale = 'es') {
    const rows = await dbManager.query('SELECT * FROM blog_posts WHERE slug = $1 LIMIT 1', [slug]);
    if (rows.length === 0) return null;
    return BlogRepository.#rowToModel(rows[0]).toPublicJSON(locale);
  }

  async findAllAdmin() {
    const rows = await dbManager.query('SELECT * FROM blog_posts ORDER BY published_at DESC');
    return rows.map((r) => ({
      ...r,
      content_es: JSON.parse(r.content_es_json || '[]'),
      content_en: JSON.parse(r.content_en_json || '[]'),
    }));
  }

  async create(data) {
    const post = new BlogPost({
      id: data.id || `blog-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
    });

    // Garantizar unicidad del slug
    const slugCheck = await dbManager.query('SELECT id FROM blog_posts WHERE slug = $1', [post.slug]);
    if (slugCheck.length > 0) {
      post.slug = `${post.slug}-${crypto.randomUUID().slice(0, 4)}`;
    }

    await dbManager.query(
      `INSERT INTO blog_posts (
        id, slug, title_es, title_en, excerpt_es, excerpt_en,
        content_es_json, content_en_json, category_es, category_en,
        read_time_es, read_time_en, author, image_url,
        seo_title_es, seo_title_en, seo_desc_es, seo_desc_en, og_image_url, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        post.id,
        post.slug,
        post.title_es,
        post.title_en,
        post.excerpt_es,
        post.excerpt_en,
        JSON.stringify(post.content_es),
        JSON.stringify(post.content_en),
        post.category_es,
        post.category_en,
        post.read_time_es,
        post.read_time_en,
        post.author,
        post.image_url,
        post.seo_title_es,
        post.seo_title_en,
        post.seo_desc_es,
        post.seo_desc_en,
        post.og_image_url,
        post.published_at,
      ]
    );
    return post;
  }

  async update(id, data) {
    const existingRows = await dbManager.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (existingRows.length === 0) return null;
    const prev = existingRows[0];

    const post = new BlogPost({
      ...prev,
      content_es: data.content_es ?? JSON.parse(prev.content_es_json || '[]'),
      content_en: data.content_en ?? JSON.parse(prev.content_en_json || '[]'),
      ...data,
      id: prev.id,
    });

    await dbManager.query(
      `UPDATE blog_posts
       SET slug = $1, title_es = $2, title_en = $3, excerpt_es = $4, excerpt_en = $5,
           content_es_json = $6, content_en_json = $7, category_es = $8, category_en = $9,
           read_time_es = $10, read_time_en = $11, author = $12, image_url = $13,
           seo_title_es = $14, seo_title_en = $15, seo_desc_es = $16, seo_desc_en = $17,
           og_image_url = $18
       WHERE id = $19`,
      [
        post.slug,
        post.title_es,
        post.title_en,
        post.excerpt_es,
        post.excerpt_en,
        JSON.stringify(post.content_es),
        JSON.stringify(post.content_en),
        post.category_es,
        post.category_en,
        post.read_time_es,
        post.read_time_en,
        post.author,
        post.image_url,
        post.seo_title_es,
        post.seo_title_en,
        post.seo_desc_es,
        post.seo_desc_en,
        post.og_image_url,
        post.id,
      ]
    );
    return post;
  }

  async delete(id) {
    await dbManager.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    return true;
  }
}

/**
 * Repositorio Orientado a Objetos para Noticias, Leyes y Avisos (RF-02, RF-07, RNF-05)
 */
export class AvisoRepository {
  static ALLOWED_TYPES = ['noticia', 'ley', 'aviso'];

  async findAllPublic(locale = 'es', { type, limit } = {}) {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await dbManager.query(
      'SELECT * FROM avisos ORDER BY pinned DESC, published_at DESC'
    );

    let list = rows.filter((a) => !a.expires_at || a.expires_at >= today);
    if (type && AvisoRepository.ALLOWED_TYPES.includes(type)) {
      list = list.filter((a) => a.type === type);
    }
    if (limit) {
      list = list.slice(0, Number(limit));
    }

    return list.map((a) => ({
      id: a.id,
      type: a.type,
      title: (locale === 'en' && a.title_en) ? a.title_en : a.title_es,
      body: (locale === 'en' && a.body_en) ? a.body_en : a.body_es,
      sourceUrl: a.source_url || '',
      publishedAt: a.published_at,
      expiresAt: a.expires_at,
      pinned: Boolean(a.pinned),
    }));
  }

  async findAllAdmin() {
    const rows = await dbManager.query('SELECT * FROM avisos ORDER BY pinned DESC, published_at DESC');
    return rows.map((a) => ({
      id: a.id,
      type: a.type,
      title_es: a.title_es,
      title_en: a.title_en,
      body_es: a.body_es,
      body_en: a.body_en,
      sourceUrl: a.source_url,
      publishedAt: a.published_at,
      expiresAt: a.expires_at,
      pinned: Boolean(a.pinned),
    }));
  }

  async create(data) {
    const type = AvisoRepository.ALLOWED_TYPES.includes(data.type) ? data.type : 'aviso';
    const title_es = SanitizationService.sanitizeText(data.title_es);
    const body_es = SanitizationService.sanitizeText(data.body_es);
    if (!title_es || !body_es) {
      throw new Error('AVISO_INVALID: Título y texto en español son obligatorios.');
    }

    const publishedAt = new Date().toISOString().slice(0, 10);
    const maxOneYear = new Date(Date.now() + Promotion.ONE_YEAR_MS).toISOString().slice(0, 10);
    const expiresAt = (data.expiresAt && data.expiresAt <= maxOneYear) ? data.expiresAt : maxOneYear;

    const item = {
      id: crypto.randomUUID().slice(0, 8),
      type,
      title_es,
      title_en: SanitizationService.sanitizeText(data.title_en || ''),
      body_es,
      body_en: SanitizationService.sanitizeText(data.body_en || ''),
      sourceUrl: SanitizationService.sanitizeText(data.sourceUrl || ''),
      publishedAt,
      expiresAt,
      pinned: Boolean(data.pinned),
    };

    await dbManager.query(
      `INSERT INTO avisos (id, type, title_es, title_en, body_es, body_en, source_url, published_at, expires_at, pinned)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        item.id,
        item.type,
        item.title_es,
        item.title_en,
        item.body_es,
        item.body_en,
        item.sourceUrl,
        item.publishedAt,
        item.expiresAt,
        item.pinned ? 1 : 0,
      ]
    );
    return item;
  }

  async update(id, data) {
    const rows = await dbManager.query('SELECT * FROM avisos WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const prev = rows[0];

    const type = AvisoRepository.ALLOWED_TYPES.includes(data.type) ? data.type : prev.type;
    const title_es = SanitizationService.sanitizeText(data.title_es ?? prev.title_es);
    const body_es = SanitizationService.sanitizeText(data.body_es ?? prev.body_es);
    const title_en = SanitizationService.sanitizeText(data.title_en ?? prev.title_en);
    const body_en = SanitizationService.sanitizeText(data.body_en ?? prev.body_en);
    const sourceUrl = SanitizationService.sanitizeText(data.sourceUrl ?? prev.source_url);
    const expiresAt = SanitizationService.sanitizeText(data.expiresAt || prev.expires_at);
    const pinned = data.pinned !== undefined ? Boolean(data.pinned) : Boolean(prev.pinned);

    await dbManager.query(
      `UPDATE avisos
       SET type = $1, title_es = $2, title_en = $3, body_es = $4, body_en = $5,
           source_url = $6, expires_at = $7, pinned = $8
       WHERE id = $9`,
      [type, title_es, title_en, body_es, body_en, sourceUrl, expiresAt, pinned ? 1 : 0, id]
    );

    return { id, type, title_es, title_en, body_es, body_en, sourceUrl, publishedAt: prev.published_at, expiresAt, pinned };
  }

  async delete(id) {
    await dbManager.query('DELETE FROM avisos WHERE id = $1', [id]);
    return true;
  }
}

/**
 * Repositorio de Solo Lectura/Anexo para Historial de Cotizaciones (RF-01, Sección 2.1.8.3 y 3.1.1)
 * Cumple: DB_{t+1} = DB_t U {Log(V)} (El registro se anexa sin alterar el estado previo).
 */
export class QuotationLogRepository {
  async appendLog(quotationRequest, smtpStatus = 'sent') {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await dbManager.query(
      `INSERT INTO quotation_logs (
        id, reference, name, email, phone, company, service,
        operation, mode, country, industry, description, hazmat,
        files_json, recaptcha_score, smtp_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        id,
        quotationRequest.reference,
        quotationRequest.name,
        quotationRequest.email,
        quotationRequest.phone,
        quotationRequest.company,
        quotationRequest.service,
        quotationRequest.operation,
        quotationRequest.mode,
        quotationRequest.country,
        quotationRequest.industry,
        quotationRequest.description,
        quotationRequest.hazmat ? 1 : 0,
        JSON.stringify(quotationRequest.files),
        quotationRequest.recaptchaScore,
        smtpStatus,
        createdAt,
      ]
    );

    return { id, reference: quotationRequest.reference, createdAt, smtpStatus };
  }

  async updateSmtpStatus(reference, smtpStatus) {
    await dbManager.query(
      'UPDATE quotation_logs SET smtp_status = $1 WHERE reference = $2',
      [smtpStatus, reference]
    );
  }

  async findAllReadOnly() {
    const rows = await dbManager.query('SELECT * FROM quotation_logs ORDER BY created_at DESC');
    return rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      service: r.service,
      operation: r.operation,
      mode: r.mode,
      country: r.country,
      industry: r.industry,
      description: r.description,
      hazmat: Boolean(r.hazmat),
      files: JSON.parse(r.files_json || '[]'),
      recaptchaScore: r.recaptcha_score,
      smtpStatus: r.smtp_status,
      createdAt: r.created_at,
    }));
  }
}

export const promotionRepository = new PromotionRepository();
export const blogRepository = new BlogRepository();
export const avisoRepository = new AvisoRepository();
export const quotationLogRepository = new QuotationLogRepository();
