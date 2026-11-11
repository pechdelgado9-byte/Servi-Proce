import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { envConfig } from '../config/EnvironmentConfig.js';
import { quotationLogRepository } from '../repositories/ContentRepository.js';
import { SanitizationService } from './SanitizationService.js';

/**
 * Servicio Orientado a Objetos para Envío de Correos SMTP y Cola de Mensajes
 *  - Utiliza Nodemailer sobre SMTP (puertos seguros 465 o 587 con TLS).
 *  - Encola automáticamente envíos fallidos para reintento.
 *  - Guarda siempre una copia HTML/JSON en database/mail_outbox/ para que el Administrador pueda visualizar
 *    el correo exacto desde la tabla de Historial de Cotizaciones (Log).
 */
export class MailService {
  #retryQueue = [];
  #cachedTransporter = null;
  #lastTransporterConfigKey = null;

  get outboxDir() {
    return path.join(envConfig.storageRootDir, 'database', 'mail_outbox');
  }

  /**
   * Obtiene o inicializa un transporter Nodemailer reutilizable en pool
   * con configuración resiliente para cPanel / CloudLinux / TLS.
   */
  async getTransporter() {
    const smtp = envConfig.smtp;
    if (!smtp.host || !smtp.user || !smtp.pass) {
      return null;
    }

    const currentKey = `${smtp.host}:${smtp.port}:${smtp.user}:${smtp.secure}`;
    if (this.#cachedTransporter && this.#lastTransporterConfigKey === currentKey) {
      return this.#cachedTransporter;
    }

    const nodemailer = await import('nodemailer');
    const createTransport = nodemailer.default?.createTransport || nodemailer.createTransport;

    this.#cachedTransporter = createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure, // true para 465, false para 587
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 15000, // 15 segundos
      greetingTimeout: 10000,   // 10 segundos
      socketTimeout: 30000,     // 30 segundos
      tls: {
        rejectUnauthorized: false, // Previene bloqueos por certificados compartidos / SNI en cPanel
        minVersion: 'TLSv1.2',
      },
    });

    this.#lastTransporterConfigKey = currentKey;
    return this.#cachedTransporter;
  }

  /**
   * Precalienta y verifica el pool de conexiones SMTP en segundo plano al arrancar el servidor
   */
  async prewarm() {
    const smtp = envConfig.smtp;
    if (!smtp.host || !smtp.user || !smtp.pass) {
      return;
    }
    try {
      const transporter = await this.getTransporter();
      if (transporter) {
        await transporter.verify();
        console.log(`[MailService] Pool SMTP precalentado y verificado con éxito (${smtp.host}:${smtp.port} [${smtp.user}]).`);
      }
    } catch (err) {
      console.warn(`[MailService] Aviso en precalentamiento SMTP: ${err.message}`);
    }
  }

  /**
   * Prueba en vivo la conexión SMTP autenticada
   */
  async verifySmtpConnection() {
    const smtp = envConfig.smtp;
    if (!smtp.host || !smtp.user || !smtp.pass) {
      return {
        configured: false,
        ok: false,
        message: 'Credenciales SMTP incompletas en .env (requiere SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).',
      };
    }

    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return {
        configured: true,
        ok: true,
        message: `Conexión SMTP exitosa con ${smtp.host}:${smtp.port} (${smtp.user}).`,
      };
    } catch (err) {
      return {
        configured: true,
        ok: false,
        error: err.code || 'SMTP_VERIFY_FAILED',
        message: err.message,
      };
    }
  }

  /**
   * Construye el cuerpo en Texto Plano de la cotización para paridad MIME RFC 2046
   * y eliminación de penalizaciones antispam / greylisting en Microsoft 365 y Gmail.
   */
  static buildQuotationPlainText(quotation) {
    const lines = [
      '================================================================',
      `NUEVA SOLICITUD DE COTIZACIÓN — SERVI PROCE (${quotation.reference})`,
      '================================================================',
      '',
      'DATOS DEL PROSPECTO COMERCIAL:',
      `• Folio de seguimiento: ${quotation.reference}`,
      `• Nombre Completo:     ${quotation.name}`,
      `• Correo Electrónico:  ${quotation.email}`,
      `• Teléfono:            ${quotation.phone || 'No especificado'}`,
      `• Empresa:             ${quotation.company || 'No especificada'}`,
      `• Servicio Solicitado: ${quotation.service}`,
    ];

    if (quotation.operation) {
      lines.push(`• Operación / Modalidad: ${quotation.operation.toUpperCase()} / ${(quotation.mode || '').toUpperCase()}`);
    }
    if (quotation.country) {
      lines.push(`• País Origen/Destino:   ${quotation.country} (${quotation.industry || 'General'})`);
    }
    if (quotation.hazmat) {
      lines.push('• Mercancía Peligrosa:   SÍ (HAZMAT - Requiere MSDS)');
    }
    if (quotation.description) {
      lines.push('', 'DESCRIPCIÓN DE LA CARGA / REQUERIMIENTO:', quotation.description);
    }
    if (quotation.files?.length > 0) {
      lines.push('', 'DOCUMENTACIÓN ADJUNTA:', ...quotation.files.map((f) => `  - ${f}`));
    }
    lines.push(
      '',
      '----------------------------------------------------------------',
      `Validación reCAPTCHA Score: ${quotation.recaptchaScore} | Cumplimiento LFPDPPP`,
      'Servi Proce — Logística y Despacho Aduanal'
    );
    return lines.join('\n');
  }

  /**
   * Construye el cuerpo HTML corporativo de la solicitud de cotización
   */
  static buildQuotationHtml(quotation) {
    const esc = (v) => SanitizationService.escapeHtml(v);
    const safeRef = esc(quotation.reference);
    const safeName = esc(quotation.name);
    const safeEmail = esc(quotation.email);
    const safePhone = esc(quotation.phone || 'No especificado');
    const safeCompany = esc(quotation.company || 'No especificada');
    const safeService = esc(quotation.service);
    const safeOperation = quotation.operation ? esc(quotation.operation.toUpperCase()) : '';
    const safeMode = quotation.mode ? esc(quotation.mode.toUpperCase()) : '';
    const safeCountry = quotation.country ? esc(quotation.country) : '';
    const safeIndustry = esc(quotation.industry || 'General');
    const safeDesc = quotation.description ? esc(quotation.description) : '';
    const safeScore = esc(quotation.recaptchaScore);
    const safeSalesEmail = esc(envConfig.smtp.salesEmail);

    const filesHtml = quotation.files?.length > 0
      ? `<ul>${quotation.files.map((f) => `<li><a href="/api/backend/quotations/${encodeURIComponent(quotation.reference)}/files/${encodeURIComponent(f)}" target="_blank" rel="noopener noreferrer">${esc(f)}</a></li>`).join('')}</ul>`
      : '<p><em>Sin documentos adjuntos (El cliente requiere orientación de un asesor).</em></p>';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Cotización ${safeRef} — Servi Proce</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.08);">
          <div style="background: #0b1120; color: #ffffff; padding: 22px 28px; border-bottom: 4px solid #9d0000;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px;">Notificación Automática de Cotización</div>
            <h2 style="margin: 0; font-size: 21px;">Nueva Solicitud de Cotización — SERVI PROCE</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Folio de seguimiento: <strong style="color: #ffffff;">${safeRef}</strong></p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #f1f5f9; border-left: 4px solid #0b1120; padding: 10px 14px; margin-bottom: 20px; font-size: 13px;">
              <strong>Destinatarios (Ventas):</strong> ${safeSalesEmail}<br/>
              <strong>Responder a (Prospecto):</strong> <a href="mailto:${safeEmail}">${safeEmail}</a>
            </div>
            <h3 style="margin-top: 0; color: #9d0000; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Datos del Prospecto Comercial</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; font-weight: bold; width: 170px;">Nombre Completo:</td><td>${safeName}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Correo Electrónico:</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Teléfono:</td><td>${safePhone}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Empresa:</td><td>${safeCompany}</td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Servicio Seleccionado:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 999px; font-weight: bold; font-size: 13px;">${safeService}</span></td></tr>
              ${safeOperation ? `<tr><td style="padding: 7px 0; font-weight: bold;">Operación / Modalidad:</td><td>${safeOperation} / ${safeMode}</td></tr>` : ''}
              ${safeCountry ? `<tr><td style="padding: 7px 0; font-weight: bold;">País Origen/Destino:</td><td>${safeCountry} (${safeIndustry})</td></tr>` : ''}
              ${quotation.hazmat ? `<tr><td style="padding: 7px 0; font-weight: bold; color: #b91c1c;">Mercancía Peligrosa:</td><td><strong style="color: #b91c1c;">SÍ (HAZMAT - Requiere MSDS)</strong></td></tr>` : ''}
            </table>
            ${safeDesc ? `<h4 style="margin: 20px 0 6px; color: #0f172a;">Descripción de la Carga / Requerimiento:</h4><p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-top: 0;">${safeDesc}</p>` : ''}
            <h4 style="margin: 20px 0 6px; color: #0f172a;">Documentación Adjunta:</h4>
            ${filesHtml}
          </div>
          <div style="background: #0f172a; padding: 14px 28px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Cumplimiento Normativo LFPDPPP • Validación reCAPTCHA Score: ${safeScore}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Construye el acuse de recibo en Texto Plano para el cliente (RFC 2046)
   */
  static buildClientConfirmationPlainText(quotation) {
    const lines = [
      '================================================================',
      'SERVI PROCE — CONFIRMACIÓN DE SOLICITUD DE COTIZACIÓN',
      '================================================================',
      '',
      `Estimado(a) ${quotation.name},`,
      '',
      'Gracias por contactar a Servi Proce. Confirmamos la recepción de',
      'los datos de su operación. Un ejecutivo especializado ya cuenta con su',
      'requerimiento y se pondrá en contacto con usted a la brevedad para',
      'brindarle atención personalizada.',
      '',
      'RESUMEN DE SU SOLICITUD:',
      `• Folio de seguimiento: ${quotation.reference}`,
      `• Servicio Solicitado:  ${quotation.service}`,
    ];

    if (quotation.operation) {
      lines.push(`• Operación / Modalidad: ${quotation.operation.toUpperCase()} / ${(quotation.mode || '').toUpperCase()}`);
    }
    if (quotation.country) {
      lines.push(`• País Origen/Destino:   ${quotation.country} (${quotation.industry || 'General'})`);
    }
    if (quotation.files?.length > 0) {
      lines.push(`• Archivos Adjuntos:     ${quotation.files.length} documento(s) recibido(s)`);
    }
    if (quotation.description) {
      lines.push('', 'Detalles registrados:', quotation.description);
    }
    lines.push(
      '',
      'CONTACTO DIRECTO SERVI PROCE:',
      'Correo de atención: customerservice@serviproce.com.mx',
      'Teléfono Oficina:   +52 (33) 1294-5451',
      '',
      '----------------------------------------------------------------',
      `© ${new Date().getFullYear()} Servi Proce. Cumplimiento Normativo LFPDPPP.`
    );
    return lines.join('\n');
  }

  /**
   * Construye el correo HTML de confirmación / acuse de recibo para el cliente que solicitó la cotización
   */
  static buildClientConfirmationHtml(quotation) {
    const esc = (v) => SanitizationService.escapeHtml(v);
    const safeRef = esc(quotation.reference);
    const safeName = esc(quotation.name);
    const safeService = esc(quotation.service);
    const safeOperation = quotation.operation ? esc(quotation.operation.toUpperCase()) : '';
    const safeMode = quotation.mode ? esc(quotation.mode.toUpperCase()) : '';
    const safeCountry = quotation.country ? esc(quotation.country) : '';
    const safeIndustry = esc(quotation.industry || 'General');
    const safeDesc = quotation.description ? esc(quotation.description) : '';
    const filesCount = quotation.files?.length || 0;
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Confirmación de Solicitud ${safeRef} — Servi Proce</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(15,23,42,0.08);">
          <div style="background: #0b1120; color: #ffffff; padding: 22px 28px; border-bottom: 4px solid #9d0000;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px;">SERVI PROCE • Logística y Despacho Aduanal</div>
            <h2 style="margin: 0; font-size: 21px;">Hemos recibido su solicitud de cotización</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Folio de seguimiento: <strong style="color: #ffffff;">${safeRef}</strong></p>
          </div>
          <div style="padding: 28px;">
            <p style="margin-top: 0; font-size: 15px;">Estimado(a) <strong>${safeName}</strong>,</p>
            <p style="font-size: 14px; color: #334155;">
              Gracias por contactar a <strong>Servi Proce</strong>. Confirmamos la recepción de los datos de su operación. Un ejecutivo especializado ya cuenta con su requerimiento y se pondrá en contacto con usted a la brevedad para brindarle atención personalizada.
            </p>
            <h3 style="margin-top: 22px; color: #9d0000; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 16px;">Resumen de su Solicitud</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 7px 0; font-weight: bold; width: 170px;">Folio:</td><td><strong>${safeRef}</strong></td></tr>
              <tr><td style="padding: 7px 0; font-weight: bold;">Servicio:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 3px 10px; border-radius: 999px; font-weight: bold; font-size: 13px;">${safeService}</span></td></tr>
              ${safeOperation ? `<tr><td style="padding: 7px 0; font-weight: bold;">Operación / Modalidad:</td><td>${safeOperation} / ${safeMode}</td></tr>` : ''}
              ${safeCountry ? `<tr><td style="padding: 7px 0; font-weight: bold;">País Origen/Destino:</td><td>${safeCountry} (${safeIndustry})</td></tr>` : ''}
              <tr><td style="padding: 7px 0; font-weight: bold;">Archivos Adjuntos:</td><td>${filesCount > 0 ? `${filesCount} documento(s) recibido(s)` : 'Sin adjuntos'}</td></tr>
            </table>
            ${safeDesc ? `<h4 style="margin: 18px 0 6px; color: #0f172a; font-size: 14px;">Detalles registrados:</h4><p style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-top: 0; font-size: 13px;">${safeDesc}</p>` : ''}
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
   * Soporta target='directors' (por defecto) o target='client'
   */
  async getEmailPreviewHtml(reference, target = 'directors') {
    const fileName = target === 'client' ? `${reference}_client.html` : `${reference}.html`;
    const htmlFile = path.join(this.outboxDir, fileName);
    if (fsSync.existsSync(htmlFile)) {
      return fs.readFile(htmlFile, 'utf8');
    }
    // Fallback al archivo principal si no existe el de cliente
    const fallbackFile = path.join(this.outboxDir, `${reference}.html`);
    if (fsSync.existsSync(fallbackFile)) {
      return fs.readFile(fallbackFile, 'utf8');
    }
    return null;
  }

  /**
   * Envía la notificación de cotización por SMTP de forma desacoplada y resiliente:
   * 1. Despacha a ambos directivos (customerservice@serviproce.com.mx y jorgebarrios@serviproce.com.mx).
   * 2. Despacha el correo de confirmación oficial al cliente.
   * 3. Registra copias auditables de ambos correos en mail_outbox/ (HTML y JSON detallado).
   */
  async sendQuotationNotification(quotation, attachments = []) {
    const smtpConfig = envConfig.smtp;
    const directorsEmails = smtpConfig.directorsEmails || ['customerservice@serviproce.com.mx', 'jorgebarrios@serviproce.com.mx'];
    const clientEmail = (quotation.email || '').trim().toLowerCase();

    // 1. Generar los cuerpos HTML y Texto Plano (Notificación comercial y Acuse de cliente)
    const directorsHtml = MailService.buildQuotationHtml(quotation);
    const directorsText = MailService.buildQuotationPlainText(quotation);
    const clientHtml = MailService.buildClientConfirmationHtml(quotation);
    const clientText = MailService.buildClientConfirmationPlainText(quotation);

    const directorsSubject = `[Servi Proce ${quotation.reference}] Solicitud de Cotización: ${quotation.service} - ${quotation.name}`;
    const clientSubject = `[Servi Proce ${quotation.reference}] Confirmación de Solicitud de Cotización`;

    // Cabeceras transaccionales estándar para evitar penalizaciones antispam y Greylisting en Microsoft 365 y Gmail
    const transactionalHeaders = {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'X-Priority': '1 (Highest)',
      'Importance': 'high',
      'X-MSMail-Priority': 'High',
      'Precedence': 'bulk',
      'X-ServiProce-Folio': quotation.reference,
    };

    // 2. Persistir copias físicas en el outbox local para auditoría y visualización
    await fs.mkdir(this.outboxDir, { recursive: true });
    const directorsHtmlFile = path.join(this.outboxDir, `${quotation.reference}.html`);
    const clientHtmlFile = path.join(this.outboxDir, `${quotation.reference}_client.html`);
    const outboxJsonFile = path.join(this.outboxDir, `${quotation.reference}.json`);

    await fs.writeFile(directorsHtmlFile, directorsHtml, 'utf8');
    await fs.writeFile(clientHtmlFile, clientHtml, 'utf8');

    // 3. Evaluar si el servidor SMTP está configurado en .env
    const transporter = await this.getTransporter();
    if (!transporter) {
      await quotationLogRepository.updateSmtpStatus(quotation.reference, 'ready_html_outbox');
      const outboxMetadata = {
        reference: quotation.reference,
        status: 'ready_html_outbox',
        directors: {
          recipients: directorsEmails,
          sent: false,
          offlineReason: 'SMTP_CREDENTIALS_NOT_CONFIGURED',
        },
        client: {
          recipient: clientEmail,
          sent: false,
          offlineReason: 'SMTP_CREDENTIALS_NOT_CONFIGURED',
        },
        createdAt: new Date().toISOString(),
      };
      await fs.writeFile(outboxJsonFile, JSON.stringify(outboxMetadata, null, 2), 'utf8');

      return {
        sent: true,
        mode: 'ready_html_outbox',
        directors: { sent: false, offline: true, recipients: directorsEmails },
        client: { sent: false, offline: true, recipient: clientEmail },
        previewUrl: `http://localhost:${envConfig.port}/api/quotations/${quotation.reference}/email-preview`,
      };
    }

    // 4. Despacho independiente y desacoplado mediante Promise.allSettled (Multipart RFC 2046)
    // Proteger el socket SMTP si los adjuntos son pesados (> 20 MB). Los servidores de correo (cPanel Exim / M365)
    // rechazan envíos mayores a 25 MB con '552 Message size exceeds fixed maximum'.
    // Los archivos ya están guardados en el disco local y se referencian mediante enlaces directos en el cuerpo.
    const totalAttachmentBytes = attachments.reduce((sum, a) => sum + (a.content ? a.content.length : 0), 0);
    const smtpAttachments = totalAttachmentBytes <= 20 * 1024 * 1024 ? attachments : [];
    const isLargeAttachmentsMode = attachments.length > 0 && smtpAttachments.length === 0;

    const sendDirectors = async () => {
      try {
        const info = await transporter.sendMail({
          from: smtpConfig.from,
          to: directorsEmails, // Array con discrete RCPT TO para ambos directivos
          replyTo: quotation.email,
          subject: isLargeAttachmentsMode ? `${directorsSubject} (Adjuntos descargables en panel)` : directorsSubject,
          text: directorsText,
          html: directorsHtml,
          headers: transactionalHeaders,
          messageId: `<quotation-${quotation.reference.toLowerCase()}-${Date.now()}@serviproce.com.mx>`,
          attachments: smtpAttachments,
        });
        return {
          ok: true,
          accepted: info.accepted || directorsEmails,
          rejected: info.rejected || [],
          messageId: info.messageId,
        };
      } catch (err) {
        // Fallback defensivo: Si el servidor SMTP rechazó por tamaño de adjuntos, reintentar sin adjuntos
        if (/exceed|size|payload|too large/i.test(err.message) && attachments.length > 0) {
          console.warn(`[MailService] Tamaño de adjuntos rechazado por SMTP para ${quotation.reference}. Reintentando sin adjuntos...`);
          const fallbackInfo = await transporter.sendMail({
            from: smtpConfig.from,
            to: directorsEmails,
            replyTo: quotation.email,
            subject: `${directorsSubject} (Adjuntos disponibles en panel)`,
            text: directorsText,
            html: directorsHtml,
            headers: transactionalHeaders,
            messageId: `<quotation-fallback-${quotation.reference.toLowerCase()}-${Date.now()}@serviproce.com.mx>`,
          });
          return {
            ok: true,
            fallbackNoAttachments: true,
            accepted: fallbackInfo.accepted || directorsEmails,
            rejected: fallbackInfo.rejected || [],
            messageId: fallbackInfo.messageId,
          };
        }
        throw err;
      }
    };

    const sendClient = async () => {
      if (!clientEmail) return { ok: false, skipped: true, reason: 'NO_EMAIL' };
      const info = await transporter.sendMail({
        from: smtpConfig.from,
        to: clientEmail,
        replyTo: directorsEmails[0] || 'customerservice@serviproce.com.mx',
        subject: clientSubject,
        text: clientText,
        html: clientHtml,
        headers: transactionalHeaders,
        messageId: `<confirm-${quotation.reference.toLowerCase()}-${Date.now()}@serviproce.com.mx>`,
      });
      return {
        ok: true,
        accepted: info.accepted || [clientEmail],
        rejected: info.rejected || [],
        messageId: info.messageId,
      };
    };

    const [directorsSettled, clientSettled] = await Promise.allSettled([
      sendDirectors(),
      sendClient(),
    ]);

    const directorsOutcome = directorsSettled.status === 'fulfilled'
      ? { sent: true, ...directorsSettled.value }
      : { sent: false, error: directorsSettled.reason?.message || 'DIRECTORS_SEND_ERROR' };

    const clientOutcome = clientSettled.status === 'fulfilled'
      ? { sent: true, ...clientSettled.value }
      : { sent: false, error: clientSettled.reason?.message || 'CLIENT_SEND_ERROR' };

    // 5. Determinar estatus consolidado y actualizar BD
    let consolidatedStatus = 'failed_smtp';
    if (directorsOutcome.sent && clientOutcome.sent) {
      consolidatedStatus = 'sent_all_smtp';
    } else if (directorsOutcome.sent && !clientOutcome.sent) {
      consolidatedStatus = 'sent_directors_only';
    } else if (!directorsOutcome.sent && clientOutcome.sent) {
      consolidatedStatus = 'sent_client_only';
    }

    await quotationLogRepository.updateSmtpStatus(quotation.reference, consolidatedStatus);

    // 6. Guardar metadatos completos de entrega en JSON
    const reportJson = {
      reference: quotation.reference,
      status: consolidatedStatus,
      from: smtpConfig.from,
      directors: {
        recipients: directorsEmails,
        ...directorsOutcome,
      },
      client: {
        recipient: clientEmail,
        ...clientOutcome,
      },
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(outboxJsonFile, JSON.stringify(reportJson, null, 2), 'utf8');

    // 7. Encolar reintento atómico si falló alguno de los dos
    if (!directorsOutcome.sent || !clientOutcome.sent) {
      this.#enqueueRetry(quotation, attachments, 1, {
        retryDirectors: !directorsOutcome.sent,
        retryClient: !clientOutcome.sent,
      });
    }

    return {
      sent: directorsOutcome.sent || clientOutcome.sent,
      mode: 'smtp',
      status: consolidatedStatus,
      directors: directorsOutcome,
      client: clientOutcome,
      previewUrl: `http://localhost:${envConfig.port}/api/quotations/${quotation.reference}/email-preview`,
    };
  }

  #enqueueRetry(quotation, attachments, attempt = 1, targets = { retryDirectors: true, retryClient: true }) {
    if (attempt > 3) {
      return;
    }

    const delayMs = attempt * 30_000;
    const timer = setTimeout(async () => {
      try {
        const transporter = await this.getTransporter();
        if (!transporter) return;

        const smtpConfig = envConfig.smtp;
        const directorsEmails = smtpConfig.directorsEmails;
        const clientEmail = (quotation.email || '').trim().toLowerCase();

        if (targets.retryDirectors) {
          try {
            await transporter.sendMail({
              from: smtpConfig.from,
              to: directorsEmails,
              replyTo: quotation.email,
              subject: `[Servi Proce ${quotation.reference}] Solicitud de Cotización: ${quotation.service} - ${quotation.name}`,
              html: MailService.buildQuotationHtml(quotation),
              attachments,
            });
            targets.retryDirectors = false;
          } catch (e) {
            console.warn(`[MailService] Reintento ${attempt} a directivos falló para ${quotation.reference}:`, e.message);
          }
        }

        if (targets.retryClient && clientEmail) {
          try {
            await transporter.sendMail({
              from: smtpConfig.from,
              to: clientEmail,
              replyTo: directorsEmails[0] || 'customerservice@serviproce.com.mx',
              subject: `[Servi Proce ${quotation.reference}] Confirmación de Solicitud de Cotización`,
              html: MailService.buildClientConfirmationHtml(quotation),
            });
            targets.retryClient = false;
          } catch (e) {
            console.warn(`[MailService] Reintento ${attempt} a cliente falló para ${quotation.reference}:`, e.message);
          }
        }

        if (targets.retryDirectors || targets.retryClient) {
          this.#enqueueRetry(quotation, attachments, attempt + 1, targets);
        } else {
          await quotationLogRepository.updateSmtpStatus(quotation.reference, 'sent_all_smtp');
        }
      } catch (err) {
        console.error(`[MailService] Error en ejecutor de reintentos:`, err.message);
      }
    }, delayMs);

    if (timer.unref) timer.unref();
    this.#retryQueue.push({ reference: quotation.reference, attempt, targets });
  }

  /**
   * Envía correo corporativo de bienvenida y confirmación de suscripción al Boletín Oficial
   */
  async sendNewsletterWelcome({ email, locale = 'es' }) {
    const isEn = locale === 'en';
    const safeEmail = (email || '').trim().toLowerCase();
    const currentYear = new Date().getFullYear();

    const subject = isEn
      ? 'Subscription Confirmed | Servi Proce Foreign Trade Newsletter'
      : 'Suscripción Confirmada | Boletín Oficial Servi Proce Comercio Exterior';

    const textContent = isEn
      ? [
          '================================================================',
          'SERVI PROCE — NEWSLETTER SUBSCRIPTION CONFIRMED',
          '================================================================',
          '',
          `Hello,`,
          '',
          'Thank you for subscribing to the official Servi Proce Foreign Trade Newsletter.',
          'Your email address (' + safeEmail + ') has been registered successfully.',
          '',
          'WHAT YOU WILL RECEIVE:',
          '• SAT tax and customs regulation alerts and updates.',
          '• Mexican foreign trade decree summaries and tariff modifications.',
          '• International multimodal logistics and supply chain insights.',
          '• Urgent operational notices and customs checkpoint status.',
          '',
          '----------------------------------------------------------------',
          'Direct Customer Service: customerservice@serviproce.com.mx',
          'Office Phone: +52 (33) 1294-5451',
          'Zero Spam Policy: You can unsubscribe at any time.',
          `© ${currentYear} Servi Proce Logistics & Supply Chain. All rights reserved.`
        ].join('\n')
      : [
          '================================================================',
          'SERVI PROCE — SUSCRIPCIÓN CONFIRMADA AL BOLETÍN OFICIAL',
          '================================================================',
          '',
          `Estimado(a) suscriptor(a),`,
          '',
          'Gracias por suscribirse al Boletín Oficial de Comercio Exterior de Servi Proce.',
          'Su correo electrónico (' + safeEmail + ') ha quedado registrado exitosamente.',
          '',
          'BENEFICIOS Y CONTENIDO QUE RECIBIRÁ:',
          '• Alertas oportunas sobre reglas del SAT y resoluciones aduaneras.',
          '• Decretos de comercio exterior y modificaciones arancelarias.',
          '• Artículos técnicos y mejores prácticas en logística multimodal.',
          '• Avisos y circulares operativas emitidas por la autoridad.',
          '',
          '----------------------------------------------------------------',
          'Atención a clientes: customerservice@serviproce.com.mx',
          'Teléfono de Oficina: +52 (33) 1294-5451',
          `Cancelar suscripción / Darse de baja: ${envConfig.frontendUrl || 'http://localhost:3000'}/${locale}/desuscribir?email=${encodeURIComponent(safeEmail)}`,
          'Política Cero Spam: Puede solicitar su baja en cualquier momento.',
          `© ${currentYear} Servi Proce Logistics & Supply Chain. Todos los derechos reservados.`
        ].join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.18); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 35px; border-bottom: 3px solid #9d0000; text-align: center;">
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                <span style="color: #ef4444;">SERVI</span> PROCE
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.12em; margin-top: 4px;">
                Logistics & Supply Chain • Foreign Trade Advisory
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 35px 25px 35px;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #10b981; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px;">
                ✓ ${isEn ? 'Subscription Active' : 'Suscripción Activa'}
              </div>
              <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${isEn ? 'Welcome to the Official Newsletter' : 'Bienvenido al Boletín Oficial'}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                ${isEn
                  ? `Thank you for subscribing. Your email <strong style="color: #ffffff;">${safeEmail}</strong> has been successfully registered to our foreign trade broadcast list.`
                  : `Gracias por suscribirse. Su correo electrónico <strong style="color: #ffffff;">${safeEmail}</strong> ha quedado registrado con éxito en nuestra lista de difusión de comercio exterior.`}
              </p>
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #ef4444; margin-bottom: 10px; letter-spacing: 0.05em;">
                  ${isEn ? 'What you will receive:' : 'Contenido que recibirá:'}
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; color: #cbd5e1;">
                  <li>${isEn ? 'SAT regulations, customs rules and foreign trade decrees' : 'Actualizaciones normativas del SAT y reglas de comercio exterior'}</li>
                  <li>${isEn ? 'Operational status alerts and customs terminal advisories' : 'Avisos de aduanas y estado de terminales logísticas'}</li>
                  <li>${isEn ? 'Multimodal logistics insights and international trade articles' : 'Artículos sobre transporte internacional y cadena de suministro'}</li>
                </ul>
              </div>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                ${isEn
                  ? 'Zero spam guaranteed. You may request unsubscription at any time by replying to this email.'
                  : 'Compromiso Cero Spam. Puede solicitar su baja en cualquier momento respondiendo a este mensaje.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0b1120; padding: 20px 35px; border-top: 1px solid rgba(148, 163, 184, 0.1); text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <div>Servi Proce Comercial • Zapopan, Jalisco, México</div>
              <div>Tel. Oficina: +52 (33) 1294-5451 • customerservice@serviproce.com.mx</div>
              <div style="margin-top: 10px; font-size: 11px;">
                <a href="${envConfig.frontendUrl || 'http://localhost:3000'}/${locale}/desuscribir?email=${encodeURIComponent(safeEmail)}" style="color: #ef4444; text-decoration: underline;">
                  ${isEn ? 'Cancel subscription / Unsubscribe' : 'Cancelar suscripción / Darse de baja'}
                </a>
              </div>
              <div style="margin-top: 6px; color: #475569;">© ${currentYear} Servi Proce. Cumplimiento Normativo LFPDPPP.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const transporter = await this.getTransporter();
      if (transporter) {
        const smtpConfig = envConfig.smtp;
        await transporter.sendMail({
          from: smtpConfig.from,
          to: safeEmail,
          replyTo: smtpConfig.directorsEmails?.[0] || 'customerservice@serviproce.com.mx',
          subject,
          text: textContent,
          html: htmlContent,
          headers: {
            'X-ServiProce-Type': 'Newsletter-Confirmation',
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
          },
        });
        console.log(`[MailService] Correo de bienvenida a boletín enviado con éxito a: ${safeEmail}`);
      }
    } catch (err) {
      console.warn(`[MailService] No se pudo enviar correo de bienvenida a ${safeEmail} (SMTP):`, err.message);
    }

    try {
      await fs.mkdir(this.outboxDir, { recursive: true });
      const ref = `NEWSLETTER-${Date.now()}`;
      await fs.writeFile(
        path.join(this.outboxDir, `${ref}.html`),
        htmlContent,
        'utf8'
      );
      await fs.writeFile(
        path.join(this.outboxDir, `${ref}.json`),
        JSON.stringify({ ref, email: safeEmail, locale, timestamp: new Date().toISOString() }, null, 2),
        'utf8'
      );
    } catch {}

    return { ok: true, email: safeEmail };
  }

  /**
   * Envía correo corporativo de confirmación de baja al Boletín Oficial
   */
  async sendNewsletterGoodbye({ email, locale = 'es' }) {
    const isEn = locale === 'en';
    const safeEmail = (email || '').trim().toLowerCase();
    const currentYear = new Date().getFullYear();
    const resubscribeUrl = `${envConfig.frontendUrl || 'http://localhost:3000'}/${locale}#boletin-informativo`;

    const subject = isEn
      ? 'Unsubscription Confirmed | Servi Proce Foreign Trade Newsletter'
      : 'Baja Confirmada | Boletín Oficial Servi Proce Comercio Exterior';

    const textContent = isEn
      ? [
          '================================================================',
          'SERVI PROCE — NEWSLETTER UNSUBSCRIPTION CONFIRMED',
          '================================================================',
          '',
          `Hello,`,
          '',
          'This email confirms that your address (' + safeEmail + ') has been successfully removed from the Servi Proce official newsletter distribution list.',
          'You will no longer receive foreign trade alerts, customs regulations, or logistics circulars from us.',
          '',
          'CHANGED YOUR MIND?',
          'If this was a mistake or you wish to receive our regulatory updates in the future, you may reactivate your subscription at any time at:',
          resubscribeUrl,
          '',
          '----------------------------------------------------------------',
          'Direct Customer Service: customerservice@serviproce.com.mx',
          'Office Phone: +52 (33) 1294-5451',
          `© ${currentYear} Servi Proce Logistics & Supply Chain. All rights reserved.`
        ].join('\n')
      : [
          '================================================================',
          'SERVI PROCE — BAJA CONFIRMADA DEL BOLETÍN OFICIAL',
          '================================================================',
          '',
          'Estimado(a) suscriptor(a),',
          '',
          'Le confirmamos que su correo electrónico (' + safeEmail + ') ha sido removido exitosamente de nuestra lista de difusión oficial de Servi Proce.',
          'A partir de este momento no recibirá más circulares del SAT, modificaciones arancelarias ni avisos operativos.',
          '',
          '¿DESEA VOLVER A RECIBIR NUESTRAS ACTUALIZACIONES EN EL FUTURO?',
          'Si la baja fue un error o decide suscribirse nuevamente en cualquier momento, puede reactivar su suscripción aquí:',
          resubscribeUrl,
          '',
          '----------------------------------------------------------------',
          'Atención a clientes: customerservice@serviproce.com.mx',
          'Teléfono de Oficina: +52 (33) 1294-5451',
          `© ${currentYear} Servi Proce Logistics & Supply Chain. Todos los derechos reservados.`
        ].join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.18); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 35px; border-bottom: 3px solid #9d0000; text-align: center;">
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                <span style="color: #ef4444;">SERVI</span> PROCE
              </div>
              <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.12em; margin-top: 4px;">
                Logistics & Supply Chain • Foreign Trade Advisory
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 35px 25px 35px;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.28); color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 18px;">
                ✓ ${isEn ? 'Unsubscription Processed' : 'Baja Procesada Exitosamente'}
              </div>
              <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${isEn ? 'Subscription Canceled' : 'Suscripción Cancelada con Éxito'}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                ${isEn
                  ? `Your email <strong style="color: #ffffff;">${safeEmail}</strong> has been removed from our newsletter list. You will no longer receive circulars or regulatory updates from Servi Proce.`
                  : `Su correo electrónico <strong style="color: #ffffff;">${safeEmail}</strong> ha sido removido de nuestra lista de difusión. Ya no recibirá comunicados normativos ni circulares de Servi Proce.`}
              </p>

              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 10px; padding: 22px; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
                  ${isEn ? 'Was this a mistake or wish to rejoin in the future?' : '¿Fue un error o desea volver a recibir novedades en el futuro?'}
                </div>
                <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
                  ${isEn
                    ? 'You can reactivate your subscription at any time with a single click.'
                    : 'Puede reactivar su suscripción en cualquier momento con un solo clic.'}
                </p>
                <a href="${resubscribeUrl}" style="display: inline-block; padding: 10px 22px; border-radius: 8px; background: linear-gradient(135deg, #b91c1c 0%, #800000 100%); color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(157, 0, 0, 0.35);">
                  ${isEn ? 'Reactivate Subscription' : 'Reactivar Mi Suscripción'}
                </a>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: center;">
                ${isEn
                  ? 'In compliance with CAN-SPAM and LFPDPPP data protection regulations.'
                  : 'En estricto cumplimiento con la LFPDPPP y normativas internacionales de protección de datos.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0b1120; padding: 20px 35px; border-top: 1px solid rgba(148, 163, 184, 0.1); text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <div>Servi Proce Comercial • Zapopan, Jalisco, México</div>
              <div>Tel. Oficina: +52 (33) 1294-5451 • customerservice@serviproce.com.mx</div>
              <div style="margin-top: 6px; color: #475569;">© ${currentYear} Servi Proce. Todos los derechos reservados.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const transporter = await this.getTransporter();
      if (transporter) {
        const smtpConfig = envConfig.smtp;
        await transporter.sendMail({
          from: smtpConfig.from,
          to: safeEmail,
          replyTo: smtpConfig.directorsEmails?.[0] || 'customerservice@serviproce.com.mx',
          subject,
          text: textContent,
          html: htmlContent,
          headers: {
            'X-ServiProce-Type': 'Newsletter-Unsubscribe-Confirmation',
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
          },
        });
        console.log(`[MailService] Correo de confirmación de baja enviado con éxito a: ${safeEmail}`);
      }
    } catch (err) {
      console.warn(`[MailService] No se pudo enviar confirmación de baja a ${safeEmail} (SMTP):`, err.message);
    }

    try {
      await fs.mkdir(this.outboxDir, { recursive: true });
      const ref = `UNSUBSCRIBE-${Date.now()}`;
      await fs.writeFile(
        path.join(this.outboxDir, `${ref}.html`),
        htmlContent,
        'utf8'
      );
      await fs.writeFile(
        path.join(this.outboxDir, `${ref}.json`),
        JSON.stringify({ ref, email: safeEmail, locale, timestamp: new Date().toISOString() }, null, 2),
        'utf8'
      );
    } catch {}

    return { ok: true, email: safeEmail };
  }

  /**
   * Difunde una alerta por correo a todos los suscriptores del Boletín cuando se publica un nuevo artículo en el Blog
   */
  async broadcastNewBlogPost({ post, subscribers = [] }) {
    if (!subscribers || subscribers.length === 0) {
      console.log('[MailService] Difusión de blog omitida: no hay suscriptores registrados.');
      return { ok: true, count: 0 };
    }

    const currentYear = new Date().getFullYear();
    const frontendBase = (envConfig.frontendUrl || 'http://localhost:3000').split(',')[0].trim();
    const transporter = await this.getTransporter();
    const smtpConfig = envConfig.smtp;
    await fs.mkdir(this.outboxDir, { recursive: true });

    let sentCount = 0;
    for (const sub of subscribers) {
      const safeEmail = (sub.email || '').trim().toLowerCase();
      if (!safeEmail) continue;

      const locale = sub.locale === 'en' ? 'en' : 'es';
      const isEn = locale === 'en';

      const title = (isEn && post.title_en) ? post.title_en : post.title_es;
      const excerpt = (isEn && post.excerpt_en) ? post.excerpt_en : post.excerpt_es;
      const category = (isEn && post.category_en) ? post.category_en : (post.category_es || 'Comercio Exterior');
      const author = post.author || 'Equipo Servi Proce';
      const date = post.published_at || new Date().toISOString().slice(0, 10);
      const readTime = (isEn && post.read_time_en) ? post.read_time_en : (post.read_time_es || '5 min de lectura');
      const synthesis = (isEn && post.synthesis_en?.length > 0) ? post.synthesis_en : (post.synthesis_es || []);
      const quoteText = (isEn && post.quote_text_en) ? post.quote_text_en : (post.quote_text_es || '');
      const quoteAuthor = post.quote_author || author;

      const articleUrl = `${frontendBase}/${locale}/blog/${post.slug}`;
      const unsubscribeUrl = `${frontendBase}/${locale}/desuscribir?email=${encodeURIComponent(safeEmail)}`;

      const subject = isEn
        ? `New Article | ${title} — Servi Proce Blog`
        : `Nuevo Artículo | ${title} — Blog Oficial Servi Proce`;

      const textContent = [
        '================================================================',
        isEn ? 'SERVI PROCE — NEW BLOG PUBLICATION' : 'SERVI PROCE — NUEVA PUBLICACIÓN EN EL BLOG',
        '================================================================',
        '',
        `${isEn ? 'Category' : 'Categoría'}: ${category}`,
        `${isEn ? 'Title' : 'Título'}: ${title}`,
        `${isEn ? 'Author' : 'Autor'}: ${author} | ${date} (${readTime})`,
        '',
        excerpt,
        '',
        synthesis && synthesis.length > 0
          ? `${isEn ? 'Key Takeaways' : 'Síntesis Ejecutiva'}:\n` + synthesis.map((s) => ` • ${s}`).join('\n') + '\n\n'
          : '',
        quoteText ? `"${quoteText}" — ${quoteAuthor}\n\n` : '',
        `${isEn ? 'Read full article online' : 'Leer artículo completo en línea'}: ${articleUrl}`,
        '',
        '----------------------------------------------------------------',
        `${isEn ? 'Unsubscribe' : 'Cancelar suscripción'}: ${unsubscribeUrl}`,
        `© ${currentYear} Servi Proce. Todos los derechos reservados.`,
      ].filter(Boolean).join('\n');

      const synthesisHtml = Array.isArray(synthesis) && synthesis.length > 0 ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #9d0000; border-radius: 8px; padding: 16px 20px; margin: 24px 0 20px 0;">
          <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #9d0000; margin-bottom: 10px;">
            ${isEn ? 'Executive Summary' : 'Síntesis Ejecutiva'} • ${category}
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.6;">
            ${synthesis.map((point) => `<li style="margin-bottom: 6px;">${point}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      const quoteHtml = quoteText ? `
        <blockquote style="margin: 22px 0; padding: 14px 18px; border-left: 3px solid #9d0000; background-color: #f1f5f9; border-radius: 0 8px 8px 0; font-style: italic; color: #1e293b; font-size: 14px; line-height: 1.6;">
          &ldquo;${quoteText}&rdquo;
          <span style="display: block; font-style: normal; font-weight: 700; color: #9d0000; font-size: 12px; margin-top: 6px;">
            — ${quoteAuthor}
          </span>
        </blockquote>
      ` : '';

      const htmlContent = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1120; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 35px; border-bottom: 4px solid #9d0000; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="color: #9d0000; font-size: 20px; font-weight: 900; letter-spacing: 0.05em; display: inline-block;">SERVI PROCE</span>
                    <span style="color: #64748b; font-size: 14px; font-weight: 700; margin-left: 8px;">| LOGISTICS &amp; SUPPLY CHAIN</span>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 4px; letter-spacing: 0.02em;">
                      ${isEn ? 'Official Foreign Trade & Customs Newsletter' : 'Boletín Oficial de Comercio Exterior y Aduanas'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Insignia y Título -->
          <tr>
            <td style="padding: 32px 35px 20px 35px;">
              <div style="margin-bottom: 14px;">
                <span style="display: inline-block; background-color: rgba(157, 0, 0, 0.1); color: #9d0000; border: 1px solid rgba(157, 0, 0, 0.25); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;">
                  ${isEn ? 'New Blog Article' : 'Nuevo Artículo del Blog'} • ${category}
                </span>
              </div>
              <h1 style="margin: 0 0 14px 0; font-size: 24px; line-height: 1.35; color: #0f172a; font-weight: 800;">
                ${title}
              </h1>
              <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                <span>${date}</span> • <span>${readTime}</span> • <span>${author}</span>
              </div>

              <!-- Párrafo destacado / Excerpt -->
              <div style="font-size: 16px; line-height: 1.65; color: #1e293b; font-weight: 500; border-left: 3px solid #9d0000; padding-left: 14px; margin-bottom: 20px;">
                ${excerpt}
              </div>

              ${synthesisHtml}
              ${quoteHtml}

              <!-- Botón CTA de Lectura -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${articleUrl}" target="_blank" style="display: inline-block; background-color: #9d0000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(157, 0, 0, 0.35); letter-spacing: 0.02em;">
                  ${isEn ? 'Read Full Article Online →' : 'Leer Artículo Completo en servi proce.com.mx →'}
                </a>
              </div>
            </td>
          </tr>

          <!-- Aviso de Desuscripción 1-Clic -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 35px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                ${isEn
                  ? 'You received this email because you are subscribed to the Servi Proce Official Newsletter.'
                  : 'Recibió este correo porque está suscrito al Boletín Oficial de Servi Proce.'}
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                <a href="${unsubscribeUrl}" target="_blank" style="color: #9d0000; text-decoration: underline; font-weight: 600;">
                  ${isEn ? 'Cancel your subscription in 1 click' : 'Cancelar su suscripción con un solo clic'}
                </a>
              </p>
            </td>
          </tr>

          <!-- Pie de Página Legal -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 35px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <div>Servi Proce Comercial • Av. Altavista Poniente 450 Int. 110, Zapopan, Jal.</div>
              <div>Tel. Oficina: +52 (33) 1294-5451 • customerservice@serviproce.com.mx</div>
              <div style="margin-top: 6px; color: #475569;">© ${currentYear} Servi Proce. Todos los derechos reservados.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        if (transporter) {
          await transporter.sendMail({
            from: smtpConfig.from,
            to: safeEmail,
            replyTo: smtpConfig.directorsEmails?.[0] || 'customerservice@serviproce.com.mx',
            subject,
            text: textContent,
            html: htmlContent,
            headers: {
              'X-ServiProce-Type': 'Newsletter-Blog-Broadcast',
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'X-Auto-Response-Suppress': 'OOF, AutoReply',
            },
          });
          sentCount++;
          console.log(`[MailService] Alerta de nuevo artículo de Blog enviada a: ${safeEmail}`);
        }
      } catch (err) {
        console.warn(`[MailService] No se pudo enviar alerta de Blog a ${safeEmail} (SMTP):`, err.message);
      }

      // Guardar copia de auditoría en mail_outbox
      try {
        const fileRef = `BROADCAST-BLOG-${Date.now()}-${safeEmail.replace(/[^a-z0-9]/gi, '_')}`;
        await fs.writeFile(path.join(this.outboxDir, `${fileRef}.html`), htmlContent, 'utf8');
        await fs.writeFile(
          path.join(this.outboxDir, `${fileRef}.json`),
          JSON.stringify({ ref: fileRef, email: safeEmail, locale, slug: post.slug, title, timestamp: new Date().toISOString() }, null, 2),
          'utf8'
        );
      } catch {}
    }

    console.log(`[MailService] Difusión de blog completada: ${sentCount}/${subscribers.length} correos despachados.`);
    return { ok: true, count: sentCount, total: subscribers.length };
  }

  /**
   * Difunde una alerta por correo a todos los suscriptores del Boletín cuando se publica una Noticia, Aviso o Ley
   */
  async broadcastNewAviso({ aviso, subscribers = [] }) {
    if (!subscribers || subscribers.length === 0) {
      console.log('[MailService] Difusión de aviso/noticia omitida: no hay suscriptores registrados.');
      return { ok: true, count: 0 };
    }

    const currentYear = new Date().getFullYear();
    const frontendBase = (envConfig.frontendUrl || 'http://localhost:3000').split(',')[0].trim();
    const transporter = await this.getTransporter();
    const smtpConfig = envConfig.smtp;
    await fs.mkdir(this.outboxDir, { recursive: true });

    let sentCount = 0;
    for (const sub of subscribers) {
      const safeEmail = (sub.email || '').trim().toLowerCase();
      if (!safeEmail) continue;

      const locale = sub.locale === 'en' ? 'en' : 'es';
      const isEn = locale === 'en';

      const type = aviso.type || 'aviso';
      const title = (isEn && aviso.title_en) ? aviso.title_en : aviso.title_es;
      const body = (isEn && aviso.body_en) ? aviso.body_en : aviso.body_es;
      const sourceUrl = aviso.sourceUrl || aviso.source_url || '';
      const publishedAt = aviso.publishedAt || aviso.published_at || new Date().toISOString().slice(0, 10);

      const typeLabel = type === 'ley'
        ? (isEn ? 'Customs Law Update' : 'Actualización Normativa')
        : type === 'noticia'
          ? (isEn ? 'Foreign Trade News' : 'Noticia de Comercio Exterior')
          : (isEn ? 'Official Notice' : 'Aviso Oficial');

      const avisosUrl = `${frontendBase}/${locale}/avisos`;
      const unsubscribeUrl = `${frontendBase}/${locale}/desuscribir?email=${encodeURIComponent(safeEmail)}`;

      const subject = isEn
        ? `${typeLabel} | ${title} — Servi Proce`
        : `${typeLabel} | ${title} — Servi Proce`;

      const textContent = [
        '================================================================',
        `SERVI PROCE — ${typeLabel.toUpperCase()}`,
        '================================================================',
        '',
        `${isEn ? 'Title' : 'Título'}: ${title}`,
        `${isEn ? 'Date' : 'Fecha'}: ${publishedAt}`,
        '',
        body,
        '',
        sourceUrl ? `${isEn ? 'Official Source' : 'Fuente Oficial'}: ${sourceUrl}\n` : '',
        `${isEn ? 'View in News & Notices panel' : 'Consultar en el panel de Noticias y Avisos'}: ${avisosUrl}`,
        '',
        '----------------------------------------------------------------',
        `${isEn ? 'Unsubscribe' : 'Cancelar suscripción'}: ${unsubscribeUrl}`,
        `© ${currentYear} Servi Proce. Todos los derechos reservados.`,
      ].filter(Boolean).join('\n');

      const htmlContent = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1120; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 35px; border-bottom: 4px solid #9d0000; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="color: #9d0000; font-size: 20px; font-weight: 900; letter-spacing: 0.05em; display: inline-block;">SERVI PROCE</span>
                    <span style="color: #64748b; font-size: 14px; font-weight: 700; margin-left: 8px;">| LOGISTICS &amp; SUPPLY CHAIN</span>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 4px; letter-spacing: 0.02em;">
                      ${isEn ? 'Official Foreign Trade Advisory & Alerts' : 'Avisos y Comunicados Oficiales de Comercio Exterior'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Insignia y Contenido del Aviso -->
          <tr>
            <td style="padding: 32px 35px 20px 35px;">
              <div style="margin-bottom: 14px;">
                <span style="display: inline-block; background-color: rgba(157, 0, 0, 0.1); color: #9d0000; border: 1px solid rgba(157, 0, 0, 0.25); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;">
                  ${typeLabel}
                </span>
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 23px; line-height: 1.35; color: #0f172a; font-weight: 800;">
                ${title}
              </h1>
              <div style="font-size: 13px; color: #64748b; margin-bottom: 22px;">
                <span>${publishedAt}</span> • <span>Servi Proce Noticias &amp; Avisos</span>
              </div>

              <!-- Cuerpo del Aviso / Noticia -->
              <div style="font-size: 15px; line-height: 1.75; color: #334155; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 22px; margin-bottom: 24px;">
                ${body}
              </div>

              ${sourceUrl ? `
                <div style="margin-bottom: 24px; font-size: 13px; color: #64748b;">
                  <strong>${isEn ? 'Official Source:' : 'Fuente Oficial:'}</strong>
                  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #9d0000; text-decoration: underline; margin-left: 6px; word-break: break-all;">
                    ${sourceUrl}
                  </a>
                </div>
              ` : ''}

              <!-- Botón CTA al Panel de Avisos -->
              <div style="text-align: center; margin: 30px 0 20px 0;">
                <a href="${avisosUrl}" target="_blank" style="display: inline-block; background-color: #9d0000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(157, 0, 0, 0.35); letter-spacing: 0.02em;">
                  ${isEn ? 'View in News & Notices Panel →' : 'Consultar Panel de Noticias y Avisos →'}
                </a>
              </div>
            </td>
          </tr>

          <!-- Aviso de Desuscripción 1-Clic -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 35px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                ${isEn
                  ? 'You received this alert because you are subscribed to the Servi Proce Official Newsletter.'
                  : 'Recibió esta alerta porque está suscrito al Boletín Oficial de Servi Proce.'}
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                <a href="${unsubscribeUrl}" target="_blank" style="color: #9d0000; text-decoration: underline; font-weight: 600;">
                  ${isEn ? 'Cancel your subscription in 1 click' : 'Cancelar su suscripción con un solo clic'}
                </a>
              </p>
            </td>
          </tr>

          <!-- Pie de Página Legal -->
          <tr>
            <td style="background-color: #0b1120; padding: 20px 35px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <div>Servi Proce Comercial • Av. Altavista Poniente 450 Int. 110, Zapopan, Jal.</div>
              <div>Tel. Oficina: +52 (33) 1294-5451 • customerservice@serviproce.com.mx</div>
              <div style="margin-top: 6px; color: #475569;">© ${currentYear} Servi Proce. Todos los derechos reservados.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      try {
        if (transporter) {
          await transporter.sendMail({
            from: smtpConfig.from,
            to: safeEmail,
            replyTo: smtpConfig.directorsEmails?.[0] || 'customerservice@serviproce.com.mx',
            subject,
            text: textContent,
            html: htmlContent,
            headers: {
              'X-ServiProce-Type': 'Newsletter-Aviso-Broadcast',
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'X-Auto-Response-Suppress': 'OOF, AutoReply',
            },
          });
          sentCount++;
          console.log(`[MailService] Alerta de Aviso/Noticia enviada a: ${safeEmail}`);
        }
      } catch (err) {
        console.warn(`[MailService] No se pudo enviar alerta de Aviso/Noticia a ${safeEmail} (SMTP):`, err.message);
      }

      // Guardar copia de auditoría en mail_outbox
      try {
        const fileRef = `BROADCAST-AVISO-${Date.now()}-${safeEmail.replace(/[^a-z0-9]/gi, '_')}`;
        await fs.writeFile(path.join(this.outboxDir, `${fileRef}.html`), htmlContent, 'utf8');
        await fs.writeFile(
          path.join(this.outboxDir, `${fileRef}.json`),
          JSON.stringify({ ref: fileRef, email: safeEmail, locale, avisoId: aviso.id, type, title, timestamp: new Date().toISOString() }, null, 2),
          'utf8'
        );
      } catch {}
    }

    console.log(`[MailService] Difusión de aviso/noticia completada: ${sentCount}/${subscribers.length} correos despachados.`);
    return { ok: true, count: sentCount, total: subscribers.length };
  }
}

export const mailService = new MailService();
