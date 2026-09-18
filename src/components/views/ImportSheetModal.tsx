'use client';

import React, { useState } from 'react';
import { X, Loader2, Download } from 'lucide-react';

interface ImportSheetModalProps {
  defaultUrl: string;
  onClose: () => void;
  onImport: (sheetUrl: string) => Promise<void>;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'Pastikan sheet dibagikan sebagai "Siapa saja yang memiliki link dapat melihat". Data tanggal yang sudah ada akan ditimpa dengan nilai terbaru dari sheet.';

export default function ImportSheetModal({ defaultUrl, onClose, onImport, description = DEFAULT_DESCRIPTION }: ImportSheetModalProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onImport(url);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-sm sm:text-base text-slate-900">Import dari Google Sheets</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link Google Sheets</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">{description}</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Import Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
