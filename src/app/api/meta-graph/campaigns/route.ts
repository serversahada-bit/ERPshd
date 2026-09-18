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

    const settingsRows = (await query('SELECT account_name FROM meta_api_settings WHERE id = 1')) as any[];
    const accountName = settingsRows[0]?.account_name || '';

    const rows = (await query(
      'SELECT * FROM meta_api_campaign_snapshots WHERE date_preset = ? ORDER BY spend DESC',
      [datePreset]
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

    return NextResponse.json({ success: true, data, accountName, lastFetchedAt });
  } catch (error: any) {
    console.error('Meta Graph Campaigns Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data campaign.' },
      { status: 500 }
    );
  }
}
