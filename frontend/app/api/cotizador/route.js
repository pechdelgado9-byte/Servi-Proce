import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

// Proxy desacoplado hacia el servidor Backend Headless (/api/quotations) para las cotizaciones de Despachos Aduanales.
// Garantiza que toda solicitud se valide con RF-01, RF-04 y RF-09 en el Backend, se registre en la tabla Log de la BD y se envíe por SMTP.

const FILE_FIELDS = ['invoice', 'specs', 'msds'];

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_form' }, { status: 400 });
  }

  const str = (k) => String(form.get(k) ?? '').trim();
  const hazmat = str('hazmat') === 'true';

  const filesPayload = [];
  for (const field of FILE_FIELDS) {
    const file = form.get(field);
    if (file && typeof file === 'object' && file.size > 0) {
      const arrayBuf = await file.arrayBuffer();
      filesPayload.push({
        field,
        name: file.name || `${field}.pdf`,
        base64: Buffer.from(arrayBuf).toString('base64'),
      });
    } else if (field === 'msds' && hazmat) {
      return NextResponse.json({ ok: false, error: 'file_msds_required' }, { status: 400 });
    }
  }

  const payload = {
    website: str('website'),
    recaptchaToken: str('recaptchaToken') || 'dev-human-token',
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    company: str('company'),
    service: 'Despacho de Aduana',
    operation: str('operation'),
    mode: str('mode'),
    country: str('country'),
    industry: str('industry'),
    description: str('description'),
    hazmat,
    requireMsds: hazmat,
    files: filesPayload,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': request.headers.get('x-forwarded-for') || 'local',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: 'backend_unreachable' }, { status: 502 });
  }
}
