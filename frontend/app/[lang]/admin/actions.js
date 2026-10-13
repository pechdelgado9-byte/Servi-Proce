'use server';

import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { updateTag } from 'next/cache';
import { ADMIN_COOKIE, SESSION_MAX_AGE_S, adminEnabled, checkPassword, createSessionToken, isAdmin } from '@/lib/auth';
import { AVISO_TYPES, AVISOS_TAG, createAviso, updateAviso, deleteAviso } from '@/lib/avisos';

const safeLang = (v) => (v === 'en' ? 'en' : 'es');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Límite de intentos fallidos de login (en memoria): 5 por 15 min por IP.
const failures = new Map();
function tooManyFailures(ip) {
  const now = Date.now();
  const recent = (failures.get(ip) || []).filter((t) => now - t < 15 * 60_000);
  failures.set(ip, recent);
  return recent.length >= 5;
}

export async function login(formData) {
  const lang = safeLang(formData.get('lang'));
  const ip = ((await headers()).get('x-forwarded-for') || 'local').split(',')[0].trim();

  if (!adminEnabled() || tooManyFailures(ip)) redirect(`/${lang}/admin?error=login`);

  if (!checkPassword(String(formData.get('password') ?? ''))) {
    failures.set(ip, [...(failures.get(ip) || []), Date.now()]);
    redirect(`/${lang}/admin?error=login`);
  }

  (await cookies()).set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
  redirect(`/${lang}/admin`);
}

export async function logout(formData) {
  const lang = safeLang(formData.get('lang'));
  (await cookies()).delete(ADMIN_COOKIE);
  redirect(`/${lang}/admin`);
}

export async function saveAviso(formData) {
  const lang = safeLang(formData.get('lang'));
  if (!(await isAdmin())) redirect(`/${lang}/admin`);

  const s = (k) => String(formData.get(k) ?? '').trim();
  const data = {
    type: s('type'),
    title_es: s('title_es'),
    title_en: s('title_en'),
    body_es: s('body_es'),
    body_en: s('body_en'),
    sourceUrl: s('sourceUrl'),
    expiresAt: s('expiresAt'),
    pinned: formData.get('pinned') === 'on',
  };

  let validUrl = data.sourceUrl === '';
  if (!validUrl) {
    try {
      const u = new URL(data.sourceUrl);
      validUrl = (u.protocol === 'https:' || u.protocol === 'http:') && data.sourceUrl.length <= 500;
    } catch {
      validUrl = false;
    }
  }

  const id = s('id');
  const valid =
    AVISO_TYPES.includes(data.type) &&
    data.title_es.length >= 3 && data.title_es.length <= 160 &&
    data.body_es.length >= 1 && data.body_es.length <= 4000 &&
    data.title_en.length <= 160 && data.body_en.length <= 4000 &&
    validUrl &&
    (data.expiresAt === '' || DATE_RE.test(data.expiresAt));

  if (!valid) redirect(`/${lang}/admin?error=validation${id ? `&edit=${encodeURIComponent(id)}` : ''}`);

  if (id) {
    const updated = await updateAviso(id, data);
    if (!updated) redirect(`/${lang}/admin?error=notfound`);
  } else {
    await createAviso(data);
  }
  updateTag(AVISOS_TAG);
  redirect(`/${lang}/admin?ok=saved`);
}

export async function removeAviso(formData) {
  const lang = safeLang(formData.get('lang'));
  if (!(await isAdmin())) redirect(`/${lang}/admin`);
  await deleteAviso(String(formData.get('id') ?? ''));
  updateTag(AVISOS_TAG);
  redirect(`/${lang}/admin?ok=deleted`);
}
