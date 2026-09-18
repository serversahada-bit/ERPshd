// Definisi field mentah (yang diinput manual / diimpor) untuk tabel meta_ads_daily,
// beserta rumus untuk menghitung kolom turunan (CPM, CTR, Closing Rate, dst).
// Struktur & rumus ini disamakan persis dengan spreadsheet sumber:
// https://docs.google.com/spreadsheets/d/1X8alHRw7tGIFrb-0tBgs03tv9GnNoxIYG9FJAu2iwOE

export type FieldFormat = 'date' | 'currency' | 'percent' | 'number' | 'grade';

export interface RawFieldDef {
  key: string;
  dbColumn: string;
  label: string;
  format: FieldFormat;
}

export interface RawFieldSection {
  title: string;
  fields: RawFieldDef[];
}

export const RAW_FIELD_SECTIONS: RawFieldSection[] = [
  {
    title: 'Perencanaan & Spend',
    fields: [
      { key: 'tanggal', dbColumn: 'tanggal', label: 'Tanggal', format: 'date' },
      { key: 'targetSpend', dbColumn: 'target_spend', label: 'Perencanaan Target Spend', format: 'currency' },
      { key: 'spendIklan', dbColumn: 'spend_iklan', label: 'Spend Iklan', format: 'currency' },
    ],
  },
  {
    title: 'Data Iklan Meta % (dari Ads Manager)',
    fields: [
      { key: 'jangkauan', dbColumn: 'jangkauan', label: 'Jangkauan', format: 'number' },
      { key: 'impresi', dbColumn: 'impresi', label: 'Impresi', format: 'number' },
      { key: 'klikTautan', dbColumn: 'klik_tautan', label: 'Klik Tautan', format: 'number' },
      { key: 'tayanganKonten', dbColumn: 'tayangan_konten', label: 'Tayangan Konten', format: 'number' },
      { key: 'rasioVC70', dbColumn: 'rasio_vc70', label: 'Rasio VC >70%', format: 'percent' },
      { key: 'rasioATC15', dbColumn: 'rasio_atc15', label: 'Rasio ATC >15%', format: 'percent' },
      { key: 'rasioIC30', dbColumn: 'rasio_ic30', label: 'Rasio IC >30%', format: 'percent' },
      { key: 'rasioKonversi', dbColumn: 'rasio_konversi', label: 'Rasio Konversi', format: 'percent' },
      { key: 'addToChart', dbColumn: 'add_to_chart', label: 'Add To Chart', format: 'number' },
      { key: 'icForm', dbColumn: 'ic_form', label: 'IC FORM', format: 'number' },
    ],
  },
  {
    title: 'Lead Dashboard (dari Iklan)',
    fields: [
      { key: 'formScalev', dbColumn: 'form_scalev', label: 'FORM SCALEV', format: 'number' },
      { key: 'waIklan', dbColumn: 'wa_iklan', label: 'WA IKLAN', format: 'number' },
    ],
  },
  {
    title: 'Lead Real (Konfirmasi CS)',
    fields: [
      { key: 'formReal', dbColumn: 'form_real', label: 'FORM', format: 'number' },
      { key: 'waReal', dbColumn: 'wa_real', label: 'WA', format: 'number' },
      { key: 'targetLead', dbColumn: 'target_lead', label: 'Target Lead', format: 'number' },
    ],
  },
  {
    title: 'New Customer Real Hari Ini',
    fields: [
      { key: 'closingCustomerNc', dbColumn: 'closing_customer_nc', label: 'Closing Customer', format: 'number' },
      { key: 'boxNc', dbColumn: 'box_nc', label: 'Box', format: 'number' },
    ],
  },
  {
    title: 'Follow Up',
    fields: [
      { key: 'closingCustomerFu', dbColumn: 'closing_customer_fu', label: 'Closing Customer', format: 'number' },
      { key: 'boxFu', dbColumn: 'box_fu', label: 'Box', format: 'number' },
    ],
  },
  {
    title: 'Target & Akuisisi Box',
    fields: [
      { key: 'targetBoxTp', dbColumn: 'target_box_tp', label: 'Target Box', format: 'number' },
      { key: 'batasAkuisisiBox', dbColumn: 'batas_akuisisi_box', label: 'Batas Akuisisi Box', format: 'currency' },
      { key: 'grade', dbColumn: 'grade', label: 'Grade', format: 'grade' },
      { key: 'arus', dbColumn: 'arus', label: 'Arus (Arus Kas)', format: 'currency' },
    ],
  },
];

export const RAW_FIELDS: RawFieldDef[] = RAW_FIELD_SECTIONS.flatMap((s) => s.fields);

export interface MetaAdsRawRecord {
  id?: number;
  dibuatOleh: string;
  tanggal: string;
  targetSpend: number;
  spendIklan: number;
  jangkauan: number;
  impresi: number;
  klikTautan: number;
  tayanganKonten: number;
  rasioVC70: number;
  rasioATC15: number;
  rasioIC30: number;
  rasioKonversi: number;
  addToChart: number;
  icForm: number;
  formScalev: number;
  waIklan: number;
  formReal: number;
  waReal: number;
  targetLead: number;
  closingCustomerNc: number;
  boxNc: number;
  closingCustomerFu: number;
  boxFu: number;
  targetBoxTp: number;
  batasAkuisisiBox: number;
  grade: string;
  arus: number;
}

function toDateStr(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 10);
  // mysql2 mengembalikan DATE sebagai Date object pada tengah malam waktu lokal server;
  // pakai getter lokal (bukan toISOString/UTC) supaya tidak mundur satu hari.
  const d = value as Date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mapDbRowToRecord(row: any): MetaAdsRawRecord & { id: number } {
  return {
    id: row.id,
    dibuatOleh: String(row.dibuat_oleh || ''),
    tanggal: toDateStr(row.tanggal),
    targetSpend: Number(row.target_spend),
    spendIklan: Number(row.spend_iklan),
    jangkauan: Number(row.jangkauan),
    impresi: Number(row.impresi),
    klikTautan: Number(row.klik_tautan),
    tayanganKonten: Number(row.tayangan_konten),
    rasioVC70: Number(row.rasio_vc70),
    rasioATC15: Number(row.rasio_atc15),
    rasioIC30: Number(row.rasio_ic30),
    rasioKonversi: Number(row.rasio_konversi),
    addToChart: Number(row.add_to_chart),
    icForm: Number(row.ic_form),
    formScalev: Number(row.form_scalev),
    waIklan: Number(row.wa_iklan),
    formReal: Number(row.form_real),
    waReal: Number(row.wa_real),
    targetLead: Number(row.target_lead),
    closingCustomerNc: Number(row.closing_customer_nc),
    boxNc: Number(row.box_nc),
    closingCustomerFu: Number(row.closing_customer_fu),
    boxFu: Number(row.box_fu),
    targetBoxTp: Number(row.target_box_tp),
    batasAkuisisiBox: Number(row.batas_akuisisi_box),
    grade: String(row.grade || ''),
    arus: Number(row.arus),
  };
}

function safeDiv(a: number, b: number): number {
  return b ? a / b : 0;
}

/**
 * Rumus-rumus ini diverifikasi manual terhadap data & formula asli di
 * spreadsheet sumber (baris Agustus 2026), termasuk pemakaian Spend +
 * PPN 11% (bukan spend mentah) khusus untuk CPL & Biaya Akuisisi.
 */
export function computeDerived(raw: MetaAdsRawRecord) {
  const spendPpn = raw.spendIklan * 1.11;

  const frekuensi = safeDiv(raw.impresi, raw.jangkauan);
  const hargaPerJangkauan = safeDiv(raw.spendIklan, raw.jangkauan);
  const cpm = safeDiv(raw.spendIklan, raw.impresi) * 1000;
  const ctr = safeDiv(raw.klikTautan, raw.impresi) * 100;
  const cpcTotal = safeDiv(raw.spendIklan, raw.klikTautan);
  const lrIcScalev = safeDiv(raw.formScalev, raw.icForm) * 100;

  const totalLeadDasboard = raw.formScalev + raw.waIklan;
  const cprDasboard = safeDiv(raw.spendIklan, totalLeadDasboard);

  const totalLeadReal = raw.formReal + raw.waReal;
  const cplReal = safeDiv(spendPpn, totalLeadReal);

  const leadHilang = totalLeadReal - totalLeadDasboard;
  const formRatePct = safeDiv(raw.formReal, raw.formScalev) * 100;
  const waRatePct = safeDiv(raw.waReal, raw.waIklan) * 100;

  const closingRateNc = safeDiv(raw.closingCustomerNc, totalLeadReal) * 100;
  const upSellingNc = safeDiv(raw.boxNc, raw.closingCustomerNc);

  const closingTotalTp = raw.closingCustomerNc + raw.closingCustomerFu;
  const boxTotalTp = raw.boxNc + raw.boxFu;
  const closingRateTp = safeDiv(closingTotalTp, totalLeadReal) * 100;
  const upSellingTp = safeDiv(boxTotalTp, closingTotalTp);
  const biayaAkuisisiCustomer = safeDiv(spendPpn, closingTotalTp);
  const biayaAkuisisiBoxPcs = safeDiv(spendPpn, boxTotalTp);
  const persenAkuisisiBox = safeDiv(boxTotalTp, raw.targetBoxTp) * 100;

  return {
    spendPpn,
    frekuensi,
    hargaPerJangkauan,
    cpm,
    ctr,
    cpcTotal,
    lrIcScalev,
    totalLeadDasboard,
    cprDasboard,
    totalLeadReal,
    cplReal,
    leadHilang,
    formRatePct,
    waRatePct,
    closingRateNc,
    upSellingNc,
    closingTotalTp,
    boxTotalTp,
    closingRateTp,
    upSellingTp,
    biayaAkuisisiCustomer,
    biayaAkuisisiBoxPcs,
    persenAkuisisiBox,
  };
}

export type MetaAdsFullRow = MetaAdsRawRecord & ReturnType<typeof computeDerived> & { id: number };

export function withDerived(raw: MetaAdsRawRecord & { id: number }): MetaAdsFullRow {
  return { ...raw, ...computeDerived(raw) };
}

// ===== Metadata untuk tampilan (label, format, pengelompokan) =====

export type DisplayFormat = 'currency' | 'percent' | 'number' | 'decimal' | 'text';

export interface DisplayColMeta {
  label: string;
  format: DisplayFormat;
}

export const DISPLAY_COL_META: Record<string, DisplayColMeta> = {
  targetSpend: { label: 'Target Spend', format: 'currency' },
  spendIklan: { label: 'Spend Iklan', format: 'currency' },
  spendPpn: { label: 'Spend + PPN 11%', format: 'currency' },

  jangkauan: { label: 'Jangkauan', format: 'number' },
  impresi: { label: 'Impresi', format: 'number' },
  frekuensi: { label: 'Frekuensi', format: 'decimal' },
  hargaPerJangkauan: { label: 'Harga Per Jangkauan', format: 'currency' },
  cpm: { label: 'CPM', format: 'currency' },
  ctr: { label: 'CTR', format: 'percent' },
  klikTautan: { label: 'Klik Tautan', format: 'number' },
  tayanganKonten: { label: 'Tayangan Konten', format: 'number' },
  rasioVC70: { label: 'Rasio VC >70%', format: 'percent' },
  rasioATC15: { label: 'Rasio ATC >15%', format: 'percent' },
  rasioIC30: { label: 'Rasio IC >30%', format: 'percent' },
  rasioKonversi: { label: 'Rasio Konversi', format: 'percent' },
  cpcTotal: { label: 'CPC Total', format: 'currency' },
  addToChart: { label: 'Add To Chart', format: 'number' },
  icForm: { label: 'IC FORM', format: 'number' },
  lrIcScalev: { label: 'LR IC Scalev', format: 'percent' },

  formScalev: { label: 'FORM SCALEV', format: 'number' },
  waIklan: { label: 'WA IKLAN', format: 'number' },
  totalLeadDasboard: { label: 'Total Lead Dasboard', format: 'number' },
  cprDasboard: { label: 'CPR (80.000)', format: 'currency' },

  formReal: { label: 'FORM', format: 'number' },
  waReal: { label: 'WA', format: 'number' },
  totalLeadReal: { label: 'Total Lead Real', format: 'number' },
  targetLead: { label: 'Target Lead', format: 'number' },
  cplReal: { label: 'CPL (130.000)', format: 'currency' },

  leadHilang: { label: 'Lead Hilang', format: 'number' },
  formRatePct: { label: '% Rate FORM', format: 'percent' },
  waRatePct: { label: '% Rate WA', format: 'percent' },

  closingCustomerNc: { label: 'Closing Customer', format: 'number' },
  boxNc: { label: 'Box', format: 'number' },
  closingRateNc: { label: 'Closing Rate', format: 'percent' },
  upSellingNc: { label: 'Up Selling', format: 'decimal' },

  closingCustomerFu: { label: 'Closing Customer', format: 'number' },
  boxFu: { label: 'Box', format: 'number' },

  closingTotalTp: { label: 'Closing Total', format: 'number' },
  boxTotalTp: { label: 'Box Total', format: 'number' },
  targetBoxTp: { label: 'Target Box', format: 'number' },
  closingRateTp: { label: 'Closing Rate', format: 'percent' },
  upSellingTp: { label: 'Up Selling', format: 'decimal' },

  persenAkuisisiBox: { label: '% Akuisisi Box', format: 'percent' },
  batasAkuisisiBox: { label: 'Batas Akuisisi Box', format: 'currency' },
  grade: { label: 'Grade', format: 'text' },
  arus: { label: 'Arus (Arus Kas)', format: 'currency' },
  biayaAkuisisiCustomer: { label: 'Biaya Akuisisi Customer', format: 'currency' },
  biayaAkuisisiBoxPcs: { label: 'Biaya Akuisisi Box/pcs', format: 'currency' },
};

export interface DetailGroup {
  title: string;
  dotClass: string;
  keys: string[];
}

export const DETAIL_GROUPS: DetailGroup[] = [
  {
    title: 'Data Iklan Meta %',
    dotClass: 'bg-blue-600',
    keys: [
      'jangkauan', 'impresi', 'frekuensi', 'hargaPerJangkauan', 'cpm', 'ctr',
      'klikTautan', 'tayanganKonten', 'rasioVC70', 'rasioATC15', 'rasioIC30',
      'rasioKonversi', 'cpcTotal', 'addToChart', 'icForm', 'lrIcScalev',
    ],
  },
  {
    title: 'Lead Dashboard',
    dotClass: 'bg-indigo-600',
    keys: ['formScalev', 'waIklan', 'totalLeadDasboard', 'cprDasboard'],
  },
  {
    title: 'Lead Real CS',
    dotClass: 'bg-cyan-600',
    keys: ['formReal', 'waReal', 'totalLeadReal', 'targetLead', 'cplReal'],
  },
  {
    title: '% Lead Rate CS',
    dotClass: 'bg-amber-600',
    keys: ['leadHilang', 'formRatePct', 'waRatePct'],
  },
  {
    title: 'New Customer Real Hari Ini',
    dotClass: 'bg-emerald-600',
    keys: ['closingCustomerNc', 'boxNc', 'closingRateNc', 'upSellingNc'],
  },
  {
    title: 'Follow Up',
    dotClass: 'bg-purple-600',
    keys: ['closingCustomerFu', 'boxFu'],
  },
  {
    title: 'Total Performa CS',
    dotClass: 'bg-rose-600',
    keys: ['closingTotalTp', 'boxTotalTp', 'targetBoxTp', 'closingRateTp', 'upSellingTp', 'biayaAkuisisiCustomer', 'biayaAkuisisiBoxPcs'],
  },
  {
    title: 'Akuisisi Box',
    dotClass: 'bg-slate-700',
    keys: ['persenAkuisisiBox', 'batasAkuisisiBox', 'arus'],
  },
];

export function formatDisplayValue(value: number | string, format: DisplayFormat): string {
  if (format === 'text') return String(value);
  const num = Number(value);
  if (format === 'currency') return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  if (format === 'percent') return `${num.toFixed(1)}%`;
  if (format === 'decimal') return num.toFixed(2);
  return Math.round(num).toLocaleString('id-ID');
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const GRADE_BADGE_CLASS: Record<string, string> = {
  'A+': 'bg-emerald-50 text-emerald-700',
  A: 'bg-blue-50 text-blue-700',
  'B+': 'bg-amber-50 text-amber-700',
  B: 'bg-orange-50 text-orange-700',
  C: 'bg-rose-50 text-rose-700',
};
