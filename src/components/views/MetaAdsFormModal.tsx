'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { RAW_FIELD_SECTIONS, RAW_FIELDS, MANUAL_INPUT_KEYS, AUTO_FROM_CLOSING_BOX_CS_KEYS, computeAutoRawFields, MetaAdsRawRecord } from '@/lib/metaAds';

// Section-section RAW_FIELD_SECTIONS setelah field yang sudah dihitung otomatis dari
// Closing Box CS (Lead Real, New Customer Real Hari Ini, Follow Up) disaring keluar —
// field-field itu tidak lagi ditampilkan atau diinput di form Tambah/Edit.
const VISIBLE_FIELD_SECTIONS = RAW_FIELD_SECTIONS.map((section) => ({
  ...section,
  fields: section.fields.filter((field) => !AUTO_FROM_CLOSING_BOX_CS_KEYS.includes(field.key)),
})).filter((section) => section.fields.length > 0);

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function buildInitialFormState(initialData: MetaAdsRawRecord | null): Record<string, string> {
  const state: Record<string, string> = {};
  RAW_FIELDS.forEach((f) => {
    if (initialData) {
      state[f.key] = String((initialData as any)[f.key] ?? (f.key === 'grade' ? 'B' : 0));
    } else {
      state[f.key] = f.key === 'tanggal' ? todayStr() : f.key === 'grade' ? 'B' : '0';
    }
  });
  return state;
}

interface MetaAdsFormModalProps {
  mode: 'create' | 'edit';
  productId: string;
  initialData: (MetaAdsRawRecord & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function MetaAdsFormModal({ mode, productId, initialData, onClose, onSaved }: MetaAdsFormModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => buildInitialFormState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Field terkunci yang sudah punya rumus (Perencanaan Target Spend, Rasio VC/ATC/IC/Konversi)
  // dihitung ulang otomatis tiap kali field manual yang jadi sumbernya berubah — hanya untuk
  // data baru. Data lama (mode edit) dibiarkan menampilkan nilai yang sudah tersimpan,
  // tidak ditimpa oleh rumus supaya angka historis tidak berubah sendiri.
  useEffect(() => {
    if (mode !== 'create') return;
    const auto = computeAutoRawFields({
      spendIklan: Number(form.spendIklan) || 0,
      tayanganKonten: Number(form.tayanganKonten) || 0,
      klikTautan: Number(form.klikTautan) || 0,
      addToChart: Number(form.addToChart) || 0,
      icForm: Number(form.icForm) || 0,
      formScalev: Number(form.formScalev) || 0,
      waIklan: Number(form.waIklan) || 0,
    });
    setForm((prev) => {
      let changed = false;
      const next = { ...prev };
      (Object.keys(auto) as (keyof typeof auto)[]).forEach((key) => {
        const value = String(auto[key]);
        if (next[key] !== value) {
          next[key] = value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [form.spendIklan, form.tayanganKonten, form.klikTautan, form.addToChart, form.icForm, form.formScalev, form.waIklan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload: Record<string, string | number> = mode === 'create' ? { productId: Number(productId) } : {};
    RAW_FIELDS.forEach((f) => {
      if (AUTO_FROM_CLOSING_BOX_CS_KEYS.includes(f.key)) return;
      if (f.key === 'tanggal' || f.key === 'grade') {
        payload[f.key] = form[f.key];
      } else {
        payload[f.key] = Number(form[f.key]) || 0;
      }
    });

    try {
      const url = mode === 'create' ? '/api/meta-ads' : `/api/meta-ads/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Gagal menyimpan data.');
        setIsSaving(false);
        return;
      }

      onSaved();
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            {mode === 'create' ? 'Tambah Data Meta Ads Harian' : 'Edit Data Meta Ads Harian'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2">
              {error}
            </div>
          )}

          {VISIBLE_FIELD_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                {section.title}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.fields.map((field) => {
                  const isManual = MANUAL_INPUT_KEYS.includes(field.key);
                  const lockedClass = 'bg-slate-50 text-slate-400 cursor-not-allowed';
                  return (
                    <div key={field.key}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {field.label}
                        {!isManual && (
                          <span className="ml-1 font-normal normal-case text-slate-400">(Otomatis)</span>
                        )}
                      </label>
                      {field.format === 'date' ? (
                        <input
                          type="date"
                          required
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                        />
                      ) : field.format === 'grade' ? (
                        <select
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          disabled={!isManual}
                          className={`w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                            isManual ? '' : lockedClass
                          }`}
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          step={field.format === 'percent' ? '0.1' : 'any'}
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          disabled={!isManual}
                          className={`w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                            isManual ? '' : lockedClass
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </form>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 size={13} className="animate-spin" />}
            <span>{mode === 'create' ? 'Simpan Data' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
