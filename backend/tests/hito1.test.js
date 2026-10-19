import test from 'node:test';
import assert from 'node:assert/strict';
import { SanitizationService } from '../src/services/SanitizationService.js';
import { Promotion } from '../src/models/Promotion.js';
import { BlogPost } from '../src/models/BlogPost.js';
import { QuotationRequest } from '../src/models/QuotationRequest.js';
import { dbManager } from '../src/database/DatabaseManager.js';
import { AuthService } from '../src/services/AuthService.js';
import { promotionCronService } from '../src/services/PromotionCronService.js';

test('Hito 1 - Pruebas de Unidad y Módulos según ERS (RF-01, RF-02, RF-07, RF-09, RF-10, RNF-03, RNF-04, RNF-05)', async (t) => {
  await dbManager.initialize();

  await t.test('RF-09: Sanitización y Normalización de Nombres de Archivos', () => {
    const result = SanitizationService.normalizeFilename('Cotización Aérea ÁÉÍÓÚ Ñ #2026 (Final).PDF');
    assert.equal(result.baseName, 'cotizacion-aerea-aeiou-n-2026-final');
    assert.equal(result.extension, '.pdf');
    assert.equal(result.fullName, 'cotizacion-aerea-aeiou-n-2026-final.pdf');
    assert.match(result.baseName, /^[a-z0-9-]+$/);
  });

  await t.test('RF-07: Sanitización Anti-XSS rechaza <script> y javascript:', () => {
    assert.throws(
      () => SanitizationService.sanitizeText('Hola <script>alert(1)</script>'),
      /XSS_DETECTED/
    );
    assert.throws(
      () => SanitizationService.sanitizeText('javascript:void(0)'),
      /XSS_DETECTED/
    );
  });

  await t.test('RF-02: Caducidad automática de Promociones exactamente a los 365 días', async () => {
    const overOneYearAgo = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString();
    const expiredPromo = new Promotion({
      id: 'promo-expired-test',
      title_es: 'Promo Antigua',
      description_es: 'Debe ocultarse',
      published_at: overOneYearAgo,
    });
    assert.equal(expiredPromo.isExpired(), true);
    assert.equal(expiredPromo.status, 'Oculto');

    // Insertar en BD como Publicado y verificar que el Cron Job la pasa a Oculto
    await dbManager.query(
      `INSERT INTO promotions (id, title_es, title_en, description_es, description_en, image_url, published_at, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ['promo-cron-test', 'Promo Cron', 'Cron Promo', 'Desc', 'Desc', '', overOneYearAgo, overOneYearAgo, 'Publicado']
    );

    const audit = await promotionCronService.auditAndExpirePromotions();
    assert.ok(audit.expiredCount >= 1);

    const rows = await dbManager.query('SELECT status FROM promotions WHERE id = $1', ['promo-cron-test']);
    assert.equal(rows[0].status, 'Oculto');
    await dbManager.query('DELETE FROM promotions WHERE id = $1', ['promo-cron-test']);
  });

  await t.test('RF-10: Límites de SEO (<=60 / <=160) y Fallback automático de Open Graph (/logo.png)', () => {
    const post = new BlogPost({
      title_es: 'Título de prueba extremadamente largo que supera por mucho los sesenta caracteres permitidos en SEO',
      content_es: ['Párrafo uno de contenido válido.'],
      image_url: '',
      og_image_url: '',
    });
    const publicJson = post.toPublicJSON('es');
    assert.ok(publicJson.seo.title.length <= 60);
    assert.ok(publicJson.seo.description.length <= 160);
    assert.equal(publicJson.seo.ogImage, '/logo.png');
  });

  await t.test('RNF-03 y RNF-04: Bloqueo de 15 min tras 5 intentos fallidos y Expiración tras 15 min de inactividad', async () => {
    const testIp = '198.51.100.99';
    await AuthService.clearFailedAttempts(`ip:${testIp}`);

    // 5 intentos fallidos consecutivos
    for (let i = 1; i <= 5; i++) {
      const res = await AuthService.login({ password: 'wrong-password', ip: testIp });
      assert.equal(res.ok, false);
      if (i === 5) {
        assert.equal(res.status, 429);
        assert.equal(res.error, 'ACCOUNT_LOCKED_BRUTE_FORCE');
      }
    }

    // Incluso con contraseña correcta, sigue bloqueado durante 15 minutos
    const blockedRes = await AuthService.login({ password: process.env.ADMIN_PASSWORD || 'ServiProce2026!', ip: testIp });
    assert.equal(blockedRes.ok, false);
    assert.equal(blockedRes.status, 429);

    await AuthService.clearFailedAttempts(`ip:${testIp}`);

    // Login exitoso y prueba de RNF-04 (cierre tras 15 min de inactividad)
    const loginRes = await AuthService.login({ password: process.env.ADMIN_PASSWORD || 'ServiProce2026!', ip: testIp });
    assert.equal(loginRes.ok, true);

    const activeCheck = await AuthService.verifySession(loginRes.token);
    assert.equal(activeCheck.valid, true);

    // Simular 16 minutos de inactividad en la base de datos
    const sixteenMinAgo = Date.now() - 16 * 60 * 1000;
    await dbManager.query(
      'UPDATE sessions SET last_activity_at = $1 WHERE token_id = $2',
      [sixteenMinAgo, activeCheck.user.tokenId]
    );

    const expiredCheck = await AuthService.verifySession(loginRes.token);
    assert.equal(expiredCheck.valid, false);
    assert.equal(expiredCheck.reason, 'SESSION_EXPIRED_INACTIVITY');
  });

  await t.test('RNF-05: Prevención de Inyección SQL mediante Sentencias Preparadas', async () => {
    const maliciousSlug = "nueva-normativa-aduanera-2026' OR '1'='1";
    const rows = await dbManager.query('SELECT * FROM blog_posts WHERE slug = $1', [maliciousSlug]);
    assert.equal(rows.length, 0);
  });
});
