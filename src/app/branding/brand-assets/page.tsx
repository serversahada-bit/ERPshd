'use client';

import { Boxes, Wallet, CheckCircle2, Printer } from 'lucide-react';
import BrandingSectionView from '@/components/views/BrandingSectionView';

export default function BrandingBrandAssetsPage() {
  return (
    <BrandingSectionView
      title="Desain Kemasan & Brand Assets"
      description="Master packaging, stiker label, dan materi cetak"
      addLabel="Tambah Desain"
      kpis={[
        { icon: Boxes, label: 'Desain Aktif', value: '12 Desain', accent: 'bg-rose-50 text-rose-600' },
        { icon: Wallet, label: 'Total Biaya Cetak', value: 'Rp 5.550.000', accent: 'bg-blue-50 text-blue-600' },
        { icon: CheckCircle2, label: 'Approval Rate', value: '82%', accent: 'bg-emerald-50 text-emerald-600' },
        { icon: Printer, label: 'Total Unit Dicetak', value: '40.000 Pcs', accent: 'bg-cyan-50 text-cyan-600' },
      ]}
      chart={{
        title: 'Tren Biaya Cetak & Unit Dicetak per Tanggal',
        barLabel: 'Biaya Cetak',
        lineLabel: 'Unit Dicetak',
        barColor: '#e11d48',
        lineColor: '#f97316',
        data: [
          { label: '03 Sep', barValue: 800000, lineValue: 6000 },
          { label: '05 Sep', barValue: 1200000, lineValue: 9000 },
          { label: '07 Sep', barValue: 600000, lineValue: 4000 },
          { label: '09 Sep', barValue: 1500000, lineValue: 12000 },
          { label: '11 Sep', barValue: 900000, lineValue: 7000 },
          { label: '13 Sep', barValue: 700000, lineValue: 5000 },
          { label: '15 Sep', barValue: 1100000, lineValue: 8500 },
          { label: '17 Sep', barValue: 950000, lineValue: 7500 },
        ],
      }}
      headers={['Nama Aset / Desain', 'Kategori', 'Estimasi Biaya', 'Jadwal Selesai', 'Jumlah Cetak', 'Status']}
      rows={[
        ['Desain Box Polymailer Eksklusif', 'Kemasan Baru Q4', 'Rp 1.500.000', '22 Sep 2026', 'Cetak 10.000 Pcs', { text: 'Approval Desain', badge: 'bg-amber-100 text-amber-800' }],
        ['Stiker Label Halal & QR Garansi', 'Label Produk', 'Rp 600.000', '19 Sep 2026', 'Cetak 25.000 Pcs', { text: 'Proses Cetak', badge: 'bg-blue-100 text-blue-800' }],
        ['Thank You Card Edisi Ramadan', 'Materi Cetak', 'Rp 450.000', '26 Sep 2026', 'Cetak 5.000 Pcs', { text: 'Draft Desain', badge: 'bg-purple-100 text-purple-800' }],
        ['Brand Guideline & Logo Update', 'Brand Assets', 'Rp 3.000.000', '30 Sep 2026', 'Master File', { text: 'Revisi Internal', badge: 'bg-slate-100 text-slate-700' }],
      ]}
    />
  );
}
