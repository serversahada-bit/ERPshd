// Dipanggil sekali oleh Next.js saat server dimulai. Dipakai di sini untuk
// menjadwalkan import otomatis harian dari Google Sheets Meta Ads, supaya
// tidak perlu klik tombol "Import" manual setiap hari.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Guard supaya tidak dobel-jadwal saat hot-reload di `next dev`.
  const g = globalThis as unknown as { __metaAdsImportScheduled?: boolean };
  if (g.__metaAdsImportScheduled) return;
  g.__metaAdsImportScheduled = true;

  const { scheduleMetaAdsAutoImport } = await import('./lib/metaAdsScheduler');
  scheduleMetaAdsAutoImport();
}
