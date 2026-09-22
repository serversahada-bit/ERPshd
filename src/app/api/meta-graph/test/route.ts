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
    const productId = Number(body.productId);

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Access Token dan Ad Account ID wajib diisi.' }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
    }

    const info = await testMetaConnection(accessToken, adAccountId);

    // Access Token global (dipakai semua produk); Ad Account ID disimpan ke produk ini saja.
    await query(
      `INSERT INTO meta_api_settings (id, access_token, diubah_oleh) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), diubah_oleh = VALUES(diubah_oleh)`,
      [accessToken, user.nama || user.nama_user || '']
    );
    await query('UPDATE meta_ads_products SET meta_ad_account_id = ? WHERE id = ?', [adAccountId, productId]);

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
