import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const datePreset = searchParams.get('datePreset') || 'today';
    const productId = Number(searchParams.get('productId'));
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
    }

    const rows = (await query(
      'SELECT * FROM meta_api_campaign_snapshots WHERE product_id = ? AND date_preset = ? ORDER BY spend DESC',
      [productId, datePreset]
    )) as any[];

    const data = rows.map((r) => ({
      campaignId: r.campaign_id,
      campaignName: r.campaign_name,
      spend: Number(r.spend),
      impressions: Number(r.impressions),
      reach: Number(r.reach),
      clicks: Number(r.clicks),
      ctr: Number(r.ctr),
      cpm: Number(r.cpm),
    }));

    const lastFetchedAt = rows.length > 0 ? rows.reduce((latest, r) => (r.fetched_at > latest ? r.fetched_at : latest), rows[0].fetched_at) : null;

    return NextResponse.json({ success: true, data, lastFetchedAt });
  } catch (error: any) {
    console.error('Meta Graph Campaigns Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data campaign.' },
      { status: 500 }
    );
  }
}
