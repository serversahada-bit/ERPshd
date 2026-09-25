'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import SearchableSelect from './SearchableSelect';

interface RowState {
  nama: string;
  sheetUrl: string;
  scalevTestStoreId: string;
  metaAdAccountId: string;
  scalevStoreId: string;
  saving: boolean;
}

interface ScalevStoreOption {
  id: number;
  name: string;
}
interface MetaAdAccountOption {
  id: string;
  name: string;
}

export default function ProductMasterView() {
  const [products, setProducts] = useState<MetaAdsProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowEdits, setRowEdits] = useState<Record<number, RowState>>({});
  const [newNama, setNewNama] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newStoreId, setNewStoreId] = useState('');
  const [newAdAccountId, setNewAdAccountId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daftar store Scalev & Ad Account Meta, diambil sekali dari API supaya user tinggal
  // pilih dari nama-nya, tidak perlu cari/copy ID manual dari dashboard lain.
  const [scalevStores, setScalevStores] = useState<ScalevStoreOption[]>([]);
  const [scalevStoresError, setScalevStoresError] = useState<string | null>(null);
  const [isLoadingScalevStores, setIsLoadingScalevStores] = useState(true);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccountOption[]>([]);
  const [adAccountsError, setAdAccountsError] = useState<string | null>(null);
  const [isLoadingAdAccounts, setIsLoadingAdAccounts] = useState(true);

  useEffect(() => {
    fetch('/api/scalev-stores')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setScalevStores(json.data as ScalevStoreOption[]);
        else setScalevStoresError(json.error || 'Gagal memuat daftar store Scalev.');
      })
      .catch(() => setScalevStoresError('Gagal terhubung ke Scalev.'))
      .finally(() => setIsLoadingScalevStores(false));

    fetch('/api/meta-graph/accounts')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAdAccounts(json.data as MetaAdAccountOption[]);
        else setAdAccountsError(json.error || 'Gagal memuat daftar Ad Account Meta.');
      })
      .catch(() => setAdAccountsError('Gagal terhubung ke Meta API.'))
      .finally(() => setIsLoadingAdAccounts(false));
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/meta-ads/products');
      const json = await res.json();
      if (!json.success) {
        setLoadError(json.error || 'Gagal memuat daftar produk.');
        return;
      }
      const list = json.data as MetaAdsProduct[];
      setProducts(list);
      setRowEdits(
        Object.fromEntries(
          list.map((p) => [
            p.id,
            {
              nama: p.nama,
              sheetUrl: p.sheetUrl,
              scalevTestStoreId: p.scalevTestStoreId ? String(p.scalevTestStoreId) : '',
              metaAdAccountId: p.metaAdAccountId || '',
              scalevStoreId: p.scalevStoreId ? String(p.scalevStoreId) : '',
              saving: false,
            },
          ])
        )
      );
    } catch {
      setLoadError('Terjadi kesalahan jaringan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getRow = (p: MetaAdsProduct): RowState =>
    rowEdits[p.id] || {
      nama: p.nama,
      sheetUrl: p.sheetUrl,
      scalevTestStoreId: p.scalevTestStoreId ? String(p.scalevTestStoreId) : '',
      metaAdAccountId: p.metaAdAccountId || '',
      scalevStoreId: p.scalevStoreId ? String(p.scalevStoreId) : '',
      saving: false,
    };

  const isDirty = (p: MetaAdsProduct) => {
    const row = getRow(p);
    return (
      row.nama !== p.nama ||
      row.sheetUrl !== p.sheetUrl ||
      row.scalevTestStoreId !== (p.scalevTestStoreId ? String(p.scalevTestStoreId) : '') ||
      row.metaAdAccountId !== (p.metaAdAccountId || '') ||
      row.scalevStoreId !== (p.scalevStoreId ? String(p.scalevStoreId) : '')
    );
  };

  const updateRow = (id: number, patch: Partial<RowState>) => {
    setRowEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveRow = async (p: MetaAdsProduct) => {
    const row = getRow(p);
    updateRow(p.id, { saving: true });
    setError(null);
    try {
      const res = await fetch(`/api/meta-ads/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: row.nama,
          sheetUrl: row.sheetUrl,
          scalevTestStoreId: row.scalevTestStoreId ? Number(row.scalevTestStoreId) : null,
          metaAdAccountId: row.metaAdAccountId.trim() || null,
          scalevStoreId: row.scalevStoreId ? Number(row.scalevStoreId) : null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menyimpan perubahan.');
        return;
      }
      fetchProducts();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      updateRow(p.id, { saving: false });
    }
  };

  const toggleActive = async (p: MetaAdsProduct) => {
    setError(null);
    try {
      const res = await fetch(`/api/meta-ads/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal mengubah status.');
        return;
      }
      fetchProducts();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const deleteProduct = async (p: MetaAdsProduct) => {
    if (!window.confirm(`Hapus produk "${p.nama}"? Seluruh data harian, Script & Konten, dan Meta Testing produk ini juga akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/meta-ads/products/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menghapus produk.');
        return;
      }
      fetchProducts();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newUrl.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/meta-ads/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: newNama.trim(),
          sheetUrl: newUrl.trim(),
          scalevTestStoreId: newStoreId.trim() ? Number(newStoreId.trim()) : null,
          metaAdAccountId: newAdAccountId.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menambahkan produk.');
        return;
      }
      setNewNama('');
      setNewUrl('');
      setNewStoreId('');
      setNewAdAccountId('');
      fetchProducts();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Master Produk</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Kelola jenis produk yang dipakai bersama oleh modul Advertiser, Branding, Script &amp; Konten, dan Meta Testing.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Memuat data...</span>
          </div>
        ) : loadError ? (
          <div className="p-6 text-center text-rose-600 text-sm font-semibold">{loadError}</div>
        ) : (
          products.map((p) => {
            const row = getRow(p);
            const dirty = isDirty(p);
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    value={row.nama}
                    onChange={(e) => updateRow(p.id, { nama: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                    placeholder="Nama produk"
                  />
                  <label className="inline-flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={p.isActive}
                      onChange={() => toggleActive(p)}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                    />
                    <span className={`text-[11px] font-semibold ${p.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {p.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteProduct(p)}
                    className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus produk"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Link Google Sheets (Meta Ads)</label>
                    <input
                      value={row.sheetUrl}
                      onChange={(e) => updateRow(p.id, { sheetUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                      placeholder="Link Google Sheets"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Scalev Test Store ID (untuk Meta Testing)</label>
                    <select
                      value={row.scalevTestStoreId}
                      onChange={(e) => updateRow(p.id, { scalevTestStoreId: e.target.value })}
                      disabled={isLoadingScalevStores}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">{isLoadingScalevStores ? 'Memuat store...' : '- Pilih store -'}</option>
                      {row.scalevTestStoreId && !scalevStores.some((s) => String(s.id) === row.scalevTestStoreId) && (
                        <option value={row.scalevTestStoreId}>ID {row.scalevTestStoreId} (tidak ditemukan di daftar)</option>
                      )}
                      {scalevStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                    {scalevStoresError && <p className="text-[10px] text-rose-500 mt-1">{scalevStoresError}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Meta Ad Account ID (Dashboard Meta Live)</label>
                    <SearchableSelect
                      value={row.metaAdAccountId}
                      onChange={(id) => updateRow(p.id, { metaAdAccountId: id })}
                      options={adAccounts.map((a) => ({ id: a.id, label: a.name }))}
                      disabled={isLoadingAdAccounts}
                      disabledPlaceholder="Memuat akun..."
                      placeholder="Ketik buat cari Ad Account..."
                    />
                    {adAccountsError && <p className="text-[10px] text-rose-500 mt-1">{adAccountsError}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">Scalev Store ID (untuk FORM SCALEV harian)</label>
                    <SearchableSelect
                      value={row.scalevStoreId}
                      onChange={(id) => updateRow(p.id, { scalevStoreId: id })}
                      options={scalevStores.map((s) => ({ id: String(s.id), label: s.name }))}
                      disabled={isLoadingScalevStores}
                      disabledPlaceholder="Memuat store..."
                      placeholder="Ketik buat cari store..."
                    />
                    {scalevStoresError && <p className="text-[10px] text-rose-500 mt-1">{scalevStoresError}</p>}
                  </div>
                </div>

                {dirty && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => saveRow(p)}
                      disabled={row.saving}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-60"
                    >
                      {row.saving && <Loader2 size={11} className="animate-spin" />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        <form onSubmit={addProduct} className="rounded-xl border border-dashed border-slate-300 p-3.5 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tambah Jenis Produk Baru</div>
          <input
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Nama produk (mis. Gamamilk Plus)"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Link Google Sheets (Meta Ads)"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
            />
            <input
              value={newStoreId}
              onChange={(e) => setNewStoreId(e.target.value.replace(/\D/g, ''))}
              placeholder="Scalev Test Store ID (opsional)"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
            />
            <input
              value={newAdAccountId}
              onChange={(e) => setNewAdAccountId(e.target.value)}
              placeholder="Meta Ad Account ID (opsional)"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newNama.trim() || !newUrl.trim()}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            {isAdding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            <span>Tambah Produk</span>
          </button>
        </form>
      </div>
    </div>
  );
}
