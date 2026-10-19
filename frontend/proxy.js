import { NextResponse } from 'next/server';

// Idiomas soportados (RF-03)
const locales = ['es', 'en'];
const defaultLocale = 'es';

// Rutas estáticas o de Next.js que no deben ser interceptadas
const PUBLIC_FILE = /\.(.*)$/;

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // RF-03 Precondición 2 y Postcondición 3: Exclusión Topológica Absoluta de "vacantes" o "bolsa-de-trabajo"
  // Si se intenta acceder a cualquier ruta relacionada con vacantes, aborta y redirige al inicio.
  if (/vacantes|bolsa-de-trabajo/i.test(pathname)) {
    const targetLocale = pathname.startsWith('/en') ? 'en' : defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${targetLocale}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Si es una ruta interna de Next.js, un archivo público o ruta de API, no hacemos nada
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Verificar si la ruta ya tiene el idioma en el path
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Si no tiene idioma, intentar obtenerlo de las cabeceras (Sección 2.1.9.1)
  const acceptLanguage = request.headers.get('accept-language');
  let localeToUse = defaultLocale;

  if (acceptLanguage) {
    if (acceptLanguage.includes('en')) {
      localeToUse = 'en';
    }
  }

  // Redirigir a la ruta con el prefijo de idioma
  request.nextUrl.pathname = `/${localeToUse}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Configuración del enrutador para ignorar explícitamente ciertas rutas
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
