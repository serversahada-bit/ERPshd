'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Table2, Search, ShoppingBag, ArrowLeft, Sliders, Megaphone, PlugZap } from 'lucide-react';

const MAIN_MENU = [
  { id: 'dashboard', href: '/meta', label: 'Dashboard Report', icon: LayoutDashboard, disabled: false },
  { id: 'live', href: '/meta/live', label: 'Dashboard Meta', icon: PlugZap, disabled: false },
  { id: 'data', href: '/meta/data', label: 'Data', icon: Table2, disabled: false },
  { id: 'google-tiktok-ads', href: '#', label: 'Google & TikTok Ads', icon: Search, disabled: true },
  { id: 'marketplace-ads', href: '#', label: 'Marketplace (Shopee/Tokped)', icon: ShoppingBag, disabled: true },
];

const SETTINGS_MENU = [{ id: 'advertiser-settings', label: 'Pengaturan Advertiser', icon: Sliders }];

export default function MetaSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pid = searchParams.get('pid');
  const withPid = (href: string) => (pid ? `${href}?pid=${pid}` : href);

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="h-9 w-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0">
          <Megaphone size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-900 truncate">Advertiser</div>
          <div className="text-[10px] text-slate-400 truncate">Meta Ads Dashboard</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          <div className="space-y-1">
            {MAIN_MENU.map((item) => {
              const Icon = item.icon;
              const isActive = !item.disabled && pathname === item.href;

              if (item.disabled) {
                return (
                  <div
                    key={item.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 opacity-60 cursor-not-allowed"
                    title="Segera hadir"
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={withPid(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pengaturan
          </div>
          <div className="space-y-1">
            {SETTINGS_MENU.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 opacity-60 cursor-not-allowed"
                  title="Segera hadir"
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}

            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={16} className="shrink-0" />
              <span className="truncate">Kembali ke Portal Utama</span>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
