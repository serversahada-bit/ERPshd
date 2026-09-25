'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronsUpDown, Inbox, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { CS_COUNT_FIELDS, CS_METRIC_FIELDS, formatCsMetric, isPositiveId, type ClosingBoxCsRecord } from '@/lib/closingBoxCs';
import ProductSelector from '../ProductSelector';
import ClosingBoxCsFormModal from './ClosingBoxCsFormModal';

const number = (value: number) => value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
const date = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ClosingBoxCsView() {
  const searchParams = useSearchParams();
  const productId = Number(searchParams.get('pid'));
  // Remount product-specific state so an open form or a slow request cannot leak across products.
  return isPositiveId(productId) ? (
    <ClosingBoxCsTable key={productId} productId={productId} />
  ) : (
    <div className="space-y-5">
      <div className="flex justify-end">
        <ProductSelector />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Pilih atau tambahkan produk di atas untuk mengelola Closing Box CS.
      </div>
    </div>
  );
}

function ClosingBoxCsTable({ productId }: { productId: number }) {
  const [rows, setRows] = useState<ClosingBoxCsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState<{ data: ClosingBoxCsRecord | null } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [ascending, setAscending] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/closing-box-cs?productId=${productId}`, { signal: controller.signal });
        if (response.redirected || response.status === 401) throw new Error('Sesi berakhir. Silakan login kembali.');
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || 'Gagal memuat data.');
        if (!controller.signal.aborted) setRows(json.data);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Gagal memuat data.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [productId, revision]);

  const groups = useMemo(() => {
    const sorted = [...rows].sort((a, b) => (a.tanggal.localeCompare(b.tanggal) || a.id - b.id) * (ascending ? 1 : -1));
    const result = new Map<string, ClosingBoxCsRecord[]>();
    for (const row of sorted) {
      const month = row.tanggal.slice(0, 7);
      const group = result.get(month) || [];
      group.push(row);
      result.set(month, group);
    }
    return Array.from(result.entries());
  }, [rows, ascending]);

  async function deleteRow(row: ClosingBoxCsRecord) {
    if (!window.confirm(`Hapus data Closing Box CS ${date(row.tanggal)} — ${row.platform} / ${row.adv}?`)) return;
    setDeleting(row.id);
    setError('');
    try {
      const response = await fetch(`/api/closing-box-cs/${row.id}?productId=${productId}`, { method: 'DELETE' });
      if (response.redirected || response.status === 401) throw new Error('Sesi berakhir. Silakan login kembali.');
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Gagal menghapus data.');
      setRevision((value) => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : 'Gagal menghapus data.'); }
    finally { setDeleting(null); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900">Closing Box CS</h1>
          <p className="mt-1 text-xs text-slate-500">Pencatatan lead, closing, dan box CS per tanggal, platform, dan advertiser.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ProductSelector />
          <button onClick={() => setModal({ data: null })} disabled={deleting !== null} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"><Plus size={15} />Tambah Data</button>
        </div>
      </div>
      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button onClick={() => setRevision((value) => value + 1)} className="shrink-0 font-semibold underline">Coba lagi</button></div>}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Memuat data...</div>
      ) : !error && rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-center"><Inbox size={28} className="text-slate-300" /><p className="text-sm font-semibold text-slate-600">Belum ada data Closing Box CS</p><p className="text-xs text-slate-400">Klik &quot;Tambah Data&quot; untuk mencatat closing CS.</p></div>
      ) : rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700">
                <tr className="border-b border-slate-200">
                  <th rowSpan={2} scope="col" className="px-4 py-3 text-left">Dibuat Oleh</th>
                  <th rowSpan={2} scope="col" aria-sort={ascending ? 'ascending' : 'descending'} className="px-4 py-3 text-left"><button onClick={() => setAscending((value) => !value)} className="inline-flex items-center gap-1">Tanggal<ChevronsUpDown size={13} /></button></th>
                  <th rowSpan={2} scope="col" className="px-4 py-3 text-left">Platform</th>
                  <th rowSpan={2} scope="col" className="px-4 py-3 text-left">ADV</th>
                  {['Lead CS', 'New Customer', 'Follow Up'].map((group) => <th key={group} scope="colgroup" colSpan={2} className="border-l border-slate-200 px-4 py-3 text-center">{group}</th>)}
                  {CS_METRIC_FIELDS.map((metric) => <th key={metric.key} rowSpan={2} scope="col" title={metric.formula} className="border-l border-slate-200 px-4 py-3 text-right">{metric.label}</th>)}
                  <th rowSpan={2} scope="col" className="px-4 py-3 text-center">Aksi</th>
                </tr>
                <tr className="border-b border-slate-200">{CS_COUNT_FIELDS.map((field, index) => <th scope="col" key={field.key} className={`px-4 py-2 text-right ${index % 2 === 0 ? 'border-l border-slate-200' : ''}`}>{field.label}</th>)}</tr>
              </thead>
              {groups.map(([month, monthRows]) => (
                <tbody key={month} className="divide-y divide-slate-100">
                  <tr className="bg-indigo-50/60"><th colSpan={5 + CS_COUNT_FIELDS.length + CS_METRIC_FIELDS.length} scope="rowgroup" className="px-4 py-2 text-left"><button aria-expanded={!collapsed.has(month)} onClick={() => setCollapsed((previous) => { const next = new Set(previous); if (next.has(month)) next.delete(month); else next.add(month); return next; })} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-800">{collapsed.has(month) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}{new Date(`${month}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}<span className="font-normal text-slate-500">({monthRows.length} data)</span></button></th></tr>
                  {!collapsed.has(month) && monthRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-500">{row.dibuatOleh}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{date(row.tanggal)}</td>
                      <td className="px-4 py-3">{row.platform}</td><td className="px-4 py-3">{row.adv}</td>
                      {CS_COUNT_FIELDS.map((field) => <td key={field.key} className="px-4 py-3 text-right tabular-nums">{number(row[field.key])}</td>)}
                      {CS_METRIC_FIELDS.map((metric) => <td key={metric.key} className="px-4 py-3 text-right font-bold tabular-nums text-indigo-700">{formatCsMetric(row[metric.key], metric.percent)}</td>)}
                      <td className="px-4 py-3"><div className="flex justify-center gap-1">
                        <button aria-label={`Edit data ${date(row.tanggal)} ${row.adv}`} title="Edit" disabled={deleting !== null} onClick={() => setModal({ data: row })} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"><Pencil size={15} /></button>
                        <button aria-label={`Hapus data ${date(row.tanggal)} ${row.adv}`} title="Hapus" disabled={deleting !== null} onClick={() => void deleteRow(row)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50">{deleting === row.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Closing Rate dan Up Selling memakai New Customer. Metrik All menggabungkan New Customer dan Follow Up. Pembagi nol menghasilkan 0.</p>
        </div>
      ) : null}
      {modal && <ClosingBoxCsFormModal productId={productId} initialData={modal.data} onClose={() => setModal(null)} onSaved={() => { setModal(null); setRevision((value) => value + 1); }} />}
    </div>
  );
}
