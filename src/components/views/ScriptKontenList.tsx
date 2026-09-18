'use client';

import React from 'react';
import { Inbox, ChevronRight } from 'lucide-react';
import { ScriptKontenRow, statusBadgeClass } from '@/lib/scriptKonten';

interface ScriptKontenListProps {
  rows: ScriptKontenRow[];
  hasProducts: boolean;
  onEdit: (row: ScriptKontenRow) => void;
}

export default function ScriptKontenList({ rows, hasProducts, onEdit }: ScriptKontenListProps) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex flex-col items-center justify-center gap-2 text-center">
        <Inbox size={28} className="text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">Belum ada data Script & Konten</p>
        <p className="text-xs text-slate-400">{!hasProducts ? 'Tambahkan produk di menu Meta Ads dulu.' : 'Klik "Tambah Data" untuk mulai.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
      {rows.map((row) => (
        <button
          key={row.id}
          onClick={() => onEdit(row)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors text-left"
        >
          <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(row.status)}`}>{row.status}</span>
          <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{row.judul || '(Tanpa judul)'}</span>
          <span className="hidden sm:block text-xs text-slate-400 shrink-0 w-28 truncate">{row.productNama}</span>
          <span className="hidden md:block text-xs text-slate-400 shrink-0 w-24 truncate">{row.creator || '-'}</span>
          <span className="hidden md:block text-xs text-slate-400 shrink-0 w-20 text-right">{row.tanggalOrder || '-'}</span>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
        </button>
      ))}
    </div>
  );
}
