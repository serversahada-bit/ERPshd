import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchCampaignInsights } from '@/lib/metaGraphApi';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const datePreset = String(body.datePreset || 'today');

    const rows = (await query('SELECT * FROM meta_api_settings WHERE id = 1')) as any[];
    const settings = rows[0];

    if (!settings?.access_token || !settings?.ad_account_id) {
      return NextResponse.json({ success: false, error: 'Kredensial Meta API belum diatur.', notConfigured: true }, { status: 400 });
    }

    const campaigns = await fetchCampaignInsights(settings.access_token, settings.ad_account_id, datePreset);

    for (const c of campaigns) {
      await query(
        `INSERT INTO meta_api_campaign_snapshots
           (campaign_id, campaign_name, date_preset, spend, impressions, reach, clicks, ctr, cpm)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           campaign_name = VALUES(campaign_name), spend = VALUES(spend), impressions = VALUES(impressions),
           reach = VALUES(reach), clicks = VALUES(clicks), ctr = VALUES(ctr), cpm = VALUES(cpm)`,
        [c.campaignId, c.campaignName, datePreset, c.spend, c.impressions, c.reach, c.clicks, c.ctr, c.cpm]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menarik & menyimpan ${campaigns.length} campaign.`,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error('Meta Graph Pull Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menarik data dari Meta API.' },
      { status: 500 }
    );
  }
}
