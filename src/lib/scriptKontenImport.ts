import { buildCsvExportUrl, parseCsv } from './googleSheetImport';
import { RAW_FIELDS } from './scriptKonten';
import { MetaAdsProduct } from './metaAdsProducts';

const BULAN_ABBR_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', jun: '06',
  jul: '07', agu: '08', sep: '09', okt: '10', nov: '11', des: '12',
};

/** "Sab, 29 Agu 26" -> "2026-08-29". Return null kalau bukan format yang dikenali. */
export function parseIndonesianDateShort(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^[A-Za-z]+,\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
  if (!match) return null;
  const [, dayStr, monthAbbr, yearStr] = match;
  const month = BULAN_ABBR_MAP[monthAbbr.toLowerCase().slice(0, 3)];
  if (!month) return null;
  const day = parseInt(dayStr, 10);
  let year = parseInt(yearStr, 10);
  if (year < 100) year += 2000;
  if (!day || !year) return null;
  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function normalize(s: string): string {
  return (s || '').toLowerCase().replace(/\s+/g, '');
}

/** Nama header sheet (setelah dinormalisasi) untuk tiap field internal. Sheet ini
 * cuma punya satu baris header (beda dengan sheet Meta Ads yang pakai grup+leaf). */
const FIELD_HEADER_MAP: Record<string, string> = {
  tanggalOrder: 'tanggalorder',
  judul: 'judul',
  cep: 'cep',
  funnel: 'funnel',
  kategori: 'kategori',
  stageAwareness: 'stageawarenes',
  angle: 'angle',
  typeHook: 'typehook',
  format: 'format',
  eksekusi: 'eksekusi',
  script: 'script',
  creator: 'creator',
  linkKonten: 'linkkonten',
  status: 'status',
  tanggalAccKonten: 'tanggalacckonten',
  namaKonten: 'namakonten',
  matriksPerolehan: 'matriksperolehan',
  analisisEvaluasi: 'analisis&evaluasi',
  iterasi: 'iterasi',
};

function findHeaderRowIndex(table: string[][]): number {
  return table.findIndex((row) => {
    const normalizedRow = row.map(normalize);
    return normalizedRow.includes('judul') && normalizedRow.includes('produk');
  });
}

function resolveColumnMap(headerRow: string[]): { fieldCols: Map<string, number>; produkCol: number } {
  const normalizedRow = headerRow.map(normalize);
  const fieldCols = new Map<string, number>();

  for (const field of RAW_FIELDS) {
    const headerText = FIELD_HEADER_MAP[field.key];
    if (!headerText) continue;
    const idx = normalizedRow.findIndex((c) => c === headerText);
    if (idx === -1) {
      throw new Error(
        `Kolom "${field.label}" tidak ditemukan di sheet. Sheet mungkin berubah struktur -- import dibatalkan supaya data tidak salah kolom.`
      );
    }
    fieldCols.set(field.key, idx);
  }

  const produkCol = normalizedRow.findIndex((c) => c === 'produk');
  if (produkCol === -1) {
    throw new Error('Kolom "PRODUK" tidak ditemukan di sheet. Import dibatalkan.');
  }

  return { fieldCols, produkCol };
}

function resolveProductId(produkText: string, products: MetaAdsProduct[]): { productId: number | null; matched: boolean } {
  if (products.length === 1) {
    return { productId: products[0].id, matched: true };
  }
  const lower = produkText.trim().toLowerCase();
  const exact = products.find((p) => p.nama.toLowerCase() === lower);
  if (exact) return { productId: exact.id, matched: true };
  const partial = products.find((p) => p.nama.toLowerCase().startsWith(lower) || (lower && lower.startsWith(p.nama.toLowerCase())));
  if (partial) return { productId: partial.id, matched: true };
  return { productId: products[0]?.id ?? null, matched: false };
}

export interface ParsedScriptKontenRow {
  productId: number;
  fields: Record<string, string>;
}

export interface FetchScriptKontenSheetResult {
  rows: ParsedScriptKontenRow[];
  warnings: string[];
}

export async function fetchAndParseScriptKontenSheet(sheetUrl: string, products: MetaAdsProduct[]): Promise<FetchScriptKontenSheetResult> {
  const csvUrl = buildCsvExportUrl(sheetUrl);
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Gagal mengambil Google Sheet (status ${res.status}). Pastikan sheet dibagikan sebagai "Siapa saja yang memiliki link dapat melihat".`);
  }
  const csvText = await res.text();
  const table = parseCsv(csvText);

  const headerRowIdx = findHeaderRowIndex(table);
  if (headerRowIdx === -1) {
    throw new Error('Baris header (kolom JUDUL & PRODUK) tidak ditemukan di sheet. Struktur sheet mungkin sudah berubah.');
  }

  const { fieldCols, produkCol } = resolveColumnMap(table[headerRowIdx]);
  const judulCol = fieldCols.get('judul')!;
  const tanggalOrderCol = fieldCols.get('tanggalOrder')!;

  const warnings: string[] = [];
  const rows: ParsedScriptKontenRow[] = [];
  let unmatchedProductCount = 0;

  for (let r = headerRowIdx + 1; r < table.length; r++) {
    const sheetRow = table[r];
    const judulCell = (sheetRow[judulCol] || '').trim();
    const tanggalCell = (sheetRow[tanggalOrderCol] || '').trim();
    if (!judulCell && !tanggalCell) continue; // baris kosong/pemisah antar bulan

    const fields: Record<string, string> = {};
    for (const field of RAW_FIELDS) {
      const colIdx = fieldCols.get(field.key);
      const raw = colIdx !== undefined ? (sheetRow[colIdx] || '').trim() : '';
      if (field.key === 'tanggalOrder' || field.key === 'tanggalAccKonten') {
        const parsed = raw ? parseIndonesianDateShort(raw) : null;
        if (raw && !parsed) {
          warnings.push(`Baris "${judulCell || '(tanpa judul)'}": tanggal "${raw}" tidak dikenali formatnya, dikosongkan.`);
        }
        fields[field.key] = parsed || '';
      } else {
        fields[field.key] = raw;
      }
    }

    const produkText = (sheetRow[produkCol] || '').trim();
    const { productId, matched } = resolveProductId(produkText, products);
    if (!productId) {
      warnings.push(`Baris "${judulCell || '(tanpa judul)'}" dilewati: belum ada produk terdaftar di sistem.`);
      continue;
    }
    if (!matched) unmatchedProductCount++;

    rows.push({ productId, fields });
  }

  if (unmatchedProductCount > 0) {
    warnings.push(`${unmatchedProductCount} baris tidak bisa dicocokkan nama produknya secara pasti, dimasukkan ke produk default (${products[0]?.nama}).`);
  }
  if (rows.length === 0) {
    warnings.push('Tidak ada baris data valid yang ditemukan di sheet.');
  }

  return { rows, warnings };
}
