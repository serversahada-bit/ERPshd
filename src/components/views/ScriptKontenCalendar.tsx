'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScriptKontenRow, statusBadgeClass } from '@/lib/scriptKonten';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_LABELS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface ScriptKontenCalendarProps {
  rows: ScriptKontenRow[];
  onEdit: (row: ScriptKontenRow) => void;
}

export default function ScriptKontenCalendar({ rows, onEdit }: ScriptKontenCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const rowsByDate = useMemo(() => {
    const map = new Map<string, ScriptKontenRow[]>();
    rows.forEach((row) => {
      if (!row.tanggalOrder) return;
      const key = row.tanggalOrder;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return map;
  }, [rows]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const result: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, i - startOffset + 1);
      result.push({ date, inMonth: date.getMonth() === month });
    }
    return result;
  }, [cursor]);

  const todayKey = toKey(new Date());
  const noDateCount = rows.filter((r) => !r.tanggalOrder).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="font-bold text-sm text-slate-900">
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
          >
            Hari Ini
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map(({ date, inMonth }, i) => {
          const key = toKey(date);
          const items = rowsByDate.get(key) || [];
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 ${inMonth ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <div
                className={`text-[10px] font-semibold h-5 w-5 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-rose-600 text-white' : inMonth ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {items.slice(0, 3).map((row) => (
                  <button
                    key={row.id}
                    onClick={() => onEdit(row)}
                    className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${statusBadgeClass(row.status)}`}
                    title={row.judul}
                  >
                    {row.judul || '(Tanpa judul)'}
                  </button>
                ))}
                {items.length > 3 && <div className="text-[9px] text-slate-400 px-1.5">+{items.length - 3} lagi</div>}
              </div>
            </div>
          );
        })}
      </div>

      {noDateCount > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
          {noDateCount} konten belum punya Tanggal Order, tidak muncul di kalender.
        </div>
      )}
    </div>
  );
}
