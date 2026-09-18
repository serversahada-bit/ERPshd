'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Command, CornerDownLeft, Sparkles } from 'lucide-react';
import { ERP_MODULES, ERPModule, ERPMenuItem } from '@/data/erpMenuData';
import DynamicIcon from './DynamicIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (moduleId: string, itemId: string) => void;
}

interface FlatMenuItem {
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
  submoduleTitle: string;
  item: ERPMenuItem;
}

export default function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all menu items for easy indexing and fast search
  const allItems: FlatMenuItem[] = [];
  ERP_MODULES.forEach((mod) => {
    mod.submodules.forEach((sub) => {
      sub.items.forEach((item) => {
        allItems.push({
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleIcon: mod.icon,
          submoduleTitle: sub.title,
          item,
        });
      });
    });
  });

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter((i) => {
        const q = query.toLowerCase();
        return (
          i.item.title.toLowerCase().includes(q) ||
          i.moduleTitle.toLowerCase().includes(q) ||
          i.submoduleTitle.toLowerCase().includes(q) ||
          (i.item.description && i.item.description.toLowerCase().includes(q))
        );
      });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled outside or in parent
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        onSelect(selected.moduleId, selected.item.id);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search size={20} className="text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ketik nama modul, dokumen, atau aksi (misal: BOM, PO, Karyawan, Kas)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Menu tidak ditemukan untuk &quot;{query}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain seperti &apos;Stok&apos;, &apos;Jurnal&apos;, &apos;Gaji&apos;, atau &apos;SPK&apos;.</p>
            </div>
          ) : (
            <div className="space-y-1 py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{query ? 'Hasil Pencarian Menu ERP' : 'Saran Menu Populer'}</span>
                <span className="text-[10px] lowercase text-slate-500">{filteredItems.length} opsi</span>
              </div>
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.moduleId}-${item.item.id}`}
                    onClick={() => {
                      onSelect(item.moduleId, item.item.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-blue-500'
                        }`}
                      >
                        <DynamicIcon name={item.moduleIcon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold truncate">
                            {item.item.title}
                          </span>
                          {item.item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {item.item.badge}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[11px] truncate flex items-center gap-1 mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          <span>{item.moduleTitle}</span>
                          <span>&bull;</span>
                          <span>{item.submoduleTitle}</span>
                          {item.item.description && (
                            <>
                              <span className="hidden md:inline">&bull;</span>
                              <span className="hidden md:inline truncate">{item.item.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-100 font-mono bg-white/10 px-2 py-0.5 rounded">
                          <span>Buka</span>
                          <CornerDownLeft size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white dark:bg-slate-700 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 font-mono text-[9px]">
                &uarr; &darr;
              </kbd>{' '}
              Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white dark:bg-slate-700 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 font-mono text-[9px]">
                Enter
              </kbd>{' '}
              Pilih
            </span>
          </div>
          <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
            <Sparkles size={12} />
            Great ERP Instant Navigation
          </span>
        </div>
      </div>
    </div>
  );
}
