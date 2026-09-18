'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { ScriptKontenRow, statusBadgeClass, formatAccentClass } from '@/lib/scriptKonten';

interface ScriptKontenGalleryProps {
  rows: ScriptKontenRow[];
  hasProducts: boolean;
  onEdit: (row: ScriptKontenRow) => void;
}

export default function ScriptKontenGallery({ rows, hasProducts, onEdit }: ScriptKontenGalleryProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rows.map((row) => (
        <div
          key={row.id}
          onClick={() => onEdit(row)}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden cursor-pointer hover:shadow-md hover:border-rose-200 transition-all"
        >
          <div className={`h-20 flex items-center justify-center text-white font-black text-sm tracking-wide ${formatAccentClass(row.format)}`}>
            {row.format || 'KONTEN'}
          </div>
          <div className="p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(row.status)}`}>{row.status}</span>
              <span className="text-[9px] font-semibold text-slate-400">{row.funnel}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{row.judul || '(Tanpa judul)'}</h4>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{row.productNama}</p>
            {row.angle && <p className="text-[10px] text-slate-400 mt-1 truncate">Angle: {row.angle}</p>}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
              <span className="text-[10px] text-slate-500 truncate">{row.creator || '-'}</span>
              <span className="text-[10px] text-slate-400">{row.tanggalOrder || '-'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
