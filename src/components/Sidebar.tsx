'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ERP_MODULES,
  ERP_MENU_CATEGORIES,
  ERPModule,
  COMPANY_BRANCHES
} from '@/data/erpMenuData';
import DynamicIcon from './DynamicIcon';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Check,
  Search,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  activeModuleId: string;
  activeItemId: string;
  onSelectModule: (moduleId: string) => void;
  onSelectItem: (moduleId: string, itemId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCommandPalette: () => void;
}

export default function Sidebar({
  activeModuleId,
  activeItemId,
  onSelectModule,
  onSelectItem,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenCommandPalette,
}: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    manufacturing: false,
    inventory: false,
    sales: false,
    procurement: false,
    finance: false,
    hr: false,
    settings: false,
  });

  const [expandedSubmodules, setExpandedSubmodules] = useState<Record<string, boolean>>({
    'dash-analytics': true,
    'mfg-planning': true,
    'inv-master': true,
    'sales-transactions': true,
    'proc-transactions': true,
    'fin-gl': true,
    'hr-personnel': true,
  });

  const [selectedBranch, setSelectedBranch] = useState(COMPANY_BRANCHES[0]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<ERPModule | null>(null);

  const toggleModuleAccordion = (moduleId: string) => {
    if (isCollapsed) {
      onToggleCollapse();
    }
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
    onSelectModule(moduleId);
  };

  const toggleSubmoduleAccordion = (submoduleId: string) => {
    setExpandedSubmodules((prev) => ({
      ...prev,
      [submoduleId]: !prev[submoduleId],
    }));
  };

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'danger':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'purple':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      default:
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out select-none
          ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Brand & Branch Section */}
        <div className="flex flex-col border-b border-slate-800 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectModule('dashboard')}>
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/20 p-1.5">
                <Image src="/gsh.png" alt="Great ERP" width={32} height={32} className="object-contain" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight text-white truncate">
                      GREAT<span className="text-blue-400">ERP</span>
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      v4.2
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 truncate">Enterprise Solution</span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Perluas Menu (Expand)' : 'Perkecil Menu (Collapse)'}
            >
              {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Branch Switcher Pill (Hidden if collapsed) */}
          {!isCollapsed && (
            <div className="relative mt-3">
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 size={14} className="text-blue-400 shrink-0" />
                  <div className="truncate text-left">
                    <div className="font-medium text-slate-200 truncate">{selectedBranch.name}</div>
                    <div className="text-[10px] text-slate-400">Unit: {selectedBranch.code}</div>
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-200 transition-transform" />
              </button>

              {/* Branch Dropdown */}
              {isBranchDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsBranchDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl bg-slate-850 border border-slate-700 shadow-xl overflow-hidden py-1">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Pilih Entitas / Cabang
                    </div>
                    {COMPANY_BRANCHES.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBranch(b);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 transition-colors ${
                          selectedBranch.id === b.id ? 'text-blue-400 bg-blue-500/10 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {selectedBranch.id === b.id && <Check size={14} className="shrink-0 text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Search Shortcut inside Sidebar */}
        <div className="p-3">
          <button
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group
              ${isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between py-2 px-3'}
            `}
            title="Pencarian Cepat (Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search size={15} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
              {!isCollapsed && <span>Cari modul ERP...</span>}
            </div>
            {!isCollapsed && (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-700/80 text-slate-300 border border-slate-600">
                Ctrl K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Modules Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {ERP_MENU_CATEGORIES.map((category) => {
            const categoryModules = ERP_MODULES.filter((m) => m.category === category.id);
            if (categoryModules.length === 0) return null;

            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header Label */}
                {!isCollapsed ? (
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    {category.label}
                  </div>
                ) : (
                  <div className="h-px bg-slate-800 my-2 mx-1" />
                )}

                {/* Modules list */}
                {categoryModules.map((module) => {
                  const isActive = activeModuleId === module.id;
                  const isExpanded = expandedModules[module.id];

                  return (
                    <div
                      key={module.id}
                      className="relative group"
                      onMouseEnter={() => isCollapsed && setHoveredModule(module)}
                      onMouseLeave={() => isCollapsed && setHoveredModule(null)}
                    >
                      {/* Module Trigger Button */}
                      <button
                        onClick={() => toggleModuleAccordion(module.id)}
                        className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all duration-150 font-medium
                          ${isActive
                            ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm shadow-blue-500/10'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }
                          ${isCollapsed ? 'justify-center' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                              ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                : 'bg-slate-800 text-slate-300 group-hover:text-blue-400 group-hover:bg-slate-700/80'
                              }
                            `}
                          >
                            <DynamicIcon name={module.icon} size={16} />
                          </div>

                          {!isCollapsed && (
                            <span className="truncate font-semibold text-left">{module.title}</span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {module.badge && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBadgeStyle(
                                  module.badgeType
                                )}`}
                              >
                                {module.badge}
                              </span>
                            )}
                            <ChevronDown
                              size={14}
                              className={`text-slate-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </div>
                        )}
                      </button>

                      {/* Collapsed Mode Flyout Menu (when hovered) */}
                      {isCollapsed && hoveredModule?.id === module.id && (
                        <div className="fixed left-20 ml-2 top-auto z-50 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 text-slate-200">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <DynamicIcon name={module.icon} size={16} className="text-blue-400" />
                              <span className="font-bold text-white text-xs">{module.title}</span>
                            </div>
                            {module.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${getBadgeStyle(
                                  module.badgeType
                                )}`}
                              >
                                {module.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                            {module.description}
                          </p>

                          <div className="space-y-2 max-h-72 overflow-y-auto">
                            {module.submodules.map((sub) => (
                              <div key={sub.id} className="space-y-1">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                                  {sub.title}
                                </div>
                                <div className="space-y-0.5 pl-1.5 border-l border-slate-800">
                                  {sub.items.map((item) => (
                                    <button
                                      key={item.id}
                                      onClick={() => {
                                        onSelectItem(module.id, item.id);
                                        setHoveredModule(null);
                                      }}
                                      className={`w-full text-left py-1 px-1.5 rounded text-xs transition-colors truncate flex items-center justify-between ${
                                        activeItemId === item.id
                                          ? 'bg-blue-600/30 text-blue-300 font-medium'
                                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                      }`}
                                    >
                                      <span className="truncate">{item.title}</span>
                                      {item.badge && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                                          {item.badge}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expanded Mode: Hierarchical Sub-modules Accordion */}
                      {!isCollapsed && isExpanded && (
                        <div className="ml-5 pl-3 border-l-2 border-slate-800/80 mt-1 space-y-2 py-1">
                          {module.submodules.map((submodule) => {
                            const isSubOpen = expandedSubmodules[submodule.id] ?? true;

                            return (
                              <div key={submodule.id} className="space-y-1">
                                {/* Submodule Title Trigger */}
                                <button
                                  onClick={() => toggleSubmoduleAccordion(submodule.id)}
                                  className="w-full flex items-center justify-between py-1 px-1.5 rounded text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors group"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <ChevronRight
                                      size={12}
                                      className={`text-slate-400 transition-transform ${
                                        isSubOpen ? 'rotate-90 text-blue-400' : ''
                                      }`}
                                    />
                                    <span className="truncate">{submodule.title}</span>
                                  </div>
                                  {submodule.badge && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                      {submodule.badge}
                                    </span>
                                  )}
                                </button>

                                {/* Child Items */}
                                {isSubOpen && (
                                  <div className="space-y-0.5 pl-3">
                                    {submodule.items.map((item) => {
                                      const isItemSelected = activeItemId === item.id;
                                      return (
                                        <button
                                          key={item.id}
                                          onClick={() => {
                                            onSelectItem(module.id, item.id);
                                            if (window.innerWidth < 1024) onCloseMobile();
                                          }}
                                          className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs text-left transition-all group ${
                                            isItemSelected
                                              ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                          }`}
                                        >
                                          <span className="truncate">{item.title}</span>
                                          {item.badge && (
                                            <span
                                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                isItemSelected
                                                  ? 'bg-white/20 text-white'
                                                  : getBadgeStyle(item.badgeType)
                                              }`}
                                            >
                                              {item.badge}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer Profile & Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                JD
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-xs text-white truncate">John Doe, S.T.</span>
                <span className="text-[10px] text-blue-400 font-medium truncate">Chief Operating Officer</span>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => onSelectItem('settings', 'user-management')}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/60 transition-colors"
                title="Pengaturan Akun"
              >
                <SlidersHorizontal size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
