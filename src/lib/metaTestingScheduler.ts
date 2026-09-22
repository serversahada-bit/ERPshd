import { queryAdvertiser as query } from './dbAdvertiser';
import { runMetaTestingSync } from './metaTestingSyncRunner';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ACTOR = 'Auto Sync';

async function runOnce() {
  try {
    // Cuma iklan yang sedang "Running" — hemat kuota API Meta/Scalev, tidak buang-buang
    // sync ke konten yang belum tayang, di-pause, atau sudah selesai ditesting.
    const rows = (await query(
      `SELECT id, nama_konten FROM meta_testing
       WHERE status_iklan = 'Running' AND ad_id IS NOT NULL AND ad_id != ''`
    )) as { id: number; nama_konten: string | null }[];

    for (const row of rows) {
      try {
        await runMetaTestingSync(ACTOR, row.id);
        console.log(`[Meta Testing Auto Sync] #${row.id} "${row.nama_konten || '-'}": berhasil sync.`);
      } catch (error) {
        console.error(`[Meta Testing Auto Sync] #${row.id} "${row.nama_konten || '-'}" gagal:`, error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error('[Meta Testing Auto Sync] Gagal mengambil daftar konten Running:', error instanceof Error ? error.message : error);
  }
}

/**
 * Jadwalkan sync otomatis dari Meta Graph API + Scalev tiap 1 jam untuk semua konten
 * Meta Testing berstatus "Running", supaya tidak perlu klik tombol "Sync" manual satu-satu.
 * Dipanggil sekali dari instrumentation.ts saat server start.
 */
export function scheduleMetaTestingAutoSync() {
  console.log(`[Meta Testing Auto Sync] Dijadwalkan tiap 1 jam untuk semua konten berstatus Running (run pertama dalam 1 menit).`);

  // Run pertama sengaja ditunda 1 menit (bukan langsung saat start) supaya tidak numpuk
  // dengan proses startup server lain, lalu ulang tiap 1 jam.
  setTimeout(() => {
    runOnce();
    setInterval(runOnce, ONE_HOUR_MS);
  }, 60 * 1000);
}
