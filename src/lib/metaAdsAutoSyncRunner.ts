import { queryAdvertiser as query } from './dbAdvertiser';
import { fetchAccountDailyInsight } from './metaGraphApi';
import { fetchScalevLeadsCount } from './scalevApi';
import { computeAutoRawFields } from './metaAds';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Tarik data hari ini langsung dari Meta Graph API (Spend, Jangkauan, Impresi, Klik
 * Tautan, Tayangan Konten, Add To Chart, IC Form) + Scalev (Form Scalev = All Orders hari
 * itu, kalau produk sudah punya Scalev Store ID) untuk SATU produk, lalu upsert ke
 * meta_ads_daily — dipakai penjadwal otomatis (lihat metaAdsAutoSyncScheduler.ts) supaya
 * Dashboard selalu punya data terbaru tanpa perlu ada yang buka halaman/klik tombol.
 *
 * Field manual lain (WA Iklan, Target Lead, Grade, dst) TIDAK disentuh — kalau baris hari
 * ini sudah ada, nilai manual yang sudah tersimpan dipertahankan (dibaca ulang supaya Rasio
 * Konversi tetap dihitung benar), cuma field yang berasal dari Meta/Scalev yang ditimpa.
 * Kalau baris belum ada, dibuat baru dengan field manual default 0/'B'.
 */
export async function runMetaAdsAutoSyncFromMeta(
  actor: string,
  productId: number,
  accessToken: string,
  adAccountId: string,
  scalevApiKey: string | null,
  scalevStoreId: number | null
): Promise<void> {
  const date = todayStr();
  const [insight, formScalevFromScalev] = await Promise.all([
    fetchAccountDailyInsight(accessToken, adAccountId, date),
    scalevApiKey && scalevStoreId ? fetchScalevLeadsCount(scalevApiKey, scalevStoreId, date) : Promise.resolve(null),
  ]);

  const existingRows = (await query('SELECT form_scalev, wa_iklan FROM meta_ads_daily WHERE product_id = ? AND tanggal = ?', [
    productId,
    date,
  ])) as any[];
  const existing = existingRows[0];
  const formScalev = formScalevFromScalev !== null ? formScalevFromScalev : existing ? Number(existing.form_scalev) || 0 : 0;
  const waIklan = existing ? Number(existing.wa_iklan) || 0 : 0;

  const auto = computeAutoRawFields({
    spendIklan: insight.spend,
    tayanganKonten: insight.viewContent,
    klikTautan: insight.linkClicks,
    addToChart: insight.addToCart,
    icForm: insight.initiateCheckout,
    formScalev,
    waIklan,
  });

  // form_scalev cuma ikut ditimpa kalau kita baru dapat angka segar dari Scalev (produk
  // sudah punya Scalev Store ID) — kalau tidak, `formScalev` di atas sudah berisi nilai
  // lama yang tersimpan (preserved), jadi menulisnya balik ke kolom yang sama aman/no-op.
  await query(
    `INSERT INTO meta_ads_daily
       (product_id, tanggal, spend_iklan, jangkauan, impresi, klik_tautan, tayangan_konten,
        add_to_chart, ic_form, form_scalev, target_spend, rasio_vc70, rasio_atc15, rasio_ic30, rasio_konversi, dibuat_oleh)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       spend_iklan = VALUES(spend_iklan), jangkauan = VALUES(jangkauan), impresi = VALUES(impresi),
       klik_tautan = VALUES(klik_tautan), tayangan_konten = VALUES(tayangan_konten),
       add_to_chart = VALUES(add_to_chart), ic_form = VALUES(ic_form), form_scalev = VALUES(form_scalev),
       target_spend = VALUES(target_spend), rasio_vc70 = VALUES(rasio_vc70),
       rasio_atc15 = VALUES(rasio_atc15), rasio_ic30 = VALUES(rasio_ic30),
       rasio_konversi = VALUES(rasio_konversi), diubah_oleh = VALUES(dibuat_oleh)`,
    [
      productId,
      date,
      insight.spend,
      insight.reach,
      insight.impressions,
      insight.linkClicks,
      insight.viewContent,
      insight.addToCart,
      insight.initiateCheckout,
      formScalev,
      auto.targetSpend,
      auto.rasioVC70,
      auto.rasioATC15,
      auto.rasioIC30,
      auto.rasioKonversi,
      actor,
    ]
  );
}
