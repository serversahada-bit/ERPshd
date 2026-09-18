'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { RAW_FIELD_SECTIONS, RAW_FIELDS, MetaTestingRow } from '@/lib/metaTesting';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import { ScalevPage } from '@/lib/scalevApi';
import AdIdPicker from './AdIdPicker';

interface ScriptKontenOption {
  id: number;
  namaKonten: string;
}

function buildInitialFormState(initialData: MetaTestingRow | null): Record<string, string> {
  const state: Record<string, string> = {};
  RAW_FIELDS.forEach((f) => {
    const value = initialData ? (initialData as any)[f.key] : null;
    state[f.key] = value === null || value === undefined ? '' : String(value);
  });
  return state;
}

interface MetaTestingFormModalProps {
  mode: 'create' | 'edit';
  products: MetaAdsProduct[];
  initialData: MetaTestingRow | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function MetaTestingFormModal({ mode, products, initialData, onClose, onSaved }: MetaTestingFormModalProps) {
  const [productId, setProductId] = useState<string>(
    initialData ? String(initialData.productId) : products[0] ? String(products[0].id) : ''
  );
  const [form, setForm] = useState<Record<string, string>>(() => buildInitialFormState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scalevPages, setScalevPages] = useState<ScalevPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [scriptKontenOptions, setScriptKontenOptions] = useState<ScriptKontenOption[]>([]);
  const [isLoadingKonten, setIsLoadingKonten] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setIsLoadingPages(true);
    setPagesError(null);
    fetch(`/api/scalev-pages?productId=${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setPagesError(json.error || 'Gagal memuat daftar landing page Scalev.');
          setScalevPages([]);
          return;
        }
        setScalevPages(json.data as ScalevPage[]);
      })
      .catch(() => {
        if (!cancelled) setPagesError('Gagal terhubung ke Scalev.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPages(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setIsLoadingKonten(true);
    fetch(`/api/script-konten?productId=${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const options = (json.data as { id: number; namaKonten: string | null }[])
          .filter((r) => r.namaKonten)
          .map((r) => ({ id: r.id, namaKonten: r.namaKonten as string }));
        setScriptKontenOptions(options);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingKonten(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Pilih produk terlebih dahulu.');
      return;
    }
    setIsSaving(true);
    setError(null);

    const payload: Record<string, string | number> = { productId: Number(productId), ...form };

    try {
      const url = mode === 'create' ? '/api/meta-testing' : `/api/meta-testing/${initialData?.id}`;
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
            {mode === 'create' ? 'Tambah Data Meta Testing' : 'Edit Data Meta Testing'}
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

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Produk</div>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            >
              {products.length === 0 && <option value="">Belum ada produk</option>}
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          {RAW_FIELD_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                {section.title}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {field.label}
                      {field.suffix ? ` (${field.suffix})` : ''}
                    </label>
                    {field.key === 'adId' ? (
                      <AdIdPicker value={form[field.key]} onChange={(id) => handleChange(field.key, id)} />
                    ) : field.key === 'namaKonten' ? (
                      <>
                        <input
                          type="text"
                          list="meta-testing-nama-konten-options"
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={isLoadingKonten ? 'Memuat daftar konten...' : 'Pilih atau ketik nama konten'}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                        />
                        <datalist id="meta-testing-nama-konten-options">
                          {scriptKontenOptions.map((opt) => (
                            <option key={opt.id} value={opt.namaKonten} />
                          ))}
                        </datalist>
                        <p className="text-[10px] text-slate-400 mt-1">Otomatis menyarankan Nama Konten yang sudah ada di Script dan Konten.</p>
                      </>
                    ) : field.key === 'scalevPageId' ? (
                      <>
                        <select
                          value={form[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          disabled={isLoadingPages || scalevPages.length === 0}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="">{isLoadingPages ? 'Memuat landing page...' : '- Pilih landing page -'}</option>
                          {scalevPages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.slug})
                            </option>
                          ))}
                        </select>
                        {pagesError && <p className="text-[10px] text-rose-500 mt-1">{pagesError}</p>}
                      </>
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      >
                        <option value="">-</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        step="any"
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
                      />
                    )}
                  </div>
                ))}
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
            className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 size={13} className="animate-spin" />}
            <span>{mode === 'create' ? 'Simpan Data' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
