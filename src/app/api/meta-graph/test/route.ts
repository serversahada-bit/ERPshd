import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { testMetaConnection } from '@/lib/metaGraphApi';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const accessToken = String(body.accessToken || '').trim();
    const adAccountId = String(body.adAccountId || '').trim();

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Access Token dan Ad Account ID wajib diisi.' }, { status: 400 });
    }

    const info = await testMetaConnection(accessToken, adAccountId);

    // Kalau koneksi berhasil, simpan sekalian nama akunnya (biar konsisten dengan settings tersimpan).
    await query('UPDATE meta_api_settings SET account_name = ? WHERE id = 1', [info.name]);

    return NextResponse.json({
      success: true,
      message: `Berhasil terhubung ke akun "${info.name}".`,
      data: info,
    });
  } catch (error: any) {
    console.error('Meta Graph Test Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal terhubung ke Meta API. Cek kembali Access Token & Ad Account ID.' },
      { status: 400 }
    );
  }
}
