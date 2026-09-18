'use client';

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  HelpCircle,
  ChevronDown,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Command
} from 'lucide-react';
import { QUICK_ACTIONS, ERP_MODULES, COMPANY_BRANCHES } from '@/data/erpMenuData';
import DynamicIcon from './DynamicIcon';
import UserMenu from './UserMenu';

interface HeaderProps {
  onToggleMobile: () => void;
  activeModuleId: string;
  activeItemId: string;
  onOpenCommandPalette: () => void;
  onSelectAction: (moduleId: string, itemId: string) => void;
  isCollapsed: boolean;
}

export default function Header({
  onToggleMobile,
  activeModuleId,
  activeItemId,
  onOpenCommandPalette,
  onSelectAction,
  isCollapsed,
}: HeaderProps) {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Find module & active item names for breadcrumb
  const currentModule = ERP_MODULES.find((m) => m.id === activeModuleId) || ERP_MODULES[0];
  let currentSubmoduleTitle = '';
  let currentItemTitle = '';

  for (const sub of currentModule.submodules) {
    const found = sub.items.find((i) => i.id === activeItemId);
    if (found) {
      currentSubmoduleTitle = sub.title;
      currentItemTitle = found.title;
      break;
    }
  }

  const notifications = [
    {
      id: 1,
      title: 'Approval Purchase Order Dibutuhkan',
      desc: 'PO #PO-2026-089 (PT Krakatau Steel) sebesar Rp 184.000.000 menunggu persetujuan.',
      time: '12 menit lalu',
      type: 'warning',
      module: 'procurement',
      item: 'po-approvals',
    },
    {
      id: 2,
      title: 'Peringatan Stok Minimum SKU',
      desc: 'Bahan Baku Resin Grade A di Gudang Cikarang tersisa 18 drum (di bawah safety stock).',
      time: '45 menit lalu',
      type: 'danger',
      module: 'inventory',
      item: 'safety-stock-alert',
    },
    {
      id: 3,
      title: 'Work Order #WO-409 Selesai Produksi',
      desc: '3.000 unit Finished Goods lolos inspeksi QC 100% dan siap dimutasi ke gudang.',
      time: '2 jam lalu',
      type: 'success',
      module: 'manufacturing',
      item: 'work-orders',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 transition-colors">
      {/* Left Section: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <DynamicIcon name={currentModule.icon} size={15} className="text-blue-500" />
            <span className="hidden sm:inline">{currentModule.title}</span>
          </span>
          {currentSubmoduleTitle && (
            <>
              <span className="text-slate-400">/</span>
              <span className="hidden md:inline text-slate-600 dark:text-slate-300">
                {currentSubmoduleTitle}
              </span>
            </>
          )}
          {currentItemTitle && (
            <>
              <span className="text-slate-400">/</span>
              <span className="font-medium text-blue-600 dark:text-blue-400 truncate max-w-[140px] sm:max-w-xs">
                {currentItemTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right Section: Search trigger, Quick Create, Notifications, Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Bar trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-colors shadow-xs group"
        >
          <Search size={14} className="group-hover:text-blue-500 transition-colors" />
          <span className="text-slate-400 dark:text-slate-400">Cari menu, form, atau transaksi...</span>
          <kbd className="inline-flex items-center gap-0.5 rounded bg-white dark:bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-2xs">
            <Command size={10} /> K
          </kbd>
        </button>

        {/* Quick Search Icon for mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Cari"
        >
          <Search size={18} />
        </button>

        {/* Quick Transaction Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Buat Baru</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${isQuickActionOpen ? 'rotate-180' : ''}`} />
          </button>

          {isQuickActionOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsQuickActionOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Transaksi Cepat
                </div>
                <div className="py-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        onSelectAction(action.module, action.id);
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors group"
                    >
                      <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-500/10 transition-colors">
                        <DynamicIcon name={action.icon} size={14} className={action.color} />
                      </div>
                      <span className="truncate font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifikasi & Approval"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">Pemberitahuan</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      3 Baru
                    </span>
                  </div>
                  <button className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                    Tandai dibaca
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectAction(n.module, n.item);
                        setIsNotificationOpen(false);
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                            n.type === 'warning'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : n.type === 'danger'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {n.type === 'warning' ? (
                            <Clock size={14} />
                          ) : n.type === 'danger' ? (
                            <AlertTriangle size={14} />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-700/80 text-center">
                  <button
                    onClick={() => {
                      onSelectAction('dashboard', 'kpi-overview');
                      setIsNotificationOpen(false);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Lihat Semua Notifikasi di Dashboard &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
