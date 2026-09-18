import { RAW_FIELDS, MetaAdsRawRecord } from './metaAds';

const DEFAULT_SHEET_ID = '1X8alHRw7tGIFrb-0tBgs03tv9GnNoxIYG9FJAu2iwOE';
const DEFAULT_SHEET_GID = '1693594156';

/** Link default yang ditampilkan di popup import (bisa diganti user). */
export const DEFAULT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit?gid=${DEFAULT_SHEET_GID}#gid=${DEFAULT_SHEET_GID}`;

/**
 * Terima link Google Sheets dalam format apa saja (link edit lengkap, atau
 * cuma ID-nya) lalu ubah jadi URL export CSV. Kalau tidak ketemu ID yang
 * valid, lempar error supaya user tahu link-nya salah format.
 */
export function buildCsvExportUrl(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/export?format=csv&gid=${DEFAULT_SHEET_GID}`;
  }

  const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/) || trimmed.match(/^([a-zA-Z0-9-_]{20,})$/);
  if (!idMatch) {
    throw new Error('Link Google Sheets tidak valid. Pastikan link berupa URL spreadsheet (docs.google.com/spreadsheets/d/...).');
  }
  const sheetId = idMatch[1];

  const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

const BULAN_MAP: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

/** Parser CSV sederhana yang menangani kolom bertanda kutip berisi newline/koma. */
export function parseCsv(str: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === '"') {
        if (str[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** "Sabtu, Agustus 1, 2026" -> "2026-08-01". Return null kalau bukan format tanggal yang dikenali. */
export function parseIndonesianDate(raw: string): string | null {
  const parts = raw.split(',').map((p) => p.trim());
  if (parts.length !== 3) return null;

  const [, monthDay, yearStr] = parts;
  const monthDayParts = monthDay.split(' ').filter(Boolean);
  if (monthDayParts.length !== 2) return null;

  const [monthName, dayStr] = monthDayParts;
  const month = BULAN_MAP[monthName.toLowerCase()];
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  if (!month || !day || !year) return null;

  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

/** Bersihkan angka format Indonesia: "Rp11.052.427,62" / "2,18%" / "#DIV/0!" -> number */
export function parseIndonesianNumber(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.startsWith('#')) return 0;

  const cleaned = trimmed
    .replace(/Rp/gi, '')
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalize(s: string): string {
  // Hilangkan semua whitespace (termasuk newline di tengah kata akibat wrap
  // manual di Sheets, mis. "JANG\nKAUAN") supaya perbandingan tidak meleset.
  return (s || '').toLowerCase().replace(/\s+/g, '');
}

/**
 * Lokasi tiap field mentah di sheet sumber, ditentukan lewat TEKS header
 * (bukan nomor kolom). `group` = teks baris grup (baris ke-1 header, exact
 * match setelah normalisasi); kalau ada, `leaf` dicari HANYA di dalam rentang
 * kolom grup tsb pada baris ke-2 header. Kalau `group` tidak diisi, `leaf`
 * dicari langsung di baris grup (field berdiri sendiri, mis. Date/Grade).
 *
 * Karena dicari lewat teks, kolom boleh digeser/reorder di sheet dan import
 * akan tetap menemukan posisi barunya sendiri. Kalau labelnya sendiri yang
 * diganti (atau dihapus), resolver akan gagal dengan pesan error yang jelas
 * -- bukan diam-diam salah ambil kolom.
 */
const FIELD_SHEET_LOCATIONS: Record<string, { group?: string; leaf: string }> = {
  tanggal: { leaf: 'date' },
  targetSpend: { leaf: 'perencanaantargetspend' },
  spendIklan: { leaf: 'spendiklan' },

  jangkauan: { group: 'dataiklanmeta%', leaf: 'jangkauan' },
  impresi: { group: 'dataiklanmeta%', leaf: 'impresi' },
  klikTautan: { group: 'dataiklanmeta%', leaf: 'kliktautan' },
  tayanganKonten: { group: 'dataiklanmeta%', leaf: 'tayangankonten' },
  rasioVC70: { group: 'dataiklanmeta%', leaf: 'rasiovc>70%' },
  rasioATC15: { group: 'dataiklanmeta%', leaf: 'rasioatc>15%' },
  rasioIC30: { group: 'dataiklanmeta%', leaf: 'rasioic>30%' },
  rasioKonversi: { group: 'dataiklanmeta%', leaf: 'rasiokonversi' },
  addToChart: { group: 'dataiklanmeta%', leaf: 'addtocard' },
  icForm: { group: 'dataiklanmeta%', leaf: 'initialcheckout' },

  formScalev: { group: 'leaddasboard', leaf: 'formscalev' },
  waIklan: { group: 'leaddasboard', leaf: 'waiklan' },

  formReal: { group: 'leadrealcs', leaf: 'form' },
  waReal: { group: 'leadrealcs', leaf: 'wa' },
  targetLead: { group: 'leadrealcs', leaf: 'targetlead' },

  closingCustomerNc: { group: 'newcustomerrealhariini', leaf: 'closingcustomer' },
  boxNc: { group: 'newcustomerrealhariini', leaf: 'box' },

  closingCustomerFu: { group: 'followup', leaf: 'closingcustomer' },
  boxFu: { group: 'followup', leaf: 'box' },

  targetBoxTp: { group: 'totalperformacs', leaf: 'targetbox' },

  batasAkuisisiBox: { leaf: 'batasakuisisibox(dalamnilai)' },
  grade: { leaf: 'grade' },
  arus: { leaf: 'arus' },
};

interface GroupSpan {
  label: string;
  start: number;
  end: number;
}

function findGroupSpans(groupRow: string[]): GroupSpan[] {
  const spans: GroupSpan[] = [];
  let i = 0;
  while (i < groupRow.length) {
    const label = normalize(groupRow[i] || '');
    if (label) {
      let j = i + 1;
      while (j < groupRow.length && !normalize(groupRow[j] || '')) j++;
      spans.push({ label, start: i, end: j });
      i = j;
    } else {
      i++;
    }
  }
  return spans;
}

/**
 * Cari posisi kolom tiap RAW_FIELDS berdasarkan teks header (bukan index tetap).
 * Melempar error yang jelas kalau ada field yang headernya tidak ketemu --
 * baik karena digeser/di-reorder (posisi berubah) maupun diganti nama/dihapus
 * (teksnya tidak ada lagi).
 */
export function resolveColumnMap(table: string[][], headerRowIdx: number): Map<string, number> {
  const groupRow = table[headerRowIdx] || [];
  const leafRow = table[headerRowIdx + 1] || [];
  const spans = findGroupSpans(groupRow);

  const colByKey = new Map<string, number>();

  for (const field of RAW_FIELDS) {
    const loc = FIELD_SHEET_LOCATIONS[field.key];
    if (!loc) continue;

    if (!loc.group) {
      // Field berdiri sendiri: cari langsung di baris grup.
      const idx = groupRow.findIndex((cell) => normalize(cell) === loc.leaf);
      if (idx === -1) {
        throw new Error(
          `Kolom "${field.label}" tidak ditemukan di sheet (mencari header "${loc.leaf}"). Sheet mungkin berubah struktur -- import dibatalkan supaya data tidak salah kolom.`
        );
      }
      colByKey.set(field.key, idx);
      continue;
    }

    const span = spans.find((s) => s.label === loc.group);
    if (!span) {
      throw new Error(
        `Grup kolom "${loc.group}" (untuk field "${field.label}") tidak ditemukan di sheet. Sheet mungkin berubah struktur -- import dibatalkan supaya data tidak salah kolom.`
      );
    }

    let leafIdx = -1;
    for (let c = span.start; c < span.end; c++) {
      if (normalize(leafRow[c] || '') === loc.leaf) {
        leafIdx = c;
        break;
      }
    }
    if (leafIdx === -1) {
      throw new Error(
        `Kolom "${field.label}" tidak ditemukan di dalam grup "${loc.group}". Sheet mungkin berubah struktur -- import dibatalkan supaya data tidak salah kolom.`
      );
    }
    colByKey.set(field.key, leafIdx);
  }

  return colByKey;
}

export interface ParsedSheetRow {
  record: MetaAdsRawRecord;
}

export interface FetchSheetResult {
  rows: ParsedSheetRow[];
  warnings: string[];
}

export async function fetchAndParseMetaAdsSheet(sheetUrl?: string): Promise<FetchSheetResult> {
  const csvUrl = buildCsvExportUrl(sheetUrl || '');
  const res = await fetch(csvUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Gagal mengambil Google Sheet (status ${res.status}). Pastikan sheet dibagikan sebagai "Siapa saja yang memiliki link dapat melihat".`);
  }
  const csvText = await res.text();
  const table = parseCsv(csvText);

  const headerRowIdx = table.findIndex((r) => (r[0] || '').trim() === 'Date');
  if (headerRowIdx === -1) {
    throw new Error('Header "Date" tidak ditemukan di sheet. Struktur sheet mungkin sudah berubah.');
  }

  const colByKey = resolveColumnMap(table, headerRowIdx);

  const dataStartIdx = headerRowIdx + 2;
  const rows: ParsedSheetRow[] = [];
  const warnings: string[] = [];

  for (let r = dataStartIdx; r < table.length; r++) {
    const sheetRow = table[r];
    const rawDateCell = (sheetRow[colByKey.get('tanggal')!] || '').trim();
    if (!rawDateCell) break;

    const tanggal = parseIndonesianDate(rawDateCell);
    if (!tanggal) break; // ketemu baris ringkasan (TOTAL/RATA RATA dst) -> berhenti

    const record: Record<string, string | number> = { tanggal };
    for (const field of RAW_FIELDS) {
      if (field.key === 'tanggal') continue;
      const colIdx = colByKey.get(field.key);
      const cell = colIdx !== undefined ? sheetRow[colIdx] || '' : '';
      if (field.format === 'grade') {
        record[field.key] = cell.trim() || 'B';
      } else {
        record[field.key] = parseIndonesianNumber(cell);
      }
    }

    rows.push({ record: record as unknown as MetaAdsRawRecord });
  }

  if (rows.length === 0) {
    warnings.push('Tidak ada baris data valid yang ditemukan di sheet.');
  }

  return { rows, warnings };
}
