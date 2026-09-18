'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Loader2 } from 'lucide-react';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';

interface ProductManageModalProps {
  products: MetaAdsProduct[];
  onClose: () => void;
  onChanged: () => void;
}

interface RowState {
  nama: string;
  sheetUrl: string;
  saving: boolean;
}

export default function ProductManageModal({ products, onClose, onChanged }: ProductManageModalProps) {
  const [rowEdits, setRowEdits] = useState<Record<number, RowState>>(() =>
    Object.fromEntries(products.map((p) => [p.id, { nama: p.nama, sheetUrl: p.sheetUrl, saving: false }]))
  );
  const [newNama, setNewNama] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRow = (p: MetaAdsProduct): RowState => rowEdits[p.id] || { nama: p.nama, sheetUrl: p.sheetUrl, saving: false };

  const isDirty = (p: MetaAdsProduct) => {
    const row = getRow(p);
    return row.nama !== p.nama || row.sheetUrl !== p.sheetUrl;
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
        body: JSON.stringify({ nama: row.nama, sheetUrl: row.sheetUrl }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menyimpan perubahan.');
        return;
      }
      onChanged();
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
      onChanged();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    }
  };

  const deleteProduct = async (p: MetaAdsProduct) => {
    if (!window.confirm(`Hapus produk "${p.nama}"? Seluruh data harian produk ini juga akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`)) {
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
      onChanged();
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
        body: JSON.stringify({ nama: newNama.trim(), sheetUrl: newUrl.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Gagal menambahkan produk.');
        return;
      }
      setNewNama('');
      setNewUrl('');
      onChanged();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">Kelola Produk</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2">
              {error}
            </div>
          )}

          {products.map((p) => {
            const row = getRow(p);
            const dirty = isDirty(p);
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={row.nama}
                    onChange={(e) => updateRow(p.id, { nama: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
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
                <div className="flex items-center gap-2">
                  <input
                    value={row.sheetUrl}
                    onChange={(e) => updateRow(p.id, { sheetUrl: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="Link Google Sheets"
                  />
                  {dirty && (
                    <button
                      onClick={() => saveRow(p)}
                      disabled={row.saving}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-60"
                    >
                      {row.saving && <Loader2 size={11} className="animate-spin" />}
                      <span>Simpan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <form onSubmit={addProduct} className="rounded-xl border border-dashed border-slate-300 p-3 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tambah Produk Baru</div>
            <input
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              placeholder="Nama produk (mis. Gamamilk Q1 2027)"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Link Google Sheets"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isAdding || !newNama.trim() || !newUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isAdding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              <span>Tambah Produk</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
