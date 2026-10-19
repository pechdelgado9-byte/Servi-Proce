'use server';

import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { updateTag } from 'next/cache';
import { API_BASE_URL, BLOG_TAG, PROMOTIONS_TAG } from '@/lib/api';
import { ADMIN_COOKIE, SESSION_MAX_AGE_S, getAdminToken } from '@/lib/auth';
import { AVISOS_TAG } from '@/lib/avisos';

const safeLang = (v) => (v === 'en' ? 'en' : 'es');

/**
 * Sube opcionalmente un archivo de imagen al Backend Headless (/api/admin/upload)
 * aplicando la normalización y sanitización de nombres del RF-09 (<= 2 MB).
 */
async function uploadImageIfPresent(file, token) {
  if (!file || typeof file !== 'object' || file.size <= 0) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  const res = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name || 'imagen.webp',
      base64: buf.toString('base64'),
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'UPLOAD_ERROR');
  }
  return data.url;
}

/**
 * Autenticación contra el Backend Headless (RF-07, RNF-03 bloqueo 15m tras 5 intentos, RNF-04 inactividad 15m)
 */
export async function login(formData) {
  const lang = safeLang(formData.get('lang'));
  const ip = ((await headers()).get('x-forwarded-for') || 'local').split(',')[0].trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  let res;
  let data;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify({ username, password }),
    });
    data = await res.json();
  } catch {
    // Modo Vista Previa cuando se ejecuta únicamente el Frontend sin encender el Backend
    const expectedPass = process.env.ADMIN_PASSWORD || 'ServiProce2026!';
    if (password === expectedPass) {
      (await cookies()).set(ADMIN_COOKIE, 'frontend-preview-mode', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_MAX_AGE_S,
      });
      redirect(`/${lang}/admin?tab=blog`);
    }
    redirect(`/${lang}/admin?error=login`);
  }

  if (!res.ok || !data.ok) {
    if (res.status === 429 || data.error === 'ACCOUNT_LOCKED_BRUTE_FORCE') {
      redirect(`/${lang}/admin?error=locked`);
    }
    redirect(`/${lang}/admin?error=login`);
  }

  (await cookies()).set(ADMIN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });

  redirect(`/${lang}/admin?tab=blog`);
}

export async function logout(formData) {
  const lang = safeLang(formData.get('lang'));
  const reason = String(formData.get('reason') ?? '');
  const token = await getAdminToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignorar si el backend no responde al cerrar sesión
    }
  }

  (await cookies()).delete(ADMIN_COOKIE);
  redirect(`/${lang}/admin${reason === 'inactivity' ? '?error=inactivity' : ''}`);
}

/**
 * CRUD de Artículos del Blog en el CMS Headless (RF-07, RF-09, RF-10)
 */
export async function saveBlogPost(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const s = (k) => String(formData.get(k) ?? '').trim();
  const id = s('id');

  let uploadedImageUrl = null;
  try {
    uploadedImageUrl = await uploadImageIfPresent(formData.get('image_file'), token);
  } catch {
    redirect(`/${lang}/admin?tab=blog&error=upload`);
  }

  const payload = {
    slug: s('slug'),
    title_es: s('title_es'),
    title_en: s('title_en'),
    excerpt_es: s('excerpt_es'),
    excerpt_en: s('excerpt_en'),
    content_es: s('content_es'),
    content_en: s('content_en'),
    category_es: s('category_es') || 'Comercio Exterior',
    category_en: s('category_en') || 'Foreign Trade',
    read_time_es: s('read_time_es') || '5 min de lectura',
    read_time_en: s('read_time_en') || '5 min read',
    author: s('author') || 'Equipo Servi Proce',
    image_url: uploadedImageUrl || s('image_url') || '/logo.png',
    seo_title_es: s('seo_title_es').slice(0, 60),
    seo_title_en: s('seo_title_en').slice(0, 60),
    seo_desc_es: s('seo_desc_es').slice(0, 160),
    seo_desc_en: s('seo_desc_en').slice(0, 160),
  };

  const url = id ? `${API_BASE_URL}/admin/blog-posts/${encodeURIComponent(id)}` : `${API_BASE_URL}/admin/blog-posts`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    redirect(`/${lang}/admin?tab=blog&error=validation${id ? `&editBlog=${encodeURIComponent(id)}` : ''}`);
  }

  updateTag(BLOG_TAG);
  redirect(`/${lang}/admin?tab=blog&ok=saved`);
}

export async function removeBlogPost(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const id = String(formData.get('id') ?? '').trim();
  await fetch(`${API_BASE_URL}/admin/blog-posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  updateTag(BLOG_TAG);
  redirect(`/${lang}/admin?tab=blog&ok=deleted`);
}

/**
 * CRUD de Promociones con caducidad automática de 365 días (RF-02, RF-07, RF-09)
 */
export async function savePromotion(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const s = (k) => String(formData.get(k) ?? '').trim();
  const id = s('id');

  let uploadedImageUrl = null;
  try {
    uploadedImageUrl = await uploadImageIfPresent(formData.get('image_file'), token);
  } catch {
    redirect(`/${lang}/admin?tab=promotions&error=upload`);
  }

  const payload = {
    title_es: s('title_es'),
    title_en: s('title_en'),
    description_es: s('description_es'),
    description_en: s('description_en'),
    image_url: uploadedImageUrl || s('image_url'),
    expires_at: s('expires_at'),
    status: s('status') || 'Publicado',
  };

  const url = id ? `${API_BASE_URL}/admin/promotions/${encodeURIComponent(id)}` : `${API_BASE_URL}/admin/promotions`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    redirect(`/${lang}/admin?tab=promotions&error=validation`);
  }

  updateTag(PROMOTIONS_TAG);
  redirect(`/${lang}/admin?tab=promotions&ok=saved`);
}

export async function removePromotion(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const id = String(formData.get('id') ?? '').trim();
  await fetch(`${API_BASE_URL}/admin/promotions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  updateTag(PROMOTIONS_TAG);
  redirect(`/${lang}/admin?tab=promotions&ok=deleted`);
}

/**
 * CRUD de Noticias, Leyes y Avisos (RF-07)
 */
export async function saveAviso(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const s = (k) => String(formData.get(k) ?? '').trim();
  const id = s('id');
  const payload = {
    type: s('type'),
    title_es: s('title_es'),
    title_en: s('title_en'),
    body_es: s('body_es'),
    body_en: s('body_en'),
    sourceUrl: s('sourceUrl'),
    expiresAt: s('expiresAt'),
    pinned: formData.get('pinned') === 'on',
  };

  const url = id ? `${API_BASE_URL}/admin/avisos/${encodeURIComponent(id)}` : `${API_BASE_URL}/admin/avisos`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    redirect(`/${lang}/admin?tab=avisos&error=validation${id ? `&edit=${encodeURIComponent(id)}` : ''}`);
  }

  updateTag(AVISOS_TAG);
  redirect(`/${lang}/admin?tab=avisos&ok=saved`);
}

export async function removeAviso(formData) {
  const lang = safeLang(formData.get('lang'));
  const token = await getAdminToken();
  if (!token) redirect(`/${lang}/admin`);

  const id = String(formData.get('id') ?? '').trim();
  await fetch(`${API_BASE_URL}/admin/avisos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  updateTag(AVISOS_TAG);
  redirect(`/${lang}/admin?tab=avisos&ok=deleted`);
}
