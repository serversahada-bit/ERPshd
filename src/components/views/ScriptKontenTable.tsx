'use client';

import React from 'react';
import { Inbox, Pencil, Trash2 } from 'lucide-react';
import { ScriptKontenRow, statusBadgeClass } from '@/lib/scriptKonten';

interface ScriptKontenTableProps {
  rows: ScriptKontenRow[];
  hasProducts: boolean;
  isDeleting: number | null;
  onEdit: (row: ScriptKontenRow) => void;
  onDelete: (row: ScriptKontenRow) => void;
}

export default function ScriptKontenTable({ rows, hasProducts, isDeleting, onEdit, onDelete }: ScriptKontenTableProps) {
  if (rows.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-2 text-center">
        <Inbox size={28} className="text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">Belum ada data Script & Konten</p>
        <p className="text-xs text-slate-400">
          {!hasProducts ? 'Tambahkan produk di menu Meta Ads dulu.' : 'Klik "Tambah Data" untuk mulai bikin brief konten.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4 whitespace-nowrap">Tgl Order</th>
            <th className="py-3 px-4 whitespace-nowrap">Judul</th>
            <th className="py-3 px-4 whitespace-nowrap">Produk</th>
            <th className="py-3 px-4 whitespace-nowrap">Funnel</th>
            <th className="py-3 px-4 whitespace-nowrap">Stage Awareness</th>
            <th className="py-3 px-4 whitespace-nowrap">Angle</th>
            <th className="py-3 px-4 whitespace-nowrap">Format</th>
            <th className="py-3 px-4 whitespace-nowrap">Creator</th>
            <th className="py-3 px-4 whitespace-nowrap">Status</th>
            <th className="py-3 px-4 whitespace-nowrap">Nama Konten</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-4 whitespace-nowrap">{row.tanggalOrder || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap max-w-[200px] truncate">{row.judul || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap">{row.productNama}</td>
              <td className="py-3 px-4 whitespace-nowrap">{row.funnel}</td>
              <td className="py-3 px-4 whitespace-nowrap">{row.stageAwareness || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap max-w-[160px] truncate">{row.angle || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap">{row.format || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap">{row.creator || '-'}</td>
              <td className="py-3 px-4 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass(row.status)}`}>{row.status}</span>
              </td>
              <td className="py-3 px-4 whitespace-nowrap max-w-[180px] truncate">{row.namaKonten || '-'}</td>
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(row)} className="text-blue-600 hover:underline font-semibold text-xs flex items-center gap-1">
                    <Pencil size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(row)}
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
  );
}
