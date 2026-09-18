-- Tambahan untuk fitur auto-sync Meta Testing (Meta Graph API + Scalev API).
-- Dijalankan manual terhadap erp_sahada, disimpan sebagai catatan histori skema.

ALTER TABLE meta_testing
  ADD COLUMN ad_id VARCHAR(50) NULL AFTER link_konten,
  ADD COLUMN scalev_page_id INT NULL AFTER ad_id,
  ADD COLUMN last_synced_at DATETIME NULL AFTER updated_at;

-- Setiap produk Meta Ads punya 1 store Scalev khusus testing konten
-- (pola yang sudah dipakai user: 1 landing page Scalev = 1 konten yang ditest).
ALTER TABLE meta_ads_products
  ADD COLUMN scalev_test_store_id INT NULL AFTER sheet_url;

-- Kredensial Scalev API (singleton, mengikuti pola meta_api_settings).
CREATE TABLE IF NOT EXISTS scalev_settings (
  id INT PRIMARY KEY DEFAULT 1,
  api_key TEXT NOT NULL,
  diubah_oleh VARCHAR(150) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
