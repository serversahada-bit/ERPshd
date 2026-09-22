export const CS_COUNT_FIELDS = [
  { key: 'leadForm', label: 'FORM', group: 'Lead CS' },
  { key: 'leadWa', label: 'WA', group: 'Lead CS' },
  { key: 'ncClosing', label: 'Closing', group: 'New Customer' },
  { key: 'ncBox', label: 'Box', group: 'New Customer' },
  { key: 'fuClosing', label: 'Closing', group: 'Follow Up' },
  { key: 'fuBox', label: 'Box', group: 'Follow Up' },
] as const;

export type CsCountKey = (typeof CS_COUNT_FIELDS)[number]['key'];
export type ClosingBoxCsInput = Record<CsCountKey, number> & {
  productId: number;
  tanggal: string;
  platform: string;
  adv: string;
};
export type ClosingBoxCsMetrics = {
  closingRate: number;
  upSelling: number;
  closingRateAll: number;
  upSellingAll: number;
};

export const CS_METRIC_FIELDS = [
  { key: 'closingRate', label: 'Closing Rate', percent: true, formula: 'Closing New Customer ÷ (WA + FORM) × 100%' },
  { key: 'upSelling', label: 'Up Selling', percent: false, formula: 'Box New Customer ÷ Closing New Customer' },
  { key: 'closingRateAll', label: 'Closing Rate All', percent: true, formula: '(Closing Follow Up + Closing New Customer) ÷ (FORM + WA) × 100%' },
  { key: 'upSellingAll', label: 'Up Selling All', percent: false, formula: '(Box Follow Up + Box New Customer) ÷ (Closing Follow Up + Closing New Customer)' },
] as const;

export type ClosingBoxCsRecord = ClosingBoxCsInput & ClosingBoxCsMetrics & {
  id: number;
  dibuatOleh: string;
};

export function calculateClosingRate(ncClosing: number, leadWa: number, leadForm: number): number {
  const total = leadWa + leadForm;
  return total > 0 ? (ncClosing / total) * 100 : 0;
}

export function calculateClosingBoxCsMetrics(input: Record<CsCountKey, number>): ClosingBoxCsMetrics {
  const totalClosing = input.fuClosing + input.ncClosing;
  return {
    closingRate: calculateClosingRate(input.ncClosing, input.leadWa, input.leadForm),
    upSelling: input.ncClosing > 0 ? input.ncBox / input.ncClosing : 0,
    closingRateAll: calculateClosingRate(totalClosing, input.leadWa, input.leadForm),
    upSellingAll: totalClosing > 0 ? (input.fuBox + input.ncBox) / totalClosing : 0,
  };
}

export function formatCsMetric(value: number, percent: boolean): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: percent ? 0 : 2,
    maximumFractionDigits: 2,
  }) + (percent ? '%' : '');
}

export function isPositiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
}

export class ClosingBoxCsValidationError extends Error {}

export function validateClosingBoxCsInput(body: unknown): ClosingBoxCsInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ClosingBoxCsValidationError('Data tidak valid.');
  }
  const input = body as Record<string, unknown>;
  if (!isPositiveId(input.productId)) throw new ClosingBoxCsValidationError('Pilih produk yang valid.');
  const tanggal = input.tanggal;
  if (typeof tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) ||
      tanggal < '1000-01-01' || Number.isNaN(Date.parse(`${tanggal}T00:00:00Z`)) ||
      new Date(`${tanggal}T00:00:00Z`).toISOString().slice(0, 10) !== tanggal) {
    throw new ClosingBoxCsValidationError('Tanggal tidak valid.');
  }
  const textField = (key: 'platform' | 'adv', label: string) => {
    const value = input[key];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 100) {
      throw new ClosingBoxCsValidationError(`${label} wajib diisi, maksimal 100 karakter.`);
    }
    return value.trim();
  };
  const counts = {} as Record<CsCountKey, number>;
  for (const field of CS_COUNT_FIELDS) {
    const value = input[field.key];
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 2147483647) {
      throw new ClosingBoxCsValidationError(`${field.group} - ${field.label} harus berupa bilangan bulat minimal 0.`);
    }
    counts[field.key] = value;
  }
  return { productId: input.productId, tanggal, platform: textField('platform', 'Platform'), adv: textField('adv', 'ADV'), ...counts };
}
