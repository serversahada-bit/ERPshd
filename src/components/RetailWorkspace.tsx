'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RETAIL_MODULES, RetailModule, COMPANY_PROFILE } from '@/data/retailMenuData';
import DynamicIcon from './DynamicIcon';
import MetaAdsPerformanceTable from './views/MetaAdsPerformanceTable';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Building2,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';

interface RetailWorkspaceProps {
  moduleId: string;
  subitemId?: string;
  onBackToGrid: () => void;
  onSelectSubmenu: (subitemId: string) => void;
  onOpenTab?: (tab: string) => void;
}

export default function RetailWorkspace({
  moduleId,
  subitemId,
  onBackToGrid,
  onSelectSubmenu,
  onOpenTab,
}: RetailWorkspaceProps) {
  const router = useRouter();
  const currentModule = RETAIL_MODULES.find((m) => m.id === moduleId) || RETAIL_MODULES[0];
  const activeSubitem = currentModule.submenus.find((s) => s.id === subitemId) || currentModule.submenus[0];
  const isMetaFullPage = moduleId === 'advertiser' && activeSubitem.id === 'meta';

  // Specific dummy data table per retail division
  const tableDataMap: Record<string, { headers: string[]; rows: (string | number | { text: string; badge: string })[][] }> = {
    advertiser: {
      headers: ['Nama Kampanye / Channel', 'Target Akun', 'Budget / Hari', 'Hasil (Purchase/Order)', 'ROAS Realtime', 'Status'],
      rows: [
        ['[Meta Ads] Skincare Glow Serum Scale-Up', 'FB & Instagram', 'Rp 5.000.000', '182 Order', '5.24x', { text: 'Active Scaling', badge: 'bg-emerald-100 text-emerald-800' }],
        ['[TikTok Ads] Live Shopping Flash Deal', 'TikTok Shop', 'Rp 2.500.000', '114 Order', '4.60x', { text: 'Active', badge: 'bg-emerald-100 text-emerald-800' }],
        ['[Google Ads] Brand Search Keyword Promo', 'Google Search', 'Rp 1.000.000', '48 Order', '6.10x', { text: 'Optimal', badge: 'bg-purple-100 text-purple-800' }],
        ['[Marketplace] Shopee Mega Campaign 9.9', 'Shopee Mall', 'Rp 3.000.000', '240 Order', '4.80x', { text: 'Running', badge: 'bg-blue-100 text-blue-800' }],
      ]
    },
    cscrm: {
      headers: ['Nama Staf CS', 'Status Shift', 'Leads Hari Ini', 'Total Closing', 'Closing Rate (%)', 'Omset Closing'],
      rows: [
        ['Siti Nurhaliza (CS-01)', 'Online (Active)', '124 Leads', '56 Order', '45.1%', 'Rp 13.940.000'],
        ['Annisa Rahma (CS-02)', 'Online (Active)', '118 Leads', '51 Order', '43.2%', 'Rp 12.750.000'],
        ['Fitri Handayani (CS-03)', 'Online (Active)', '109 Leads', '46 Order', '42.2%', 'Rp 11.500.000'],
        ['Rina Agustina (CS-04)', 'Istirahat Shift', '98 Leads', '38 Order', '38.7%', 'Rp 9.500.000'],
      ]
    },
    fat: {
      headers: ['Uraian Keuangan / Rekonsiliasi', 'Metode / Mitra', 'Total Nominal', 'Potongan Fee', 'Net Diterima', 'Status'],
      rows: [
        ['Pencairan Setoran COD Minggu Ini', 'J&T Express Pusat', 'Rp 184.800.000', 'Rp 5.544.000 (3%)', 'Rp 179.256.000', { text: 'Masuk Rekening BCA', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Pencairan Settlement Payment Gateway', 'Midtrans & QRIS', 'Rp 62.400.000', 'Rp 436.800 (0.7%)', 'Rp 61.963.200', { text: 'Masuk Rekening Mandiri', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Tagihan Ad Spend FB & Google', 'Meta & Alphabet', 'Rp 45.000.000', 'PPN 11% Tercover', 'Rp 45.000.000', { text: 'Terverifikasi FAT', badge: 'bg-blue-100 text-blue-800' }],
        ['Kompilasi SPT Masa PPh & PPN PMSE', 'Ditjen Pajak (DJP)', 'Rp 12.800.000', '-', 'Rp 12.800.000', { text: 'Siap Lapor', badge: 'bg-purple-100 text-purple-800' }],
      ]
    },
    fulfillment: {
      headers: ['Nomor Batch / Resi', 'Ekspedisi / Kurir', 'Tujuan Wilayah', 'Jumlah Paket', 'Petugas Packing', 'Status Pengiriman'],
      rows: [
        ['BATCH-JABODETABEK-01', 'J&T Express COD', 'Jabodetabek & Banten', '250 Paket', 'Tim Packing A', { text: 'Pick-Up Driver', badge: 'bg-emerald-100 text-emerald-800' }],
        ['BATCH-JAWA-02', 'SiCepat Reguler', 'Jawa Barat & Jawa Tengah', '180 Paket', 'Tim Packing B', { text: 'Selesai Packing', badge: 'bg-blue-100 text-blue-800' }],
        ['BATCH-SUMATERA-03', 'Ninja Xpress COD', 'Sumatera & Sekitarnya', '120 Paket', 'Tim Packing C', { text: 'Proses Scan Barcode', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    it: {
      headers: ['Nama Integrasi / Layanan', 'Tipe Koneksi', 'Endpoint Target', 'Terakhir Sinkron', 'Status Sistem'],
      rows: [
        ['Webhook Pesanan Shopee Open API', 'REST Webhook', 'api.sahadalaku.id/v1/shopee', '3 detik lalu', { text: 'Normal (99.9%)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['WhatsApp Cloud API Official', 'Graph Webhook', 'api.sahadalaku.id/v1/whatsapp', '12 detik lalu', { text: 'Normal (99.9%)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Integrasi Resi & Manifest J&T', 'SFTP / API Track', 'api.sahadalaku.id/v1/jnt-track', '1 menit lalu', { text: 'Normal', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Autentikasi Staf & Hak Akses (RBAC)', 'Internal Auth', 'auth.sahadalaku.id', 'Online (18 Staf)', { text: 'Aman & Terproteksi', badge: 'bg-blue-100 text-blue-800' }],
      ]
    },
    branding: {
      headers: ['Nama KOL / Proyek Kreatif', 'Platform / Tipe', 'Nilai Kontrak', 'Jadwal Tayang', 'Target Views', 'Status'],
      rows: [
        ['@sarah_hijabstyle (520k)', 'Instagram Reels & Story', 'Rp 4.500.000', '16 Sep 2026', '150.000 Views', { text: 'Materi Siap Tayang', badge: 'bg-emerald-100 text-emerald-800' }],
        ['@alya.ootd (240k)', 'TikTok Video Hook Review', 'Rp 2.800.000', '18 Sep 2026', '280.000 Views', { text: 'Draft Video Direview', badge: 'bg-blue-100 text-blue-800' }],
        ['Photoshoot Gamis Eid Edition', 'Studio & Model Muslimah', 'Rp 6.000.000', '20 Sep 2026', 'Katalog 24 SKU', { text: 'Jadwal Studio', badge: 'bg-purple-100 text-purple-800' }],
        ['Desain Box Polymailer Eksklusif', 'Kemasan Baru Q4', 'Rp 1.500.000', '22 Sep 2026', 'Cetak 10.000 Pcs', { text: 'Approval Desain', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    chat: {
      headers: ['Saluran / Pengirim', 'Topik Koordinasi', 'Anggota Terlibat', 'Pesan Terakhir', 'Waktu', 'Status'],
      rows: [
        ['#eskalasi-cs-komplain', 'Paket Retur Rusak J&T #9921', '8 Staf (CS + Gudang)', 'Video unboxing terverifikasi, kirim ulang', '2 menit lalu', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
        ['#ads-creative-brief', 'Materi Iklan Baru Payday', '6 Staf (Ads + Branding)', 'Video hook TikTok draft 2 sudah siap', '15 menit lalu', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
        ['#fat-reconcile-alert', 'Settlement COD SiCepat Rp 112 Jt', '4 Staf (FAT + Gudang)', 'Uang sudah masuk rekening BCA', '1 jam lalu', { text: 'Selesai', badge: 'bg-blue-100 text-blue-800' }],
        ['[BOT] Notifikasi Stok', 'Stok SKU Gamis Mocca Sisa 15 Pcs', 'Semua Divisi', 'Trigger order restok otomatis ke vendor', '3 jam lalu', { text: 'Peringatan', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    hr: {
      headers: ['NIP & Nama Karyawan', 'Divisi / Posisi', 'Shift Kerja', 'Kehadiran MTD', 'Komisi / Insentif', 'Status Gaji'],
      rows: [
        ['EMP-014 - Siti Nurhaliza', 'CS & Penjualan (CS-01)', 'Shift Pagi (08:00 - 16:00)', '100% Hadir', 'Rp 2.800.000 (56 Paket)', { text: 'Payroll Siap', badge: 'bg-emerald-100 text-emerald-800' }],
        ['EMP-015 - Annisa Rahma', 'CS & Penjualan (CS-02)', 'Shift Siang (13:00 - 21:00)', '96% Hadir (1 Cuti)', 'Rp 2.550.000 (51 Paket)', { text: 'Payroll Siap', badge: 'bg-emerald-100 text-emerald-800' }],
        ['EMP-022 - Budi Santoso', 'Fulfillment (Kepala Gudang)', 'Shift Reguler (08:30 - 17:30)', '100% Hadir (8 Jam Lembur)', 'Bonus Target Packing', { text: 'Payroll Siap', badge: 'bg-emerald-100 text-emerald-800' }],
        ['EMP-008 - Reza Pratama', 'Advertiser (Media Buyer)', 'Flexi Remote', '100% Hadir', 'Bonus KPI ROAS 4.8x', { text: 'Payroll Siap', badge: 'bg-emerald-100 text-emerald-800' }],
      ]
    },
    purchasing: {
      headers: ['No. Purchase Order', 'Nama Pabrik / Supplier', 'Item / Bahan Baku', 'Total Tagihan PO', 'Termin Pembayaran', 'Status Produksi'],
      rows: [
        ['PO-2026-081', 'Konveksi Berkah Garment', 'Gamis Syari Khimar (3.000 Pcs)', 'Rp 210.000.000', 'DP 50% / Pelunasan TOP 14', { text: 'Sedang Jahit (70%)', badge: 'bg-blue-100 text-blue-800' }],
        ['PO-2026-082', 'Pabrik Tekstil Voal Bandung', 'Kain Voal Miracle 80 Roll', 'Rp 96.000.000', 'Lunas (Transfer BCA)', { text: 'Siap Kirim ke Gudang', badge: 'bg-emerald-100 text-emerald-800' }],
        ['PO-2026-083', 'Percetakan Kemasan Prima Box', 'Box Packaging & Polymailer', 'Rp 28.500.000', 'TOP 30 Hari', { text: 'Proses Cetak', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    executive: {
      headers: ['Kanal Penjualan / Unit', 'Omset Kotor (MTD)', 'Biaya Iklan (Ad Spend)', 'HPP & Packing', 'Laba Bersih (Net Profit)', 'Net Margin %'],
      rows: [
        ['Meta Ads (Web Order COD)', 'Rp 820.000.000', 'Rp 164.000.000 (ROAS 5.0x)', 'Rp 369.000.000', 'Rp 188.600.000', { text: '23.0% (Sangat Sehat)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Shopee Official Store', 'Rp 340.000.000', 'Rp 34.000.000 (Ads 10%)', 'Rp 153.000.000', 'Rp 78.200.000', { text: '23.0% (Optimal)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['TikTok Shop Live & Video', 'Rp 210.000.000', 'Rp 42.000.000 (Ads 20%)', 'Rp 94.500.000', 'Rp 44.100.000', { text: '21.0% (Berkembang)', badge: 'bg-blue-100 text-blue-800' }],
        ['Tokopedia Official Mall', 'Rp 110.000.000', 'Rp 11.000.000 (Ads 10%)', 'Rp 49.500.000', 'Rp 27.500.000', { text: '25.0% (Stabil)', badge: 'bg-emerald-100 text-emerald-800' }],
      ]
    }
  };

  const defaultTable = tableDataMap[currentModule.id] || tableDataMap['advertiser'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Bar Workspace */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToGrid}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>Menu Utama (App Grid)</span>
            </button>

            <span className="text-slate-300">|</span>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">{currentModule.title}</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="font-semibold text-blue-600 truncate">{activeSubitem.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTab && (
              <>
                <button
                  onClick={() => onOpenTab('kalender')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Calendar size={14} className="text-cyan-600" />
                  <span>Kalender</span>
                </button>
              </>
            )}

            <button
              onClick={onBackToGrid}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Kembali ke App Launcher"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Container */}
      <div
        className={`w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6 ${
          isMetaFullPage ? '' : 'max-w-6xl lg:flex-row'
        }`}
      >
        {/* Left Mini Sidebar for Submenus */}
        {!isMetaFullPage && (
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${currentModule.iconBgColor}`}
              >
                <DynamicIcon name={currentModule.icon} size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{currentModule.title}</h3>
                <span className="text-[10px] text-slate-500">{currentModule.subtitle}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Sub-Menu
              </div>
              {currentModule.submenus.map((sub) => {
                const isSelected = activeSubitem.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (moduleId === 'advertiser' && sub.id === 'meta') {
                        router.push('/meta');
                        return;
                      }
                      if (moduleId === 'branding') {
                        const brandingRoutes: Record<string, string> = {
                          'kol-endorse': '/branding',
                          'studio-creative': '/branding/studio-creative',
                          'brand-assets': '/branding/brand-assets',
                          'script-konten': '/branding/script-konten',
                          'meta-testing': '/branding/meta-testing',
                        };
                        router.push(brandingRoutes[sub.id] || '/branding');
                        return;
                      }
                      if (moduleId === 'produk-master') {
                        router.push('/produk');
                        return;
                      }
                      onSelectSubmenu(sub.id);
                    }}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{sub.title}</span>
                    {sub.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics Card */}
          {currentModule.metrics && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500">{currentModule.metrics.label}</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{currentModule.metrics.value}</div>
              {currentModule.metrics.note && (
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{currentModule.metrics.note}</span>
                </div>
              )}
            </div>
          )}
        </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 space-y-5 ${isMetaFullPage ? 'w-full' : ''}`}>
          {isMetaFullPage ? (
            <MetaAdsPerformanceTable />
          ) : (
            <>
          {/* Module Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{activeSubitem.title}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {currentModule.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{activeSubitem.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors">
                <Plus size={15} />
                <span>Tambah Data</span>
              </button>
            </div>
          </div>

          {/* Live Data Grid Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    Data Aktivitas: {activeSubitem.title}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Live
                  </span>
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
                      {defaultTable.headers.map((h, i) => (
                        <th key={i} className="py-3 px-4 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {defaultTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                            {typeof cell === 'object' && cell !== null && 'text' in cell ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cell.badge}`}>
                                {cell.text}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button className="text-blue-600 hover:underline font-semibold text-xs">
                            Detail &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                <div>Menampilkan {defaultTable.rows.length} baris data</div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded border border-slate-200 hover:bg-white text-xs">Sebelumnya</button>
                  <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold text-xs">1</button>
                  <button className="px-2 py-1 rounded border border-slate-200 hover:bg-white text-xs">Selanjutnya</button>
                </div>
              </div>
            </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
