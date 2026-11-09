import fs from 'node:fs/promises';
import path from 'node:path';
import { cacheTag, cacheLife } from 'next/cache';
import { API_BASE_URL } from './api';

// Capa de consumo Headless de Noticias / Leyes actualizadas / Avisos (Sección 3.4.1 y RF-07 del ERS).
// Si el Backend Headless (puerto 1337) está apagado y se prueba únicamente el Frontend,
// usa como respaldo visual los datos de muestra en data/avisos.json.

export const AVISO_TYPES = ['noticia', 'ley', 'aviso'];
export const AVISOS_TAG = 'avisos';

const DATA_FILE = path.join(process.cwd(), 'data', 'avisos.json');

async function readFallbackAvisos(lang = 'es', { type, limit } = {}) {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const today = new Date().toISOString().slice(0, 10);
    let list = parsed.filter((a) => !a.expiresAt || a.expiresAt >= today);
    if (type && AVISO_TYPES.includes(type)) list = list.filter((a) => a.type === type);
    list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.publishedAt).localeCompare(String(a.publishedAt)));
    if (limit) list = list.slice(0, Number(limit));
    return list.map((a) => ({
      id: a.id,
      type: a.type,
      title: (lang === 'en' && a.title_en) || a.title_es,
      body: (lang === 'en' && a.body_en) || a.body_es,
      sourceUrl: a.sourceUrl || '',
      publishedAt: a.publishedAt,
      expiresAt: a.expiresAt || '',
      pinned: Boolean(a.pinned),
    }));
  } catch {
    return [];
  }
}

export async function fetchAvisos(lang = 'es', { type, limit } = {}) {
  'use cache';
  cacheTag(AVISOS_TAG);
  cacheLife('hours');

  try {
    const params = new URLSearchParams({ locale: lang });
    if (type && AVISO_TYPES.includes(type)) params.set('type', type);
    if (limit) params.set('limit', String(limit));

    const res = await fetch(`${API_BASE_URL}/avisos?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) return json.data;
    }
  } catch {
    // Si solo está encendido el Frontend (sin Backend), mostrar los avisos locales de muestra
  }

  return readFallbackAvisos(lang, { type, limit });
}
