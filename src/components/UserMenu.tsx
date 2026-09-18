'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User } from 'lucide-react';

interface SessionUser {
  nama: string;
  id_karyawan: string;
  role: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.user && setUser(data.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!user) return null;

  const initials = user.nama
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {initials}
        </div>
        <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
          {user.nama}
        </span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700/80">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.nama}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                NIP {user.id_karyawan}{user.role ? ` · ${user.role}` : ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 text-rose-600 dark:text-rose-400 transition-colors mt-1"
            >
              <LogOut size={14} />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
