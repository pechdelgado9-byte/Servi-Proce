import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Receptor del Webhook de Regeneración Estática SSG (RF-07 Postcondición 3 y Sección 2.1.9.2.3 del ERS)
 * Cuando el administrador publica o modifica un artículo del blog, promoción o aviso en el Backend,
 * el CMS dispara una señal a este endpoint para regenerar las vistas inmediatamente.
 */
export async function POST(request) {
  const expectedSecret = process.env.WEBHOOK_SECRET || 'sp_webhook_ssg_secret_2026';
  const providedSecret = request.headers.get('x-webhook-secret');

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'INVALID_WEBHOOK_SECRET' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    for (const tag of tags) {
      revalidateTag(tag);
    }

    // Regenerar rutas bilingües principales (ES/EN)
    for (const lang of ['es', 'en']) {
      revalidatePath(`/${lang}`);
      revalidatePath(`/${lang}/blog`);
      revalidatePath(`/${lang}/avisos`);
    }

    return NextResponse.json({
      ok: true,
      revalidated: true,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
