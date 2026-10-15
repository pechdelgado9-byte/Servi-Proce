import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

// Solicitud de cotización: SOLO recibe datos de contacto y documentos.
// No calcula ni devuelve precios, costos ni estimados; el asesor da seguimiento
// directamente con el cliente por su medio de contacto.

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB por archivo
const ALLOWED_EXT = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx', 'xml'];
const FILE_FIELDS = [
  { field: 'invoice', label: 'factura-comercial', required: false },
  { field: 'specs', label: 'especificaciones-tecnicas', required: false },
  { field: 'msds', label: 'msds', required: false },
];
const OPERATIONS = ['import', 'export'];
const MODES = ['air', 'sea', 'land'];
const INDUSTRIES = ['autopartes', 'electronica', 'textil', 'calzado', 'maquinaria', 'siderurgicos', 'otro'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Límite simple en memoria: 10 solicitudes por hora por IP.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

function looksLikeExt(ext, buf) {
  const head = buf.subarray(0, 8);
  switch (ext) {
    case 'pdf': return head.subarray(0, 4).toString('latin1') === '%PDF';
    case 'png': return head[0] === 0x89 && head.subarray(1, 4).toString('latin1') === 'PNG';
    case 'jpg':
    case 'jpeg': return head[0] === 0xff && head[1] === 0xd8;
    case 'docx':
    case 'xlsx': return head[0] === 0x50 && head[1] === 0x4b;
    case 'xml': return buf.subarray(0, 200).toString('utf8').trimStart().startsWith('<');
    default: return false;
  }
}

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // sin llave (desarrollo) no se valida
  if (!token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const json = await res.json();
    return Boolean(json.success) && (json.score ?? 1) >= 0.5;
  } catch {
    return false;
  }
}

const bad = (code, status = 400) => NextResponse.json({ ok: false, error: code }, { status });

export async function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (rateLimited(ip)) return bad('rate_limited', 429);

  let form;
  try {
    form = await request.formData();
  } catch {
    return bad('invalid_form');
  }

  if (String(form.get('website') || '').trim() !== '') return bad('rejected', 403); // honeypot
  if (!(await verifyRecaptcha(String(form.get('recaptchaToken') || '')))) return bad('recaptcha', 403);

  const str = (k) => String(form.get(k) ?? '').trim();
  const data = {
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    company: str('company'),
    operation: str('operation'),
    mode: str('mode'),
    country: str('country'),
    industry: str('industry'),
    description: str('description'),
    hazmat: str('hazmat') === 'true',
  };

  if (!data.name || data.name.length > 120) return bad('name');
  if (!EMAIL_RE.test(data.email) || data.email.length > 160) return bad('email');
  if (data.phone.length > 40) return bad('phone');
  if (data.company.length > 160) return bad('company');
  if (!OPERATIONS.includes(data.operation)) return bad('operation');
  if (!MODES.includes(data.mode)) return bad('mode');
  if (!data.country || data.country.length > 80) return bad('country');
  if (!INDUSTRIES.includes(data.industry)) return bad('industry');
  if (!data.description || data.description.length > 500) return bad('description');

  const files = [];
  for (const { field, label, required } of FILE_FIELDS) {
    const file = form.get(field);
    const present = file && typeof file === 'object' && file.size > 0;
    if (!present) {
      if (required || (field === 'msds' && data.hazmat)) return bad(`file_${field}_required`);
      continue;
    }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return bad(`file_${field}_type`);
    if (file.size > MAX_FILE_BYTES) return bad(`file_${field}_size`);
    const buf = Buffer.from(await file.arrayBuffer());
    if (!looksLikeExt(ext, buf)) return bad(`file_${field}_type`);
    files.push({ label, ext, buf });
  }

  // Respaldo de la solicitud + archivos (no se pierden prospectos si falla el correo)
  const ref = `SP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  let saved = false;
  try {
    const dir = path.join(process.cwd(), 'data', 'cotizaciones', ref);
    await fs.mkdir(dir, { recursive: true });
    for (const f of files) await fs.writeFile(path.join(dir, `${f.label}.${f.ext}`), f.buf);
    await fs.writeFile(
      path.join(dir, 'solicitud.json'),
      JSON.stringify({ ref, createdAt: new Date().toISOString(), ...data, files: files.map((f) => `${f.label}.${f.ext}`) }, null, 2)
    );
    saved = true;
  } catch (err) {
    console.error('[cotizador] no se pudo guardar la solicitud:', err);
  }

  // TODO: notificar al área de ventas por SMTP / API de correo transaccional (ver ERS).
  console.log(`[cotizador] nueva solicitud ${ref} (${data.operation}/${data.mode}) de ${data.email}`);

  return NextResponse.json({ ok: true, ref, saved });
}
