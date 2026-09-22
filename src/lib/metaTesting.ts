export interface MetaTestingField {
  key: string;
  dbColumn: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  suffix?: string;
}

export interface MetaTestingFieldSection {
  title: string;
  fields: MetaTestingField[];
}

export const RAW_FIELD_SECTIONS: MetaTestingFieldSection[] = [
  {
    title: 'Info Konten',
    fields: [
      { key: 'funnel', dbColumn: 'funnel', label: 'Funnel', type: 'select', options: ['TOFU', 'MOFU', 'BOFU'] },
      { key: 'kategori', dbColumn: 'kategori', label: 'Kategori', type: 'text' },
      { key: 'linkKonten', dbColumn: 'link_konten', label: 'Link Konten', type: 'text' },
      { key: 'adId', dbColumn: 'ad_id', label: 'Ad ID (Meta)', type: 'text' },
      { key: 'scalevPageId', dbColumn: 'scalev_page_id', label: 'Scalev Page ID', type: 'text' },
      { key: 'namaKonten', dbColumn: 'nama_konten', label: 'Nama Konten', type: 'text' },
      { key: 'tanggalRunning', dbColumn: 'tanggal_running', label: 'Tanggal Running', type: 'date' },
      {
        key: 'statusIklan',
        dbColumn: 'status_iklan',
        label: 'Status Iklan',
        type: 'select',
        options: ['Menunggu ACC', 'Ready to Post', 'Running', 'Paused', 'Selesai'],
      },
    ],
  },
  {
    title: 'Performa Iklan',
    fields: [
      { key: 'spending', dbColumn: 'spending', label: 'Spending', type: 'number' },
      { key: 'totalLead', dbColumn: 'total_lead', label: 'Lead', type: 'number' },
      { key: 'cpr', dbColumn: 'cpr', label: 'CPR', type: 'number' },
      { key: 'hookRate', dbColumn: 'hook_rate', label: 'Hook Rate', type: 'number', suffix: '%' },
      { key: 'holdRate', dbColumn: 'hold_rate', label: 'Hold Rate', type: 'number', suffix: '%' },
      { key: 'ctr', dbColumn: 'ctr', label: 'CTR', type: 'number', suffix: '%' },
      { key: 'cpm', dbColumn: 'cpm', label: 'CPM', type: 'number' },
      { key: 'closing', dbColumn: 'closing', label: 'Closing', type: 'number' },
      { key: 'box', dbColumn: 'box', label: 'Box', type: 'number' },
      { key: 'cr', dbColumn: 'cr', label: 'CR', type: 'number', suffix: '%' },
      { key: 'cpa', dbColumn: 'cpa', label: 'CPA', type: 'number' },
      { key: 'cpaPersen', dbColumn: 'cpa_persen', label: 'CPA%', type: 'number', suffix: '%' },
      { key: 'layakDianalisa', dbColumn: 'layak_dianalisa', label: 'Layak Dianalisa?', type: 'text' },
    ],
  },
  {
    title: 'Skor & Ranking',
    fields: [
      { key: 'skorCpr', dbColumn: 'skor_cpr', label: 'Skor CPR', type: 'number' },
      { key: 'skorCpm', dbColumn: 'skor_cpm', label: 'Skor CPM', type: 'number' },
      { key: 'skorCtr', dbColumn: 'skor_ctr', label: 'Skor CTR', type: 'number' },
      { key: 'skorHook', dbColumn: 'skor_hook', label: 'Skor Hook', type: 'number' },
      { key: 'skorHold', dbColumn: 'skor_hold', label: 'Skor Hold', type: 'number' },
      { key: 'bonusBudget', dbColumn: 'bonus_budget', label: 'Bonus Budget', type: 'number' },
      { key: 'skorKonten', dbColumn: 'skor_konten', label: 'Skor Konten', type: 'number' },
      { key: 'skorCr', dbColumn: 'skor_cr', label: 'Skor CR', type: 'number' },
      { key: 'skorCpaPersen', dbColumn: 'skor_cpa_persen', label: 'Skor CPA%', type: 'number' },
      { key: 'bonusVolume', dbColumn: 'bonus_volume', label: 'Bonus Volume', type: 'number' },
      { key: 'skorKonvert', dbColumn: 'skor_konvert', label: 'Skor Konvert', type: 'number' },
      { key: 'skorTotal', dbColumn: 'skor_total', label: 'Skor Total', type: 'number' },
      { key: 'peringkat', dbColumn: 'peringkat', label: 'Rank', type: 'number' },
      { key: 'grade', dbColumn: 'grade', label: 'Grade', type: 'text' },
    ],
  },
];

export const RAW_FIELDS: MetaTestingField[] = RAW_FIELD_SECTIONS.flatMap((s) => s.fields);

// Field yang masih diinput manual oleh user di form Tambah/Edit Meta Testing.
// Field lain (CPR, CR, CPA, CPA%, Layak Dianalisa, semua Skor, Rank, Grade) dihitung
// otomatis lewat computeMetaTestingBatch — lihat AUTO_COMPUTED_KEYS.
export const MANUAL_INPUT_KEYS: string[] = [
  'funnel',
  'kategori',
  'linkKonten',
  'adId',
  'scalevPageId',
  'namaKonten',
  'tanggalRunning',
  'statusIklan',
  'spending',
  'totalLead',
  'hookRate',
  'holdRate',
  'ctr',
  'cpm',
  'closing',
  'box',
];

// Field yang tidak lagi diinput manual — dihitung otomatis dari field manual di atas,
// mengikuti rumus & parameter skoring di spreadsheet sumber "EVALADS META V2" (sheet
// META TESTING + Parameter). Lihat computeMetaTestingBatch di bawah.
export const AUTO_COMPUTED_KEYS: string[] = [
  'cpr',
  'cr',
  'cpa',
  'cpaPersen',
  'layakDianalisa',
  'skorCpr',
  'skorCpm',
  'skorCtr',
  'skorHook',
  'skorHold',
  'bonusBudget',
  'skorKonten',
  'skorCr',
  'skorCpaPersen',
  'bonusVolume',
  'skorKonvert',
  'skorTotal',
  'peringkat',
  'grade',
];

// Parameter skoring — disamakan persis dengan sheet "Parameter" di EVALADS META V2.
// Ubah di sini kalau target/bobot berubah, tidak perlu ubah rumus di computeMetaTestingBatch.
export const SCORING_PARAMS = {
  targetCpr: 146880, // Target CPR (Rp)
  targetCpm: 80000, // Target CPM (Rp) — juga dipakai sebagai pembagi tetap untuk CPA% (sesuai rumus asli)
  targetCtr: 2, // Target CTR (%)
  targetHookRate: 30, // Target Hook Rate (%)
  targetHoldRate: 35, // Target Hold Rate (%)
  targetCrPercent: 65, // Target CR (%) — sheet asli simpan sebagai 0.65 (fraksi), di sini pakai skala % (65)
  breakEvenCpaPercent: 100, // Target CPA% breakeven — sheet asli 1.0 (fraksi) = 100%
  capCpaPercent: 125, // Batas maksimal CPA% (cap gagal) — sheet asli 1.25 = 125%
  minSpendingThreshold: 150000, // Ambang minimum Spending supaya "Layak Dianalisa"
  minLeadThreshold: 1, // Ambang minimum Lead supaya "Layak Dianalisa"
  bobotCpr: 30,
  bobotCpm: 25,
  bobotCtr: 20,
  bobotHookRate: 10,
  bobotHoldRate: 5,
  bobotBonusBudget: 10,
  bobotCr: 45,
  bobotCpaPersen: 45,
  bobotBonusVolume: 10,
  gradeAThreshold: 140, // Skor Total >= ini => Grade A
  gradeBThreshold: 100, // Skor Total >= ini => Grade B
  gradeCThreshold: 60, // Skor Total >= ini => Grade C, di bawah ini => Grade D
} as const;

const TEXT_KEYS = new Set(['funnel', 'kategori', 'linkKonten', 'namaKonten', 'tanggalRunning', 'statusIklan', 'layakDianalisa', 'grade']);
const NULLABLE_KEYS = new Set(['adId', 'scalevPageId', 'namaKonten', 'tanggalRunning']);

export interface MetaTestingRow {
  id: number;
  productId: number;
  productNama?: string;
  funnel: string;
  kategori: string;
  linkKonten: string;
  adId: string | null;
  scalevPageId: number | null;
  namaKonten: string | null;
  tanggalRunning: string | null;
  statusIklan: string;
  spending: number;
  totalLead: number;
  cpr: number;
  hookRate: number;
  holdRate: number;
  ctr: number;
  cpm: number;
  closing: number;
  box: number;
  cr: number;
  cpa: number;
  cpaPersen: number;
  layakDianalisa: string;
  skorCpr: number;
  skorCpm: number;
  skorCtr: number;
  skorHook: number;
  skorHold: number;
  bonusBudget: number;
  skorKonten: number;
  skorCr: number;
  skorCpaPersen: number;
  bonusVolume: number;
  skorKonvert: number;
  skorTotal: number;
  peringkat: number | null;
  grade: string | null;
  idKaryawan: string;
  namaKaryawan: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
}

function toDateStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  // mysql2 mengembalikan DATE sebagai Date object pada tengah malam waktu lokal server;
  // pakai getter lokal (bukan toISOString/UTC) supaya tidak mundur satu hari.
  const d = value as Date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mapDbRowToMetaTesting(row: any): MetaTestingRow {
  return {
    id: row.id,
    productId: row.product_id,
    productNama: row.product_nama,
    funnel: row.funnel,
    kategori: row.kategori,
    linkKonten: row.link_konten,
    adId: row.ad_id,
    scalevPageId: row.scalev_page_id === null ? null : Number(row.scalev_page_id),
    namaKonten: row.nama_konten,
    tanggalRunning: toDateStr(row.tanggal_running),
    statusIklan: row.status_iklan,
    spending: Number(row.spending) || 0,
    totalLead: Number(row.total_lead) || 0,
    cpr: Number(row.cpr) || 0,
    hookRate: Number(row.hook_rate) || 0,
    holdRate: Number(row.hold_rate) || 0,
    ctr: Number(row.ctr) || 0,
    cpm: Number(row.cpm) || 0,
    closing: Number(row.closing) || 0,
    box: Number(row.box) || 0,
    cr: Number(row.cr) || 0,
    cpa: Number(row.cpa) || 0,
    cpaPersen: Number(row.cpa_persen) || 0,
    layakDianalisa: row.layak_dianalisa,
    skorCpr: Number(row.skor_cpr) || 0,
    skorCpm: Number(row.skor_cpm) || 0,
    skorCtr: Number(row.skor_ctr) || 0,
    skorHook: Number(row.skor_hook) || 0,
    skorHold: Number(row.skor_hold) || 0,
    bonusBudget: Number(row.bonus_budget) || 0,
    skorKonten: Number(row.skor_konten) || 0,
    skorCr: Number(row.skor_cr) || 0,
    skorCpaPersen: Number(row.skor_cpa_persen) || 0,
    bonusVolume: Number(row.bonus_volume) || 0,
    skorKonvert: Number(row.skor_konvert) || 0,
    skorTotal: Number(row.skor_total) || 0,
    peringkat: row.peringkat === null ? null : Number(row.peringkat),
    grade: row.grade,
    idKaryawan: row.id_karyawan,
    namaKaryawan: row.nama_karyawan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSyncedAt: row.last_synced_at,
  };
}

function safeDiv(a: number, b: number): number {
  return b ? a / b : 0;
}

/**
 * Hitung ulang semua field skoring untuk SATU batch (semua data Meta Testing milik satu
 * produk yang sama) — beberapa field (Bonus Budget, Bonus Volume, Rank) butuh perbandingan
 * antar baris (MAX Spending, MAX Box, ranking Skor Total), jadi tidak bisa dihitung per baris
 * sendiri-sendiri. Rumus disamakan persis dengan sheet "META TESTING" + "Parameter" di
 * spreadsheet sumber EVALADS META V2. Field hasil hitungan di baris yang dikembalikan
 * MENIMPA nilai yang tersimpan di database (yang tidak lagi dipakai/ditulis).
 */
export function computeMetaTestingBatch(rows: MetaTestingRow[]): MetaTestingRow[] {
  const p = SCORING_PARAMS;

  const withoutBatchFields = rows.map((row) => {
    const cpr = safeDiv(row.spending, row.totalLead);
    const cr = safeDiv(row.closing, row.totalLead) * 100;
    const cpa = safeDiv(row.spending, row.box);
    const cpaPersen = safeDiv(cpa, p.targetCpm) * 100;
    const layakDianalisa = row.spending >= p.minSpendingThreshold || row.totalLead >= p.minLeadThreshold ? 'Ya' : 'Tidak';

    const skorCpr = cpr > 0 ? Math.min(p.bobotCpr, (p.bobotCpr * p.targetCpr) / cpr) : 0;
    const skorCpm = row.cpm > 0 ? Math.min(p.bobotCpm, (p.bobotCpm * p.targetCpm) / row.cpm) : 0;
    const skorCtr = row.ctr > 0 ? Math.min(p.bobotCtr, (p.bobotCtr * row.ctr) / p.targetCtr) : 0;
    const skorHook = row.hookRate > 0 ? Math.min(p.bobotHookRate, (p.bobotHookRate * row.hookRate) / p.targetHookRate) : 0;
    const skorHold = row.holdRate > 0 ? Math.min(p.bobotHoldRate, (p.bobotHoldRate * row.holdRate) / p.targetHoldRate) : 0;

    return { ...row, cpr, cr, cpa, cpaPersen, layakDianalisa, skorCpr, skorCpm, skorCtr, skorHook, skorHold };
  });

  const maxSpending = Math.max(0, ...withoutBatchFields.map((r) => r.spending));
  const maxBox = Math.max(0, ...withoutBatchFields.map((r) => r.box));

  const scored = withoutBatchFields.map((row) => {
    const bonusBudget =
      row.cpr > 0 && row.cpr <= p.targetCpr && maxSpending > 0 ? p.bobotBonusBudget * safeDiv(row.spending, maxSpending) : 0;
    const skorKonten = row.skorCpr + row.skorCpm + row.skorCtr + row.skorHook + row.skorHold + bonusBudget;

    const layak = row.layakDianalisa === 'Ya';
    const skorCr = layak ? Math.min(p.bobotCr, (p.bobotCr * row.cr) / p.targetCrPercent) : 0;
    const skorCpaPersen = !layak
      ? 0
      : row.cpaPersen <= p.breakEvenCpaPercent
        ? p.bobotCpaPersen
        : row.cpaPersen >= p.capCpaPercent
          ? 0
          : (p.bobotCpaPersen * (p.capCpaPercent - row.cpaPersen)) / (p.capCpaPercent - p.breakEvenCpaPercent);
    const bonusVolume = layak && maxBox > 0 ? p.bobotBonusVolume * safeDiv(row.box, maxBox) : 0;
    const skorKonvert = layak ? skorCr + skorCpaPersen + bonusVolume : 0;

    const skorTotal = skorKonten + skorKonvert;
    const grade = skorTotal >= p.gradeAThreshold ? 'A' : skorTotal >= p.gradeBThreshold ? 'B' : skorTotal >= p.gradeCThreshold ? 'C' : 'D';

    return { ...row, bonusBudget, skorKonten, skorCr, skorCpaPersen, bonusVolume, skorKonvert, skorTotal, grade };
  });

  // Ranking gaya "competition ranking" (sama seperti RANK() di Google Sheets/Excel): baris
  // dengan Skor Total sama dapat rank yang sama, rank berikutnya loncat sejumlah baris yang
  // seri di atasnya (bukan rank berurutan rapat).
  const sortedTotals = [...scored].sort((a, b) => b.skorTotal - a.skorTotal);
  return scored.map((row) => ({
    ...row,
    peringkat: sortedTotals.findIndex((r) => r.skorTotal === row.skorTotal) + 1,
  }));
}

export function fieldValueFromBody(field: MetaTestingField, body: any): string | number | null {
  const raw = body[field.key];
  if (field.key === 'scalevPageId') {
    return raw ? Number(raw) || null : null;
  }
  if (field.key === 'adId') {
    return raw ? String(raw) : null;
  }
  if (TEXT_KEYS.has(field.key)) {
    return raw ? String(raw) : NULLABLE_KEYS.has(field.key) ? null : '';
  }
  return Number(raw) || 0;
}
