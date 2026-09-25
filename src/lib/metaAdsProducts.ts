export interface MetaAdsProduct {
  id: number;
  nama: string;
  sheetUrl: string;
  isActive: boolean;
  scalevTestStoreId: number | null;
  metaAdAccountId: string | null;
  scalevStoreId: number | null;
}

export function mapDbRowToProduct(row: any): MetaAdsProduct {
  return {
    id: row.id,
    nama: row.nama,
    sheetUrl: row.sheet_url,
    isActive: Boolean(row.is_active),
    scalevTestStoreId: row.scalev_test_store_id === null || row.scalev_test_store_id === undefined ? null : Number(row.scalev_test_store_id),
    metaAdAccountId: row.meta_ad_account_id || null,
    scalevStoreId: row.scalev_store_id === null || row.scalev_store_id === undefined ? null : Number(row.scalev_store_id),
  };
}
