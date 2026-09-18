'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import BrandingSidebar from '@/components/BrandingSidebar';

const PAGE_TITLES: Record<string, string> = {
  '/branding': 'Manajemen KOL & Endorsement',
  '/branding/studio-creative': 'Produksi Video & Foto Produk',
  '/branding/brand-assets': 'Desain Kemasan & Brand Assets',
  '/branding/script-konten': 'Script dan Konten',
  '/branding/meta-testing': 'Meta Testing',
};

export default function BrandingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || 'Manajemen KOL & Endorsement';

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden">
      <BrandingSidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <header className="shrink-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs shrink-0"
              >
                <ArrowLeft size={15} />
                <span>Menu Utama (App Grid)</span>
              </Link>

              <span className="text-slate-300">|</span>

              <div className="flex items-center gap-2 text-xs min-w-0">
                <span className="font-bold text-slate-900 shrink-0">Branding</span>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-[#E11D48] truncate">{pageTitle}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
