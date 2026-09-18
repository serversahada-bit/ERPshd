'use client';

import { Plus, Filter, FileSpreadsheet } from 'lucide-react';
import DualMetricChart, { DualMetricPoint } from './DualMetricChart';

export interface BrandingTableCell {
  text: string;
  badge: string;
}

export interface BrandingKpi {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent: string;
}

export interface BrandingChartConfig {
  title: string;
  data: DualMetricPoint[];
  barLabel: string;
  lineLabel: string;
  barColor: string;
  lineColor: string;
}

export interface BrandingSectionViewProps {
  title: string;
  description: string;
  addLabel: string;
  kpis: BrandingKpi[];
  chart: BrandingChartConfig;
  headers: string[];
  rows: (string | number | BrandingTableCell)[][];
}

export default function BrandingSectionView({ title, description, addLabel, kpis, chart, headers, rows }: BrandingSectionViewProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{title}</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors">
            <Plus size={15} />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex items-center gap-3.5">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.accent}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-500">{kpi.label}</div>
                <div className="text-lg font-extrabold text-slate-900 truncate">{kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm text-slate-900">{chart.title}</h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chart.barColor }} /> {chart.barLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chart.lineColor }} /> {chart.lineLabel}
            </span>
          </div>
        </div>
        <DualMetricChart data={chart.data} barColor={chart.barColor} lineColor={chart.lineColor} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Data Aktivitas: {title}</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1">
              <Filter size={13} />
              <span>Filter</span>
            </button>
            <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1">
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                      {typeof cell === 'object' && cell !== null && 'text' in cell ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cell.badge}`}>{cell.text}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button className="text-[#E11D48] hover:underline font-semibold text-xs">Detail &rarr;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>Menampilkan {rows.length} baris data</div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 hover:bg-white text-xs">Sebelumnya</button>
            <button className="px-2.5 py-1 rounded bg-[#E11D48] text-white font-semibold text-xs">1</button>
            <button className="px-2 py-1 rounded border border-slate-200 hover:bg-white text-xs">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
