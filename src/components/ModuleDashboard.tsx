'use client';

import React, { useState } from 'react';
import { ERP_MODULES, ERPMenuItem } from '@/data/erpMenuData';
import DynamicIcon from './DynamicIcon';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ModuleDashboardProps {
  activeModuleId: string;
  activeItemId: string;
  onSelectItem: (moduleId: string, itemId: string) => void;
  onOpenCommandPalette: () => void;
}

export default function ModuleDashboard({
  activeModuleId,
  activeItemId,
  onSelectItem,
  onOpenCommandPalette,
}: ModuleDashboardProps) {
  const currentModule = ERP_MODULES.find((m) => m.id === activeModuleId) || ERP_MODULES[0];

  // Find active item details
  let activeItem: ERPMenuItem | undefined;
  let activeSubmoduleTitle = '';

  for (const sub of currentModule.submodules) {
    const item = sub.items.find((i) => i.id === activeItemId);
    if (item) {
      activeItem = item;
      activeSubmoduleTitle = sub.title;
      break;
    }
  }

  // If activeItem is not found in this module, pick the first item
  if (!activeItem && currentModule.submodules[0]?.items[0]) {
    activeItem = currentModule.submodules[0].items[0];
    activeSubmoduleTitle = currentModule.submodules[0].title;
  }

  // Sample mock table records based on module
  const mockTableData: Record<string, { headers: string[]; rows: (string | number | { text: string; badge: string })[][] }> = {
    manufacturing: {
      headers: ['Kode SPK', 'Item / Produk Jadi', 'Target Qty', 'Progress', 'Lini Mesin', 'Status'],
      rows: [
        ['WO-2026-081', 'Gearbox Motor Induksi 5HP', '450 Unit', '78%', 'Lini Machining C', { text: 'Diproses', badge: 'bg-blue-100 text-blue-800' }],
        ['WO-2026-082', 'Flange Steel SS-316 Dia 4"', '1.200 Pcs', '100%', 'Lini CNC-04', { text: 'QC Pass', badge: 'bg-emerald-100 text-emerald-800' }],
        ['WO-2026-083', 'Hydraulic Pump Assembly v2', '120 Unit', '42%', 'Lini Perakitan B', { text: 'Diproses', badge: 'bg-blue-100 text-blue-800' }],
        ['WO-2026-084', 'Precision Shaft 25mm x 1m', '800 Pcs', '12%', 'Lini Bubut 02', { text: 'Material Ready', badge: 'bg-amber-100 text-amber-800' }],
        ['WO-2026-085', 'Control Valve Pneumatic DN50', '350 Unit', '95%', 'Lini Testing Final', { text: 'Inspeksi QC', badge: 'bg-purple-100 text-purple-800' }],
      ]
    },
    inventory: {
      headers: ['Kode SKU', 'Nama Produk / Material', 'Kategori', 'Gudang Utama', 'Stok Fisik', 'Status Stok'],
      rows: [
        ['RAW-RES-001', 'Epoxy Resin Polymer Grade-A', 'Bahan Baku', 'Gudang Cikarang', '18 Drum', { text: 'Min. Stock Alert', badge: 'bg-rose-100 text-rose-800' }],
        ['STL-PLT-004', 'Steel Sheet SS-400 3mm x 1200', 'Bahan Baku', 'Gudang Raw Steel', '480 Lembar', { text: 'Aman', badge: 'bg-emerald-100 text-emerald-800' }],
        ['FGD-GBX-501', 'Industrial Gearbox 5HP 1:30', 'Barang Jadi', 'Gudang Distribusi JKT', '84 Unit', { text: 'Aman', badge: 'bg-emerald-100 text-emerald-800' }],
        ['PKB-BOX-012', 'Kardus Packaging Double Wall', 'Packing', 'Gudang Surabaya', '2.400 Pcs', { text: 'Optimal', badge: 'bg-blue-100 text-blue-800' }],
        ['CHM-SLV-089', 'Chemical Solvent Degreaser 20L', 'Bahan Pembantu', 'Gudang Bahan Kimia', '35 Pail', { text: 'Reorder Point', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    sales: {
      headers: ['Nomor SO', 'Nama Pelanggan / Perusahaan', 'Tanggal', 'Nilai Transaksi', 'Salesman', 'Status Order'],
      rows: [
        ['SO-26-00412', 'PT Wijaya Karya Industri Tbk', '14 Sep 2026', 'Rp 245.800.000', 'Budi Santoso', { text: 'Siap Kirim', badge: 'bg-emerald-100 text-emerald-800' }],
        ['SO-26-00413', 'CV Makmur Jaya Mandiri', '14 Sep 2026', 'Rp 58.250.000', 'Andi Pratama', { text: 'Menunggu Packing', badge: 'bg-blue-100 text-blue-800' }],
        ['SO-26-00414', 'PT United Tractors Semen Tbk', '13 Sep 2026', 'Rp 612.000.000', 'Citra Lestari', { text: 'Parsial Terkirim', badge: 'bg-purple-100 text-purple-800' }],
        ['SO-26-00415', 'PT Pertamina Hulu Rokan', '13 Sep 2026', 'Rp 189.500.000', 'Budi Santoso', { text: 'Faktur Diterbitkan', badge: 'bg-emerald-100 text-emerald-800' }],
        ['SO-26-00416', 'PT Barata Indonesia Persero', '12 Sep 2026', 'Rp 94.000.000', 'Rian Hidayat', { text: 'Menunggu Approval', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    procurement: {
      headers: ['Nomor PO', 'Nama Vendor / Rekanan', 'Tanggal Order', 'Total Tagihan', 'Termin Bayar', 'Status Pengiriman'],
      rows: [
        ['PO-2026-089', 'PT Krakatau Steel (Persero) Tbk', '15 Sep 2026', 'Rp 184.000.000', 'TOP 45 Hari', { text: 'Menunggu Approval', badge: 'bg-amber-100 text-amber-800' }],
        ['PO-2026-090', 'PT Nippon Paint Indonesia', '14 Sep 2026', 'Rp 42.500.000', 'TOP 30 Hari', { text: 'Dalam Pengiriman', badge: 'bg-blue-100 text-blue-800' }],
        ['PO-2026-091', 'SKF Bearing Distribution Pte Ltd', '12 Sep 2026', 'Rp 96.750.000', 'LC at Sight', { text: 'Diterima di Gudang (GRN)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['PO-2026-092', 'PT Triputra Agro Chemicals', '10 Sep 2026', 'Rp 78.000.000', 'TOP 14 Hari', { text: 'Faktur Terverifikasi', badge: 'bg-purple-100 text-purple-800' }],
      ]
    },
    finance: {
      headers: ['Kode Akun / No Ref', 'Deskripsi Transaksi Jurnal', 'Debit', 'Kredit', 'Departemen', 'Status Verifikasi'],
      rows: [
        ['1110.02 - Bank Mandiri IDR', 'Penerimaan Pelunasan SO-00410 PT WIKA', 'Rp 245.800.000', '-', 'Accounting', { text: 'Posted GL', badge: 'bg-emerald-100 text-emerald-800' }],
        ['1130.01 - Piutang Usaha (AR)', 'Pelunasan Faktur Penjualan INV-0921', '-', 'Rp 245.800.000', 'AR Dept', { text: 'Posted GL', badge: 'bg-emerald-100 text-emerald-800' }],
        ['5100.01 - HPP Bahan Baku', 'Alokasi Pengeluaran Bahan WO-2026-081', 'Rp 88.400.000', '-', 'Cost Accounting', { text: 'Posted GL', badge: 'bg-emerald-100 text-emerald-800' }],
        ['2110.01 - Hutang Usaha (AP)', 'Pembayaran Sebagian PO Krakatau Steel', 'Rp 100.000.000', '-', 'Treasury', { text: 'Menunggu Otorisasi', badge: 'bg-amber-100 text-amber-800' }],
      ]
    },
    hr: {
      headers: ['NIP Pegawai', 'Nama Lengkap', 'Jabatan / Posisi', 'Departemen', 'Status Kontrak', 'Kehadiran MTD'],
      rows: [
        ['EMP-2022-041', 'Agus Setiawan, S.T.', 'Kepala Produksi Pabrik', 'Manufaktur & Fabrikasi', 'PKWTT Tetap', { text: '100% (On Time)', badge: 'bg-emerald-100 text-emerald-800' }],
        ['EMP-2023-112', 'Dewi Rahayu, S.E.', 'Senior Financial Controller', 'Keuangan & Akuntansi', 'PKWTT Tetap', { text: '98% Hadir', badge: 'bg-emerald-100 text-emerald-800' }],
        ['EMP-2024-008', 'Fajar Ramadhan', 'Operator CNC Machining', 'Produksi Line B', 'PKWT Kontrak', { text: '95% Hadir (1 Cuti)', badge: 'bg-blue-100 text-blue-800' }],
        ['EMP-2025-055', 'Nadia Putri', 'Staff Procurement & Tender', 'Pengadaan Barang', 'PKWT Kontrak', { text: '100% (On Time)', badge: 'bg-emerald-100 text-emerald-800' }],
      ]
    },
    settings: {
      headers: ['Nama User / Akun', 'Email Login', 'Role Hak Akses', 'Unit / Cabang', 'Terakhir Aktif', 'Status Akun'],
      rows: [
        ['Admin Pusat', 'admin.erp@arthamandiri.co.id', 'Super Administrator (Full)', 'Semua Cabang', 'Online Sekarang', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
        ['John Doe (COO)', 'john.doe@arthamandiri.co.id', 'Executive Director', 'HQ Jakarta', '5 menit lalu', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Budi Santoso', 'budi.sales@arthamandiri.co.id', 'Sales Manager & Approver', 'Regional Barat', '1 jam lalu', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Hendra Wijaya', 'hendra.plant@arthamandiri.co.id', 'Plant Factory Manager', 'Pabrik Cikarang', '3 jam lalu', { text: 'Aktif', badge: 'bg-emerald-100 text-emerald-800' }],
      ]
    },
    dashboard: {
      headers: ['Unit Bisnis', 'Target Penjualan', 'Realisasi (MTD)', 'Work Order', 'Arus Kas Operasional', 'Tingkat Kesehatan'],
      rows: [
        ['Plant Manufaktur Cikarang', 'Rp 2.400.000.000', 'Rp 2.280.000.000 (95%)', '18 SPK', 'Positif (+Rp 420 Jt)', { text: 'Sangat Sehat', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Distribution Center JKT', 'Rp 1.500.000.000', 'Rp 1.450.000.000 (96%)', '23 Order', 'Positif (+Rp 280 Jt)', { text: 'Sangat Sehat', badge: 'bg-emerald-100 text-emerald-800' }],
        ['Regional Sumatera (Medan)', 'Rp 900.000.000', 'Rp 780.000.000 (86%)', '9 Order', 'Stabil (+Rp 95 Jt)', { text: 'Stabil', badge: 'bg-blue-100 text-blue-800' }],
        ['Regional Jawa Timur (SBY)', 'Rp 800.000.000', 'Rp 820.000.000 (102%)', '12 Order', 'Positif (+Rp 140 Jt)', { text: 'Melampaui Target', badge: 'bg-emerald-100 text-emerald-800' }],
      ]
    }
  };

  const activeTable = mockTableData[currentModule.id] || mockTableData['dashboard'];

  return (
    <div className="space-y-6 pb-12">
      {/* Module Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        {/* Glow effect */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-500/30 text-blue-400">
                <DynamicIcon name={currentModule.icon} size={24} />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                Modul ERP: {currentModule.title}
              </span>
              {currentModule.badge && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {currentModule.badge}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeItem?.title || currentModule.title}
              </h1>
              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                {activeItem?.description || currentModule.description}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
            >
              <Search size={14} className="text-blue-400" />
              <span>Cari di Modul Ini</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all">
              <Plus size={15} />
              <span>Tambah Dokumen Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {currentModule.quickStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentModule.quickStats.map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{stat.label}</span>
                <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <TrendingUp size={14} />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                <CheckCircle2 size={13} />
                <span>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-modules Quick Explorer Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daftar Sub-Menu & Fitur ({currentModule.submodules.length} Kelompok)
          </h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Pilih untuk beralih halaman
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentModule.submodules.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-blue-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {sub.title}
                  </span>
                  {sub.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sub.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {sub.items.map((item) => {
                    const isSelected = activeItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(currentModule.id, item.id)}
                        className={`w-full flex items-center justify-between text-left p-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-500/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="truncate">{item.title}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-400 font-normal truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.badge ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shrink-0">
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Data Grid Showcase */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Daftar Dokumen: {activeItem?.title || currentModule.title}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Live Data Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Menampilkan entri transaksi terkini yang disinkronkan dengan database ERP.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5"
              title="Filter Lanjutan"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5"
              title="Ekspor ke Excel"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5"
              title="Cetak Laporan"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                {activeTable.headers.map((h, idx) => (
                  <th key={idx} className="py-3 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {activeTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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
                    <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs">
                      Detail &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Info */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            Menampilkan 1 - {activeTable.rows.length} dari total 148 entri
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
              Sebelumnya
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold">
              1
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              2
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
