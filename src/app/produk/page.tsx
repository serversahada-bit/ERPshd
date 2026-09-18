'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductMasterView from '@/components/views/ProductMasterView';

export default function ProdukPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
        >
          <ArrowLeft size={15} />
          <span>Menu Utama (App Grid)</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ProductMasterView />
      </main>
    </div>
  );
}
