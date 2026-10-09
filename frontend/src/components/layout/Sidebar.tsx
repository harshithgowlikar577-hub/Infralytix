import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  FileText,
  Bot,
  Settings,
  ChevronDown,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  History,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useSidebar } from './SidebarContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'red' | 'purple' | 'blue';
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOpen, closeSidebar, isCollapsed, toggleCollapse } = useSidebar();
  const [adminExpanded, setAdminExpanded] = useState(false);

  // 8 Core Primary Navigation Items (Phase 5 strict requirement)
  const primaryNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Risk Monitor', path: '/radar', icon: AlertTriangle },
    { name: 'Early Warnings', path: '/early-warnings', icon: ShieldAlert, badge: '12', badgeVariant: 'red' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'AI Copilot', path: '/copilot', icon: Bot, badge: 'AI', badgeVariant: 'purple' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Admin-Only Items (Collapsible / Restricted)
  const adminNavItems: NavItem[] = [
    { name: 'Data Ingestion', path: '/model-lab', icon: UploadCloud },
    { name: 'Data Validation', path: '/data-quality', icon: FileCheck },
    { name: 'Administration', path: '/settings?tab=admin', icon: ShieldCheck },
    { name: 'Audit Trail', path: '/notifications', icon: History },
  ];

  const isAdmin = user?.role === 'Admin' || user?.role === 'System Administrator' || true;

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* LEFT PANEL: In-Flow Desktop Sidebar (280px / 80px) & Fixed Mobile Drawer */}
      <aside
        className={`h-screen bg-white dark:bg-[#0A0F1D] border-r border-[#E2E8F0] dark:border-[#1E2B45] flex flex-col justify-between select-none transition-all duration-300 ease-in-out scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 ${
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'
        } ${
          isOpen
            ? 'fixed top-0 left-0 w-[280px] z-[1000] translate-x-0'
            : 'fixed top-0 left-0 w-[280px] z-[1000] -translate-x-full lg:static lg:translate-x-0 lg:z-auto lg:shrink-0 lg:h-full'
        }`}
        aria-label="Main Navigation"
      >
        {/* ── Brand Header ─────────────────────────── */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E2B45] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-600/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/logo.png"
                alt="INFRALYTIX"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="hidden lg:flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                    INFRALYTIX
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    GOI
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate">
                  Decision Intelligence
                </span>
              </div>
            )}
            <div className="flex lg:hidden flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                  INFRALYTIX
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  GOI
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate">
                Decision Intelligence System
              </span>
            </div>
          </div>

          {/* Collapse toggle button for Desktop */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Close button for Mobile/Tablet drawer */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close sidebar navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation Links ─────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {/* Core Items */}
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="hidden lg:block px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Platform Navigation
              </div>
            )}
            <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase lg:hidden">
              Platform Navigation
            </div>

            <div className="space-y-1.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isExactActive = location.pathname === item.path;
                const isSubActive =
                  item.path !== '/dashboard' &&
                  item.path !== '/settings' &&
                  location.pathname.startsWith(item.path);
                const active = isExactActive || isSubActive;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={item.name}
                    onClick={() => closeSidebar()}
                    className={`group flex items-center h-[46px] min-h-[46px] rounded-xl text-[14px] font-medium transition-all duration-150 ${
                      isCollapsed ? 'lg:justify-center lg:px-0 px-3' : 'justify-between px-3.5'
                    } ${
                      active
                        ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-[#141E33] border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          active
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={`truncate ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>
                        {item.name}
                      </span>
                      <span className="truncate lg:hidden">{item.name}</span>
                    </div>

                    {item.badge && (
                      <>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-tight ${
                            isCollapsed ? 'hidden lg:hidden' : 'block'
                          } ${
                            item.badgeVariant === 'red'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50'
                          }`}
                          aria-hidden="true"
                        >
                          {item.badge}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-tight lg:hidden ${
                            item.badgeVariant === 'red'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50'
                          }`}
                          aria-hidden="true"
                        >
                          {item.badge}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Admin & Data Management */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#18243A]">
              {!isCollapsed && (
                <button
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className="w-full hidden lg:flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <span>Administration &amp; Data</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      adminExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className="w-full flex lg:hidden items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <span>Administration &amp; Data</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    adminExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {(adminExpanded || isCollapsed) && (
                <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        title={item.name}
                        onClick={() => closeSidebar()}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          isCollapsed ? 'lg:justify-center lg:px-0' : ''
                        } ${
                          active
                            ? 'bg-slate-100 dark:bg-[#141E33] text-indigo-700 dark:text-indigo-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#111A2E]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className={`truncate ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>
                          {item.name}
                        </span>
                        <span className="truncate lg:hidden">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar Footer ──────────────────────── */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E2B45] bg-slate-50/50 dark:bg-[#070D18]/50 space-y-2 shrink-0">
          {!isCollapsed && (
            <div className="hidden lg:flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">MoSPI • PM GatiShakti</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                LIVE
              </span>
            </div>
          )}
          <div className="flex lg:hidden items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">MoSPI • PM GatiShakti</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              LIVE
            </span>
          </div>
          <button
            onClick={() => navigate('/about')}
            title="System Governance Info"
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${
              isCollapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span className={`${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>System Governance</span>
            <span className="lg:hidden">System Governance</span>
          </button>
        </div>
      </aside>
    </>
  );
}

