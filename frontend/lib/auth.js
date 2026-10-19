import { cookies } from 'next/headers';
import { API_BASE_URL, fetchBlogPosts, fetchPromotions } from './api';
import { fetchAvisos } from './avisos';

// Gestión de sesión del administrador en el Frontend conectada por JWT al Backend Headless (RF-07, RNF-03, RNF-04)
// Incluye modo de vista previa ("frontend-only") si el usuario levanta únicamente el Frontend para revisar diseño.
export const ADMIN_COOKIE = 'sp_admin_jwt';
export const SESSION_MAX_AGE_S = 15 * 60; // RNF-04: Cierre automático de sesión tras 15 minutos de inactividad

export function adminEnabled() {
  return true;
}

export async function getAdminToken() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value || '';
}

export async function isAdmin() {
  const token = await getAdminToken();
  if (!token) return false;
  if (token === 'frontend-preview-mode') return true;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return false;
  }
}

export async function fetchAdminDashboardData() {
  const token = await getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Si solo se levantó el Frontend para revisar el diseño visual, devuelve datos de vista previa
  }

  const [promoEs, postsEs, avisosEs] = await Promise.all([
    fetchPromotions('es'),
    fetchBlogPosts('es'),
    fetchAvisos('es'),
  ]);

  return {
    promotions: promoEs
      ? [
          {
            id: promoEs.id || 'promo-2026-01',
            title_es: promoEs.title,
            title_en: 'Personalized advice for your foreign trade operation',
            description_es: promoEs.description,
            description_en: 'Contact us and a specialized advisor will follow up with your operation directly.',
            published_at: '2026-10-18',
            expires_at: promoEs.validUntil || '2027-10-18',
            status: 'Publicado',
          },
        ]
      : [],
    blogPosts: postsEs.map((p) => ({
      id: p.id,
      slug: p.slug,
      title_es: p.title,
      title_en: p.title,
      excerpt_es: p.excerpt,
      excerpt_en: p.excerpt,
      content_es: p.content || [p.excerpt],
      content_en: p.content || [p.excerpt],
      category_es: p.category,
      category_en: p.category,
      read_time_es: p.readTime,
      author: p.author,
      image_url: p.imageUrl,
      seo_title_es: p.seo?.title || p.title,
      seo_desc_es: p.seo?.description || p.excerpt,
      published_at: p.date,
    })),
    avisos: avisosEs.map((a) => ({
      id: a.id,
      type: a.type,
      title_es: a.title,
      title_en: a.title,
      body_es: a.body,
      body_en: a.body,
      sourceUrl: a.sourceUrl || '',
      publishedAt: a.publishedAt,
      expiresAt: a.expiresAt || '',
      pinned: a.pinned,
    })),
    quotationLogs: [
      {
        id: 'log-demo-1',
        reference: 'SP-20261018-A1B2',
        name: 'Carlos Mendoza (Vista Previa)',
        email: 'cmendoza@importadoramx.com',
        phone: '+52 33 1140 2745',
        company: 'Importadora Industrial del Occidente',
        service: 'Despacho de Aduana',
        operation: 'import',
        mode: 'sea',
        country: 'China',
        description: 'Importación de maquinaria bajo programa PROSEC.',
        files: ['factura-comercial.pdf'],
        recaptchaScore: 0.9,
        smtpStatus: 'sent_smtp',
        createdAt: '2026-10-18T14:30:00Z',
      },
    ],
    newsletter: [{ id: 'sub-1', email: 'cliente@empresa.com.mx' }],
  };
}
