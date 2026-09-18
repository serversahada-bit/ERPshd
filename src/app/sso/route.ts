import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheKaryawan } from '@/lib/dbAdvertiser';
import { verifySsoToken, setSessionCookie, UserSession } from '@/lib/auth';

/**
 * Penerima SSO dari Great (HRIS). Dipanggil lewat redirect saat user klik "Masuk ke ERP".
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const appUrl = request.nextUrl.origin;

  const ssoPayload = await verifySsoToken(token);
  if (!ssoPayload || !ssoPayload.id_karyawan) {
    return NextResponse.redirect(`${appUrl}/login?error=sso`);
  }

  // Cek ulang ke database agar data selalu terbaru & memastikan akun masih aktif
  const rows = (await query(
    `SELECT id_karyawan, nama, nama_user, password, jabatan, organisasi, posisi, foto, email, status_karyawan
     FROM karyawan
     WHERE id_karyawan = ?
     LIMIT 1`,
    [ssoPayload.id_karyawan]
  )) as any[];

  if (!rows || rows.length === 0 || rows[0].status_karyawan === 'Non-Aktif') {
    return NextResponse.redirect(`${appUrl}/login?error=inactive`);
  }

  const row = rows[0];
  const userPayload: UserSession = {
    id_karyawan: row.id_karyawan || '',
    nama: row.nama || '',
    nama_user: row.nama_user || '',
    role: row.jabatan || '',
    perusahaan: row.organisasi || '',
    foto: row.foto || '',
    email: row.email || '',
  };

  // Sinkronkan salinan data karyawan ke erp_sahada (dipakai fitur lain, mis. filter karyawan)
  await cacheKaryawan(row);

  await setSessionCookie(userPayload);
  return NextResponse.redirect(`${appUrl}/`);
}
