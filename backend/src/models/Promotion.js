import { SanitizationService } from '../services/SanitizationService.js';

/**
 * Modelo de Dominio: Promotion (RF-02 del ERS)
 * Representa el vector P = (img, txt, t0) y evalúa la caducidad exacta a los 365 días.
 */
export class Promotion {
  static ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000; // Exactamente 365 días (RF-02)

  constructor({
    id = null,
    title_es = '',
    title_en = '',
    description_es = '',
    description_en = '',
    image_url = '',
    published_at = null,
    expires_at = null,
    status = 'Publicado',
  }) {
    this.id = id;
    this.title_es = SanitizationService.sanitizeText(title_es);
    this.title_en = SanitizationService.sanitizeText(title_en);
    this.description_es = SanitizationService.sanitizeText(description_es);
    this.description_en = SanitizationService.sanitizeText(description_en);
    this.image_url = SanitizationService.sanitizeText(image_url);

    // Precondición 2 de RF-02: img != empty OR txt != empty
    if (!this.image_url && !this.title_es && !this.description_es) {
      throw new Error('PROMOTION_EMPTY: La promoción requiere al menos texto descriptivo o imagen (RF-02).');
    }

    // Precondición 3 de RF-02: Registro temporal t0
    const t0Date = published_at ? new Date(published_at) : new Date();
    if (Number.isNaN(t0Date.getTime())) {
      throw new Error('PROMOTION_INVALID_DATE: Timestamp de publicación t0 inválido (RF-02).');
    }
    this.published_at = t0Date.toISOString();

    // Fecha de caducidad máxima forzosa a 1 año (365 días) desde t0
    const maxExpiryDate = new Date(t0Date.getTime() + Promotion.ONE_YEAR_MS);
    if (expires_at) {
      const customExpiry = new Date(expires_at);
      this.expires_at = (!Number.isNaN(customExpiry.getTime()) && customExpiry < maxExpiryDate)
        ? customExpiry.toISOString()
        : maxExpiryDate.toISOString();
    } else {
      this.expires_at = maxExpiryDate.toISOString();
    }

    this.status = this.isExpired() ? 'Oculto' : (status === 'Oculto' ? 'Oculto' : 'Publicado');
  }

  /**
   * RF-02 Postcondiciones 1 y 2:
   * Si t_sys - t_0 < 365 días => Estado_P = Publicado
   * Si t_sys - t_0 >= 365 días => Estado_P = Oculto
   */
  isExpired(tSys = Date.now()) {
    const t0 = new Date(this.published_at).getTime();
    const tExp = new Date(this.expires_at).getTime();
    const now = typeof tSys === 'number' ? tSys : new Date(tSys).getTime();
    return (now - t0) >= Promotion.ONE_YEAR_MS || now >= tExp;
  }

  toPublicJSON(locale = 'es') {
    const isEn = locale === 'en';
    return {
      id: this.id,
      title: (isEn && this.title_en) ? this.title_en : this.title_es,
      description: (isEn && this.description_en) ? this.description_en : this.description_es,
      imageUrl: this.image_url,
      publishedAt: this.published_at,
      validUntil: this.expires_at.slice(0, 10),
      status: this.status,
    };
  }
}
