-- Ad Account ID Meta jadi per-produk (sebelumnya 1 akun global di meta_api_settings),
-- supaya tidak perlu gonta-ganti manual kalau kelola beberapa akun Meta Ads.
-- Access Token tetap global di meta_api_settings (satu token bisa akses banyak akun).
-- Dijalankan manual terhadap erp_sahada, disimpan sebagai catatan histori skema.

ALTER TABLE meta_ads_products
  ADD COLUMN meta_ad_account_id VARCHAR(50) NULL AFTER scalev_test_store_id;

ALTER TABLE meta_api_campaign_snapshots
  ADD COLUMN product_id INT NULL AFTER id,
  ADD CONSTRAINT fk_campaign_snapshots_product FOREIGN KEY (product_id) REFERENCES meta_ads_products(id) ON DELETE CASCADE,
  DROP INDEX uniq_campaign_preset,
  ADD UNIQUE KEY uniq_product_campaign_preset (product_id, campaign_id, date_preset);

-- Kolom meta_api_settings.ad_account_id dan account_name sudah tidak dipakai kode lagi
-- setelah migrasi ini (diganti meta_ads_products.meta_ad_account_id per-produk), tapi
-- sengaja TIDAK di-drop di sini supaya migrasi ini aman dijalankan ulang / rollback mudah.
