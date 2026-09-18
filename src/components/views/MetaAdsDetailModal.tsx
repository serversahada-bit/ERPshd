'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  MetaAdsFullRow,
  DISPLAY_COL_META,
  DETAIL_GROUPS,
  formatDisplayValue,
  formatDisplayDate,
  GRADE_BADGE_CLASS,
} from '@/lib/metaAds';

interface MetaAdsDetailModalProps {
  row: MetaAdsFullRow;
  onClose: () => void;
}

export default function MetaAdsDetailModal({ row, onClose }: MetaAdsDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Detail Performa — {formatDisplayDate(row.tanggal)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Seluruh metrik untuk tanggal ini</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Ringkasan spend & grade */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Target Spend</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{formatDisplayValue(row.targetSpend, 'currency')}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Spend Iklan</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{formatDisplayValue(row.spendIklan, 'currency')}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Spend + PPN 11%</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{formatDisplayValue(row.spendPpn, 'currency')}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-start justify-center">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Grade</div>
              <span
                className={`mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  GRADE_BADGE_CLASS[row.grade] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {row.grade}
              </span>
            </div>
          </div>

          {DETAIL_GROUPS.map((group) => (
            <div key={group.title} className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
                <span className={`h-2 w-2 rounded-full ${group.dotClass}`} />
                <h4 className="text-xs font-bold text-slate-900">{group.title}</h4>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.keys.map((key) => {
                  const meta = DISPLAY_COL_META[key];
                  return (
                    <div key={key} className="rounded-xl border border-slate-100 bg-white p-3">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 leading-tight">
                        {meta.label}
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {formatDisplayValue((row as unknown as Record<string, number | string>)[key], meta.format)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
