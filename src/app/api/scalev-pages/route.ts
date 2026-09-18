import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchScalevPages } from '@/lib/scalevApi';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get('productId'));
  if (!productId) {
    return NextResponse.json({ success: false, error: 'productId wajib diisi.' }, { status: 400 });
  }

  try {
    const productRows = (await query('SELECT scalev_test_store_id FROM meta_ads_products WHERE id = ?', [productId])) as any[];
    const storeId = productRows[0]?.scalev_test_store_id;
    if (!storeId) {
      return NextResponse.json({ success: false, error: 'Produk ini belum terhubung ke Store Scalev testing.' }, { status: 400 });
    }

    const scalevSettingsRows = (await query('SELECT api_key FROM scalev_settings WHERE id = 1')) as any[];
    const apiKey = scalevSettingsRows[0]?.api_key;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key Scalev belum diatur.' }, { status: 400 });
    }

    const pages = await fetchScalevPages(apiKey, storeId);
    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Scalev Pages GET Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil daftar landing page Scalev.' }, { status: 500 });
  }
}
