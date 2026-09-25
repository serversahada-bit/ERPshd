import { queryAdvertiser as query } from './dbAdvertiser';
import { runMetaAdsAutoSyncFromMeta } from './metaAdsAutoSyncRunner';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ACTOR = 'Auto Sync (Meta)';

async function runOnce() {
  try {
    const settingsRows = (await query('SELECT access_token FROM meta_api_settings WHERE id = 1')) as any[];
    const accessToken = settingsRows[0]?.access_token;
    if (!accessToken) {
      console.log('[Meta Ads Auto Sync] Access Token belum diatur, lewati.');
      return;
    }

    // Scalev opsional — kalau API key belum diatur, Form Scalev tetap manual seperti sebelumnya.
    const scalevSettingsRows = (await query('SELECT api_key FROM scalev_settings WHERE id = 1')) as any[];
    const scalevApiKey: string | null = scalevSettingsRows[0]?.api_key || null;

    // Cuma produk aktif yang sudah punya Ad Account ID sendiri (diatur di Master Produk).
    const products = (await query(
      `SELECT id, nama, meta_ad_account_id, scalev_store_id FROM meta_ads_products WHERE is_active = 1 AND meta_ad_account_id IS NOT NULL AND meta_ad_account_id != ''`
    )) as { id: number; nama: string; meta_ad_account_id: string; scalev_store_id: number | null }[];

    for (const product of products) {
      try {
        await runMetaAdsAutoSyncFromMeta(
          ACTOR,
          product.id,
          accessToken,
          product.meta_ad_account_id,
          scalevApiKey,
          product.scalev_store_id
        );
        console.log(`[Meta Ads Auto Sync] "${product.nama}": berhasil sync hari ini.`);
      } catch (error) {
        console.error(`[Meta Ads Auto Sync] "${product.nama}" gagal:`, error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error('[Meta Ads Auto Sync] Gagal mengambil daftar produk:', error instanceof Error ? error.message : error);
  }
}

/**
 * Jadwalkan tarik data hari ini langsung dari Meta Graph API (Spend, Jangkauan, Impresi,
 * Klik Tautan, Tayangan Konten, Add To Chart, IC Form) tiap 1 jam untuk semua produk aktif
 * yang sudah punya Ad Account ID — supaya Dashboard Report selalu punya data yang relatif
 * baru walau tidak ada yang buka halaman/klik "Tambah Data dari Meta" secara manual.
 * Beda dari scheduleMetaAdsAutoImport (metaAdsScheduler.ts) yang narik dari Google Sheets
 * 1x sehari — ini narik langsung dari Meta, lebih sering, dan cuma untuk 7 field yang
 * mapping-nya jelas (bukan field manual seperti Form Scalev/WA Iklan/Target Lead).
 */
export function scheduleMetaAdsAutoSyncFromMeta() {
  console.log('[Meta Ads Auto Sync] Dijadwalkan tiap 1 jam dari Meta Graph API untuk semua produk aktif yang punya Ad Account ID (run pertama dalam 2 menit).');

  setTimeout(() => {
    runOnce();
    setInterval(runOnce, ONE_HOUR_MS);
  }, 2 * 60 * 1000);
}
