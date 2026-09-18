'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  Users,
  Video,
  Truck,
  DollarSign,
  Megaphone,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  time: string;
  date: string;
  day: number;
  category: 'live' | 'kol' | 'logistik' | 'payroll' | 'purchasing';
  categoryLabel: string;
  badgeBg: string;
  badgeText: string;
  pic: string;
  location?: string;
  note?: string;
}

export default function KalenderView() {
  const [currentMonth] = useState('September 2026');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(15);

  const events: AgendaItem[] = [
    {
      id: 'ev-1',
      title: 'TikTok Shop Mega Live Flash Deal (Host Salsabila & Tim)',
      time: '14:00 - 18:00 WIB',
      date: '15 Sep 2026',
      day: 15,
      category: 'live',
      categoryLabel: 'Live Shopping',
      badgeBg: 'bg-cyan-50 border border-cyan-200',
      badgeText: 'text-cyan-700',
      pic: 'Salsabila & Tim Host Live',
      location: 'Studio 1 HQ Sahada',
      note: 'Target GMV Live: Rp 65 Juta'
    },
    {
      id: 'ev-2',
      title: 'Jadwal Pick-Up Massal Kurir Batch Sore (J&T & Ninja COD)',
      time: '16:30 WIB',
      date: '15 Sep 2026',
      day: 15,
      category: 'logistik',
      categoryLabel: 'Logistik Gudang',
      badgeBg: 'bg-purple-50 border border-purple-200',
      badgeText: 'text-purple-700',
      pic: 'Bambang (Spv Gudang)',
      location: 'Gudang Pusat Bintaro',
      note: 'Estimasi: 1.850 Resi Siap Kirim'
    },
    {
      id: 'ev-3',
      title: 'Posting Video Endorsement Instagram Reels: @amelia_beauty',
      time: '19:00 WIB',
      date: '16 Sep 2026',
      day: 16,
      category: 'kol',
      categoryLabel: 'Branding & KOL',
      badgeBg: 'bg-rose-50 border border-rose-200',
      badgeText: 'text-rose-700',
      pic: 'Tim Kreatif & Endorse',
      note: 'Review produk Serum Brightening'
    },
    {
      id: 'ev-4',
      title: 'Kedatangan Truk Restok PO-042 dari Pabrik Mitra',
      time: '09:00 WIB',
      date: '18 Sep 2026',
      day: 18,
      category: 'purchasing',
      categoryLabel: 'Pengadaan PO',
      badgeBg: 'bg-indigo-50 border border-indigo-200',
      badgeText: 'text-indigo-700',
      pic: 'Purchasing & Tim QC',
      location: 'Loading Dock Gudang A',
      note: '10.000 Pcs Kemasan Baru'
    },
    {
      id: 'ev-5',
      title: 'Cut-Off Absensi & Perhitungan Komisi CS / Advertiser',
      time: '23:59 WIB',
      date: '20 Sep 2026',
      day: 20,
      category: 'payroll',
      categoryLabel: 'HR & Komisi',
      badgeBg: 'bg-amber-50 border border-amber-200',
      badgeText: 'text-amber-700',
      pic: 'HRD & Finance FAT',
      note: 'Sinkronisasi rekapan closing dan omset'
    },
    {
      id: 'ev-6',
      title: 'Pencairan Payroll & Gaji Karyawan PT SAHADA LAKU UTAMA',
      time: '10:00 WIB',
      date: '25 Sep 2026',
      day: 25,
      category: 'payroll',
      categoryLabel: 'HR & Payroll',
      badgeBg: 'bg-emerald-50 border border-emerald-200',
      badgeText: 'text-emerald-700',
      pic: 'Finance & Direksi',
      note: 'Transfer payroll via BCA KlikBisnis'
    }
  ];

  const filteredEvents = events.filter((e) => filterCat === 'all' || e.category === filterCat);
  const selectedDayEvents = filteredEvents.filter((e) => e.day === selectedDay);

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <CalendarCheck size={14} />
            <span>Kalender Operasional Ritel &bull; PT SAHADA LAKU UTAMA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Agenda & Jadwal Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sinkronisasi jadwal live streaming, posting endorsement KOL, pick-up kurir, kedatangan truk restok, dan payroll.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Fitur Tambah Jadwal Agenda Baru dibuka')}
            className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Semua Agenda (6)' },
          { id: 'live', label: 'Live Shopping & Ads' },
          { id: 'kol', label: 'KOL & Kreatif' },
          { id: 'logistik', label: 'Logistik & Ekspedisi' },
          { id: 'purchasing', label: 'Restok Pabrik PO' },
          { id: 'payroll', label: 'HR & Payroll' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterCat(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterCat === f.id
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3. Main Calendar Layout: Left Calendar Grid, Right Agenda Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar Box */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <CalendarIcon size={18} className="text-purple-600" />
              <span>{currentMonth}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2">
            <div>MIN</div>
            <div>SEN</div>
            <div>SEL</div>
            <div>RAB</div>
            <div>KAM</div>
            <div>JUM</div>
            <div>SAB</div>
          </div>

          {/* Days Matrix (September 2026 starts on Tuesday = day 2) */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank leading days for Sunday, Monday */}
            <div className="h-14 p-1.5 rounded-xl text-slate-300 text-xs font-semibold bg-slate-50/50">30</div>
            <div className="h-14 p-1.5 rounded-xl text-slate-300 text-xs font-semibold bg-slate-50/50">31</div>

            {/* Days 1 to 30 */}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const dayHasEvents = events.filter((e) => e.day === day);
              const isSelected = selectedDay === day;
              const isToday = day === 15;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-14 p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/70 text-purple-700 ring-2 ring-purple-500/20 shadow-xs'
                      : isToday
                      ? 'border-purple-200 bg-purple-50/30 text-slate-900'
                      : 'border-slate-100 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{day}</span>
                    {isToday && (
                      <span className="text-[9px] px-1 bg-[#8B5CF6] text-white rounded-sm font-semibold">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  {/* Dots / indicator badges */}
                  {dayHasEvents.length > 0 && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      {dayHasEvents.map((ev) => (
                        <span
                          key={ev.id}
                          className={`h-2 w-2 rounded-full ${
                            ev.category === 'live'
                              ? 'bg-cyan-500'
                              : ev.category === 'logistik'
                              ? 'bg-purple-500'
                              : ev.category === 'kol'
                              ? 'bg-rose-500'
                              : ev.category === 'payroll'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                      <span className="text-[9px] text-slate-500 truncate">
                        {dayHasEvents.length} Jadwal
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Events & Detailed Agenda */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900">
                  Agenda Tanggal {selectedDay} September 2026
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedDayEvents.length} kegiatan terjadwal
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700">
                PT SAHADA LAKU UTAMA
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada agenda khusus di tanggal ini</p>
                <p className="text-[11px] text-slate-400 mt-1">Pilih tanggal 15, 16, 18, 20, atau 25 September</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ev.badgeBg} ${ev.badgeText}`}>
                        {ev.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock size={12} />
                        <span>{ev.time}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xs text-slate-900 leading-snug">
                      {ev.title}
                    </h3>

                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{ev.location}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="font-medium text-slate-700">PIC: {ev.pic}</span>
                      {ev.note && <span className="text-purple-600 font-semibold">{ev.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Highlights Card */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-5 shadow-md shadow-purple-500/15">
            <div className="font-extrabold text-sm mb-1">Target Operasional Bulan Ini</div>
            <p className="text-xs text-purple-100 leading-relaxed mb-3">
              Fokus scale-up kampanye iklan Q3, pencapaian target omset Rp 1,5 Miliar, dan optimasi rasio sukses kirim COD kurir di atas 92%.
            </p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/20">
              <span className="font-semibold text-white/90">Status Target:</span>
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">On Track (98.8%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
