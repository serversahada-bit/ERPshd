'use client';

import { Video, Wallet, Camera, Clock } from 'lucide-react';
import BrandingSectionView from '@/components/views/BrandingSectionView';

export default function BrandingStudioCreativePage() {
  return (
    <BrandingSectionView
      title="Produksi Video & Foto Produk"
      description="Pipeline syuting materi promosi & hook video"
      addLabel="Tambah Jadwal Syuting"
      kpis={[
        { icon: Video, label: 'Proyek Berjalan', value: '9 Proyek', accent: 'bg-rose-50 text-rose-600' },
        { icon: Wallet, label: 'Estimasi Biaya Bulan Ini', value: 'Rp 28.500.000', accent: 'bg-blue-50 text-blue-600' },
        { icon: Camera, label: 'Output Selesai', value: '46 Video/Foto', accent: 'bg-emerald-50 text-emerald-600' },
        { icon: Clock, label: 'Rata-rata Waktu Produksi', value: '3.2 Hari', accent: 'bg-cyan-50 text-cyan-600' },
      ]}
      chart={{
        title: 'Tren Biaya Produksi & Output per Tanggal',
        barLabel: 'Biaya Produksi',
        lineLabel: 'Output (Video/Foto)',
        barColor: '#e11d48',
        lineColor: '#f97316',
        data: [
          { label: '03 Sep', barValue: 2200000, lineValue: 4 },
          { label: '05 Sep', barValue: 3600000, lineValue: 6 },
          { label: '07 Sep', barValue: 1800000, lineValue: 3 },
          { label: '09 Sep', barValue: 4200000, lineValue: 8 },
          { label: '11 Sep', barValue: 3200000, lineValue: 5 },
          { label: '13 Sep', barValue: 2500000, lineValue: 4 },
          { label: '15 Sep', barValue: 3800000, lineValue: 7 },
          { label: '17 Sep', barValue: 3200000, lineValue: 5 },
        ],
      }}
      headers={['Proyek Kreatif', 'Tipe Produksi', 'Estimasi Biaya', 'Jadwal Syuting', 'Target Output', 'Status']}
      rows={[
        ['Photoshoot Gamis Eid Edition', 'Studio & Model Muslimah', 'Rp 6.000.000', '20 Sep 2026', 'Katalog 24 SKU', { text: 'Jadwal Studio', badge: 'bg-purple-100 text-purple-800' }],
        ['Hook Video TikTok Skincare Serum', 'Video Product Hook', 'Rp 3.200.000', '19 Sep 2026', '5 Video Varian', { text: 'Proses Editing', badge: 'bg-blue-100 text-blue-800' }],
        ['Foto Katalog Sepatu Sneakers Q4', 'Studio Product Shot', 'Rp 2.500.000', '23 Sep 2026', 'Katalog 40 SKU', { text: 'Briefing Tim', badge: 'bg-amber-100 text-amber-800' }],
        ['Video Testimoni Pelanggan VIP', 'UGC & Voice Over', 'Rp 1.800.000', '25 Sep 2026', '3 Video Testimoni', { text: 'Menunggu Talent', badge: 'bg-slate-100 text-slate-700' }],
      ]}
    />
  );
}
