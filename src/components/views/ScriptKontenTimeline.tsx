'use client';

import React, { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { ScriptKontenRow, statusBarColorClass } from '@/lib/scriptKonten';

const DAY_WIDTH = 34;

function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

interface ScriptKontenTimelineProps {
  rows: ScriptKontenRow[];
  hasProducts: boolean;
  onEdit: (row: ScriptKontenRow) => void;
}

export default function ScriptKontenTimeline({ rows, hasProducts, onEdit }: ScriptKontenTimelineProps) {
  const scheduled = useMemo(
    () => rows.filter((r) => r.tanggalOrder).sort((a, b) => (a.tanggalOrder! < b.tanggalOrder! ? -1 : 1)),
    [rows]
  );
  const unscheduledCount = rows.length - scheduled.length;

  const { rangeStart, days } = useMemo(() => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (scheduled.length === 0) {
      return { rangeStart: today, days: 21 };
    }
    let min = parseDate(scheduled[0].tanggalOrder!);
    let max = today;
    scheduled.forEach((r) => {
      const start = parseDate(r.tanggalOrder!);
      if (start < min) min = start;
      const end = r.tanggalAccKonten ? parseDate(r.tanggalAccKonten) : start;
      if (end > max) max = end;
    });
    min.setDate(min.getDate() - 1);
    max.setDate(max.getDate() + 2);
    return { rangeStart: min, days: Math.max(diffDays(min, max), 7) };
  }, [scheduled]);

  const dateHeaders = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [rangeStart, days]);

  const todayOffset = diffDays(rangeStart, new Date(new Date().setHours(0, 0, 0, 0)));

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 200 + days * DAY_WIDTH }}>
          <div className="flex sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
            <div className="w-[200px] shrink-0 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Konten</div>
            {dateHeaders.map((d, i) => (
              <div
                key={i}
                style={{ width: DAY_WIDTH }}
                className={`shrink-0 text-center py-2 text-[9px] font-semibold border-l border-slate-100 ${
                  i === todayOffset ? 'bg-rose-50 text-rose-600' : 'text-slate-400'
                }`}
              >
                <div>{d.getDate()}</div>
              </div>
            ))}
          </div>

          {scheduled.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">Belum ada konten dengan Tanggal Order untuk ditampilkan.</div>
          ) : (
            scheduled.map((row) => {
              const start = parseDate(row.tanggalOrder!);
              const offset = diffDays(rangeStart, start);
              const isOngoing = !row.tanggalAccKonten;
              const end = isOngoing ? new Date() : parseDate(row.tanggalAccKonten!);
              const span = Math.max(diffDays(start, end), 1);

              return (
                <div key={row.id} className="flex border-b border-slate-50 hover:bg-slate-50/50">
                  <div className="w-[200px] shrink-0 px-3 py-2.5 text-xs font-semibold text-slate-700 truncate">{row.judul || '(Tanpa judul)'}</div>
                  <div className="relative flex-1" style={{ height: 38 }}>
                    <button
                      onClick={() => onEdit(row)}
                      title={row.judul}
                      className={`absolute top-1.5 h-6 rounded-md ${statusBarColorClass(row.status)} ${
                        isOngoing ? 'opacity-70 border-2 border-dashed border-white' : ''
                      } text-white text-[9px] font-semibold flex items-center px-2 truncate hover:opacity-90 transition-opacity`}
                      style={{ left: offset * DAY_WIDTH, width: span * DAY_WIDTH - 4 }}
                    >
                      {row.status}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {unscheduledCount > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
          {unscheduledCount} konten belum punya Tanggal Order, tidak muncul di timeline.
        </div>
      )}
    </div>
  );
}
