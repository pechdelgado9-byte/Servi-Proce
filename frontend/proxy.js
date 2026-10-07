import { NextResponse } from 'next/server';

// Idiomas soportados
const locales = ['es', 'en'];
const defaultLocale = 'es';

// Rutas estáticas o de Next.js que no deben ser interceptadas
const PUBLIC_FILE = /\.(.*)$/;

export default function proxy(request) {
  const { pathname } = request.nextUrl;

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

  // Si no tiene idioma, intentar obtenerlo de las cabeceras
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
