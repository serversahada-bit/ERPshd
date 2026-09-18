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

export interface ScalevPage {
  id: number;
  name: string;
  slug: string;
}

/** Daftar landing page di satu store — dipakai untuk dropdown pilih "konten mana" di form Meta Testing. */
export async function fetchScalevPages(apiKey: string, storeId: number): Promise<ScalevPage[]> {
  const data = await scalevGet<{ data: { id: number; name: string; slug: string }[] }>(`/stores/${storeId}/pages`, apiKey, {
    page_size: '100',
  });
  return data.data.map((p) => ({ id: p.id, name: p.name, slug: p.slug }));
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
