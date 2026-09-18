export interface ScriptKontenField {
  key: string;
  dbColumn: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
}

export interface ScriptKontenFieldSection {
  title: string;
  fields: ScriptKontenField[];
}

export const STATUS_OPTIONS = ['Draft', 'Briefing', 'Proses Produksi', 'Review', 'Revisi', 'ACC', 'READY POST', 'Sudah Upload'];

export function statusBadgeClass(status: string): string {
  if (status === 'ACC' || status === 'READY POST' || status === 'Sudah Upload') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Review' || status === 'Proses Produksi') return 'bg-blue-100 text-blue-800';
  if (status === 'Revisi') return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-700';
}

export function statusBarColorClass(status: string): string {
  if (status === 'ACC' || status === 'READY POST' || status === 'Sudah Upload') return 'bg-emerald-500';
  if (status === 'Review' || status === 'Proses Produksi') return 'bg-blue-500';
  if (status === 'Revisi') return 'bg-amber-500';
  return 'bg-slate-400';
}

export function formatAccentClass(format: string): string {
  if (format === 'Reels' || format === 'Video') return 'bg-rose-500';
  if (format === 'Image') return 'bg-blue-500';
  if (format === 'Carousel') return 'bg-purple-500';
  if (format === 'Story') return 'bg-amber-500';
  return 'bg-slate-400';
}

export const RAW_FIELD_SECTIONS: ScriptKontenFieldSection[] = [
  {
    title: 'Brief & Kategori',
    fields: [
      { key: 'tanggalOrder', dbColumn: 'tanggal_order', label: 'Tanggal Order', type: 'date' },
      { key: 'judul', dbColumn: 'judul', label: 'Judul', type: 'text' },
      { key: 'cep', dbColumn: 'cep', label: 'CEP', type: 'text' },
      { key: 'funnel', dbColumn: 'funnel', label: 'Funnel', type: 'select', options: ['TOFU', 'MOFU', 'BOFU'] },
      { key: 'kategori', dbColumn: 'kategori', label: 'Kategori', type: 'text' },
      {
        key: 'stageAwareness',
        dbColumn: 'stage_awareness',
        label: 'Stage Awareness',
        type: 'select',
        options: ['Completely Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware'],
      },
      { key: 'angle', dbColumn: 'angle', label: 'Angle', type: 'text' },
      { key: 'typeHook', dbColumn: 'type_hook', label: 'Type Hook', type: 'text' },
      { key: 'format', dbColumn: 'format', label: 'Format', type: 'select', options: ['Reels', 'Image', 'Carousel', 'Video', 'Story'] },
    ],
  },
  {
    title: 'Eksekusi & Script',
    fields: [
      { key: 'eksekusi', dbColumn: 'eksekusi', label: 'Eksekusi', type: 'textarea' },
      { key: 'script', dbColumn: 'script', label: 'Script', type: 'textarea' },
      { key: 'creator', dbColumn: 'creator', label: 'Creator', type: 'text' },
      { key: 'linkKonten', dbColumn: 'link_konten', label: 'Link Konten', type: 'text' },
      {
        key: 'status',
        dbColumn: 'status',
        label: 'Status',
        type: 'select',
        options: STATUS_OPTIONS,
      },
      { key: 'tanggalAccKonten', dbColumn: 'tanggal_acc_konten', label: 'Tanggal ACC Konten', type: 'date' },
      { key: 'namaKonten', dbColumn: 'nama_konten', label: 'Nama Konten', type: 'text' },
    ],
  },
  {
    title: 'Hasil & Evaluasi',
    fields: [
      { key: 'matriksPerolehan', dbColumn: 'matriks_perolehan', label: 'Matriks Perolehan', type: 'textarea' },
      { key: 'analisisEvaluasi', dbColumn: 'analisis_evaluasi', label: 'Analisis & Evaluasi', type: 'textarea' },
      { key: 'iterasi', dbColumn: 'iterasi', label: 'Iterasi', type: 'textarea' },
    ],
  },
];

export const RAW_FIELDS: ScriptKontenField[] = RAW_FIELD_SECTIONS.flatMap((s) => s.fields);

const DATE_KEYS = new Set(['tanggalOrder', 'tanggalAccKonten']);
const NULLABLE_TEXT_KEYS = new Set(['namaKonten']);

export interface ScriptKontenRow {
  id: number;
  productId: number;
  productNama?: string;
  tanggalOrder: string | null;
  judul: string;
  cep: string;
  funnel: string;
  kategori: string;
  stageAwareness: string;
  angle: string;
  typeHook: string;
  format: string;
  eksekusi: string | null;
  script: string | null;
  creator: string;
  linkKonten: string;
  status: string;
  tanggalAccKonten: string | null;
  namaKonten: string | null;
  matriksPerolehan: string | null;
  analisisEvaluasi: string | null;
  iterasi: string | null;
  idKaryawan: string;
  namaKaryawan: string;
  createdAt: string;
  updatedAt: string;
}

function toDateStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const d = value as Date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mapDbRowToScriptKonten(row: any): ScriptKontenRow {
  return {
    id: row.id,
    productId: row.product_id,
    productNama: row.product_nama,
    tanggalOrder: toDateStr(row.tanggal_order),
    judul: row.judul,
    cep: row.cep,
    funnel: row.funnel,
    kategori: row.kategori,
    stageAwareness: row.stage_awareness,
    angle: row.angle,
    typeHook: row.type_hook,
    format: row.format,
    eksekusi: row.eksekusi,
    script: row.script,
    creator: row.creator,
    linkKonten: row.link_konten,
    status: row.status,
    tanggalAccKonten: toDateStr(row.tanggal_acc_konten),
    namaKonten: row.nama_konten,
    matriksPerolehan: row.matriks_perolehan,
    analisisEvaluasi: row.analisis_evaluasi,
    iterasi: row.iterasi,
    idKaryawan: row.id_karyawan,
    namaKaryawan: row.nama_karyawan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fieldValueFromBody(field: ScriptKontenField, body: any): string | null {
  const raw = body[field.key];
  if (DATE_KEYS.has(field.key)) {
    return raw ? String(raw) : null;
  }
  if (NULLABLE_TEXT_KEYS.has(field.key)) {
    return raw ? String(raw) : null;
  }
  return raw ? String(raw) : '';
}

const MONTH_ABBR_ID = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

export interface NamaKontenSourceFields {
  format: string;
  funnel: string;
  kategori: string;
  stageAwareness: string;
  angle: string;
  creator: string;
  tanggalOrder: string;
}

/**
 * Replikasi formula "Nama Konten" dari spreadsheet asli user (kolom itu berisi
 * catatan "Copy untuk nama konten & Iklan" -- hasilnya memang dipakai juga
 * sebagai nama iklan di Meta Ads Manager). Pola: FORMAT--FUNNEL-KATEGORI-STAGE-ANGLE--CREATOR-DDMMMYY.
 * Return string kosong kalau field sumbernya belum lengkap.
 */
export function generateNamaKonten(fields: NamaKontenSourceFields): string {
  const { format, funnel, kategori, stageAwareness, angle, creator, tanggalOrder } = fields;
  if (!format || !funnel || !kategori || !stageAwareness || !angle || !creator || !tanggalOrder) return '';

  const match = tanggalOrder.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  const dateStr = `${day}${MONTH_ABBR_ID[Number(month) - 1]}${year.slice(-2)}`;

  const up = (s: string) => s.toUpperCase();
  return `${up(format)}--${up(funnel)}-${up(kategori)}-${up(stageAwareness)}-${up(angle)}--${up(creator)}-${dateStr}`;
}

/** Konversi baris yang sudah ada jadi payload untuk PUT (mis. saat drag & drop cuma ganti status). */
export function rowToPayload(row: ScriptKontenRow): Record<string, string | number> {
  const payload: Record<string, string | number> = { productId: row.productId };
  RAW_FIELDS.forEach((f) => {
    const value = (row as any)[f.key];
    payload[f.key] = value === null || value === undefined ? '' : value;
  });
  return payload;
}
