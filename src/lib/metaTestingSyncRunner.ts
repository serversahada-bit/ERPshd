import { queryAdvertiser as query } from './dbAdvertiser';
import { fetchCombinedAdInsight } from './metaGraphApi';
import { fetchScalevContentStats } from './scalevApi';
import { mapDbRowToMetaTesting, MetaTestingRow } from './metaTesting';

/**
 * Tarik ulang performa satu baris Meta Testing dari Meta Graph API (+ Scalev kalau sudah
 * diatur), lalu simpan ke database. Dipakai baik dari tombol "Sync" manual
 * (POST /api/meta-testing/[id]/sync) maupun dari penjadwal otomatis (lihat
 * metaTestingScheduler.ts) — `actor` dicatat di kolom diubah_oleh supaya kelihatan mana
 * yang manual vs otomatis.
 *
 * `ad_id` boleh berisi BEBERAPA Ad ID dipisah koma (satu konten yang sama diupload ke
 * beberapa ad set/campaign berbeda) — metriknya digabung dari semua Ad ID itu, lihat
 * fetchCombinedAdInsight di metaGraphApi.ts untuk cara penggabungannya.
 *
 * Scalev (Closing/Box) bersifat OPSIONAL untuk saat ini — kalau Store/Page Scalev belum
 * diatur, sync tetap jalan cuma buat data dari Meta (Spending, Lead, Hook/Hold Rate, CTR,
 * CPM), Closing/Box/CR/CPA/CPA% dibiarkan seperti nilai tersimpan sebelumnya (biasanya
 * diisi manual sampai Scalev diurus lagi).
 */
export async function runMetaTestingSync(actor: string, id: number): Promise<MetaTestingRow> {
  const rows = (await query(
    `SELECT mt.*, mp.scalev_test_store_id
     FROM meta_testing mt
     JOIN meta_ads_products mp ON mp.id = mt.product_id
     WHERE mt.id = ?`,
    [id]
  )) as any[];
  const row = rows[0];
  if (!row) {
    throw new Error('Data tidak ditemukan.');
  }
  if (!row.ad_id) {
    throw new Error('Ad ID belum diisi untuk konten ini.');
  }

  const metaSettingsRows = (await query('SELECT access_token FROM meta_api_settings WHERE id = 1')) as any[];
  const accessToken = metaSettingsRows[0]?.access_token;
  if (!accessToken) {
    throw new Error('Token Meta API belum diatur (menu Meta Ads Live).');
  }

  const sinceDate: string | null = row.tanggal_running ? new Date(row.tanggal_running).toISOString().slice(0, 10) : null;
  const adIds = String(row.ad_id)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const adInsight = await fetchCombinedAdInsight(accessToken, adIds, sinceDate || undefined);

  const fields = ['spending = ?', 'total_lead = ?', 'hook_rate = ?', 'hold_rate = ?', 'ctr = ?', 'cpm = ?'];
  const values: (string | number)[] = [
    adInsight.spend,
    adInsight.totalLead,
    adInsight.hookRate,
    adInsight.holdRate,
    adInsight.ctr,
    adInsight.cpm,
  ];

  // Rumus dikonfirmasi dari sheet asli user (tab "META TESTING"): CPR = Spending/Lead.
  const cpr = adInsight.totalLead > 0 ? adInsight.spend / adInsight.totalLead : 0;
  fields.push('cpr = ?');
  values.push(cpr);

  // Scalev opsional — cuma dicoba kalau Store & Page-nya sudah diisi.
  if (row.scalev_test_store_id && row.scalev_page_id) {
    const scalevSettingsRows = (await query('SELECT api_key FROM scalev_settings WHERE id = 1')) as any[];
    const scalevApiKey = scalevSettingsRows[0]?.api_key;
    if (scalevApiKey) {
      const scalevStats = await fetchScalevContentStats(scalevApiKey, row.scalev_test_store_id, row.scalev_page_id, sinceDate);
      // Rumus: CR = Closing/Lead, CPA = Spending/Box (BUKAN Spending/Closing).
      const cr = adInsight.totalLead > 0 ? (scalevStats.closing / adInsight.totalLead) * 100 : 0;
      const cpa = scalevStats.box > 0 ? adInsight.spend / scalevStats.box : 0;
      const cpaPersen = cpa > 0 ? (cpa / 80000) * 100 : 0;
      fields.push('closing = ?', 'box = ?', 'cr = ?', 'cpa = ?', 'cpa_persen = ?');
      values.push(scalevStats.closing, scalevStats.box, cr, cpa, cpaPersen);
    }
  }

  fields.push('last_synced_at = NOW()', 'diubah_oleh = ?');
  values.push(actor);

  await query(`UPDATE meta_testing SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);

  const updatedRows = (await query(
    `SELECT mt.*, mp.nama AS product_nama FROM meta_testing mt JOIN meta_ads_products mp ON mp.id = mt.product_id WHERE mt.id = ?`,
    [id]
  )) as any[];

  return mapDbRowToMetaTesting(updatedRows[0]);
}
