import { NextResponse } from 'next/server';
import { queryAdvertiser } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { searchAds } from '@/lib/metaGraphApi';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const productId = Number(searchParams.get('productId'));
  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }
  if (!productId) {
    return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
  }

  try {
    const [settingsRows, productRows] = await Promise.all([
      queryAdvertiser('SELECT access_token FROM meta_api_settings WHERE id = 1') as Promise<any[]>,
      queryAdvertiser('SELECT meta_ad_account_id FROM meta_ads_products WHERE id = ?', [productId]) as Promise<any[]>,
    ]);
    const accessToken = settingsRows[0]?.access_token;
    const adAccountId = productRows[0]?.meta_ad_account_id;

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Meta Ad Account ID produk ini belum diatur (menu Meta Ads Live).' }, { status: 400 });
    }

    const results = await searchAds(accessToken, adAccountId, q);
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Meta Ads Search Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mencari iklan.' }, { status: 500 });
  }
}
