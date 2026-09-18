import { queryAdvertiser as query } from './dbAdvertiser';
import { RAW_FIELDS } from './metaAds';
import { fetchAndParseMetaAdsSheet } from './googleSheetImport';
import { mapDbRowToProduct } from './metaAdsProducts';

export interface ImportRunResult {
  imported: number;
  warnings: string[];
}

/**
 * Jalankan proses import (fetch sheet -> upsert ke meta_ads_daily) untuk SATU
 * produk. Kalau `sheetUrl` tidak diisi, dipakai link yang tersimpan di
 * meta_ads_products untuk productId tsb. Kalau `sheetUrl` diisi (user ganti
 * link lewat popup), link produk itu juga diperbarui supaya import berikutnya
 * (termasuk yang otomatis/terjadwal) ikut pakai link baru.
 */
export async function runMetaAdsImport(actor: string, productId: number, sheetUrl?: string): Promise<ImportRunResult> {
  const productRows = (await query('SELECT * FROM meta_ads_products WHERE id = ?', [productId])) as any[];
  if (productRows.length === 0) {
    throw new Error('Produk tidak ditemukan.');
  }
  const product = mapDbRowToProduct(productRows[0]);

  const effectiveUrl = sheetUrl?.trim() || product.sheetUrl;
  if (sheetUrl?.trim() && sheetUrl.trim() !== product.sheetUrl) {
    await query('UPDATE meta_ads_products SET sheet_url = ? WHERE id = ?', [sheetUrl.trim(), productId]);
  }

  const { rows, warnings } = await fetchAndParseMetaAdsSheet(effectiveUrl);

  const columns = ['product_id', ...RAW_FIELDS.map((f) => f.dbColumn)];
  const updateClause = RAW_FIELDS.map((f) => f.dbColumn)
    .filter((c) => c !== 'tanggal')
    .map((c) => `${c} = VALUES(${c})`)
    .join(', ');

  let imported = 0;
  for (const { record } of rows) {
    const values: (string | number)[] = [
      productId,
      ...RAW_FIELDS.map((f) => (record as unknown as Record<string, string | number>)[f.key]),
    ];
    await query(
      `INSERT INTO meta_ads_daily (${columns.join(', ')}, dibuat_oleh)
       VALUES (${columns.map(() => '?').join(', ')}, ?)
       ON DUPLICATE KEY UPDATE ${updateClause}, diubah_oleh = VALUES(dibuat_oleh)`,
      [...values, actor]
    );
    imported++;
  }

  return { imported, warnings };
}
