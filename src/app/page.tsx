 'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RetailAppLauncher from '@/components/RetailAppLauncher';
import RetailWorkspace from '@/components/RetailWorkspace';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CommandPalette from '@/components/CommandPalette';
import ModuleDashboard from '@/components/ModuleDashboard';
import { RETAIL_MODULES } from '@/data/retailMenuData';
import { ERP_MODULES } from '@/data/erpMenuData';

export default function App() {
  const router = useRouter();
  // Navigation mode: 'grid' (Corporate App Launcher Grid, default) | 'workspace' (Retail Module View) | 'classic-sidebar'
  const [viewMode, setViewMode] = useState<'grid' | 'workspace' | 'classic-sidebar'>('grid');
  const [activeLauncherTab, setActiveLauncherTab] = useState<string>('beranda');
  const [activeRetailModuleId, setActiveRetailModuleId] = useState<string>('advertiser');
  const [activeRetailSubitemId, setActiveRetailSubitemId] = useState<string>('meta');

  // Classic sidebar state if user toggles to classic view
  const [activeClassicModuleId, setActiveClassicModuleId] = useState<string>('dashboard');
  const [activeClassicItemId, setActiveClassicItemId] = useState<string>('kpi-overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const handleOpenRetailModule = (moduleId: string, subitemId?: string) => {
    if (moduleId === 'calendar') {
      setActiveLauncherTab('kalender');
      setViewMode('grid');
      return;
    }
    if (moduleId === 'settings') {
      setActiveLauncherTab('pengaturan');
      setViewMode('grid');
      return;
    }

    const mod = RETAIL_MODULES.find((m) => m.id === moduleId);
    const resolvedSubitemId = subitemId || (mod && mod.submenus.length > 0 ? mod.submenus[0].id : undefined);

    // Meta Ads dan Branding sudah punya halaman URL sendiri, arahkan ke sana supaya bisa
    // di-bookmark/refresh dan tombol back/forward browser berfungsi normal.
    if (moduleId === 'advertiser' && resolvedSubitemId === 'meta') {
      router.push('/meta');
      return;
    }
    if (moduleId === 'branding') {
      const brandingRoutes: Record<string, string> = {
        'kol-endorse': '/branding',
        'studio-creative': '/branding/studio-creative',
        'brand-assets': '/branding/brand-assets',
        'script-konten': '/branding/script-konten',
        'meta-testing': '/branding/meta-testing',
      };
      router.push(brandingRoutes[resolvedSubitemId || 'kol-endorse'] || '/branding');
      return;
    }
    if (moduleId === 'produk-master') {
      router.push('/produk');
      return;
    }

    setActiveRetailModuleId(moduleId);
    if (resolvedSubitemId) {
      setActiveRetailSubitemId(resolvedSubitemId);
    }
    setViewMode('workspace');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. DEFAULT VIEW: Modern Corporate App Launcher Grid for PT SAHADA LAKU UTAMA */}
      {viewMode === 'grid' && (
        <RetailAppLauncher
          onOpenModuleWorkspace={handleOpenRetailModule}
          activeTab={activeLauncherTab}
          onTabChange={setActiveLauncherTab}
        />
      )}

      {/* 2. RETAIL WORKSPACE VIEW: When user clicks any App card */}
      {viewMode === 'workspace' && (
        <RetailWorkspace
          moduleId={activeRetailModuleId}
          subitemId={activeRetailSubitemId}
          onBackToGrid={() => setViewMode('grid')}
          onSelectSubmenu={(subId) => setActiveRetailSubitemId(subId)}
          onOpenTab={(tab) => {
            setActiveLauncherTab(tab);
            setViewMode('grid');
          }}
        />
      )}

      {/* 3. OPTIONAL CLASSIC SIDEBAR VIEW */}
      {viewMode === 'classic-sidebar' && (
        <div className="flex">
          <Sidebar
            activeModuleId={activeClassicModuleId}
            activeItemId={activeClassicItemId}
            onSelectModule={(modId) => setActiveClassicModuleId(modId)}
            onSelectItem={(modId, itemId) => {
              setActiveClassicModuleId(modId);
              setActiveClassicItemId(itemId);
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            mobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />

          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            <Header
              onToggleMobile={() => setIsMobileSidebarOpen(true)}
              activeModuleId={activeClassicModuleId}
              activeItemId={activeClassicItemId}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onSelectAction={(mId, itId) => {
                setActiveClassicModuleId(mId);
                setActiveClassicItemId(itId);
              }}
              isCollapsed={isSidebarCollapsed}
            />

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
              <div className="mb-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  &larr; Kembali ke Portal Aplikasi Utama PT SAHADA LAKU UTAMA
                </button>
              </div>

              <ModuleDashboard
                activeModuleId={activeClassicModuleId}
                activeItemId={activeClassicItemId}
                onSelectItem={(mId, itId) => {
                  setActiveClassicModuleId(mId);
                  setActiveClassicItemId(itId);
                }}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              />
            </main>
          </div>

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onSelect={(mId, itId) => {
              setActiveClassicModuleId(mId);
              setActiveClassicItemId(itId);
            }}
          />
        </div>
      )}
    </div>
  );
}
