'use client';

import React, { useState, useMemo } from 'react';
import { RETAIL_MODULES, RetailModule } from '@/data/retailMenuData';
import DynamicIcon from '../DynamicIcon';
import {
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Activity
} from 'lucide-react';

interface ModulCatalogViewProps {
  onOpenModuleWorkspace: (moduleId: string, subitemId?: string) => void;
  onOpenDetailModal: (mod: RetailModule) => void;
}

export default function ModulCatalogView({
  onOpenModuleWorkspace,
  onOpenDetailModal
}: ModulCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'operasional' | 'manajemen'>('all');

  const filtered = useMemo(() => {
    return RETAIL_MODULES.filter((m) => {
      const matchCat =
        activeCategory === 'all' ||
        (activeCategory === 'operasional' && ['advertiser', 'branding', 'cscrm', 'fat', 'fulfillment'].includes(m.category)) ||
        (activeCategory === 'manajemen' && ['purchasing', 'it', 'communication', 'hr', 'executive', 'produk'].includes(m.category));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.submenus.some((s) => s.title.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Layers size={14} />
            <span>Katalog Lengkap &bull; 11 Modul Operasional ERP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Direktori Modul & Fitur Terpadu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seluruh modul operasional retail PT SAHADA LAKU UTAMA aktif dan terhubung secara realtime.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari fitur atau nama modul..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Semua 11 Modul' },
          { id: 'operasional', label: 'Operasional Inti — Baris 1 (5 Modul)' },
          { id: 'manajemen', label: 'Manajemen & Sistem — Baris 2 (6 Modul)' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? 'bg-[#8B5CF6] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. Detailed Grid View (10 Full Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header row: Icon, title, badge, version */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${mod.iconBgColor}`}>
                    <DynamicIcon name={mod.icon} size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                        {mod.title}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {mod.version}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      {mod.subtitle}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{mod.statusText}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {mod.description}
              </p>

              {/* Submenus List */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Fitur Utama di Modul Ini:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {mod.submenus.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onOpenModuleWorkspace(mod.id, sub.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 hover:text-blue-600 truncate">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {sub.description}
                        </div>
                      </div>
                      {sub.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-700 rounded-md shrink-0">
                          {sub.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenDetailModal(mod)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Lihat Dokumentasi SOP
              </button>

              <button
                onClick={() => onOpenModuleWorkspace(mod.id)}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <span>Buka Ruang Kerja</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
