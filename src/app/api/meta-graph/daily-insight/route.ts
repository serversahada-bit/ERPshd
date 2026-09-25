import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchAccountDailyInsight } from '@/lib/metaGraphApi';

// Tarik Spend/Jangkauan/Impresi/Klik Tautan satu hari untuk satu produk — dipakai tombol
// "Tarik dari Meta" di form Tambah/Edit Data Harian Meta Ads.
export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get('productId'));
  const date = (searchParams.get('date') || '').trim();
  // Boleh override Ad Account yang dipakai buat sekali tarik ini saja, tanpa mengubah
  // Ad Account default produk yang tersimpan (diatur di Master Produk).
  const adAccountOverride = (searchParams.get('adAccountId') || '').trim();

  if (!productId) {
    return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, error: 'Tanggal tidak valid.' }, { status: 400 });
  }

  try {
    const [settingsRows, productRows] = await Promise.all([
      query('SELECT access_token FROM meta_api_settings WHERE id = 1') as Promise<any[]>,
      query('SELECT meta_ad_account_id FROM meta_ads_products WHERE id = ?', [productId]) as Promise<any[]>,
    ]);
    const accessToken = settingsRows[0]?.access_token;
    const adAccountId = adAccountOverride || productRows[0]?.meta_ad_account_id;

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Meta Ad Account ID produk ini belum diatur (menu Meta Ads Live).' }, { status: 400 });
    }

    const insight = await fetchAccountDailyInsight(accessToken, adAccountId, date);
    return NextResponse.json({ success: true, data: insight });
  } catch (error: any) {
    console.error('Meta Graph Daily Insight Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil data dari Meta.' }, { status: 500 });
  }
}
