import { envConfig } from '../config/EnvironmentConfig.js';

/**
 * Servicio Orientado a Objetos para Sincronización Desacoplada vía Webhook SSG (RF-07 Postcondición 3 y Sección 2.1.9.2.3)
 * Cuando una operación del administrador muta el estado (CREATE, UPDATE, DELETE),
 * emite una señal de red hacia el servidor de Frontend (Next.js) para invalidar la caché y regenerar las vistas.
 */
export class WebhookService {
  static async emitRevalidation({ entity, action, tags = [] }) {
    const webhookUrl = envConfig.frontendWebhookUrl;
    if (!webhookUrl) return { triggered: false };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': envConfig.webhookSecret,
        },
        body: JSON.stringify({
          entity,
          action,
          tags,
          timestamp: new Date().toISOString(),
        }),
      });

      return {
        triggered: true,
        status: response.status,
        ok: response.ok,
      };
    } catch (err) {
      // Si el servidor de Frontend no está encendido al momento del cambio, no interrumpe la transacción de BD
      console.warn(`[WebhookService] Aviso: No se pudo contactar Webhook SSG en ${webhookUrl} (${err.message})`);
      return {
        triggered: false,
        error: err.message,
      };
    }
  }
}
