import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { envConfig } from '../config/EnvironmentConfig.js';
import { quotationLogRepository } from '../repositories/ContentRepository.js';

/**
 * Servicio Orientado a Objetos para Envío de Correos SMTP y Cola de Mensajes (RF-01, Sección 2.1.6, 2.1.8.3 y 3.1.3.2 del ERS)
 *  - Utiliza Nodemailer sobre SMTP (puertos seguros 465 o 587 con TLS).
 *  - Encola automáticamente envíos fallidos para reintento (Sección 2.1.8.3).
 *  - Guarda siempre una copia HTML/JSON en database/mail_outbox/ para que el Administrador pueda visualizar
 *    el correo exacto desde la tabla de Historial de Cotizaciones (Log).
 */
export class MailService {
  #retryQueue = [];

  get outboxDir() {
    return path.join(envConfig.storageRootDir, 'database', 'mail_outbox');
  }

  /**
   * Construye el cuerpo HTML corporativo de la solicitud de cotización (Sin costos según RF-01 / RF-06)
   */
  static buildQuotationHtml(quotation) {
    const filesHtml = quotation.files?.length > 0
      ? `<ul>${quotation.files.map((f) => `<li><a href="http://localhost:${envConfig.port}/api/quotations/${quotation.reference}/files/${encodeURIComponent(f)}" target="_blank">${f}</a></li>`).join('')}</ul>`
      : '<p><em>Sin documentos adjuntos (El cliente requiere orientación de un asesor).</em></p>';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Cotización ${quotation.reference} — Servi Proce</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.08);">
          <div style="background: #0b1120; color: #ffffff; padding: 22px 28px; border-bottom: 4px solid #9d0000;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px;">Notificación Automática SMTP (RF-01)</div>
            <h2 style="margin: 0; font-size: 21px;">Nueva Solicitud de Cotización — SERVI PROCE</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Folio de seguimiento: <strong style="color: #ffffff;">${quotation.reference}</strong></p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #f1f5f9; border-left: 4px solid #0b1120; padding: 10px 14px; margin-bottom: 20px; font-size: 13px;">
              <strong>Destinatarios (Ventas):</strong> ${envConfig.smtp.salesEmail}<br/>
              <strong>Responder a (Prospecto):</strong> <a href="mailto:${quotation.email}">${quotation.email}</a>
            </div>
            <h3 style="margin-top: 0; color: #9d0000; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Datos del Prospecto Comercial</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; font-weight: bold; width: 170px;">Nombre Completo:</td><td>${quotation.name}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Correo Electrónico:</td><td><a href="mailto:${quotation.email}">${quotation.email}</a></td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Teléfono:</td><td>${quotation.phone || 'No especificado'}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Empresa:</td><td>${quotation.company || 'No especificada'}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Servicio Seleccionado:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 999px; font-weight: bold; font-size: 13px;">${quotation.service}</span></td></tr>
              ${quotation.operation ? `<tr><td style="padding: 7px 0; font-weight: bold;">Operación / Modalidad:</td><td>${quotation.operation.toUpperCase()} / ${quotation.mode.toUpperCase()}</td></tr>` : ''}
              ${quotation.country ? `<tr><td style="padding: 7px 0; font-weight: bold;">País Origen/Destino:</td><td>${quotation.country} (${quotation.industry || 'General'})</td></tr>` : ''}
              ${quotation.hazmat ? `<tr><td style="padding: 7px 0; font-weight: bold; color: #b91c1c;">Mercancía Peligrosa:</td><td><strong style="color: #b91c1c;">SÍ (HAZMAT - Requiere MSDS)</strong></td></tr>` : ''}
            </table>
            ${quotation.description ? `<h4 style="margin: 20px 0 6px; color: #0f172a;">Descripción de la Carga / Requerimiento:</h4><p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-top: 0;">${quotation.description}</p>` : ''}
            <h4 style="margin: 20px 0 6px; color: #0f172a;">Documentación Adjunta (Sanitizada según RF-09):</h4>
            ${filesHtml}
          </div>
          <div style="background: #0f172a; padding: 14px 28px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Cumplimiento Normativo LFPDPPP • Regla de Cero Costos (RF-01) • Validación reCAPTCHA Score: ${quotation.recaptchaScore}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Construye el correo HTML de confirmación / acuse de recibo para el cliente que solicitó la cotización
   */
  static buildClientConfirmationHtml(quotation) {
    const filesCount = quotation.files?.length || 0;
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Confirmación de Solicitud ${quotation.reference} — Servi Proce</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.08);">
          <div style="background: #0b1120; color: #ffffff; padding: 22px 28px; border-bottom: 4px solid #9d0000;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px;">SERVI PROCE • Logística y Despacho Aduanal</div>
            <h2 style="margin: 0; font-size: 21px;">Hemos recibido su solicitud de cotización</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Folio de seguimiento: <strong style="color: #ffffff;">${quotation.reference}</strong></p>
          </div>
          <div style="padding: 28px;">
            <p style="margin-top: 0; font-size: 15px;">Estimado(a) <strong>${quotation.name}</strong>,</p>
            <p style="font-size: 14px; color: #334155;">
              Gracias por contactar a <strong>Servi Proce</strong>. Confirmamos la recepción de los datos de su operación. Un ejecutivo especializado ya cuenta con su requerimiento y se pondrá en contacto con usted a la brevedad para brindarle atención personalizada.
            </p>
            <h3 style="margin-top: 22px; color: #9d0000; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 16px;">Resumen de su Solicitud</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; font-weight: bold; width: 170px;">Folio:</td><td><strong>${quotation.reference}</strong></td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Servicio:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 999px; font-weight: bold; font-size: 13px;">${quotation.service}</span></td></tr>
              ${quotation.operation ? `<tr><td style="padding: 7px 0; font-weight: bold;">Operación / Modalidad:</td><td>${quotation.operation.toUpperCase()} / ${quotation.mode.toUpperCase()}</td></tr>` : ''}
              ${quotation.country ? `<tr><td style="padding: 7px 0; font-weight: bold;">País Origen/Destino:</td><td>${quotation.country} (${quotation.industry || 'General'})</td></tr>` : ''}
              <tr><td style="padding: 7px 0; font-weight: bold;">Archivos Adjuntos:</td><td>${filesCount > 0 ? `${filesCount} documento(s) recibido(s)` : 'Sin adjuntos'}</td></tr>
            </table>
            ${quotation.description ? `<h4 style="margin: 18px 0 6px; color: #0f172a; font-size: 14px;">Detalles registrados:</h4><p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-top: 0; font-size: 13px;">${quotation.description}</p>` : ''}
            <div style="margin-top: 24px; padding: 14px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #475569;">
              <strong>Contacto directo Servi Proce:</strong><br/>
              Correo de atención: <a href="mailto:customerservice@serviproce.com.mx" style="color: #9d0000;">customerservice@serviproce.com.mx</a>
            </div>
          </div>
          <div style="background: #0f172a; padding: 14px 28px; font-size: 12px; color: #94a3b8;">
            <span>© ${new Date().getFullYear()} Servi Proce • Cumplimiento Normativo LFPDPPP</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtiene el HTML del correo enviado/generado para vista previa desde el Panel Admin
   */
  async getEmailPreviewHtml(reference) {
    const htmlFile = path.join(this.outboxDir, `${reference}.html`);
    if (fsSync.existsSync(htmlFile)) {
      return fs.readFile(htmlFile, 'utf8');
    }
    return null;
  }

  /**
   * Envía la notificación de cotización por SMTP y guarda copia verificable en mail_outbox
   */
  async sendQuotationNotification(quotation, attachments = []) {
    const smtpConfig = envConfig.smtp;
    const html = MailService.buildQuotationHtml(quotation);
    const subject = `[Servi Proce ${quotation.reference}] Solicitud de Cotización: ${quotation.service} - ${quotation.name}`;

    // Guardar copia auditable del correo HTML y metadatos
    await fs.mkdir(this.outboxDir, { recursive: true });
    const outboxHtmlFile = path.join(this.outboxDir, `${quotation.reference}.html`);
    const outboxJsonFile = path.join(this.outboxDir, `${quotation.reference}.json`);
    await fs.writeFile(outboxHtmlFile, html, 'utf8');
    await fs.writeFile(
      outboxJsonFile,
      JSON.stringify(
        {
          reference: quotation.reference,
          to: smtpConfig.salesEmail,
          from: smtpConfig.from,
          replyTo: quotation.email,
          subject,
          attachments: quotation.files || [],
          createdAt: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf8'
    );

    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'ready_html_outbox');
      return {
        sent: true,
        mode: 'ready_html_outbox',
        previewUrl: `http://localhost:${envConfig.port}/api/quotations/${quotation.reference}/email-preview`,
      };
    }

    try {
      const nodemailer = await import('nodemailer');
      const createTransport = nodemailer.default?.createTransport || nodemailer.createTransport;

      const transporter = createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
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

      // Enviar también correo de confirmación (acuse de recibo) directamente al cliente/prospecto
      const isMockTestEmail = /@(exportadora\.com\.mx|example\.com|test\.com)$/i.test(quotation.email || '');
      if (quotation.email && !isMockTestEmail) {
        const clientHtml = MailService.buildClientConfirmationHtml(quotation);
        const clientSubject = `[Servi Proce] Confirmación de Solicitud de Cotización (${quotation.reference})`;
        await transporter.sendMail({
          from: smtpConfig.from,
          to: quotation.email,
          replyTo: 'customerservice@serviproce.com.mx',
          subject: clientSubject,
          html: clientHtml,
        });
      }

      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'sent_smtp');
      return {
        sent: true,
        mode: 'smtp',
        previewUrl: `http://localhost:${envConfig.port}/api/quotations/${quotation.reference}/email-preview`,
      };
    } catch (err) {
      console.error(`[MailService] Fallo temporal SMTP para ${quotation.reference}, encolando reintento:`, err.message);
      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'queued_retry');
      this.#enqueueRetry(quotation, attachments);
      return { sent: false, mode: 'queued_retry', error: err.message };
    }
  }

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
