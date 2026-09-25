// Klien tipis untuk Scalev API v3 — dipakai untuk menarik data closing/box
// per konten yang ditest (1 landing page Scalev = 1 konten yang ditest).
// Referensi: https://dev.scalev.com

const SCALEV_BASE_URL = 'https://api.scalev.com/v3';

interface ScalevOrderSummary {
  id: string;
  status: string;
  store: { id: number };
}

interface ScalevOrderDetail {
  id: string;
  status: string;
  total_quantity: number;
  page: { id: number; name: string } | null;
  completed_time: string | null;
}

async function scalevGet<T>(path: string, apiKey: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${SCALEV_BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.status || `Gagal menghubungi Scalev API (HTTP ${res.status}).`);
  }

  return json as T;
}

/** Tes koneksi: pastikan API key valid dengan ambil daftar store. */
export async function testScalevConnection(apiKey: string): Promise<{ storeCount: number }> {
  const data = await scalevGet<{ data: unknown[] }>('/stores', apiKey, { page_size: '1' });
  return { storeCount: data.data.length };
}

export interface ScalevStore {
  id: number;
  name: string;
}

/**
 * Daftar semua store yang bisa diakses API key ini — dipakai buat dropdown pilih Scalev
 * Test Store ID / Scalev Store ID di Master Produk, supaya tidak perlu cari manual ID-nya
 * di dashboard Scalev. `page_size` diminta 100 tapi ternyata dibatasi API ke 25/halaman
 * (ditemukan lewat testing nyata — store produksi "META (Gamamilk)" sempat tidak muncul
 * karena cuma halaman pertama yang diambil), jadi ikuti `has_next`/`next_cursor` sampai habis.
 */
export async function fetchScalevStores(apiKey: string): Promise<ScalevStore[]> {
  const stores: ScalevStore[] = [];
  let cursor: string | null = null;

  do {
    const params: Record<string, string> = { page_size: '100' };
    if (cursor) params.next_cursor = cursor;

    const data: { data: { id: number; name: string }[]; has_next: boolean; next_cursor: string | null } = await scalevGet(
      '/stores',
      apiKey,
      params
    );
    stores.push(...data.data.map((s) => ({ id: s.id, name: s.name })));
    cursor = data.has_next ? data.next_cursor : null;
  } while (cursor);

  return stores;
}

export interface ScalevPage {
  id: number;
  name: string;
  slug: string;
}

/** Daftar landing page di satu store — dipakai untuk dropdown pilih "konten mana" di form Meta Testing. */
export async function fetchScalevPages(apiKey: string, storeId: number): Promise<ScalevPage[]> {
  const pages: ScalevPage[] = [];
  let cursor: string | null = null;

  do {
    const params: Record<string, string> = { page_size: '100' };
    if (cursor) params.next_cursor = cursor;

    const data: { data: { id: number; name: string; slug: string }[]; has_next: boolean; next_cursor: string | null } = await scalevGet(
      `/stores/${storeId}/pages`,
      apiKey,
      params
    );
    pages.push(...data.data.map((p) => ({ id: p.id, name: p.name, slug: p.slug })));
    cursor = data.has_next ? data.next_cursor : null;
  } while (cursor);

  return pages;
}

function wibDateStr(iso: string): string {
  const d = new Date(iso);
  d.setUTCHours(d.getUTCHours() + 7);
  return d.toISOString().slice(0, 10);
}

/**
 * Hitung jumlah order pada satu tanggal tertentu (dibuat/"Created At", waktu Asia/Jakarta)
 * di satu store yang PUNYA `utm_source` terisi (bukan kosong) — dipakai untuk auto-isi
 * FORM SCALEV di form Meta Ads Harian, supaya cuma menghitung lead yang beneran datang dari
 * iklan berbayar (mis. utm_source=FACEBOOK), bukan order lain yang masuk lewat store yang
 * sama tapi tanpa sumber jelas (input manual CS, dsb).
 *
 * `utm_source` cuma ada di endpoint DETAIL per-order (bukan di endpoint list ringkasan),
 * dan endpoint statistik (`/orders/statistics`) tidak bisa filter by field ini — jadi harus:
 * 1) paginate endpoint list buat kumpulin semua order yang draft_time-nya jatuh di tanggal
 *    itu (tidak bisa asumsi urutan list selalu terurut ketat oleh draft_time, jadi berhenti
 *    baru setelah 2 halaman berturut-turut sama sekali tidak ada order tanggal itu/lebih baru),
 * 2) fetch detail satu-satu buat baca `utm_source`-nya.
 * Ini JAUH lebih berat (puluhan request per hari per produk) dibanding sekadar panggil
 * endpoint statistik — sengaja dipilih (bukan default) karena user secara eksplisit minta
 * cuma dihitung yang ada sumbernya, walau harus lebih lambat/berat.
 */
export async function fetchScalevLeadsCount(apiKey: string, storeId: number, dateStr: string): Promise<number> {
  const matches: { id: string }[] = [];
  let cursor: string | null = null;
  let pages = 0;
  let sawFullyOlderPage = false;

  do {
    const params: Record<string, string> = { page_size: '50', store_id: String(storeId) };
    if (cursor) params.next_cursor = cursor;

    const data: { data: { id: string; draft_time: string }[]; has_next: boolean; next_cursor: string | null } = await scalevGet(
      '/orders',
      apiKey,
      params
    );
    pages++;

    let sawTargetOrNewer = false;
    for (const o of data.data) {
      const day = wibDateStr(o.draft_time);
      if (day === dateStr) {
        matches.push({ id: o.id });
        sawTargetOrNewer = true;
      } else if (day > dateStr) {
        sawTargetOrNewer = true;
      }
    }

    if (sawTargetOrNewer) {
      sawFullyOlderPage = false;
    } else if (sawFullyOlderPage) {
      break; // dua halaman berturut-turut sudah lebih tua dari tanggal target — aman berhenti
    } else {
      sawFullyOlderPage = true;
    }

    cursor = data.has_next ? data.next_cursor : null;
  } while (cursor && pages < 30);

  let count = 0;
  for (const m of matches) {
    const detail = await scalevGet<{ utm_source: string | null }>(`/orders/${m.id}`, apiKey);
    if (detail.utm_source && detail.utm_source.trim()) count++;
  }
  return count;
}

export interface ScalevContentStats {
  closing: number;
  box: number;
}

/**
 * Hitung jumlah closing (order status "completed") dan total box (quantity)
 * untuk satu landing page tertentu di satu store, sejak tanggal tertentu.
 *
 * Catatan: endpoint list order Scalev tidak menyediakan field `page`/`total_quantity`
 * langsung (hanya ada di detail per-order), jadi harus fetch detail satu-satu
 * untuk order yang berstatus "completed" di store tsb. Wajar untuk store testing
 * (volume order rendah), tapi jangan dipakai untuk store produksi bervolume tinggi.
 */
export async function fetchScalevContentStats(
  apiKey: string,
  storeId: number,
  pageId: number,
  sinceDate: string | null
): Promise<ScalevContentStats> {
  let closing = 0;
  let box = 0;
  let cursor: string | null = null;

  do {
    const params: Record<string, string> = { store_id: String(storeId), page_size: '25', status: 'completed' };
    if (sinceDate) params.completed_time_since = new Date(sinceDate).toISOString();
    if (cursor) params.next_cursor = cursor;

    const listRes = await scalevGet<{
      data: ScalevOrderSummary[];
      has_next: boolean;
      next_cursor: string | null;
    }>('/orders', apiKey, params);

    for (const summary of listRes.data) {
      const detail = await scalevGet<ScalevOrderDetail>(`/orders/${summary.id}`, apiKey);
      if (detail.page?.id === pageId) {
        closing += 1;
        box += Number(detail.total_quantity) || 0;
      }
    }

    cursor = listRes.has_next ? listRes.next_cursor : null;
  } while (cursor);

  return { closing, box };
}
