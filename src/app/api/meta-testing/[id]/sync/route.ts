import { NextResponse } from 'next/server';
import { queryAdvertiser as query } from '@/lib/dbAdvertiser';
import { getSession } from '@/lib/auth';
import { fetchAdInsight } from '@/lib/metaGraphApi';
import { fetchScalevContentStats } from '@/lib/scalevApi';
import { mapDbRowToMetaTesting } from '@/lib/metaTesting';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = (await query(
      `SELECT mt.*, mp.scalev_test_store_id
       FROM meta_testing mt
       JOIN meta_ads_products mp ON mp.id = mt.product_id
       WHERE mt.id = ?`,
      [id]
    )) as any[];
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }
    if (!row.ad_id) {
      return NextResponse.json({ success: false, error: 'Ad ID belum diisi untuk konten ini.' }, { status: 400 });
    }
    if (!row.scalev_test_store_id) {
      return NextResponse.json({ success: false, error: 'Produk ini belum punya Store Scalev testing yang terhubung.' }, { status: 400 });
    }
    if (!row.scalev_page_id) {
      return NextResponse.json({ success: false, error: 'Scalev Page ID belum diisi untuk konten ini.' }, { status: 400 });
    }

    const [metaSettingsRows, scalevSettingsRows] = await Promise.all([
      query('SELECT access_token FROM meta_api_settings WHERE id = 1') as Promise<any[]>,
      query('SELECT api_key FROM scalev_settings WHERE id = 1') as Promise<any[]>,
    ]);
    const accessToken = metaSettingsRows[0]?.access_token;
    const scalevApiKey = scalevSettingsRows[0]?.api_key;

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Token Meta API belum diatur (menu Meta Ads Live).' }, { status: 400 });
    }
    if (!scalevApiKey) {
      return NextResponse.json({ success: false, error: 'API key Scalev belum diatur.' }, { status: 400 });
    }

    const sinceDate: string | null = row.tanggal_running
      ? new Date(row.tanggal_running).toISOString().slice(0, 10)
      : null;

    const [adInsight, scalevStats] = await Promise.all([
      fetchAdInsight(accessToken, row.ad_id, sinceDate || undefined),
      fetchScalevContentStats(scalevApiKey, row.scalev_test_store_id, row.scalev_page_id, sinceDate),
    ]);

    // Rumus dikonfirmasi dari sheet asli user (tab "META TESTING"): CPR = Spending/Lead,
    // CR = Closing/Lead, CPA = Spending/Box (BUKAN Spending/Closing).
    const cpr = adInsight.totalLead > 0 ? adInsight.spend / adInsight.totalLead : 0;
    const cr = adInsight.totalLead > 0 ? (scalevStats.closing / adInsight.totalLead) * 100 : 0;
    const cpa = scalevStats.box > 0 ? adInsight.spend / scalevStats.box : 0;
    const cpaPersen = cpa > 0 ? (cpa / 80000) * 100 : 0;

    await query(
      `UPDATE meta_testing SET
        spending = ?, total_lead = ?, cpr = ?, hook_rate = ?, hold_rate = ?, ctr = ?, cpm = ?,
        closing = ?, box = ?, cr = ?, cpa = ?, cpa_persen = ?, last_synced_at = NOW(), diubah_oleh = ?
       WHERE id = ?`,
      [
        adInsight.spend,
        adInsight.totalLead,
        cpr,
        adInsight.hookRate,
        adInsight.holdRate,
        adInsight.ctr,
        adInsight.cpm,
        scalevStats.closing,
        scalevStats.box,
        cr,
        cpa,
        cpaPersen,
        user.nama || user.nama_user || '',
        id,
      ]
    );

    const updatedRows = (await query(
      `SELECT mt.*, mp.nama AS product_nama FROM meta_testing mt JOIN meta_ads_products mp ON mp.id = mt.product_id WHERE mt.id = ?`,
      [id]
    )) as any[];

    return NextResponse.json({ success: true, data: mapDbRowToMetaTesting(updatedRows[0]) });
  } catch (error: any) {
    console.error('Meta Testing Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal sinkronisasi data.' }, { status: 500 });
  }
}
