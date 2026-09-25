'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { RAW_FIELD_SECTIONS, RAW_FIELDS, MANUAL_INPUT_KEYS, AUTO_FROM_CLOSING_BOX_CS_KEYS, computeAutoRawFields, MetaAdsRawRecord } from '@/lib/metaAds';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import SearchableSelect from './SearchableSelect';

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
  /** Langsung tarik data dari Meta buat tanggal default (hari ini) begitu form dibuka. */
  autoFetchFromMeta?: boolean;
}

// Field ini yang mapping-nya ke Meta Graph API jelas & dikonfirmasi — Tayangan
// Konten/Add To Chart/IC Form ternyata funnel e-commerce standar Meta Pixel (View
// Content/Add To Cart/Initiate Checkout, dikonfirmasi user dari pola nama "Rasio VC/ATC/IC").
// Field lain (Form Scalev, WA Iklan, dst) tetap manual karena definisinya belum dipastikan.
const META_FETCH_FIELD_MAP: Record<
  string,
  'spend' | 'reach' | 'impressions' | 'linkClicks' | 'viewContent' | 'addToCart' | 'initiateCheckout'
> = {
  spendIklan: 'spend',
  jangkauan: 'reach',
  impresi: 'impressions',
  klikTautan: 'linkClicks',
  tayanganKonten: 'viewContent',
  addToChart: 'addToCart',
  icForm: 'initiateCheckout',
};

export default function MetaAdsFormModal({ mode, productId, initialData, onClose, onSaved, autoFetchFromMeta }: MetaAdsFormModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => buildInitialFormState(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaFetchMessage, setMetaFetchMessage] = useState<string | null>(null);
  const [metaFetchError, setMetaFetchError] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingAdAccounts, setIsLoadingAdAccounts] = useState(true);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState('');
  const [scalevStoreId, setScalevStoreId] = useState<number | null>(null);
  // Sekali "Tarik dari Meta" pernah jalan (otomatis lewat tombol "Tambah Data dari Meta",
  // atau diklik manual), sesudah itu ganti Tanggal/Ad Account auto tarik ulang. Sebelum
  // pernah dipakai sama sekali (mis. buka lewat "Tambah Data" biasa), tetap full manual —
  // tidak ada API call ke Meta yang tidak disadari user.
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // Ambil daftar Ad Account (buat dropdown pilih/ganti) + Ad Account default produk ini
  // (diatur di Master Produk), supaya user lihat & bisa ganti akun mana yang dipakai
  // sebelum narik data — bukan diam-diam pakai default tanpa konfirmasi.
  useEffect(() => {
    Promise.all([
      fetch('/api/meta-graph/accounts').then((res) => res.json()),
      fetch('/api/meta-ads/products').then((res) => res.json()),
    ]).then(([accountsJson, productsJson]) => {
      if (accountsJson.success) setAdAccounts(accountsJson.data);
      if (productsJson.success) {
        const product = (productsJson.data as MetaAdsProduct[]).find((p) => String(p.id) === productId);
        if (product?.metaAdAccountId) setSelectedAdAccountId(product.metaAdAccountId);
        setScalevStoreId(product?.scalevStoreId ?? null);
      }
    }).finally(() => setIsLoadingAdAccounts(false));
  }, [productId]);

  const fetchFromMeta = async (date: string) => {
    if (!productId || !date) return;
    if (!selectedAdAccountId) {
      setMetaFetchError('Pilih Ad Account dulu.');
      return;
    }
    setIsFetchingMeta(true);
    setMetaFetchError(null);
    setMetaFetchMessage(null);
    setHasFetchedOnce(true);
    try {
      const [metaRes, scalevRes] = await Promise.all([
        fetch(`/api/meta-graph/daily-insight?productId=${productId}&date=${date}&adAccountId=${selectedAdAccountId}`).then((r) => r.json()),
        scalevStoreId
          ? fetch(`/api/scalev-order-stats?productId=${productId}&date=${date}`).then((r) => r.json())
          : Promise.resolve(null),
      ]);

      if (!metaRes.success) {
        setMetaFetchError(metaRes.error || 'Gagal menarik data dari Meta.');
        return;
      }

      const insight = metaRes.data as Record<'spend' | 'reach' | 'impressions' | 'linkClicks' | 'viewContent' | 'addToCart' | 'initiateCheckout', number>;
      const scalevCount = scalevRes?.success ? (scalevRes.data.count as number) : null;

      setForm((prev) => {
        const next = { ...prev };
        (Object.keys(META_FETCH_FIELD_MAP) as (keyof typeof META_FETCH_FIELD_MAP)[]).forEach((key) => {
          next[key] = String(insight[META_FETCH_FIELD_MAP[key]] ?? 0);
        });
        if (scalevCount !== null) next.formScalev = String(scalevCount);
        return next;
      });

      if (!scalevStoreId) {
        setMetaFetchMessage(`Berhasil ditarik dari Meta untuk tanggal ${date}. Form Scalev belum otomatis (Scalev Store ID produk ini belum diatur di Master Produk) — isi manual. WA Iklan tetap manual.`);
      } else if (scalevRes && !scalevRes.success) {
        setMetaFetchMessage(`Berhasil ditarik dari Meta untuk tanggal ${date}. Form Scalev gagal ditarik (${scalevRes.error}) — isi manual. WA Iklan tetap manual.`);
      } else {
        setMetaFetchMessage(`Berhasil ditarik dari Meta & Scalev untuk tanggal ${date}. WA Iklan tetap perlu diisi manual.`);
      }
    } catch {
      setMetaFetchError('Gagal terhubung ke Meta/Scalev API.');
    } finally {
      setIsFetchingMeta(false);
    }
  };

  // Fetch pertama otomatis — cuma kalau dibuka lewat tombol "Tambah Data dari Meta".
  // Nunggu selectedAdAccountId keisi dulu (lookup Ad Account default produk perlu waktu).
  useEffect(() => {
    if (autoFetchFromMeta && selectedAdAccountId && !hasFetchedOnce) fetchFromMeta(form.tanggal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdAccountId]);

  // Sesudah pernah tarik sekali (otomatis atau manual), ganti Tanggal/Ad Account auto
  // tarik ulang — tidak perlu klik tombol lagi tiap kali.
  useEffect(() => {
    if (hasFetchedOnce) fetchFromMeta(form.tanggal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tanggal, selectedAdAccountId]);

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

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-3 space-y-2.5">
            <div>
              <p className="text-xs font-semibold text-blue-900">Tarik Spend/Jangkauan/Impresi/Klik Tautan/Tayangan Konten/Add To Chart/IC Form dari Meta Ads Manager + Form Scalev (order dengan sumber iklan) dari Scalev</p>
              <p className="text-[11px] text-blue-700/80 mt-0.5">Buat tanggal yang dipilih di bawah. WA Iklan &amp; field lain tetap perlu diisi manual.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-semibold text-blue-900/70 mb-1">Ad Account</label>
                <SearchableSelect
                  value={selectedAdAccountId}
                  onChange={setSelectedAdAccountId}
                  options={adAccounts.map((a) => ({ id: a.id, label: a.name }))}
                  disabled={isLoadingAdAccounts}
                  disabledPlaceholder="Memuat akun..."
                  placeholder="Ketik buat cari Ad Account..."
                />
              </div>
              <button
                type="button"
                onClick={() => fetchFromMeta(form.tanggal)}
                disabled={isFetchingMeta || !form.tanggal || !selectedAdAccountId}
                className="shrink-0 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 sm:mt-[18px]"
              >
                {isFetchingMeta && <Loader2 size={13} className="animate-spin" />}
                <span>Tarik dari Meta &amp; Scalev</span>
              </button>
            </div>

            {metaFetchMessage && <p className="text-[11px] text-emerald-700 font-medium">{metaFetchMessage}</p>}
            {metaFetchError && <p className="text-[11px] text-rose-600 font-medium">{metaFetchError}</p>}
          </div>

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
