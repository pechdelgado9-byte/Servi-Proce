import test from 'node:test';
import assert from 'node:assert/strict';
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
      }),
    });
    assert.equal(createBlogRes.status, 201);
    const createdBlog = await createBlogRes.json();
    assert.equal(createdBlog.data.slug, 'guia-immex-y-prosec-2026');

    // Consultar la tabla Log de Cotizaciones en modo de solo lectura
    const logsRes = await fetch(`${baseUrl}/api/admin/quotations`, {
      headers: { Authorization: `Bearer ${loginRes.token}` },
    }).then((r) => r.json());
    assert.equal(logsRes.ok, true);
    assert.ok(logsRes.data.some((l) => l.email === 'maria@exportadora.com.mx'));

    // Limpiar el artículo de prueba
    await fetch(`${baseUrl}/api/admin/blog-posts/${createdBlog.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${loginRes.token}` },
    });
  });
});
