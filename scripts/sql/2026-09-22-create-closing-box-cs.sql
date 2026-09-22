-- Tabel baru untuk fitur "Closing Box CS" (Advertiser > Meta Ads > Closing Box CS).
-- Dijalankan manual terhadap erp_sahada, disimpan sebagai catatan histori skema.
CREATE TABLE IF NOT EXISTS closing_box_cs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  tanggal DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  adv VARCHAR(100) NOT NULL,
  lead_wa INT NOT NULL DEFAULT 0,
  lead_form INT NOT NULL DEFAULT 0,
  nc_closing INT NOT NULL DEFAULT 0,
  nc_box INT NOT NULL DEFAULT 0,
  fu_closing INT NOT NULL DEFAULT 0,
  fu_box INT NOT NULL DEFAULT 0,
  dibuat_oleh VARCHAR(150) NOT NULL DEFAULT '',
  diubah_oleh VARCHAR(150) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_closing_box_cs_product FOREIGN KEY (product_id) REFERENCES meta_ads_products(id) ON DELETE CASCADE,
  INDEX idx_closing_box_cs_product_tanggal (product_id, tanggal)
);
