'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Inbox, Plus, Pencil, Trash2, RefreshCw, Settings } from 'lucide-react';
import { MetaTestingRow } from '@/lib/metaTesting';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import MetaTestingFormModal from './MetaTestingFormModal';
import ScalevSettingsModal from './ScalevSettingsModal';

function formatCurrency(v: number) {
  return `Rp ${Math.round(v).toLocaleString('id-ID')}`;
}

function formatSyncTime(v: string | null) {
  if (!v) return 'Belum pernah';
  return new Date(v).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function gradeBadgeClass(grade: string | null) {
  if (!grade) return 'bg-slate-100 text-slate-600';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
  return 'bg-amber-100 text-amber-800';
}

export default function MetaTestingTable() {
  const [products, setProducts] = useState<MetaAdsProduct[]>([]);
  const [rows, setRows] = useState<MetaTestingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; data: MetaTestingRow | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<number | null>(null);
  const [showScalevSettings, setShowScalevSettings] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [productsRes, rowsRes] = await Promise.all([fetch('/api/meta-ads/products'), fetch('/api/meta-testing')]);
      const productsJson = await productsRes.json();
      const rowsJson = await rowsRes.json();

      if (!productsJson.success) {
        setLoadError(productsJson.error || 'Gagal memuat daftar produk.');
        return;
      }
      if (!rowsJson.success) {
        setLoadError(rowsJson.error || 'Gagal memuat data Meta Testing.');
        return;
      }
      setProducts(productsJson.data as MetaAdsProduct[]);
      setRows(rowsJson.data as MetaTestingRow[]);
    } catch {
      setLoadError('Terjadi kesalahan jaringan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSync = async (row: MetaTestingRow) => {
    setIsSyncing(row.id);
    try {
      const res = await fetch(`/api/meta-testing/${row.id}/sync`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        fetchAll();
      } else {
        alert(json.error || 'Gagal sinkronisasi data.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat sinkronisasi.');
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDelete = async (row: MetaTestingRow) => {
    if (!confirm(`Hapus data konten "${row.namaKonten || row.linkKonten}"?`)) return;
    setIsDeleting(row.id);
    try {
      const res = await fetch(`/api/meta-testing/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchAll();
      } else {
        alert(json.error || 'Gagal menghapus data.');
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Meta Testing</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tracking & scoring konten iklan yang sedang ditesting per funnel.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowScalevSettings(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Settings size={14} />
            <span>Scalev</span>
          </button>
          <button
            onClick={() => setModalState({ mode: 'create', data: null })}
            disabled={products.length === 0}
            className="px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus size={15} />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Memuat data...</span>
          </div>
        ) : loadError ? (
          <div className="p-6 text-center text-rose-600 text-sm font-semibold">{loadError}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
            <Inbox size={28} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Belum ada data Meta Testing</p>
            <p className="text-xs text-slate-400">
              {products.length === 0 ? 'Tambahkan produk di menu Meta Ads dulu.' : 'Klik "Tambah Data" untuk mulai mencatat testing konten.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Produk</th>
                  <th className="py-3 px-4 whitespace-nowrap">Funnel</th>
                  <th className="py-3 px-4 whitespace-nowrap">Nama Konten</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Tgl Running</th>
                  <th className="py-3 px-4 whitespace-nowrap">Spending</th>
                  <th className="py-3 px-4 whitespace-nowrap">Lead</th>
                  <th className="py-3 px-4 whitespace-nowrap">CPR</th>
                  <th className="py-3 px-4 whitespace-nowrap">CTR</th>
                  <th className="py-3 px-4 whitespace-nowrap">Hook</th>
                  <th className="py-3 px-4 whitespace-nowrap">Hold</th>
                  <th className="py-3 px-4 whitespace-nowrap">CR</th>
                  <th className="py-3 px-4 whitespace-nowrap">Skor Total</th>
                  <th className="py-3 px-4 whitespace-nowrap">Rank</th>
                  <th className="py-3 px-4 whitespace-nowrap">Grade</th>
                  <th className="py-3 px-4 whitespace-nowrap">PIC (NIK / Nama)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Terakhir Sync</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{row.productNama}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.funnel}</td>
                    <td className="py-3 px-4 whitespace-nowrap max-w-[180px] truncate">{row.namaKonten || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.statusIklan}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.tanggalRunning || '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatCurrency(row.spending)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.totalLead}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatCurrency(row.cpr)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.ctr}%</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.hookRate}%</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.holdRate}%</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.cr}%</td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold">{row.skorTotal}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{row.peringkat ?? '-'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeBadgeClass(row.grade)}`}>
                        {row.grade || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {row.idKaryawan} &bull; {row.namaKaryawan}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">{formatSyncTime(row.lastSyncedAt)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSync(row)}
                          disabled={isSyncing === row.id || !row.adId || !row.scalevPageId}
                          title={!row.adId || !row.scalevPageId ? 'Isi Ad ID & Scalev Page ID dulu' : 'Tarik data terbaru'}
                          className="text-emerald-600 hover:underline font-semibold text-xs flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
                        >
                          <RefreshCw size={12} className={isSyncing === row.id ? 'animate-spin' : ''} />
                          <span>Sync</span>
                        </button>
                        <button
                          onClick={() => setModalState({ mode: 'edit', data: row })}
                          className="text-blue-600 hover:underline font-semibold text-xs flex items-center gap-1"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          disabled={isDeleting === row.id}
                          className="text-rose-600 hover:underline font-semibold text-xs flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
            Menampilkan {rows.length} baris data
          </div>
        )}
      </div>

      {modalState && (
        <MetaTestingFormModal
          mode={modalState.mode}
          products={products}
          initialData={modalState.data}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            fetchAll();
          }}
        />
      )}

      {showScalevSettings && (
        <ScalevSettingsModal onClose={() => setShowScalevSettings(false)} onSaved={() => setShowScalevSettings(false)} />
      )}
    </div>
  );
}
