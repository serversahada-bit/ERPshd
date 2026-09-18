'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  RefreshCw,
  Search,
  FileSpreadsheet
} from 'lucide-react';

export default function LaporanView() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [selectedReportTab, setSelectedReportTab] = useState<'ringkasan' | 'penjualan' | 'keuangan' | 'logistik' | 'cs'>('ringkasan');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Laporan format ${type} untuk PT SAHADA LAKU UTAMA berhasil diekspor!`);
    }, 800);
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <FileText size={14} />
            <span>Pusat Laporan Terpadu &bull; PT SAHADA LAKU UTAMA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Laporan Kinerja Bisnis & Finansial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data konsolidasi performa omnichannel: Penjualan iklan, rasio COD kurir, pencairan kas FAT, dan evaluasi tim.
          </p>
        </div>

        {/* Filter Periode & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'today' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={() => handleExport('Excel')}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>{isExporting ? 'Mengunduh...' : 'Ekspor Excel'}</span>
          </button>

          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all active:scale-95"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Omset Kotor (GMV)</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">Rp 1.482.500.000</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <ArrowUpRight size={14} />
              +18.4%
            </span>
            <span className="text-slate-400 font-normal">vs bulan lalu</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Omset Bersih Diterima</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">Rp 1.145.200.000</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <ArrowUpRight size={14} />
              +15.2%
            </span>
            <span className="text-slate-400 font-normal">Setelah retur & fee kurir</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rasio Sukses COD (DSR)</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">92.4%</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <span className="flex items-center">
              <ArrowUpRight size={14} />
              +3.1%
            </span>
            <span className="text-slate-400 font-normal">Paket retur: 7.6%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-Rata ROAS Iklan</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">4.82x</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-purple-600">
            <span>Spend: Rp 284 Jt</span>
            <span className="text-slate-400 font-normal">&bull; Target: 4.0x</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'ringkasan', label: 'Ringkasan Laba Rugi' },
          { id: 'penjualan', label: 'Performa Channel & Iklan' },
          { id: 'keuangan', label: 'Pencairan COD & Kas FAT' },
          { id: 'logistik', label: 'Logistik Ekspedisi & Retur' },
          { id: 'cs', label: 'Produktivitas CS & Komisi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReportTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedReportTab === tab.id
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Detailed Data Table by Channel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              Rincian Performa Kanal Penjualan (Omnichannel Retail)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data sinkronisasi realtime dari Meta Ads, TikTok Shop, Shopee, Tokopedia, dan CS WhatsApp
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Update Terakhir: 15 Sep 2026, 10:45 WIB
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/70">
              <tr>
                <th className="px-5 py-3.5">Kanal Penjualan</th>
                <th className="px-5 py-3.5">Biaya Iklan (Spend)</th>
                <th className="px-5 py-3.5">Pesanan Masuk</th>
                <th className="px-5 py-3.5">Omset Kotor</th>
                <th className="px-5 py-3.5">ROAS / Efisiensi</th>
                <th className="px-5 py-3.5">Paket Sukses (COD)</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                  <span>Meta Ads (FB & Instagram)</span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700">Rp 142.000.000</td>
                <td className="px-5 py-4 text-slate-600 font-medium">3.840 Order</td>
                <td className="px-5 py-4 font-bold text-slate-900">Rp 724.800.000</td>
                <td className="px-5 py-4 font-extrabold text-emerald-600">5.10x</td>
                <td className="px-5 py-4 text-slate-600 font-medium">93.8% Terkirim</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    High Scale
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-600 shrink-0" />
                  <span>TikTok Shop & Live Shopping</span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700">Rp 68.500.000</td>
                <td className="px-5 py-4 text-slate-600 font-medium">2.120 Order</td>
                <td className="px-5 py-4 font-bold text-slate-900">Rp 348.200.000</td>
                <td className="px-5 py-4 font-extrabold text-emerald-600">5.08x</td>
                <td className="px-5 py-4 text-slate-600 font-medium">91.4% Terkirim</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    Trending
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-600 shrink-0" />
                  <span>Shopee Official Mall</span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700">Rp 42.000.000</td>
                <td className="px-5 py-4 text-slate-600 font-medium">1.650 Order</td>
                <td className="px-5 py-4 font-bold text-slate-900">Rp 245.500.000</td>
                <td className="px-5 py-4 font-extrabold text-emerald-600">5.84x</td>
                <td className="px-5 py-4 text-slate-600 font-medium">98.2% (Prepaid)</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    Stabil
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>CS WhatsApp (Repeat Order & CRM)</span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700">Rp 12.500.000 (Broadcast)</td>
                <td className="px-5 py-4 text-slate-600 font-medium">980 Order</td>
                <td className="px-5 py-4 font-bold text-slate-900">Rp 164.000.000</td>
                <td className="px-5 py-4 font-extrabold text-emerald-600">13.12x</td>
                <td className="px-5 py-4 text-slate-600 font-medium">96.5% Terkirim</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                    Tinggi Margin
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50/90 font-extrabold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="px-5 py-4">Total Konsolidasian</td>
                <td className="px-5 py-4 text-slate-900">Rp 265.000.000</td>
                <td className="px-5 py-4 text-slate-900">8.590 Order</td>
                <td className="px-5 py-4 text-purple-700 text-sm">Rp 1.482.500.000</td>
                <td className="px-5 py-4 text-emerald-600 text-sm">5.59x Rata-Rata</td>
                <td className="px-5 py-4">94.2% Sukses DSR</td>
                <td className="px-5 py-4 text-emerald-600">Optimal</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
