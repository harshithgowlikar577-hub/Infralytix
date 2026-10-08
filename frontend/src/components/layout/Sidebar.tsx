import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, FolderKanban, AlertTriangle, ShieldAlert, CheckCircle2,
  BarChart3, MapPin, Sparkles, FileText, Settings, HelpCircle, Bot
} from 'lucide-react';
import IndiaSilhouette from '../common/IndiaSilhouette';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 10 Navigation Items — Cleaned & Refined (Data Governance removed)
  const menuItems = [
    {
      name: 'Dashboard',
      subtitle: 'Command Center',
      path: '/dashboard',
      icon: Home,
    },
    {
      name: 'Project Portfolio',
      subtitle: 'All Projects',
      path: '/projects',
      icon: FolderKanban,
    },
    {
      name: 'Risk Monitor',
      subtitle: 'Risk Analysis',
      path: '/radar',
      icon: AlertTriangle,
    },
    {
      name: 'Early Warnings',
      subtitle: 'Alerts & Predictions',
      path: '/early-warnings',
      icon: ShieldAlert,
      badge: '12',
    },
    {
      name: 'Project Health',
      subtitle: 'Health Score',
      path: '/health',
      icon: CheckCircle2,
    },
    {
      name: 'Analytics & Insights',
      subtitle: 'Reports & Trends',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Project Map',
      subtitle: 'GIS Intelligence',
      path: '/map',
      icon: MapPin,
    },
    {
      name: 'Recommendations',
      subtitle: 'AI Driven Actions',
      path: '/interventions',
      icon: Sparkles,
    },
    {
      name: 'AI Copilot',
      subtitle: 'Decision Assistant',
      path: '/copilot',
      icon: Bot,
      badge: 'AI',
    },
    {
      name: 'Reports',
      subtitle: 'Download & Export',
      path: '/reports',
      icon: FileText,
    },
    {
      name: 'Settings',
      subtitle: 'Profile & Preferences',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="group w-16 md:w-20 lg:w-60 hover:w-60 shrink-0 h-[calc(100vh-64px)] bg-[#070F1E] border-r border-[#14233C] flex flex-col justify-between py-3.5 px-2 sm:px-2.5 select-none transition-all duration-200 ease-in-out z-20 overflow-hidden shadow-xl">
      {/* ── Sidebar Header: Official High-Res Logo ─────────────── */}
      <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2.5 rounded-xl bg-[#0B172E]/80 border border-[#142642] shrink-0">
        <img
          src="/logo.png"
          alt="INFRALYTIX Official Logo"
          className="w-7 h-7 object-contain shrink-0 drop-shadow-sm"
          loading="lazy"
        />
        <div className="hidden lg:flex group-hover:flex flex-col min-w-0 transition-opacity duration-200">
          <span className="text-xs font-black tracking-wider text-white truncate leading-none">INFRALYTIX</span>
          <span className="text-[9px] text-blue-400 font-semibold tracking-wide truncate mt-0.5 leading-none">GOV. OF INDIA</span>
        </div>
      </div>

      {/* ── Navigation List (10 Clean Items with Refined Active & Hover States) ── */}
      <nav className="space-y-1 overflow-y-auto scrollbar-none flex-1 pr-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={item.name}
              className={({ isActive: linkActive }) => {
                const active = isActive || linkActive;
                return `relative flex items-center justify-between px-2.5 py-2.5 rounded-xl transition-all duration-200 group/item ${
                  active
                    ? 'bg-[#13274D] border border-blue-500/35 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#0E1A33]/80 border border-transparent'
                }`;
              }}
            >
              {/* Left active accent bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-blue-500" />
              )}

              <div className="flex items-center gap-3 min-w-0 pl-0.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-400 group-hover/item:text-blue-400 group-hover/item:bg-[#13223D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text Labels */}
                <div className="hidden lg:flex group-hover:flex flex-col text-left truncate transition-opacity duration-200">
                  <span className="text-xs font-bold tracking-tight leading-tight truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal leading-tight truncate mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {/* Badge */}
              {item.badge && (
                <span className="hidden lg:inline-block group-hover:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white min-w-[20px] text-center leading-none shadow-xs shrink-0 ml-1">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom Section: India Graphic + Help & Support ─────── */}
      <div className="pt-3 border-t border-[#14233C] space-y-2 shrink-0">
        {/* India Silhouette: full graphic when expanded, compact icon on small viewports */}
        <div className="hidden lg:block group-hover:block transition-opacity duration-200">
          <IndiaSilhouette />
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-center lg:justify-start group-hover:justify-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0E1A33] transition-colors text-left cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="hidden lg:inline group-hover:inline">Help & Support</span>
        </button>
      </div>
    </aside>
  );
}
