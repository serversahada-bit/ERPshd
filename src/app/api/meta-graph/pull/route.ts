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
    const productId = Number(body.productId);
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Produk wajib dipilih.' }, { status: 400 });
    }

    const [settingsRows, productRows] = await Promise.all([
      query('SELECT access_token FROM meta_api_settings WHERE id = 1') as Promise<any[]>,
      query('SELECT meta_ad_account_id FROM meta_ads_products WHERE id = ?', [productId]) as Promise<any[]>,
    ]);
    const accessToken = settingsRows[0]?.access_token;
    const adAccountId = productRows[0]?.meta_ad_account_id;

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Kredensial Meta API belum diatur untuk produk ini.', notConfigured: true }, { status: 400 });
    }

    const campaigns = await fetchCampaignInsights(accessToken, adAccountId, datePreset);

    for (const c of campaigns) {
      await query(
        `INSERT INTO meta_api_campaign_snapshots
           (product_id, campaign_id, campaign_name, date_preset, spend, impressions, reach, clicks, ctr, cpm)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           campaign_name = VALUES(campaign_name), spend = VALUES(spend), impressions = VALUES(impressions),
           reach = VALUES(reach), clicks = VALUES(clicks), ctr = VALUES(ctr), cpm = VALUES(cpm)`,
        [productId, c.campaignId, c.campaignName, datePreset, c.spend, c.impressions, c.reach, c.clicks, c.ctr, c.cpm]
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
