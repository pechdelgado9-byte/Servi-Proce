import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { envConfig } from '../src/config/EnvironmentConfig.js';
import { BackendServer } from '../src/server.js';

test('Hito 2 - Pruebas de Integración de la API REST, Cotizaciones, reCAPTCHA, SMTP y CRUD CMS', async (t) => {
  const server = new BackendServer();
  const httpServer = await server.listen(0); // Puerto efímero para pruebas
  const port = httpServer.address().port;
  const baseUrl = `http://localhost:${port}`;

  t.after(async () => {
    await server.close();
  });

  await t.test('GET /api/promotions y GET /api/blog-posts con paridad de idioma (?locale=es|en)', async () => {
    const promoEs = await fetch(`${baseUrl}/api/promotions?locale=es`).then((r) => r.json());
    assert.equal(promoEs.ok, true);
    assert.ok(promoEs.data.title.includes('Asesoría'));

    const promoEn = await fetch(`${baseUrl}/api/promotions?locale=en`).then((r) => r.json());
    assert.equal(promoEn.ok, true);
    assert.ok(promoEn.data.title.includes('Personalized'));

    const blogEs = await fetch(`${baseUrl}/api/blog-posts?locale=es`).then((r) => r.json());
    assert.equal(blogEs.ok, true);
    assert.ok(blogEs.data.length >= 2);
  });

  await t.test('RF-03: Bloqueo topológico absoluto de rutas con "vacantes"', async () => {
    const res = await fetch(`${baseUrl}/api/vacantes`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error, 'ROUTE_PURGED_BY_RF03');
  });

  await t.test('RF-04: Rechazo HTTP 403 cuando el score de reCAPTCHA es menor a 0.5 (bot)', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bot Spam',
        email: 'bot@spam.com',
        service: 'Despacho de Aduana',
        recaptchaToken: 'bot-low-score',
      }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.error, 'recaptcha');
  });

  await t.test('RF-01: Rechazo HTTP 400 cuando falta el teléfono obligatorio o es inválido', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sin Telefono',
        email: 'test@empresa.com',
        phone: '',
        service: 'Despacho de Aduana',
        recaptchaToken: 'valid-human-token',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('INVALID_PHONE'));
  });

  await t.test('RF-01: Recepción de Cotización válida, guardado en Log de BD y despacho SMTP/Outbox', async () => {
    const res = await fetch(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'María González',
        email: 'maria@exportadora.com.mx',
        phone: '+52 33 1234 5678',
        company: 'Exportadora del Pacífico',
        service: 'Despacho de Aduana',
        description: 'Importación de maquinaria industrial bajo programa PROSEC.',
        recaptchaToken: 'valid-human-token',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.match(data.ref, /^SP-\d{8}-[A-F0-9]{4}$/);

    // Verificar que el visor del correo HTML esté protegido contra acceso anónimo (OWASP B-01)
    const unauthPreviewRes = await fetch(`${baseUrl}/api/quotations/${data.ref}/email-preview`);
    assert.equal(unauthPreviewRes.status, 401);

    // Iniciar sesión como administrador para verificar el visor protegido
    const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || 'ServiProce2026!',
      }),
    }).then((r) => r.json());
    assert.equal(adminLogin.ok, true);

    const previewRes = await fetch(`${baseUrl}/api/quotations/${data.ref}/email-preview`, {
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    });
    assert.equal(previewRes.status, 200);
    const previewHtml = await previewRes.text();
    assert.ok(previewHtml.includes(data.ref));
    assert.ok(previewHtml.includes('Exportadora del Pacífico'));

    // Verificar que también se genere la vista previa del acuse de recibo para el cliente (?target=client)
    const clientPreviewRes = await fetch(`${baseUrl}/api/quotations/${data.ref}/email-preview?target=client`, {
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    });
    assert.equal(clientPreviewRes.status, 200);
    const clientPreviewHtml = await clientPreviewRes.text();
    assert.ok(clientPreviewHtml.includes('Confirmación de Solicitud'));
    assert.ok(clientPreviewHtml.includes('María González'));

    // Verificar endpoint de diagnóstico SMTP
    const smtpCheckRes = await fetch(`${baseUrl}/api/admin/mail/verify-smtp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    });
    assert.equal(smtpCheckRes.status, 200);
    const smtpCheckData = await smtpCheckRes.json();
    assert.ok(smtpCheckData.configured !== undefined);
  });

  await t.test('RF-07 y Sección 3.1.1: Login JWT, CRUD de Blog y consulta de Tabla Log de Cotizaciones (Solo Lectura)', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || 'ServiProce2026!',
      }),
    }).then((r) => r.json());

    assert.equal(loginRes.ok, true);
    assert.ok(loginRes.token);

    // Crear un nuevo artículo de Blog desde el CMS
    const createBlogRes = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginRes.token}`,
      },
      body: JSON.stringify({
        title_es: 'Guía IMMEX y PROSEC 2026',
        title_en: 'IMMEX and PROSEC Guide 2026',
        excerpt_es: 'Optimice sus costos arancelarios con programas de fomento.',
        excerpt_en: 'Optimize your tariff costs with trade promotion programs.',
        content_es: ['Primer párrafo sobre IMMEX.', 'Segundo párrafo sobre PROSEC.'],
        content_en: ['First paragraph on IMMEX.', 'Second paragraph on PROSEC.'],
        synthesis_es: ['• Ventaja competitiva IMMEX.', '• Reducción de aranceles PROSEC.'],
        quote_text_es: 'El cumplimiento regulatorio anticipado blinda su cadena de valor.',
        quote_author: 'Dirección de Operaciones',
      }),
    });
    assert.equal(createBlogRes.status, 201);
    const createdBlog = await createBlogRes.json();
    assert.equal(createdBlog.data.slug, 'guia-immex-y-prosec-2026');

    // Verificar consulta pública del artículo con síntesis y frase personalizada
    const publicPostRes = await fetch(`${baseUrl}/api/blog-posts/guia-immex-y-prosec-2026?locale=es`).then((r) => r.json());
    assert.equal(publicPostRes.ok, true);
    assert.deepEqual(publicPostRes.data.synthesis, ['Ventaja competitiva IMMEX.', 'Reducción de aranceles PROSEC.']);
    assert.equal(publicPostRes.data.quoteText, 'El cumplimiento regulatorio anticipado blinda su cadena de valor.');
    assert.equal(publicPostRes.data.quoteAuthor, 'Dirección de Operaciones');

    // Consultar la tabla Log de Cotizaciones en modo de solo lectura
    const logsRes = await fetch(`${baseUrl}/api/admin/quotations`, {
      headers: { Authorization: `Bearer ${loginRes.token}` },
    }).then((r) => r.json());
    assert.equal(logsRes.ok, true);
    assert.ok(logsRes.data.some((l) => l.email === 'maria@exportadora.com.mx'));

    // Limpiar la cotización de prueba creada en el test para no ensuciar la base de datos operativa
    const testQuotation = logsRes.data.find((l) => l.email === 'maria@exportadora.com.mx');
    if (testQuotation) {
      await fetch(`${baseUrl}/api/admin/quotations/${testQuotation.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${loginRes.token}` },
      });
    }

    // Limpiar el artículo de prueba
    await fetch(`${baseUrl}/api/admin/blog-posts/${createdBlog.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${loginRes.token}` },
    });
  });

  test('Exportación ejecutiva a Microsoft Excel (.xlsx) con validación de autenticación y estructura binaria', async () => {
    // 1. Intento sin token de autenticación (debe retornar 401)
    const unauthorizedRes = await fetch(`${baseUrl}/api/admin/quotations/export`);
    assert.equal(unauthorizedRes.status, 401);

    // 2. Login administrativo
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || 'ServiProce2026!',
      }),
    }).then((r) => r.json());
    assert.ok(loginRes.token);

    // 3. Descarga autorizada de archivo .xlsx
    const exportRes = await fetch(`${baseUrl}/api/admin/quotations/export?locale=es`, {
      headers: { Authorization: `Bearer ${loginRes.token}` },
    });

    assert.equal(exportRes.status, 200);
    assert.equal(
      exportRes.headers.get('content-type'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const disposition = exportRes.headers.get('content-disposition');
    assert.ok(disposition.includes('attachment; filename="Cotizaciones_ServiProce_'));
    assert.ok(disposition.includes('.xlsx"'));

    // 4. Validación de firma binaria PK ZIP (cabecera oficial de archivos OpenXML .xlsx)
    const buffer = Buffer.from(await exportRes.arrayBuffer());
    assert.ok(buffer.length > 1000); // Tamaño no nulo con estilos
    assert.equal(buffer[0], 0x50); // 'P'
    assert.equal(buffer[1], 0x4b); // 'K'
    assert.equal(buffer[2], 0x03);
    assert.equal(buffer[3], 0x04);
  });

  await t.test('Difusión automática de alertas por correo a suscriptores del Boletín al publicar en Blog y Avisos', async () => {
    const testEmail = 'alerta.test@cliente.com.mx';

    // 1. Suscribir correo de prueba al boletín
    const subRes = await fetch(`${baseUrl}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    }).then((r) => r.json());
    assert.equal(subRes.ok, true);

    // 2. Login administrativo
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || 'ServiProce2026!',
      }),
    }).then((r) => r.json());
    assert.ok(loginRes.token);

    // 3. Publicar nuevo artículo de Blog
    const createBlogRes = await fetch(`${baseUrl}/api/admin/blog-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginRes.token}`,
      },
      body: JSON.stringify({
        title_es: 'Alerta Reforma Arancelaria 2026',
        excerpt_es: 'Resumen ejecutivo de la reforma comercial.',
        content_es: ['Detalles de la reforma aduanal aplicable este año.'],
        category_es: 'Regulaciones',
        synthesis_es: ['Punto clave de la reforma.'],
        quote_text_es: 'Cumplimiento preventivo garantizado.',
      }),
    }).then((r) => r.json());
    assert.equal(createBlogRes.ok, true);

    // 4. Publicar nueva Noticia en Avisos
    const createAvisoRes = await fetch(`${baseUrl}/api/admin/avisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginRes.token}`,
      },
      body: JSON.stringify({
        type: 'noticia',
        title_es: 'Alerta Operativa Manzanillo y Lázaro Cárdenas',
        body_es: 'Actualización en tiempo real sobre maniobras portuarias.',
      }),
    }).then((r) => r.json());
    assert.equal(createAvisoRes.ok, true);

    // 5. Esperar despacho asíncrono y verificar registros en outbox
    const outboxDir = path.join(envConfig.storageRootDir, 'database', 'mail_outbox');
    let blogOutbox = [];
    let avisoOutbox = [];
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const outboxFiles = await fs.readdir(outboxDir);
      blogOutbox = outboxFiles.filter((f) => f.startsWith('BROADCAST-BLOG-') && f.endsWith('.html'));
      avisoOutbox = outboxFiles.filter((f) => f.startsWith('BROADCAST-AVISO-') && f.endsWith('.html'));
      if (blogOutbox.length > 0 && avisoOutbox.length > 0) break;
    }

    assert.ok(blogOutbox.length > 0, 'Debe generarse al menos una copia de outbox para el nuevo artículo de blog');
    assert.ok(avisoOutbox.length > 0, 'Debe generarse al menos una copia de outbox para la nueva noticia');

    // Verificar contenido del correo de blog en outbox
    const latestBlogHtml = await fs.readFile(path.join(outboxDir, blogOutbox[blogOutbox.length - 1]), 'utf8');
    assert.ok(latestBlogHtml.includes('Alerta Reforma Arancelaria 2026'));
    assert.ok(latestBlogHtml.includes('/desuscribir?email='));

    // 6. Limpieza de datos de prueba
    await fetch(`${baseUrl}/api/admin/blog-posts/${createBlogRes.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${loginRes.token}` },
    });
    await fetch(`${baseUrl}/api/admin/avisos/${createAvisoRes.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${loginRes.token}` },
    });
    await fetch(`${baseUrl}/api/newsletter`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
  });
});
