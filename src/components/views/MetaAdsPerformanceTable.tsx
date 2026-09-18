'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, Loader2, Inbox, ChevronsUpDown, ChevronUp, ChevronDown, ChevronRight, Download } from 'lucide-react';
import {
  MetaAdsFullRow,
  MetaAdsRawRecord,
  formatDisplayValue,
  formatDisplayDate,
  GRADE_BADGE_CLASS,
} from '@/lib/metaAds';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import MetaAdsFormModal from './MetaAdsFormModal';
import MetaAdsDetailModal from './MetaAdsDetailModal';
import ImportSheetModal from './ImportSheetModal';

type SortKey = 'dibuatOleh' | 'tanggal' | 'targetSpend' | 'spendIklan' | 'totalLeadReal' | 'closingRateTp';

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const isActive = activeKey === sortKey;
  return (
    <th className={`px-5 py-3 font-bold text-slate-900 whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-blue-600 transition-colors ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span>{label}</span>
        {isActive ? (
          dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        ) : (
          <ChevronsUpDown size={13} className="text-slate-300" />
        )}
      </button>
    </th>
  );
}

export default function MetaAdsPerformanceTable() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('pid');

  const [rows, setRows] = useState<MetaAdsFullRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; data: (MetaAdsRawRecord & { id?: number }) | null } | null>(null);
  const [detailRow, setDetailRow] = useState<MetaAdsFullRow | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDefaultUrl, setImportDefaultUrl] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('tanggal');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string> | null>(null);

  const fetchRows = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/meta-ads?productId=${productId}`);
      const json = await res.json();
      if (!json.success) {
        setLoadError(json.error || 'Gagal memuat data.');
        return;
      }
      setRows(json.data as MetaAdsFullRow[]);
    } catch {
      setLoadError('Terjadi kesalahan jaringan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Default: bulan yang sudah lewat otomatis tertutup, bulan berjalan (& masa
  // depan) terbuka. Cuma dihitung SEKALI saat data pertama kali masuk, supaya
  // toggle manual user tidak ke-reset tiap refetch (habis tambah/edit/import).
  useEffect(() => {
    if (collapsedMonths === null && rows.length > 0) {
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const initial = new Set<string>();
      rows.forEach((r) => {
        const monthKey = r.tanggal.slice(0, 7);
        if (monthKey < currentMonthKey) initial.add(monthKey);
      });
      setCollapsedMonths(initial);
    }
  }, [rows, collapsedMonths]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const monthGroups = useMemo(() => {
    const groups = new Map<string, MetaAdsFullRow[]>();
    for (const row of sortedRows) {
      const monthKey = row.tanggal.slice(0, 7);
      if (!groups.has(monthKey)) groups.set(monthKey, []);
      groups.get(monthKey)!.push(row);
    }
    return Array.from(groups.entries()).map(([monthKey, monthRows]) => ({
      monthKey,
      label: new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      rows: monthRows,
    }));
  }, [sortedRows]);

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaved = () => {
    setModalState(null);
    fetchRows();
  };

  const openImportModal = async () => {
    try {
      const res = await fetch('/api/meta-ads/products');
      const json = await res.json();
      if (json.success) {
        const current = (json.data as MetaAdsProduct[]).find((p) => String(p.id) === productId);
        setImportDefaultUrl(current?.sheetUrl || '');
      }
    } catch {
      setImportDefaultUrl('');
    }
    setShowImportModal(true);
  };

  const handleImport = async (sheetUrl: string) => {
    try {
      const res = await fetch('/api/meta-ads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: Number(productId), sheetUrl }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || 'Gagal mengimpor data.');
        return;
      }
      setShowImportModal(false);
      alert(json.message || 'Impor selesai.');
      fetchRows();
    } catch {
      alert('Terjadi kesalahan jaringan saat mengimpor data.');
    }
  };

  const deleteByIds = async (ids: number[]) => {
    setIsMutating(true);
    try {
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/meta-ads/${id}`, { method: 'DELETE' }).then((r) => r.json()))
      );
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        alert(failed[0].error || 'Sebagian data gagal dihapus.');
      }
      setSelectedIds(new Set());
      fetchRows();
    } catch {
      alert('Terjadi kesalahan jaringan saat menghapus data.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteOne = (row: MetaAdsFullRow) => {
    if (!window.confirm(`Hapus data tanggal ${formatDisplayDate(row.tanggal)}? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    deleteByIds([row.id]);
  };

  const handleDeleteSelected = () => {
    if (!window.confirm(`Hapus ${selectedIds.size} data terpilih? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    deleteByIds(Array.from(selectedIds));
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">Meta Ads Performance Dashboard</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openImportModal}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={15} />
            <span>Import dari Google Sheets</span>
          </button>
          <button
            onClick={() => setModalState({ mode: 'create', data: null })}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus size={15} />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>Memuat data...</span>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-6 text-center text-rose-600 text-sm font-semibold">
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex flex-col items-center justify-center gap-2 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Belum ada data Meta Ads</p>
          <p className="text-xs text-slate-400">Klik &quot;Tambah Data&quot; untuk mulai mengisi performa harian.</p>
        </div>
      )}

      {!isLoading && !loadError && rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {selectedIds.size > 0 && (
            <div className="px-5 py-2.5 border-b border-slate-100 bg-blue-50/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700">{selectedIds.size} data dipilih</span>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                <Trash2 size={13} />
                <span>Hapus Terpilih</span>
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-600"
                    />
                  </th>
                  <SortHeader label="Dibuat Oleh" sortKey="dibuatOleh" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Date" sortKey="tanggal" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Target Spend" sortKey="targetSpend" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Spend Iklan" sortKey="spendIklan" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Total Lead Real" sortKey="totalLeadReal" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Closing Rate" sortKey="closingRateTp" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Grade</th>
                  <th className="text-right px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              {monthGroups.map((group) => {
                const isCollapsed = collapsedMonths?.has(group.monthKey) ?? false;
                return (
                  <tbody key={group.monthKey}>
                    <tr>
                      <td colSpan={9} className="p-0">
                        <button
                          onClick={() => toggleMonth(group.monthKey)}
                          className="w-full flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/70 text-left transition-colors"
                        >
                          {isCollapsed ? (
                            <ChevronRight size={14} className="text-slate-500" />
                          ) : (
                            <ChevronDown size={14} className="text-slate-500" />
                          )}
                          <span className="text-xs font-bold text-slate-700 capitalize">{group.label}</span>
                          <span className="text-[11px] text-slate-400">({group.rows.length} hari)</span>
                        </button>
                      </td>
                    </tr>

                    {!isCollapsed &&
                      group.rows.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="px-5 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(row.id)}
                              onChange={() => toggleSelectRow(row.id)}
                              className="h-3.5 w-3.5 rounded border-slate-300 accent-blue-600"
                            />
                          </td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.dibuatOleh || '-'}</td>
                          <td className="px-5 py-3 font-semibold text-slate-700 whitespace-nowrap">{formatDisplayDate(row.tanggal)}</td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.targetSpend, 'currency')}</td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.spendIklan, 'currency')}</td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.totalLeadReal, 'number')}</td>
                          <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.closingRateTp, 'percent')}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                GRADE_BADGE_CLASS[row.grade] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {row.grade}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setDetailRow(row)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Detail"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setModalState({ mode: 'edit', data: row })}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteOne(row)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
      )}

      {modalState && (
        <MetaAdsFormModal
          mode={modalState.mode}
          productId={productId || ''}
          initialData={modalState.data}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}

      {detailRow && <MetaAdsDetailModal row={detailRow} onClose={() => setDetailRow(null)} />}

      {showImportModal && (
        <ImportSheetModal
          defaultUrl={importDefaultUrl}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}

      {isMutating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30">
          <div className="bg-white rounded-xl px-5 py-4 flex items-center gap-2 shadow-xl text-sm text-slate-600">
            <Loader2 size={16} className="animate-spin" />
            <span>Memproses...</span>
          </div>
        </div>
      )}
    </div>
  );
}
