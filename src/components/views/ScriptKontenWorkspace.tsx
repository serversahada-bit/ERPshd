'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Table2, Calendar, GalleryHorizontal, List, GanttChartSquare, Download } from 'lucide-react';
import { ScriptKontenRow } from '@/lib/scriptKonten';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import ScriptKontenFormModal from './ScriptKontenFormModal';
import ScriptKontenTable from './ScriptKontenTable';
import ScriptKontenCalendar from './ScriptKontenCalendar';
import ScriptKontenGallery from './ScriptKontenGallery';
import ScriptKontenList from './ScriptKontenList';
import ScriptKontenTimeline from './ScriptKontenTimeline';
import ImportSheetModal from './ImportSheetModal';

type ViewMode = 'table' | 'calendar' | 'gallery' | 'list' | 'timeline';

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'table', label: 'Tabel', icon: Table2 },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'gallery', label: 'Gallery', icon: GalleryHorizontal },
  { id: 'list', label: 'List', icon: List },
  { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
];

export default function ScriptKontenWorkspace() {
  const [products, setProducts] = useState<MetaAdsProduct[]>([]);
  const [rows, setRows] = useState<ScriptKontenRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ mode: 'create' | 'edit'; data: ScriptKontenRow | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [productsRes, rowsRes] = await Promise.all([fetch('/api/meta-ads/products'), fetch('/api/script-konten')]);
      const productsJson = await productsRes.json();
      const rowsJson = await rowsRes.json();

      if (!productsJson.success) {
        setLoadError(productsJson.error || 'Gagal memuat daftar produk.');
        return;
      }
      if (!rowsJson.success) {
        setLoadError(rowsJson.error || 'Gagal memuat data Script & Konten.');
        return;
      }
      setProducts(productsJson.data as MetaAdsProduct[]);
      setRows(rowsJson.data as ScriptKontenRow[]);
    } catch {
      setLoadError('Terjadi kesalahan jaringan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (row: ScriptKontenRow) => {
    if (!confirm(`Hapus data "${row.judul || row.namaKonten || 'ini'}"?`)) return;
    setIsDeleting(row.id);
    try {
      const res = await fetch(`/api/script-konten/${row.id}`, { method: 'DELETE' });
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

  const handleImport = async (sheetUrl: string) => {
    try {
      const res = await fetch('/api/script-konten/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || 'Gagal mengimpor data.');
        return;
      }
      setShowImportModal(false);
      const warningText = json.warnings?.length ? `\n\nCatatan:\n- ${json.warnings.join('\n- ')}` : '';
      alert(`${json.message}${warningText}`);
      fetchAll();
    } catch {
      alert('Terjadi kesalahan jaringan saat mengimpor data.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Script dan Konten</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Perencanaan naskah & brief konten sebelum masuk produksi dan testing.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50 overflow-x-auto">
            {VIEW_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setViewMode(opt.id)}
                  title={opt.label}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    viewMode === opt.id ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden lg:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowImportModal(true)}
            disabled={products.length === 0}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Import Spreadsheet</span>
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

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>Memuat data...</span>
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 text-center text-rose-600 text-sm font-semibold">
          {loadError}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <ScriptKontenTable
            rows={rows}
            hasProducts={products.length > 0}
            isDeleting={isDeleting}
            onEdit={(row) => setModalState({ mode: 'edit', data: row })}
            onDelete={handleDelete}
          />
          {rows.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
              Menampilkan {rows.length} baris data
            </div>
          )}
        </div>
      ) : viewMode === 'calendar' ? (
        <ScriptKontenCalendar rows={rows} onEdit={(row) => setModalState({ mode: 'edit', data: row })} />
      ) : viewMode === 'gallery' ? (
        <ScriptKontenGallery rows={rows} hasProducts={products.length > 0} onEdit={(row) => setModalState({ mode: 'edit', data: row })} />
      ) : viewMode === 'list' ? (
        <ScriptKontenList rows={rows} hasProducts={products.length > 0} onEdit={(row) => setModalState({ mode: 'edit', data: row })} />
      ) : (
        <ScriptKontenTimeline rows={rows} hasProducts={products.length > 0} onEdit={(row) => setModalState({ mode: 'edit', data: row })} />
      )}

      {showImportModal && (
        <ImportSheetModal
          defaultUrl=""
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          description='Import satu kali dari spreadsheet lama (kolom dicocokkan berdasarkan nama header: JUDUL, PRODUK, FUNNEL, dst). Pastikan sheet dibagikan sebagai "Siapa saja yang memiliki link dapat melihat". Menjalankan import dua kali akan menambah data duplikat, bukan menimpa.'
        />
      )}

      {modalState && (
        <ScriptKontenFormModal
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
    </div>
  );
}
