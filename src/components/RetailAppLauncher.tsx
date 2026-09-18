'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  RETAIL_MODULES,
  RetailModule,
  COMPANY_PROFILE
} from '@/data/retailMenuData';
import DynamicIcon from './DynamicIcon';
import ModulCatalogView from './views/ModulCatalogView';
import LaporanView from './views/LaporanView';
import KalenderView from './views/KalenderView';
import {
  Search,
  LayoutGrid,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  X,
  Building2,
  CheckCircle2,
  ArrowRight,
  Bell,
  Home,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Play,
  Users,
  BarChart3,
  TrendingUp,
  Layers,
  Filter
} from 'lucide-react';

interface RetailAppLauncherProps {
  onOpenModuleWorkspace: (moduleId: string, subitemId?: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface SessionUser {
  nama: string;
  id_karyawan: string;
  role: string;
  email: string;
}

export default function RetailAppLauncher({
  onOpenModuleWorkspace,
  activeTab: controlledActiveTab,
  onTabChange
}: RetailAppLauncherProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [internalTab, setInternalTab] = useState<string>('beranda');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [activeDetailModule, setActiveDetailModule] = useState<RetailModule | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.user && setSessionUser(data.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const userInitials = (sessionUser?.nama || '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;
  const setActiveTab = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const handleCardLaunch = (modId: string, subId?: string) => {
    if (modId === 'calendar') {
      setActiveTab('kalender');
      return;
    }
    onOpenModuleWorkspace(modId, subId);
  };

  // Categories for filter pills
  const categories = [
    { id: 'all', label: 'Semua Modul', count: RETAIL_MODULES.length },
    { id: 'operasional', label: 'Operasional Retail (Baris 1)', count: 5 },
    { id: 'manajemen', label: 'Manajemen & Sistem (Baris 2)', count: 6 },
  ];

  // Filter modules by category and search query
  const filteredModules = useMemo(() => {
    return RETAIL_MODULES.filter((mod) => {
      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'operasional' && ['advertiser', 'branding', 'cscrm', 'fat', 'fulfillment'].includes(mod.category)) ||
        (selectedCategory === 'manajemen' && ['purchasing', 'it', 'communication', 'hr', 'executive', 'produk'].includes(mod.category));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        mod.subtitle.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.categoryLabel.toLowerCase().includes(q) ||
        mod.submenus.some((s) => s.title.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Color theme generator for each card matching the screenshot
  const getCardTheme = (mod: RetailModule) => {
    switch (mod.themeColor) {
      case 'blue':
        return {
          iconBg: 'bg-[#7C3AED] text-white',
          badgeBg: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]',
          btnBg: 'bg-[#F5F3FF] hover:bg-[#DDD6FE] text-[#7C3AED]',
        };
      case 'rose':
        return {
          iconBg: 'bg-[#E11D48] text-white',
          badgeBg: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FFE4E6]',
          btnBg: 'bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48]',
        };
      case 'emerald':
        return {
          iconBg: 'bg-[#10B981] text-white',
          badgeBg: 'bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]',
          btnBg: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669]',
        };
      case 'amber':
        return {
          iconBg: 'bg-[#F59E0B] text-white',
          badgeBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]',
          btnBg: 'bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#D97706]',
        };
      case 'purple':
        return {
          iconBg: 'bg-[#8B5CF6] text-white',
          badgeBg: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#EDE9FE]',
          btnBg: 'bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#7C3AED]',
        };
      case 'teal':
        return {
          iconBg: 'bg-[#0D9488] text-white',
          badgeBg: 'bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]',
          btnBg: 'bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E]',
        };
      case 'indigo':
        return {
          iconBg: 'bg-[#4F46E5] text-white',
          badgeBg: 'bg-[#EEF2FF] text-[#4338CA] border border-[#E0E7FF]',
          btnBg: 'bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4338CA]',
        };
      case 'cyan':
        return {
          iconBg: 'bg-[#0891B2] text-white',
          badgeBg: 'bg-[#ECFEFF] text-[#0E7490] border border-[#CFFAFE]',
          btnBg: 'bg-[#ECFEFF] hover:bg-[#CFFAFE] text-[#0E7490]',
        };
      case 'orange':
        return {
          iconBg: 'bg-[#EA580C] text-white',
          badgeBg: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]',
          btnBg: 'bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C]',
        };
      case 'slate':
      default:
        return {
          iconBg: 'bg-[#1E293B] text-white',
          badgeBg: 'bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]',
          btnBg: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155]',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* 1. TOP NAVBAR HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-md shadow-purple-500/25 p-1.5">
                <Image src="/gsh.png" alt="Great ERP" width={32} height={32} className="object-contain" />
              </div>
              <div className="leading-tight text-left">
                <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 uppercase">
                  PT SAHADA LAKU UTAMA
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Enterprise Portal
                </div>
              </div>
            </div>

            {/* Middle: Pill Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari modul, menu, laporan, atau apapun... (contoh: Ads, CS, Gudang, HR)"
                  className="w-full pl-11 pr-14 py-2 text-xs rounded-full border border-slate-200 bg-slate-50/90 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden transition-all text-slate-800 placeholder-slate-400 font-medium"
                />
                <div className="absolute right-3.5 flex items-center pointer-events-none">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white text-slate-500 border border-slate-200 shadow-2xs">
                    ⌘ K
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Notification & User Profile */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title="Pemberitahuan"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <div className="h-6 w-px bg-slate-200" />

              {/* User Avatar, Name & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity p-1 rounded-xl hover:bg-slate-50"
                >
                  <div className="relative h-9 w-9 rounded-full overflow-hidden ring-1 ring-slate-200 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {userInitials || <Users size={14} />}
                  </div>
                  <div className="leading-tight text-left hidden sm:block">
                    <div className="font-bold text-xs text-slate-900">Halo, {sessionUser?.nama?.split(' ')[0] || '...'}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{sessionUser?.role || 'Karyawan'}</div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">{sessionUser?.nama || '...'}</div>
                      <div className="text-[11px] text-slate-400">NIP {sessionUser?.id_karyawan || '-'}</div>
                      <div className="mt-1 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {sessionUser?.role || 'Karyawan'}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('kalender');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <Calendar size={15} className="text-slate-400" />
                        <span>Kalender Kerja</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('laporan');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <FileText size={15} className="text-slate-400" />
                        <span>Pusat Laporan</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut size={15} />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="p-3 border-t border-slate-100 md:hidden bg-slate-50">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul, menu, laporan..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-white text-slate-800 outline-hidden"
            />
          </div>
        </div>

        {/* 2. SECONDARY TABS BAR */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-1.5 overflow-x-auto no-scrollbar gap-4">
              {/* Left Navigation Tabs */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab('beranda')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'beranda'
                      ? 'bg-[#EDE9FE] text-[#7C3AED]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Home size={15} />
                  <span>Beranda</span>
                </button>

                <button
                  onClick={() => setActiveTab('modul')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'modul'
                      ? 'bg-[#EDE9FE] text-[#7C3AED]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutGrid size={15} />
                  <span>Modul ({RETAIL_MODULES.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('laporan')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'laporan'
                      ? 'bg-[#EDE9FE] text-[#7C3AED]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText size={15} />
                  <span>Laporan</span>
                </button>

                <button
                  onClick={() => setActiveTab('kalender')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'kalender'
                      ? 'bg-[#EDE9FE] text-[#7C3AED]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar size={15} />
                  <span>Kalender</span>
                </button>
              </div>

              {/* Right Utility Tabs */}
              <div className="flex items-center gap-3 shrink-0 text-xs font-medium text-slate-600">
                <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <HelpCircle size={15} />
                  <span>Bantuan & Dukungan</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 hover:text-rose-600 transition-colors pl-3 border-l border-slate-200"
                >
                  <LogOut size={15} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: BERANDA */}
        {activeTab === 'beranda' && (
          <>
            {/* HERO BANNER SECTION (Exact User Illustration) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-[#FFFFFF] to-[#F5F3FF] border border-purple-100/90 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Hero Text Column */}
            <div className="lg:col-span-6 z-10 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] border border-purple-200/80 text-[#7C3AED] text-[11px] font-bold tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                <span>PT SAHADA LAKU UTAMA &bull; ENTERPRISE PORTAL</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 tracking-tight leading-[1.08]">
                Enterprise Resource<br />
                Planning <span className="text-[#7C3AED]">(ERP)</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-500 font-normal max-w-lg leading-relaxed">
                Platform terpadu untuk efisiensi operasional, akselerasi penjualan, dan tata kelola bisnis ritel dalam satu ekosistem.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('modul-erp-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play size={13} className="fill-white" />
                  <span>Mulai Jelajahi Modul</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Hero Graphic Column */}
            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[580px] h-[260px] sm:h-[300px] lg:h-[320px]">
                <Image
                  src="/hero-illustration.png"
                  alt="PT SAHADA LAKU UTAMA Building Graphic"
                  fill
                  className="object-contain object-right"
                  priority
                />

                {/* Floating Bottom Right Card */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xl flex items-center gap-3 z-10">
                  <div className="h-10 w-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div className="leading-tight text-left">
                    <div className="text-[10px] text-slate-400 font-medium">Operasional</div>
                    <div className="font-extrabold text-xs text-slate-900">Lebih Efisien</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Bisnis Lebih Kuat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOUR KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Modul Aktif */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{RETAIL_MODULES.length}</div>
              <div className="font-bold text-xs text-slate-800 mt-1">Modul Aktif</div>
              <div className="text-[11px] text-slate-400 truncate">Terintegrasi dalam satu ekosistem</div>
            </div>
          </div>

          {/* KPI 2: Pengguna Aktif */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                <Users size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">248</div>
                <div className="font-bold text-xs text-slate-800 mt-1">Pengguna Aktif</div>
                <div className="text-[11px] text-slate-400 truncate">Dibanding bulan lalu</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md self-start shrink-0">
              ↗ +12%
            </span>
          </div>

          {/* KPI 3: Uptime Sistem */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
                <BarChart3 size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">98.7%</div>
                <div className="font-bold text-xs text-slate-800 mt-1">Uptime Sistem</div>
                <div className="text-[11px] text-slate-400 truncate">Sistem berjalan optimal</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md self-start shrink-0">
              ↗ +0.2%
            </span>
          </div>

          {/* KPI 4: Transaksi Hari Ini */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                <Calendar size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">12,480</div>
                <div className="font-bold text-xs text-slate-800 mt-1">Transaksi Hari Ini</div>
                <div className="text-[11px] text-slate-400 truncate">Dari seluruh modul</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md self-start shrink-0">
              ↗ +8%
            </span>
          </div>
        </div>

        {/* 5. MODUL ERP SECTION HEADER & CATEGORY FILTER */}
        <div id="modul-erp-section" className="pt-2 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Modul ERP
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {filteredModules.length} Modul
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih modul yang sesuai dengan kebutuhan tim Anda
              </p>
            </div>

            <button
              onClick={() => setActiveTab('modul')}
              className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-purple-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Lihat Semua Modul ({RETAIL_MODULES.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#8B5CF6] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 6. MODULE CARDS (Grid 5 Columns on Desktop, All 20 Visible!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredModules.map((mod) => {
              const theme = getCardTheme(mod);

              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group text-left"
                >
                  {/* Card Upper Half */}
                  <div>
                    {/* Icon + Category Badge + 3 Dots */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${theme.iconBg}`}
                        >
                          <DynamicIcon name={mod.icon} size={22} />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
                          {mod.badgeCategory}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveDetailModule(mod)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                        title="Opsi Modul"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Submenu Pills */}
                    <div className="mt-3.5 space-y-1.5">
                      {mod.submenus.slice(0, 3).map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleCardLaunch(mod.id, sub.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50/90 border border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/50 text-slate-600 hover:text-purple-700 text-[11px] font-medium cursor-pointer transition-colors truncate"
                        >
                          {sub.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Button */}
                  <div className="mt-4 pt-2">
                    <button
                      onClick={() => handleCardLaunch(mod.id)}
                      className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs ${theme.btnBg}`}
                    >
                      <span>Buka Modul</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-slate-700">Modul tidak ditemukan untuk &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs text-purple-600 font-semibold hover:underline"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>
      </>
    )}

        {/* VIEW 2: MODUL (10) */}
        {activeTab === 'modul' && (
          <ModulCatalogView
            onOpenModuleWorkspace={handleCardLaunch}
            onOpenDetailModal={(mod) => setActiveDetailModule(mod)}
          />
        )}

        {/* VIEW 3: LAPORAN */}
        {activeTab === 'laporan' && <LaporanView />}

        {/* VIEW 4: KALENDER */}
        {activeTab === 'kalender' && <KalenderView />}
      </main>

      {/* FLYOUT MODAL: Sub-menu Detail */}
      {activeDetailModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setActiveDetailModule(null)}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${activeDetailModule.iconBgColor}`}
                >
                  <DynamicIcon name={activeDetailModule.icon} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{activeDetailModule.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {activeDetailModule.badgeCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{activeDetailModule.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveDetailModule(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeDetailModule.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Daftar Sub-Menu ({activeDetailModule.submenus.length} Fitur)
                </h4>
                <div className="space-y-2">
                  {activeDetailModule.submenus.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        handleCardLaunch(activeDetailModule.id, sub.id);
                        setActiveDetailModule(null);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                            {sub.title}
                          </span>
                          {sub.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sub.description}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveDetailModule(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleCardLaunch(activeDetailModule.id);
                  setActiveDetailModule(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-xs"
              >
                Masuk ke Modul &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
