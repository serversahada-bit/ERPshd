-- ad_id di meta_testing sekarang bisa menampung beberapa Ad ID dipisah koma (satu konten
-- yang sama diupload ke beberapa ad set/campaign, metriknya digabung — lihat
-- fetchCombinedAdInsight di src/lib/metaGraphApi.ts). VARCHAR(50) terlalu kecil untuk itu.
-- Dijalankan manual terhadap erp_sahada, disimpan sebagai catatan histori skema.
ALTER TABLE meta_testing MODIFY COLUMN ad_id VARCHAR(500) NULL;
