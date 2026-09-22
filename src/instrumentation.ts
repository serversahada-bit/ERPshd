// Dipanggil sekali oleh Next.js saat server dimulai. Dipakai di sini untuk
// menjadwalkan import/sync otomatis, supaya tidak perlu klik tombol manual terus-menerus.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Guard supaya tidak dobel-jadwal saat hot-reload di `next dev`.
  const g = globalThis as unknown as { __metaAdsImportScheduled?: boolean; __metaTestingSyncScheduled?: boolean };

  if (!g.__metaAdsImportScheduled) {
    g.__metaAdsImportScheduled = true;
    const { scheduleMetaAdsAutoImport } = await import('./lib/metaAdsScheduler');
    scheduleMetaAdsAutoImport();
  }

  if (!g.__metaTestingSyncScheduled) {
    g.__metaTestingSyncScheduled = true;
    const { scheduleMetaTestingAutoSync } = await import('./lib/metaTestingScheduler');
    scheduleMetaTestingAutoSync();
  }
}
