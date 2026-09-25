-- FORM SCALEV di form Tambah/Edit Data Meta Ads Harian selama ini diisi manual.
-- Ternyata angkanya = "All Orders" (semua status, bukan cuma Completed) pada
-- tanggal itu di dashboard Scalev store produk yang bersangkutan — bisa ditarik
-- otomatis lewat GET /v3/orders/statistics (datetime_type=draft_time, alias "Created At").
--
-- Ini store PRODUKSI (dipakai iklan live sehari-hari), beda dengan
-- scalev_test_store_id yang khusus buat Meta Testing (store volume rendah).
ALTER TABLE meta_ads_products
  ADD COLUMN scalev_store_id INT NULL AFTER meta_ad_account_id;
