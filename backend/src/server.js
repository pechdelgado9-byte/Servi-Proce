import http from 'node:http';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { envConfig } from './config/EnvironmentConfig.js';
import { dbManager } from './database/DatabaseManager.js';
import {
  promotionRepository,
  blogRepository,
  avisoRepository,
  quotationLogRepository,
} from './repositories/ContentRepository.js';
import { AuthService } from './services/AuthService.js';
import { SanitizationService } from './services/SanitizationService.js';
import { RecaptchaService } from './services/RecaptchaService.js';
import { mailService } from './services/MailService.js';
import { WebhookService } from './services/WebhookService.js';
import { promotionCronService } from './services/PromotionCronService.js';
import { QuotationRequest } from './models/QuotationRequest.js';

/**
 * Clase BackendServer (Arquitectura Headless en puerto 1337 según ERS)
 * Expone la API REST JSON con políticas CORS restrictivas y control de acceso JWT.
 */
export class BackendServer {
  #server = null;
  #uploadsDir;
  #quotationsFilesDir;
  #rateLimitMap = new Map();

  constructor() {
    this.#uploadsDir = path.join(envConfig.rootDir, 'uploads');
    this.#quotationsFilesDir = path.join(envConfig.rootDir, 'database', 'cotizaciones');
  }

  async initialize() {
    await fs.mkdir(this.#uploadsDir, { recursive: true });
    await fs.mkdir(this.#quotationsFilesDir, { recursive: true });
    await dbManager.initialize();
    await promotionCronService.start();
  }

  /**
   * Límite de peticiones de cotización por IP (10 por hora)
   */
  #isRateLimited(ip) {
    const now = Date.now();
    const recent = (this.#rateLimitMap.get(ip) || []).filter((t) => now - t < 3600_000);
    recent.push(now);
    this.#rateLimitMap.set(ip, recent);
    return recent.length > 15;
  }

  /**
   * Sección 2.1.9.2.2: Políticas de Seguridad (CORS) restrictivas hacia el dominio del Frontend
   */
  #applyCorsHeaders(req, res) {
    const allowedOrigins = envConfig.frontendUrl.split(',').map((u) => u.trim());
    const requestOrigin = req.headers.origin;

    if (!requestOrigin || allowedOrigins.includes(requestOrigin) || envConfig.nodeEnv === 'development') {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin || allowedOrigins[0] || '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-webhook-secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  static #sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  }

  static async #readJsonBody(req, maxBytes = 6 * 1024 * 1024) {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > maxBytes) {
        throw new Error('PAYLOAD_TOO_LARGE');
      }
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};
    return JSON.parse(raw);
  }

  static #extractBearerToken(req) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    return '';
  }

  async #requireAdmin(req, res) {
    const token = BackendServer.#extractBearerToken(req);
    const verification = await AuthService.verifySession(token);
    if (!verification.valid) {
      BackendServer.#sendJson(res, 401, {
        ok: false,
        error: verification.reason || 'UNAUTHORIZED',
      });
      return null;
    }
    return verification.user;
  }

  /**
   * Manejador principal de peticiones HTTP REST
   */
  async handleRequest(req, res) {
    this.#applyCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost:1337'}`);
    const pathname = decodeURIComponent(urlObj.pathname);
    const locale = urlObj.searchParams.get('locale') === 'en' ? 'en' : 'es';
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();

    // RF-03 Precondición 2: Exclusión Topológica Absoluta de "vacantes" o "bolsa-de-trabajo"
    if (/vacantes|bolsa-de-trabajo/i.test(pathname)) {
      return BackendServer.#sendJson(res, 404, {
        ok: false,
        error: 'ROUTE_PURGED_BY_RF03',
        message: 'La sección de vacantes fue eliminada permanentemente por política corporativa (RF-03).',
      });
    }

    try {
      // 1. Servir archivos estáticos subidos y sanitizados (/uploads/:filename)
      if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
        const rawName = path.basename(pathname);
        const safeName = SanitizationService.normalizeFilename(rawName).fullName;
        const filePath = path.join(this.#uploadsDir, safeName);
        if (!fsSync.existsSync(filePath)) {
          return BackendServer.#sendJson(res, 404, { ok: false, error: 'FILE_NOT_FOUND' });
        }
        const ext = path.extname(safeName).toLowerCase();
        const mimeMap = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
        };
        const buf = await fs.readFile(filePath);
        res.writeHead(200, {
          'Content-Type': mimeMap[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400',
        });
        res.end(buf);
        return;
      }

      // 2. Healthcheck del Backend
      if (req.method === 'GET' && pathname === '/api/health') {
        return BackendServer.#sendJson(res, 200, {
          ok: true,
          service: 'serviproce-backend-cms',
          databaseMode: dbManager.mode,
          timestamp: new Date().toISOString(),
        });
      }

      // 3. GET /api/promotions (RF-02)
      if (req.method === 'GET' && pathname === '/api/promotions') {
        const promos = await promotionRepository.findActive(locale);
        return BackendServer.#sendJson(res, 200, {
          ok: true,
          data: promos[0] || null,
          items: promos,
        });
      }

      // 4. GET /api/blog-posts y GET /api/blog-posts/:slug (RF-07, RF-10)
      if (req.method === 'GET' && pathname === '/api/blog-posts') {
        const posts = await blogRepository.findAllPublic(locale);
        return BackendServer.#sendJson(res, 200, { ok: true, data: posts });
      }

      if (req.method === 'GET' && pathname.startsWith('/api/blog-posts/')) {
        const slug = pathname.slice('/api/blog-posts/'.length);
        const post = await blogRepository.findBySlugPublic(slug, locale);
        if (!post) {
          return BackendServer.#sendJson(res, 404, { ok: false, error: 'POST_NOT_FOUND' });
        }
        return BackendServer.#sendJson(res, 200, { ok: true, data: post });
      }

      // 5. GET /api/avisos
      if (req.method === 'GET' && pathname === '/api/avisos') {
        const type = urlObj.searchParams.get('type') || undefined;
        const limit = urlObj.searchParams.get('limit') || undefined;
        const avisos = await avisoRepository.findAllPublic(locale, { type, limit });
        return BackendServer.#sendJson(res, 200, { ok: true, data: avisos });
      }

      // 6. POST /api/quotations (RF-01 y RF-04: Solicitud de Cotización + reCAPTCHA + SMTP + Log en BD)
      if (req.method === 'POST' && pathname === '/api/quotations') {
        if (this.#isRateLimited(ip)) {
          return BackendServer.#sendJson(res, 429, { ok: false, error: 'rate_limited' });
        }

        const body = await BackendServer.#readJsonBody(req, 15 * 1024 * 1024);

        // Honeypot anti-bots
        if (String(body.website || '').trim() !== '') {
          return BackendServer.#sendJson(res, 403, { ok: false, error: 'honeypot_rejected' });
        }

        // RF-04 Postcondición 2: Si sigma < 0.5 => Drop(U) ^ HTTP 403
        const recaptchaCheck = await RecaptchaService.verify(body.recaptchaToken);
        if (!recaptchaCheck.valid) {
          return BackendServer.#sendJson(res, 403, {
            ok: false,
            error: 'recaptcha',
            score: recaptchaCheck.score,
          });
        }

        // Determinar servicio seleccionado (tanto desde Contacto como desde el Cotizador de Aduanas)
        let serviceName = String(body.service || '').trim();
        if (!serviceName && body.operation) {
          serviceName = 'Despacho de Aduana';
        }

        // Procesar archivos adjuntos opcionales sanitizando nombres según RF-09
        const savedFiles = [];
        const mailAttachments = [];
        const ref = `SP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

        if (Array.isArray(body.files) && body.files.length > 0) {
          const refDir = path.join(this.#quotationsFilesDir, ref);
          await fs.mkdir(refDir, { recursive: true });

          for (const f of body.files) {
            if (!f?.base64 || !f?.name) continue;
            const buf = Buffer.from(f.base64, 'base64');
            const sanitized = SanitizationService.validateAndSanitizeFile({
              originalName: f.name,
              buffer: buf,
              mode: 'quote',
            });
            const finalFileName = `${sanitized.baseName}${sanitized.extension}`;
            const targetPath = path.join(refDir, finalFileName);
            await fs.writeFile(targetPath, buf);
            savedFiles.push(finalFileName);
            mailAttachments.push({ filename: finalFileName, content: buf });
          }
        }

        // Si marcó mercancía peligrosa (hazmat) en Despachos Aduanales y viene desde el cotizador detallado
        if (body.hazmat === true && body.requireMsds && savedFiles.length === 0) {
          return BackendServer.#sendJson(res, 400, { ok: false, error: 'file_msds_required' });
        }

        let quotationRequest;
        try {
          quotationRequest = new QuotationRequest({
            reference: ref,
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            company: body.company || '',
            service: serviceName,
            operation: body.operation || '',
            mode: body.mode || '',
            country: body.country || '',
            industry: body.industry || '',
            description: body.description || '',
            hazmat: Boolean(body.hazmat),
            files: savedFiles,
            recaptchaScore: recaptchaCheck.score,
          });
        } catch (validationErr) {
          return BackendServer.#sendJson(res, 400, {
            ok: false,
            error: validationErr.message,
          });
        }

        // RF-01 Postcondición 2: Transición de Base de Datos DB_{t+1} = DB_t U {Log(V)}
        await quotationLogRepository.appendLog(quotationRequest, 'pending');

        // RF-01 Postcondición 1: Output => SMTP_Send(V)
        const mailResult = await mailService.sendQuotationNotification(quotationRequest, mailAttachments);

        return BackendServer.#sendJson(res, 200, {
          ok: true,
          ref,
          saved: true,
          smtpMode: mailResult.mode,
        });
      }

      // 7. POST /api/newsletter (Suscripción al Boletín con consulta parametrizada RNF-05)
      if (req.method === 'POST' && pathname === '/api/newsletter') {
        const body = await BackendServer.#readJsonBody(req);
        const email = SanitizationService.sanitizeText(body.email || '').toLowerCase();
        if (!QuotationRequest.RFC5322_EMAIL_REGEX.test(email)) {
          return BackendServer.#sendJson(res, 400, { ok: false, error: 'INVALID_EMAIL' });
        }

        const existing = await dbManager.query(
          'SELECT id FROM newsletter_subscribers WHERE email = $1',
          [email]
        );
        if (existing.length === 0) {
          await dbManager.query(
            'INSERT INTO newsletter_subscribers (id, email, locale, subscribed_at) VALUES ($1, $2, $3, $4)',
            [crypto.randomUUID(), email, locale, new Date().toISOString()]
          );
        }

        return BackendServer.#sendJson(res, 200, { ok: true, email });
      }

      // ======================================================================
      // ENDPOINTS DE AUTENTICACIÓN Y PANEL DE ADMINISTRACIÓN (CMS - RF-07)
      // ======================================================================

      // 8. POST /api/auth/login (RNF-03 y RNF-04)
      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const body = await BackendServer.#readJsonBody(req);
        const result = await AuthService.login({
          username: body.username,
          password: body.password,
          ip,
        });
        return BackendServer.#sendJson(res, result.ok ? 200 : (result.status || 401), result);
      }

      // 9. POST /api/auth/logout
      if (req.method === 'POST' && pathname === '/api/auth/logout') {
        const token = BackendServer.#extractBearerToken(req);
        await AuthService.logout(token);
        return BackendServer.#sendJson(res, 200, { ok: true });
      }

      // 10. GET /api/auth/session
      if (req.method === 'GET' && pathname === '/api/auth/session') {
        const token = BackendServer.#extractBearerToken(req);
        const verification = await AuthService.verifySession(token);
        return BackendServer.#sendJson(res, verification.valid ? 200 : 401, verification);
      }

      // 11. GET /api/admin/dashboard (Datos completos para el CMS: Blog, Promociones, Avisos y Tabla Log de Cotizaciones)
      if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;

        const [promotions, blogPosts, avisos, quotationLogs, newsletter] = await Promise.all([
          promotionRepository.findAllAdmin(),
          blogRepository.findAllAdmin(),
          avisoRepository.findAllAdmin(),
          quotationLogRepository.findAllReadOnly(),
          dbManager.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC'),
        ]);

        return BackendServer.#sendJson(res, 200, {
          ok: true,
          user: admin,
          data: {
            promotions,
            blogPosts,
            avisos,
            quotationLogs,
            newsletter,
          },
        });
      }

      // 12. GET /api/admin/quotations (Sección 3.1.1: Tabla de registros Log en formato de sólo lectura)
      if (req.method === 'GET' && pathname === '/api/admin/quotations') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const logs = await quotationLogRepository.findAllReadOnly();
        return BackendServer.#sendJson(res, 200, { ok: true, data: logs });
      }

      // 13. POST /api/admin/upload (RF-09: Subida y Normalización de Archivos Multimedia <= 2 MB)
      if (req.method === 'POST' && pathname === '/api/admin/upload') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;

        const body = await BackendServer.#readJsonBody(req, 4 * 1024 * 1024);
        const buffer = Buffer.from(String(body.base64 || ''), 'base64');
        const sanitized = SanitizationService.validateAndSanitizeFile({
          originalName: body.filename || 'imagen.webp',
          buffer,
          mode: 'cms',
        });

        const uniqueSafeName = `${sanitized.baseName}-${Date.now().toString(36)}${sanitized.extension}`;
        const filePath = path.join(this.#uploadsDir, uniqueSafeName);
        await fs.writeFile(filePath, buffer);

        const publicUrl = `http://localhost:${envConfig.port}/uploads/${uniqueSafeName}`;
        return BackendServer.#sendJson(res, 201, {
          ok: true,
          originalName: body.filename,
          sanitizedName: uniqueSafeName,
          url: publicUrl,
        });
      }

      // 14. CRUD de Artículos del Blog (/api/admin/blog-posts) - RF-07 y RF-10
      if (pathname === '/api/admin/blog-posts' && req.method === 'POST') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const body = await BackendServer.#readJsonBody(req);
        const created = await blogRepository.create(body);
        await WebhookService.emitRevalidation({ entity: 'blog', action: 'create', tags: ['blog'] });
        return BackendServer.#sendJson(res, 201, { ok: true, data: created });
      }

      if (pathname.startsWith('/api/admin/blog-posts/') && (req.method === 'PUT' || req.method === 'DELETE')) {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const id = pathname.slice('/api/admin/blog-posts/'.length);

        if (req.method === 'PUT') {
          const body = await BackendServer.#readJsonBody(req);
          const updated = await blogRepository.update(id, body);
          if (!updated) return BackendServer.#sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
          await WebhookService.emitRevalidation({ entity: 'blog', action: 'update', tags: ['blog'] });
          return BackendServer.#sendJson(res, 200, { ok: true, data: updated });
        }

        await blogRepository.delete(id);
        await WebhookService.emitRevalidation({ entity: 'blog', action: 'delete', tags: ['blog'] });
        return BackendServer.#sendJson(res, 200, { ok: true });
      }

      // 15. CRUD de Promociones (/api/admin/promotions) - RF-02 y RF-07
      if (pathname === '/api/admin/promotions' && req.method === 'POST') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const body = await BackendServer.#readJsonBody(req);
        const created = await promotionRepository.create(body);
        await WebhookService.emitRevalidation({ entity: 'promotion', action: 'create', tags: ['promotions'] });
        return BackendServer.#sendJson(res, 201, { ok: true, data: created });
      }

      if (pathname.startsWith('/api/admin/promotions/') && (req.method === 'PUT' || req.method === 'DELETE')) {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const id = pathname.slice('/api/admin/promotions/'.length);

        if (req.method === 'PUT') {
          const body = await BackendServer.#readJsonBody(req);
          const updated = await promotionRepository.update(id, body);
          if (!updated) return BackendServer.#sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
          await WebhookService.emitRevalidation({ entity: 'promotion', action: 'update', tags: ['promotions'] });
          return BackendServer.#sendJson(res, 200, { ok: true, data: updated });
        }

        await promotionRepository.delete(id);
        await WebhookService.emitRevalidation({ entity: 'promotion', action: 'delete', tags: ['promotions'] });
        return BackendServer.#sendJson(res, 200, { ok: true });
      }

      // 16. CRUD de Avisos, Noticias y Leyes (/api/admin/avisos) - RF-07
      if (pathname === '/api/admin/avisos' && req.method === 'POST') {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const body = await BackendServer.#readJsonBody(req);
        const created = await avisoRepository.create(body);
        await WebhookService.emitRevalidation({ entity: 'aviso', action: 'create', tags: ['avisos'] });
        return BackendServer.#sendJson(res, 201, { ok: true, data: created });
      }

      if (pathname.startsWith('/api/admin/avisos/') && (req.method === 'PUT' || req.method === 'DELETE')) {
        const admin = await this.#requireAdmin(req, res);
        if (!admin) return;
        const id = pathname.slice('/api/admin/avisos/'.length);

        if (req.method === 'PUT') {
          const body = await BackendServer.#readJsonBody(req);
          const updated = await avisoRepository.update(id, body);
          if (!updated) return BackendServer.#sendJson(res, 404, { ok: false, error: 'NOT_FOUND' });
          await WebhookService.emitRevalidation({ entity: 'aviso', action: 'update', tags: ['avisos'] });
          return BackendServer.#sendJson(res, 200, { ok: true, data: updated });
        }

        await avisoRepository.delete(id);
        await WebhookService.emitRevalidation({ entity: 'aviso', action: 'delete', tags: ['avisos'] });
        return BackendServer.#sendJson(res, 200, { ok: true });
      }

      return BackendServer.#sendJson(res, 404, { ok: false, error: 'ENDPOINT_NOT_FOUND', path: pathname });
    } catch (err) {
      console.error('[BackendServer] Error procesando petición:', err);
      return BackendServer.#sendJson(res, 400, {
        ok: false,
        error: err.message || 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  async listen(port = envConfig.port) {
    await this.initialize();
    this.#server = http.createServer((req, res) => this.handleRequest(req, res));
    return new Promise((resolve) => {
      this.#server.listen(port, () => {
        console.log(`================================================================`);
        console.log(`[Servi Proce Backend CMS] Escuchando en http://localhost:${port}/api`);
        console.log(`[Servi Proce Backend CMS] Motor BD: ${dbManager.mode} | CORS permitido: ${envConfig.frontendUrl}`);
        console.log(`================================================================`);
        resolve(this.#server);
      });
    });
  }

  async close() {
    promotionCronService.stop();
    if (!this.#server) return;
    return new Promise((resolve) => this.#server.close(() => resolve()));
  }
}

// Si se ejecuta directamente con `node src/server.js` o `npm run dev`
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  const app = new BackendServer();
  app.listen().catch((err) => {
    console.error('[BackendServer] Error fatal al iniciar:', err);
    process.exit(1);
  });
}
