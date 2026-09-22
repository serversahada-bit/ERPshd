import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

// Saran nama ADV dari Main DB (karyawan.posisi mengandung "Advertiser"), dipakai
// buat datalist di form Closing Box CS. Query langsung ke HRIS "Great" (bukan cache
// erp_sahada) supaya semua advertiser aktif ikut muncul, tidak cuma yang pernah login ke ERP.
export async function GET() {
  if (!await getSession()) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  try {
    const rows = (await query(
      `SELECT nama FROM karyawan
       WHERE posisi LIKE '%Advertiser%' AND (status_karyawan IS NULL OR status_karyawan != 'Non-Aktif')
       ORDER BY nama`
    )) as { nama: string }[];
    return NextResponse.json({ success: true, data: rows.map((row) => row.nama) });
  } catch (error) {
    console.error('[Closing Box CS] Gagal memuat opsi ADV:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat daftar advertiser.' }, { status: 500 });
  }
}
