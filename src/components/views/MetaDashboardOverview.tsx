'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Inbox, ArrowRight, Wallet, Users, TrendingUp, Package } from 'lucide-react';
import { MetaAdsFullRow, formatDisplayValue, formatDisplayDate } from '@/lib/metaAds';
import ProductSelector from '../ProductSelector';

interface ChartPoint {
  label: string;
  spend: number;
  leads: number;
}

function SpendLeadChart({ data }: { data: ChartPoint[] }) {
  const width = 800;
  const height = 240;
  const paddingLeft = 46;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxSpend = Math.max(...data.map((d) => d.spend), 1);
  const maxLeads = Math.max(...data.map((d) => d.leads), 1);
  const step = chartWidth / data.length;
  const barWidth = Math.min(step * 0.45, 36);

  const linePoints = data
    .map((d, i) => {
      const x = paddingLeft + step * i + step / 2;
      const y = paddingTop + chartHeight - (d.leads / maxLeads) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={paddingLeft}
          x2={width - paddingRight}
          y1={paddingTop + chartHeight * (1 - t)}
          y2={paddingTop + chartHeight * (1 - t)}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}

      {data.map((d, i) => {
        const x = paddingLeft + step * i + (step - barWidth) / 2;
        const barHeight = (d.spend / maxSpend) * chartHeight;
        const y = paddingTop + chartHeight - barHeight;
        return <rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={4} fill="#3b82f6" />;
      })}

      <polyline points={linePoints} fill="none" stroke="#f97316" strokeWidth={2.5} />
      {data.map((d, i) => {
        const x = paddingLeft + step * i + step / 2;
        const y = paddingTop + chartHeight - (d.leads / maxLeads) * chartHeight;
        return <circle key={`dot-${i}`} cx={x} cy={y} r={3.5} fill="#f97316" />;
      })}

      {data.map((d, i) => {
        const x = paddingLeft + step * i + step / 2;
        return (
          <text key={`lbl-${i}`} x={x} y={height - 8} fontSize={10} textAnchor="middle" fill="#64748b">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex items-center gap-3.5">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-slate-500">{label}</div>
        <div className="text-lg font-extrabold text-slate-900 truncate">{value}</div>
      </div>
    </div>
  );
}

export default function MetaDashboardOverview() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('pid');

  const [rows, setRows] = useState<MetaAdsFullRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Live update: fetch ulang tiap 30 detik selagi halaman ini terbuka, supaya data baru
  // yang ditambahkan di halaman lain (mis. Meta Ads Data) ikut kelihatan di sini tanpa
  // perlu refresh manual. `isInitial` cuma true buat load pertama/ganti produk, supaya
  // polling di background tidak bikin skeleton loading kedip-kedip tiap 30 detik.
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    const load = async (isInitial: boolean) => {
      if (isInitial) setIsLoading(true);
      try {
        const res = await fetch(`/api/meta-ads?productId=${productId}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json.success) {
          setLoadError(json.error || 'Gagal memuat data.');
          return;
        }
        setLoadError(null);
        setRows(json.data as MetaAdsFullRow[]);
        setLastUpdatedAt(new Date());
      } catch {
        if (!cancelled) setLoadError('Terjadi kesalahan jaringan saat memuat data.');
      } finally {
        if (isInitial && !cancelled) setIsLoading(false);
      }
    };

    load(true);
    const interval = setInterval(() => load(false), 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [productId]);

  // Selalu tampil (termasuk saat loading/belum ada productId) — ProductSelector di sini
  // yang tugasnya auto-pilih produk pertama & set ?pid= kalau belum ada di URL, jadi tidak
  // boleh disembunyikan di balik kondisi `!productId` (bisa bikin loading tidak pernah selesai).
  const header = (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-sm sm:text-base text-slate-900">Dashboard Report</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Live</span>
        {lastUpdatedAt && (
          <span className="text-[10px] text-slate-400">
            Update terakhir: {lastUpdatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <ProductSelector />
        {productId && (
          <Link
            href={`/meta/data?pid=${productId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <span>Kelola Data Harian</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );

  if (isLoading || !productId) {
    return (
      <div className="space-y-5">
        {header}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-5">
        {header}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-6 text-center text-rose-600 text-sm font-semibold">
          {loadError}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-5">
        {header}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-10 flex flex-col items-center justify-center gap-2 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Belum ada data Meta Ads</p>
          <p className="text-xs text-slate-400 mb-2">Isi data harian dulu di menu Meta Ads (FB & IG).</p>
          <Link
            href={`/meta/data?pid=${productId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <span>Ke Halaman Input Data</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Baris yang belum diisi di sheet (semua 0, biasanya tanggal ke depan yang
  // sudah ditulis sebagai template) tidak dianggap "data terbaru" — supaya
  // dashboard tidak terlihat kosong padahal cuma belum diinput di sheet.
  const filledRows = rows.filter((r) => r.spendIklan > 0);
  // Kalau belum ada satupun baris terisi (produk baru), jangan sampai chart/tabel kosong total.
  const chartSourceRows = filledRows.length > 0 ? filledRows : rows;

  const totalSpend = rows.reduce((sum, r) => sum + r.spendIklan, 0);
  const totalLeadReal = rows.reduce((sum, r) => sum + r.totalLeadReal, 0);
  const avgClosingRate = filledRows.length > 0 ? filledRows.reduce((sum, r) => sum + r.closingRateTp, 0) / filledRows.length : 0;
  const totalBox = rows.reduce((sum, r) => sum + r.boxTotalTp, 0);

  const chartData: ChartPoint[] = [...chartSourceRows]
    .sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1))
    .slice(-14)
    .map((r) => ({
      label: formatDisplayDate(r.tanggal).replace(/ \d{4}$/, ''),
      spend: r.spendIklan,
      leads: r.totalLeadReal,
    }));

  const recentRows = [...chartSourceRows].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1)).slice(0, 5);

  return (
    <div className="space-y-5">
      {header}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Wallet} label="Total Spend Iklan" value={formatDisplayValue(totalSpend, 'currency')} accent="bg-blue-50 text-blue-600" />
        <KpiCard icon={Users} label="Total Lead Real" value={formatDisplayValue(totalLeadReal, 'number')} accent="bg-cyan-50 text-cyan-600" />
        <KpiCard icon={TrendingUp} label="Rata-rata Closing Rate" value={formatDisplayValue(avgClosingRate, 'percent')} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={Package} label="Total Box" value={formatDisplayValue(totalBox, 'number')} accent="bg-rose-50 text-rose-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm text-slate-900">Tren Spend & Lead per Tanggal</h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Spend Iklan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Total Lead Real
            </span>
          </div>
        </div>
        <SpendLeadChart data={chartData} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h4 className="font-bold text-sm text-slate-900">Data Terbaru</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Date</th>
                <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Spend Iklan</th>
                <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Total Lead Real</th>
                <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Closing Rate</th>
                <th className="text-left px-5 py-3 font-bold text-slate-900 whitespace-nowrap">Grade</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.map((row, i) => (
                <tr key={row.id} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                  <td className="px-5 py-3 font-semibold text-slate-700 whitespace-nowrap">{formatDisplayDate(row.tanggal)}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.spendIklan, 'currency')}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.totalLeadReal, 'number')}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{formatDisplayValue(row.closingRateTp, 'percent')}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
