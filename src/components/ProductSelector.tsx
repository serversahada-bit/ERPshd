'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Settings, ChevronDown } from 'lucide-react';
import { MetaAdsProduct } from '@/lib/metaAdsProducts';
import ProductManageModal from './views/ProductManageModal';

export default function ProductSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPid = searchParams.get('pid');

  const [products, setProducts] = useState<MetaAdsProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/meta-ads/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data as MetaAdsProduct[]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Pastikan URL selalu punya ?pid=... — default ke produk aktif pertama.
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    const validPid = products.some((p) => String(p.id) === currentPid);
    if (!validPid) {
      const fallback = products.find((p) => p.isActive) || products[0];
      const params = new URLSearchParams(searchParams.toString());
      params.set('pid', String(fallback.id));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [isLoading, products, currentPid, pathname, router, searchParams]);

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pid', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return <div className="h-8 w-40 rounded-lg bg-slate-100 animate-pulse" />;
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <select
            value={currentPid || ''}
            onChange={(e) => handleSelect(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
                {!p.isActive ? ' (Nonaktif)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          onClick={() => setShowManage(true)}
          className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          title="Kelola Produk"
        >
          <Settings size={14} />
        </button>
      </div>

      {showManage && (
        <ProductManageModal
          products={products}
          onClose={() => setShowManage(false)}
          onChanged={() => {
            fetchProducts();
          }}
        />
      )}
    </>
  );
}
