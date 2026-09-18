'use client';

import { Users, Wallet, TrendingUp, Eye } from 'lucide-react';
import BrandingSectionView from '@/components/views/BrandingSectionView';

export default function BrandingKolPage() {
  return (
    <BrandingSectionView
      title="Manajemen KOL & Endorsement"
      description="Daftar talent, briefing konten, dan jadwal posting"
      addLabel="Tambah KOL"
      kpis={[
        { icon: Users, label: 'KOL Aktif', value: '28 Talent', accent: 'bg-rose-50 text-rose-600' },
        { icon: Wallet, label: 'Total Nilai Kontrak', value: 'Rp 62.400.000', accent: 'bg-blue-50 text-blue-600' },
        { icon: TrendingUp, label: 'Rata-rata Engagement', value: '6.4%', accent: 'bg-emerald-50 text-emerald-600' },
        { icon: Eye, label: 'Total Reach/Views', value: '2,4 Jt', accent: 'bg-cyan-50 text-cyan-600' },
      ]}
      chart={{
        title: 'Tren Nilai Kontrak & Views per Tanggal',
        barLabel: 'Nilai Kontrak',
        lineLabel: 'Total Views',
        barColor: '#e11d48',
        lineColor: '#f97316',
        data: [
          { label: '03 Sep', barValue: 2800000, lineValue: 95000 },
          { label: '05 Sep', barValue: 3200000, lineValue: 120000 },
          { label: '07 Sep', barValue: 2100000, lineValue: 88000 },
          { label: '09 Sep', barValue: 4500000, lineValue: 150000 },
          { label: '11 Sep', barValue: 3800000, lineValue: 168000 },
          { label: '13 Sep', barValue: 2600000, lineValue: 102000 },
          { label: '15 Sep', barValue: 4100000, lineValue: 175000 },
          { label: '17 Sep', barValue: 4500000, lineValue: 150000 },
        ],
      }}
      headers={['Nama KOL / Talent', 'Platform', 'Followers', 'Nilai Kontrak', 'Jadwal Tayang', 'Status']}
      rows={[
        ['@sarah_hijabstyle', 'Instagram Reels & Story', '520K', 'Rp 4.500.000', '16 Sep 2026', { text: 'Materi Siap Tayang', badge: 'bg-emerald-100 text-emerald-800' }],
        ['@alya.ootd', 'TikTok Video Hook Review', '240K', 'Rp 2.800.000', '18 Sep 2026', { text: 'Draft Video Direview', badge: 'bg-blue-100 text-blue-800' }],
        ['@rendy.fashionfit', 'Instagram Reels', '180K', 'Rp 2.200.000', '21 Sep 2026', { text: 'Briefing Konten', badge: 'bg-amber-100 text-amber-800' }],
        ['@dewi_reviewkece', 'TikTok Unboxing', '95K', 'Rp 1.200.000', '24 Sep 2026', { text: 'Negosiasi Kontrak', badge: 'bg-purple-100 text-purple-800' }],
      ]}
    />
  );
}
