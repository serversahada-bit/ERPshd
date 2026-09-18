'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

interface AdSearchResult {
  id: string;
  name: string;
  status: string;
}

interface AdIdPickerProps {
  value: string;
  onChange: (adId: string) => void;
}

export default function AdIdPicker({ value, onChange }: AdIdPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      setError(null);
      fetch(`/api/meta-ads-search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((json) => {
          if (cancelled) return;
          if (!json.success) {
            setError(json.error || 'Gagal mencari iklan.');
            setResults([]);
            return;
          }
          setResults(json.data as AdSearchResult[]);
        })
        .catch(() => {
          if (!cancelled) setError('Gagal terhubung ke Meta API.');
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Ketik nama iklan untuk cari..."
          className="w-full rounded-lg border border-slate-200 pl-7 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
        />
      </div>

      {value && !query && (
        <p className="text-[10px] text-slate-400 mt-1 truncate">Ad ID tersimpan: {value}</p>
      )}

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {isSearching ? (
            <div className="p-3 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={13} className="animate-spin" />
              <span>Mencari...</span>
            </div>
          ) : error ? (
            <div className="p-3 text-xs text-rose-500">{error}</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-slate-400">Tidak ada iklan ditemukan.</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onChange(r.id);
                  setQuery(r.name);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 text-xs border-b border-slate-50 last:border-0"
              >
                <div className="font-semibold text-slate-800 truncate">{r.name}</div>
                <div className="text-[10px] text-slate-400">
                  {r.id} &bull; {r.status}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
