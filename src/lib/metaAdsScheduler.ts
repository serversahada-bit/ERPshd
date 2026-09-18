import { queryAdvertiser as query } from './dbAdvertiser';
import { runMetaAdsImport } from './metaAdsImportRunner';
import { mapDbRowToProduct } from './metaAdsProducts';

const DEFAULT_HOUR = 7;
const DEFAULT_MINUTE = 0;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function msUntilNext(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function runOnce() {
  try {
    const rows = (await query('SELECT * FROM meta_ads_products WHERE is_active = 1')) as any[];
    const products = rows.map(mapDbRowToProduct);

    for (const product of products) {
      try {
        const { imported, warnings } = await runMetaAdsImport('Auto Import', product.id);
        console.log(
          `[Meta Ads Auto Import] "${product.nama}": berhasil impor ${imported} baris.`,
          warnings.length ? { warnings } : ''
        );
      } catch (error) {
        console.error(`[Meta Ads Auto Import] "${product.nama}" gagal:`, error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error('[Meta Ads Auto Import] Gagal mengambil daftar produk:', error instanceof Error ? error.message : error);
  }
}

/**
 * Jadwalkan import otomatis dari Google Sheets sekali sehari pada jam
 * META_ADS_IMPORT_HOUR:META_ADS_IMPORT_MINUTE (default 07:00, waktu server),
 * untuk SEMUA produk yang berstatus aktif. Dipanggil sekali dari
 * instrumentation.ts saat server start.
 */
export function scheduleMetaAdsAutoImport() {
  const hour = Number(process.env.META_ADS_IMPORT_HOUR ?? DEFAULT_HOUR);
  const minute = Number(process.env.META_ADS_IMPORT_MINUTE ?? DEFAULT_MINUTE);

  const delay = msUntilNext(hour, minute);
  console.log(
    `[Meta Ads Auto Import] Dijadwalkan tiap hari jam ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} untuk semua produk aktif (run pertama dalam ${Math.round(delay / 60000)} menit).`
  );

  setTimeout(function tick() {
    runOnce();
    setTimeout(tick, ONE_DAY_MS);
  }, delay);
}
