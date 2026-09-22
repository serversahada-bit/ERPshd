'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import MetaSidebar from '@/components/MetaSidebar';
import ProductSelector from '@/components/ProductSelector';

const PAGE_TITLES: Record<string, string> = {
  '/meta': 'Dashboard Report',
  '/meta/data': 'Meta Ads (FB & IG)',
  '/meta/closing-box-cs': 'Closing Box CS',
  '/meta/live': 'Dashboard Meta',
};

export default function MetaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || 'Meta Ads (FB & IG)';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Suspense>
        <MetaSidebar />
      </Suspense>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
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
                <span className="font-bold text-slate-900 shrink-0">Advertiser</span>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-blue-600 truncate">{pageTitle}</span>
              </div>
            </div>

            <Suspense>
              <ProductSelector />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
