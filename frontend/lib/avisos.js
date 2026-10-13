import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { cacheTag, cacheLife } from 'next/cache';

// Capa de datos de Noticias / Leyes actualizadas / Avisos.
// Almacenamiento: data/avisos.json (archivo local). Para producción en un hosting
// sin disco persistente (p. ej. Vercel) reemplazar las funciones de este archivo
// por llamadas al CMS (Strapi) o a la base de datos; el resto del sitio no cambia.

export const AVISO_TYPES = ['noticia', 'ley', 'aviso'];
export const AVISOS_TAG = 'avisos';

const DATA_FILE = path.join(process.cwd(), 'data', 'avisos.json');

async function readFileList() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeFileList(list) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
  await fs.rename(tmp, DATA_FILE);
}

const byPinnedThenDate = (a, b) =>
  Number(b.pinned) - Number(a.pinned) || String(b.publishedAt).localeCompare(String(a.publishedAt));

// ---- Lectura pública (cacheada; se invalida con el tag "avisos") ----
export async function fetchAvisos(lang, { type, limit } = {}) {
  'use cache';
  cacheTag(AVISOS_TAG);
  cacheLife('hours'); // la caducidad por fecha se re-evalúa cada hora

  const today = new Date().toISOString().slice(0, 10);
  let list = (await readFileList()).filter((a) => !a.expiresAt || a.expiresAt >= today);
  if (type && AVISO_TYPES.includes(type)) list = list.filter((a) => a.type === type);
  list.sort(byPinnedThenDate);
  if (limit) list = list.slice(0, limit);

  return list.map((a) => ({
    id: a.id,
    type: a.type,
    title: (lang === 'en' && a.title_en) || a.title_es,
    body: (lang === 'en' && a.body_en) || a.body_es,
    sourceUrl: a.sourceUrl || '',
    publishedAt: a.publishedAt,
    pinned: Boolean(a.pinned),
  }));
}

// ---- Administración (sin caché) ----
export async function readAllAvisos() {
  const list = await readFileList();
  return list.sort(byPinnedThenDate);
}

export async function createAviso(data) {
  const list = await readFileList();
  const item = {
    id: crypto.randomUUID().slice(0, 8),
    publishedAt: new Date().toISOString().slice(0, 10),
    ...data,
  };
  list.push(item);
  await writeFileList(list);
  return item;
}

export async function updateAviso(id, data) {
  const list = await readFileList();
  const i = list.findIndex((a) => a.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...data, id: list[i].id, publishedAt: list[i].publishedAt };
  await writeFileList(list);
  return list[i];
}

export async function deleteAviso(id) {
  const list = await readFileList();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  await writeFileList(next);
  return true;
}
