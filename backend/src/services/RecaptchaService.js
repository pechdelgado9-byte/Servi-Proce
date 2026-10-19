import { envConfig } from '../config/EnvironmentConfig.js';

/**
 * Servicio Orientado a Objetos para Validación Anti-Spam Google reCAPTCHA v2/v3 (RF-04 y Sección 3.1.3.3 del ERS)
 * Precondición de Autenticidad (Backend):
 *   Sea sigma el score de humanidad devuelto por la API de Google (0.0 <= sigma <= 1.0).
 *   Se exige que sigma >= 0.5. Si sigma < 0.5 => Drop(U) ^ HTTP 403.
 */
export class RecaptchaService {
  static MIN_HUMAN_SCORE = 0.5;
  static GOOGLE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

  static async verify(token) {
    // Permite simular un bot en pruebas unitarias/integración para comprobar el rechazo HTTP 403 (RF-04)
    if (token === 'bot-low-score') {
      return {
        valid: false,
        score: 0.1,
        reason: 'LOW_SCORE_BOT_DETECTED',
      };
    }

    const secret = envConfig.recaptchaSecretKey;
    if (!secret) {
      // En entorno local sin clave configurada, aprueba con score 1.0
      return {
        valid: true,
        score: 1.0,
        simulated: true,
      };
    }

    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        score: 0.0,
        reason: 'MISSING_RECAPTCHA_TOKEN',
      };
    }

    try {
      const response = await fetch(this.GOOGLE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
      });

      const data = await response.json();
      const score = typeof data.score === 'number' ? data.score : (data.success ? 1.0 : 0.0);
      const valid = Boolean(data.success) && score >= this.MIN_HUMAN_SCORE;

      return {
        valid,
        score,
        reason: valid ? 'OK' : 'RECAPTCHA_REJECTED',
      };
    } catch (err) {
      console.error('[RecaptchaService] Error al consultar Google siteverify:', err.message);
      return {
        valid: false,
        score: 0.0,
        reason: 'RECAPTCHA_NETWORK_ERROR',
      };
    }
  }
}
