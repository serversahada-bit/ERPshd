'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SearchableSelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (id: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabledPlaceholder?: string;
  disabled?: boolean;
}

/**
 * Dropdown ketik-untuk-cari — dipakai untuk daftar panjang (mis. puluhan Ad Account Meta)
 * supaya user bisa cari cepat pakai nama/ID, tidak perlu scroll `<select>` biasa. Filternya
 * murni di sisi client dari `options` yang sudah dimuat, tidak butuh request/permission
 * tambahan ke API manapun.
 */
export default function SearchableSelect({ value, onChange, options, placeholder, disabledPlaceholder, disabled }: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)) : options;

  return (
    <div className="relative" ref={boxRef}>
      <input
        type="text"
        value={isOpen ? query : selected ? `${selected.label} (${selected.id})` : ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setIsOpen(true);
        }}
        disabled={disabled}
        placeholder={disabled ? disabledPlaceholder : selected ? undefined : placeholder}
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
      />

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-400 border-b border-slate-50"
            >
              — Kosongkan —
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="p-3 text-xs text-slate-400">Tidak ditemukan.</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setQuery('');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-slate-50 last:border-0 ${
                  o.id === value ? 'bg-blue-50/60' : ''
                }`}
              >
                <div className="font-semibold text-slate-800 truncate">{o.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{o.id}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
