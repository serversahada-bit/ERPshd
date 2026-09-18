import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'erp_session_token';
const PUBLIC_PATHS = ['/login', '/sso'];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'erp-app-secret-key-nurul-2026-super-secure'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Lewati semua route API auth, file internal Next.js, ikon (favicon/icon/apple-icon),
    // dan berkas statis publik (gambar, font, dst) supaya tidak ikut ter-redirect ke /login.
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.png|apple-icon.png|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};
