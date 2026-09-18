'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Users, Video, Boxes, FileText, FlaskConical, ArrowLeft, Sliders } from 'lucide-react';

const MAIN_MENU = [
  { id: 'kol-endorse', href: '/branding', label: 'Manajemen KOL & Endorsement', icon: Users, disabled: false },
  { id: 'studio-creative', href: '/branding/studio-creative', label: 'Produksi Video & Foto Produk', icon: Video, disabled: false },
  { id: 'brand-assets', href: '/branding/brand-assets', label: 'Desain Kemasan & Brand Assets', icon: Boxes, disabled: false },
  { id: 'script-konten', href: '/branding/script-konten', label: 'Script dan Konten', icon: FileText, disabled: false },
  { id: 'meta-testing', href: '/branding/meta-testing', label: 'Meta Testing', icon: FlaskConical, disabled: false },
];

const SETTINGS_MENU = [{ id: 'branding-settings', label: 'Pengaturan Branding', icon: Sliders }];

export default function BrandingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="h-9 w-9 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0">
          <Palette size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-900 truncate">Branding</div>
          <div className="text-[10px] text-slate-400 truncate">Kreatif & Brand Assets</div>
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

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#E11D48] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
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
