import { dbManager } from '../database/DatabaseManager.js';
import { Promotion } from '../models/Promotion.js';

/**
 * Clase PromotionCronService (RF-02 y Sección 2.1.8.2 del ERS)
 * Ejecuta rutinas automatizadas en segundo plano (Cron Jobs) para auditar la fecha de publicación
 * original (t0) de las promociones y avisos, ocultándolos automáticamente al cumplirse exactamente
 * un año (365 días) de su vigencia.
 */
export class PromotionCronService {
  #intervalId = null;
  static CHECK_INTERVAL_MS = 60 * 60 * 1000; // Verificación cada hora + ejecución de arranque

  /**
   * Inicializa el Cron Job en memoria al arrancar el servidor Backend (Sección 2.1.9.1)
   */
  async start() {
    await this.auditAndExpirePromotions();

    if (this.#intervalId) clearInterval(this.#intervalId);
    this.#intervalId = setInterval(() => {
      this.auditAndExpirePromotions().catch((err) =>
        console.error('[PromotionCronService] Error en auditoría programada:', err)
      );
    }, PromotionCronService.CHECK_INTERVAL_MS);

    if (this.#intervalId.unref) {
      this.#intervalId.unref();
    }
  }

  stop() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }

  /**
   * RF-02 Postcondiciones 1, 2 y 3:
   * Si t_sys - t_0 >= 365 días => Estado_P = Oculto
   */
  async auditAndExpirePromotions(tSys = Date.now()) {
    const rows = await dbManager.query(
      'SELECT * FROM promotions WHERE status = $1',
      ['Publicado']
    );

    let expiredCount = 0;
    for (const row of rows) {
      const promo = new Promotion(row);
      if (promo.isExpired(tSys)) {
        await dbManager.query(
          'UPDATE promotions SET status = $1 WHERE id = $2',
          ['Oculto', promo.id]
        );
        expiredCount++;
      }
    }

    // También auditar avisos cuya fecha de caducidad o antigüedad de 365 días se haya cumplido
    const todayIso = new Date(tSys).toISOString().slice(0, 10);
    const oneYearAgoIso = new Date(tSys - Promotion.ONE_YEAR_MS).toISOString().slice(0, 10);
    await dbManager.query(
      'DELETE FROM avisos WHERE (expires_at != $1 AND expires_at < $2) OR published_at <= $3',
      ['', todayIso, oneYearAgoIso]
    );

    if (expiredCount > 0) {
      console.log(`[PromotionCronService] RF-02: ${expiredCount} promoción(es) ocultada(s) automáticamente tras cumplir 365 días.`);
    }

    return { audited: rows.length, expiredCount };
  }
}

export const promotionCronService = new PromotionCronService();
