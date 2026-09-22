'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { calculateClosingBoxCsMetrics, CS_COUNT_FIELDS, CS_METRIC_FIELDS, formatCsMetric, validateClosingBoxCsInput, type ClosingBoxCsRecord } from '@/lib/closingBoxCs';

function initialForm(row: ClosingBoxCsRecord | null): Record<string, string> {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return {
    tanggal: row?.tanggal || today, platform: row?.platform || '', adv: row?.adv || '',
    ...Object.fromEntries(CS_COUNT_FIELDS.map(({ key }) => [key, String(row?.[key] ?? 0)])),
  };
}

export default function ClosingBoxCsFormModal({ productId, initialData, onClose, onSaved }: {
  productId: number;
  initialData: ClosingBoxCsRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(() => initialForm(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [advOptions, setAdvOptions] = useState<string[]>([]);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/closing-box-cs/adv-options', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => { if (json?.success) setAdvOptions(json.data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const metrics = calculateClosingBoxCsMetrics({
    leadWa: Number(form.leadWa) || 0, leadForm: Number(form.leadForm) || 0,
    ncClosing: Number(form.ncClosing) || 0, ncBox: Number(form.ncBox) || 0,
    fuClosing: Number(form.fuClosing) || 0, fuBox: Number(form.fuBox) || 0,
  });
  const change = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setError('');
    setIsSaving(true);
    try {
      const payload = validateClosingBoxCsInput({
        productId, tanggal: form.tanggal, platform: form.platform, adv: form.adv,
        ...Object.fromEntries(CS_COUNT_FIELDS.map(({ key }) => [key, form[key].trim() === '' ? null : Number(form[key])])),
      });
      const response = await fetch(initialData ? `/api/closing-box-cs/${initialData.id}` : '/api/closing-box-cs', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.redirected || response.status === 401) throw new Error('Sesi berakhir. Silakan login kembali.');
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Gagal menyimpan data.');
      onSaved();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally { setIsSaving(false); }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="closing-cs-title" onCancel={(event) => { event.preventDefault(); if (!isSaving) onClose(); }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 id="closing-cs-title" className="font-bold">{initialData ? 'Edit' : 'Tambah'} Data Closing Box CS</h2>
        <button type="button" aria-label="Tutup form" disabled={isSaving} onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
      </div>
      <form onSubmit={save} className="space-y-5 p-5">
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <fieldset disabled={isSaving} className="space-y-5 disabled:opacity-60">
          <div className="grid gap-3 sm:grid-cols-3">
            {(['tanggal', 'platform', 'adv'] as const).map((key) => (
              <label key={key} className="block text-xs font-semibold text-slate-600">
                <span className="mb-1 block">{key === 'tanggal' ? 'Tanggal' : key === 'platform' ? 'Platform' : 'ADV'}</span>
                <input type={key === 'tanggal' ? 'date' : 'text'} required maxLength={100}
                  min={key === 'tanggal' ? '1000-01-01' : undefined} max={key === 'tanggal' ? '9999-12-31' : undefined}
                  placeholder={key === 'platform' ? 'Contoh: Meta Ads' : key === 'adv' ? 'Nama advertiser' : undefined}
                  list={key === 'adv' ? 'adv-options' : undefined}
                  value={form[key]} onChange={(event) => change(key, event.target.value)} className={inputClass} />
              </label>
            ))}
            {advOptions.length > 0 && (
              <datalist id="adv-options">
                {advOptions.map((nama) => <option key={nama} value={nama} />)}
              </datalist>
            )}
          </div>
          {['Lead CS', 'New Customer', 'Follow Up'].map((group) => (
            <fieldset key={group}>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group}</legend>
              <div className="grid grid-cols-2 gap-3">
                {CS_COUNT_FIELDS.filter((field) => field.group === group).map((field) => (
                  <label key={field.key} className="block text-xs font-semibold text-slate-600">
                    <span className="mb-1 block">{field.label}</span>
                    <input type="number" required min={0} max={2147483647} step={1} value={form[field.key]}
                      onChange={(event) => change(field.key, event.target.value)} className={inputClass} />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            {CS_METRIC_FIELDS.map((metric) => (
              <div key={metric.key} className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <label htmlFor={`cs-${metric.key}`} className="block text-sm font-semibold text-indigo-900">{metric.label} <span className="text-xs font-normal">(Otomatis)</span></label>
                <output id={`cs-${metric.key}`} aria-live="polite" className="mt-1 block text-lg font-bold text-indigo-700">{formatCsMetric(metrics[metric.key], metric.percent)}</output>
                <p className="mt-2 text-xs text-indigo-700">{metric.formula}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500 sm:col-span-2">Jika pembagi nol, hasil perhitungan ditampilkan 0.</p>
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" disabled={isSaving} onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50">Batal</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {isSaving && <Loader2 size={15} className="animate-spin" />}{isSaving ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
