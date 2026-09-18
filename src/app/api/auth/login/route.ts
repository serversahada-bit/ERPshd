import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cacheKaryawan } from '@/lib/dbAdvertiser';
import { setSessionCookie, UserSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const namaUser = String(body.nama_user || '').trim();
    const password = String(body.password || '');

    if (!namaUser || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const rows = (await query(
      `SELECT id_karyawan, nama, nama_user, jabatan, organisasi, posisi, foto, email, status_karyawan, password
       FROM karyawan
       WHERE nama_user = ?
       LIMIT 1`,
      [namaUser]
    )) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Username tidak ditemukan di sistem.' },
        { status: 400 }
      );
    }

    const row = rows[0];

    if (!row.password || password !== row.password) {
      return NextResponse.json(
        { success: false, error: 'Password salah.' },
        { status: 400 }
      );
    }

    if ((row.status_karyawan || '') === 'Non-Aktif') {
      return NextResponse.json(
        { success: false, error: 'Akun Anda telah dinonaktifkan. Silakan hubungi HRD.' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: userPayload,
      redirectUrl: '/',
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server. ' + (error.message || '') },
      { status: 500 }
    );
  }
}
