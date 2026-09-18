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
      { key: 'layakDianalisa', dbColumn: 'layak_dianalisa', label: 'Layak Dianalisa?', type: 'select', options: ['Ya', 'Belum', 'Tidak'] },
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
