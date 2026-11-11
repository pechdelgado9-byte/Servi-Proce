import { redirect } from 'next/navigation';

export default async function CotizarRedirectPage({ params }) {
  const { lang } = await params;
  const safeLang = lang === 'en' ? 'en' : 'es';
  redirect(`/${safeLang}/despachos-aduanales#cotizador`);
}
