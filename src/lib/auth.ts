import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env var is required');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

// Secret ini HARUS sama persis dengan SSO_SECRET di aplikasi Great (HRIS),
// dipakai untuk memverifikasi token SSO yang dikirim dari tombol "Masuk ke ERP".
function getSsoSecret(): Uint8Array {
  if (!process.env.SSO_SECRET) {
    throw new Error('SSO_SECRET env var is required');
  }
  return new TextEncoder().encode(process.env.SSO_SECRET);
}

const SESSION_COOKIE = 'erp_session_token';

export interface UserSession {
  id_karyawan: string;
  nama: string;
  nama_user: string;
  role: string;
  perusahaan: string;
  foto: string;
  email: string;
}

export async function createSessionToken(user: UserSession): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setSessionCookie(user: UserSession): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Verifikasi token SSO singkat yang dikirim dari Great (HRIS) saat user klik "Masuk ke ERP".
 */
export async function verifySsoToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSsoSecret());
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}
