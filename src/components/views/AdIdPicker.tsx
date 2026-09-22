'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

interface AdSearchResult {
  id: string;
  name: string;
  status: string;
  adsetName: string;
  campaignName: string;
}

interface AdIdPickerProps {
  /** Comma-separated Ad ID — satu konten bisa disebar ke beberapa ad set/campaign sekaligus. */
  value: string;
  onChange: (adIds: string) => void;
  productId: string;
  autoSearchName?: string;
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function parseIds(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdIdPicker({ value, onChange, productId, autoSearchName }: AdIdPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  // Cache nama/info iklan yang sudah pernah muncul di hasil pencarian, dipakai buat
  // nampilin label chip yang lebih informatif daripada cuma angka ID mentah.
  const [knownAds, setKnownAds] = useState<Record<string, AdSearchResult>>({});
  const boxRef = useRef<HTMLDivElement>(null);

  const selectedIds = parseIds(value);

  const addIds = (ads: AdSearchResult[]) => {
    setKnownAds((prev) => {
      const next = { ...prev };
      ads.forEach((a) => {
        next[a.id] = a;
      });
      return next;
    });
    const merged = Array.from(new Set([...selectedIds, ...ads.map((a) => a.id)]));
    onChange(merged.join(','));
  };

  const toggleId = (ad: AdSearchResult) => {
    setKnownAds((prev) => ({ ...prev, [ad.id]: ad }));
    if (selectedIds.includes(ad.id)) {
      onChange(selectedIds.filter((id) => id !== ad.id).join(','));
    } else {
      onChange([...selectedIds, ad.id].join(','));
    }
  };

  const removeId = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id).join(','));
  };

  // Kalau form dibuka dengan Ad ID yang sudah tersimpan sebelumnya (mis. mode Edit), cache
  // nama masih kosong — ambil nama aslinya sekali lewat lookup langsung by ID, supaya chip
  // menampilkan nama, bukan cuma angka ID mentah.
  useEffect(() => {
    if (!value || !productId) return;
    const unknownIds = parseIds(value).filter((id) => !knownAds[id]);
    if (unknownIds.length === 0) return;
    let cancelled = false;
    fetch(`/api/meta-ads-lookup?ids=${encodeURIComponent(unknownIds.join(','))}&productId=${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const data = json.data as AdSearchResult[];
        if (data.length === 0) return;
        setKnownAds((prev) => {
          const next = { ...prev };
          data.forEach((a) => {
            next[a.id] = a;
          });
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, productId]);

  // Nama Konten dipakai persis sebagai nama iklan di Meta Ads Manager, jadi begitu Nama
  // Konten dipilih (dan belum ada Ad ID tersimpan), langsung cari & pilih semua iklan
  // dengan nama persis sama — satu konten memang bisa disebar ke beberapa ad set, jadi
  // semuanya digabung (bukan cuma ambil satu), metriknya nanti dijumlah saat sync.
  useEffect(() => {
    if (!autoSearchName || value || !productId) return;
    let cancelled = false;
    setIsSearching(true);
    setError(null);
    setAutoMessage('Mencari otomatis dari Nama Konten...');
    fetch(`/api/meta-ads-search?q=${encodeURIComponent(autoSearchName.trim())}&productId=${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setAutoMessage(null);
          setError(json.error || 'Gagal mencari iklan.');
          return;
        }
        const data = json.data as AdSearchResult[];
        const exactMatches = data.filter((r) => namesMatch(r.name, autoSearchName));
        if (exactMatches.length > 0) {
          addIds(exactMatches);
          setAutoMessage(
            exactMatches.length === 1
              ? `Otomatis ditemukan: "${exactMatches[0].name}"`
              : `Otomatis ditemukan & digabung ${exactMatches.length} iklan dengan nama sama (beda ad set) — metrik akan dijumlah saat sync.`
          );
        } else {
          setResults(data);
          setIsOpen(data.length > 0);
          setAutoMessage(data.length > 0 ? 'Tidak ketemu yang persis sama namanya — pilih manual di bawah.' : 'Iklan dengan nama ini belum ditemukan di Meta Ads Manager.');
        }
      })
      .catch(() => {
        if (!cancelled) setAutoMessage(null);
        if (!cancelled) setError('Gagal terhubung ke Meta API.');
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearchName, productId]);

  useEffect(() => {
    if (query.trim().length < 2 || !productId) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      setError(null);
      fetch(`/api/meta-ads-search?q=${encodeURIComponent(query.trim())}&productId=${productId}`)
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
  }, [query, productId]);

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
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selectedIds.map((id) => {
            const known = knownAds[id];
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 max-w-full rounded-md bg-rose-50 text-rose-700 text-[10px] font-semibold pl-2 pr-1 py-1"
                title={known ? `${known.name} (${id})` : id}
              >
                <span className="truncate max-w-[160px]">{known ? known.name : id}</span>
                <button type="button" onClick={() => removeId(id)} className="shrink-0 hover:text-rose-900">
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}

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
          placeholder={selectedIds.length > 0 ? 'Cari & tambah iklan lain...' : 'Ketik nama iklan untuk cari...'}
          className="w-full rounded-lg border border-slate-200 pl-7 pr-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
        />
      </div>

      {autoMessage && (
        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
          {isSearching && <Loader2 size={10} className="animate-spin shrink-0" />}
          <span className="truncate">{autoMessage}</span>
        </p>
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
            results.map((r) => {
              const checked = selectedIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleId(r)}
                  className={`w-full text-left px-3 py-2 hover:bg-rose-50 text-xs border-b border-slate-50 last:border-0 flex items-start gap-2 ${checked ? 'bg-rose-50/60' : ''}`}
                >
                  <input type="checkbox" checked={checked} readOnly className="mt-0.5 h-3 w-3 accent-rose-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{r.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {r.id} &bull; {r.status}
                      {r.campaignName && <> &bull; Campaign: {r.campaignName}</>}
                      {r.adsetName && <> &bull; Ad Set: {r.adsetName}</>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
