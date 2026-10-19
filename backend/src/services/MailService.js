import fs from 'node:fs/promises';
import path from 'node:path';
import { envConfig } from '../config/EnvironmentConfig.js';
import { quotationLogRepository } from '../repositories/ContentRepository.js';

/**
 * Servicio Orientado a Objetos para Envío de Correos SMTP y Cola de Mensajes (RF-01, Sección 2.1.6, 2.1.8.3 y 3.1.3.2 del ERS)
 *  - Utiliza Nodemailer sobre SMTP (puertos seguros 465 o 587 con TLS).
 *  - Encola automáticamente envíos fallidos para reintento (Sección 2.1.8.3).
 *  - Si no hay credenciales SMTP en .env, almacena el respaldo en database/mail_outbox/ para inspección local.
 */
export class MailService {
  #retryQueue = [];
  #outboxDir;

  constructor() {
    this.#outboxDir = path.join(envConfig.rootDir, 'database', 'mail_outbox');
  }

  /**
   * Construye el cuerpo HTML corporativo de la solicitud de cotización (Sin costos según RF-01 / RF-06)
   */
  static buildQuotationHtml(quotation) {
    const filesHtml = quotation.files?.length > 0
      ? `<ul>${quotation.files.map((f) => `<li>${f}</li>`).join('')}</ul>`
      : '<p><em>Sin documentos adjuntos (El cliente requiere orientación de un asesor).</em></p>';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <div style="max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #0b1120; color: #ffffff; padding: 20px 24px; border-bottom: 3px solid #9d0000;">
            <h2 style="margin: 0; font-size: 20px;">Nueva Solicitud de Cotización — SERVI PROCE</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Folio de seguimiento: <strong>${quotation.reference}</strong></p>
          </div>
          <div style="padding: 24px;">
            <h3 style="margin-top: 0; color: #9d0000;">Datos del Prospecto Comercial</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 160px;">Nombre:</td><td>${quotation.name}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Correo Electrónico:</td><td><a href="mailto:${quotation.email}">${quotation.email}</a></td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Teléfono:</td><td>${quotation.phone || 'No especificado'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Empresa:</td><td>${quotation.company || 'No especificada'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Servicio Seleccionado:</td><td><strong>${quotation.service}</strong></td></tr>
              ${quotation.operation ? `<tr><td style="padding: 6px 0; font-weight: bold;">Operación / Modo:</td><td>${quotation.operation} / ${quotation.mode}</td></tr>` : ''}
              ${quotation.country ? `<tr><td style="padding: 6px 0; font-weight: bold;">País / Industria:</td><td>${quotation.country} / ${quotation.industry}</td></tr>` : ''}
              ${quotation.hazmat ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #b91c1c;">Mercancía Peligrosa:</td><td>SÍ (HAZMAT)</td></tr>` : ''}
            </table>
            ${quotation.description ? `<h4 style="margin-bottom: 6px;">Descripción / Comentarios:</h4><p style="background: #f8fafc; padding: 12px; border-radius: 6px;">${quotation.description}</p>` : ''}
            <h4 style="margin-bottom: 6px;">Documentación Adjunta:</h4>
            ${filesHtml}
          </div>
          <div style="background: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b;">
            Mensaje generado automáticamente por el Sistema Web de Servi Proce conforme al RF-01 del ERS. Score reCAPTCHA: ${quotation.recaptchaScore}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envía la notificación de cotización por SMTP o la registra en el buzón de respaldo local
   */
  async sendQuotationNotification(quotation, attachments = []) {
    const smtpConfig = envConfig.smtp;
    const html = MailService.buildQuotationHtml(quotation);
    const subject = `[Servi Proce ${quotation.reference}] Solicitud de Cotización: ${quotation.service} - ${quotation.name}`;

    // Si no hay servidor SMTP configurado aún en .env, guardar en outbox local de respaldo
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      await fs.mkdir(this.#outboxDir, { recursive: true });
      const outboxFile = path.join(this.#outboxDir, `${quotation.reference}.json`);
      await fs.writeFile(
        outboxFile,
        JSON.stringify(
          {
            to: smtpConfig.salesEmail,
            from: smtpConfig.from,
            replyTo: quotation.email,
            subject,
            html,
            createdAt: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf8'
      );
      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'saved_local_outbox');
      console.log(`[MailService] (Modo Respaldo sin credenciales SMTP) Correo guardado en ${outboxFile}`);
      return { sent: true, mode: 'local_outbox' };
    }

    try {
      const nodemailer = await import('nodemailer');
      const createTransport = nodemailer.default?.createTransport || nodemailer.createTransport;

      const transporter = createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465, // Puerto 465 SSL directo o 587 STARTTLS (Sección 3.1.4)
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
      });

      await transporter.sendMail({
        from: smtpConfig.from,
        to: smtpConfig.salesEmail,
        replyTo: quotation.email,
        subject,
        html,
        attachments,
      });

      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'sent_smtp');
      return { sent: true, mode: 'smtp' };
    } catch (err) {
      console.error(`[MailService] Fallo temporal SMTP para ${quotation.reference}, encolando reintento:`, err.message);
      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'queued_retry');
      this.#enqueueRetry(quotation, attachments);
      return { sent: false, mode: 'queued_retry', error: err.message };
    }
  }

  /**
   * Sección 2.1.8.3: Encolamiento de Correos (Cola de mensajes con reintento automático)
   */
  #enqueueRetry(quotation, attachments, attempt = 1) {
    if (attempt > 3) {
      quotationLogRepository.updateSmtpStatus(quotation.reference, 'failed_smtp').catch(() => {});
      return;
    }

    const delayMs = attempt * 30_000;
    const timer = setTimeout(async () => {
      const res = await this.sendQuotationNotification(quotation, attachments);
      if (!res.sent && attempt < 3) {
        this.#enqueueRetry(quotation, attachments, attempt + 1);
      }
    }, delayMs);

    if (timer.unref) timer.unref();
    this.#retryQueue.push({ reference: quotation.reference, attempt });
  }
}

export const mailService = new MailService();
