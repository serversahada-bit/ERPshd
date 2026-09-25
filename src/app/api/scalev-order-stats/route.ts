import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchScalevLeadsCount } from '@/lib/scalevApi';

// Ambil jumlah order Scalev yang punya utm_source terisi (lead dari iklan) pada satu
// tanggal untuk store produksi produk tertentu — dipakai buat auto-isi FORM SCALEV di
// form Meta Ads Harian.
export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const date = searchParams.get('date');

  if (!productId || !date) {
    return NextResponse.json({ success: false, error: 'productId dan date wajib diisi.' }, { status: 400 });
  }

  try {
    const [settingsRows, productRows] = await Promise.all([
      query('SELECT api_key FROM scalev_settings WHERE id = 1') as Promise<any[]>,
      query('SELECT scalev_store_id FROM meta_ads_products WHERE id = ?', [productId]) as Promise<any[]>,
    ]);

    const apiKey = settingsRows[0]?.api_key;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key Scalev belum diatur.' }, { status: 400 });
    }

    const storeId = productRows[0]?.scalev_store_id;
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Scalev Store ID produk ini belum diatur (menu Master Produk).' },
        { status: 400 }
      );
    }

    const count = await fetchScalevLeadsCount(apiKey, Number(storeId), date);
    return NextResponse.json({ success: true, data: { count } });
  } catch (error: any) {
    console.error('Scalev Order Stats GET Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil data dari Scalev.' }, { status: 500 });
  }
}
