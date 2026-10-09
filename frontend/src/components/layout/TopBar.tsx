import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  KeyRound,
  LogOut,
  Clock,
  Loader2,
  Building2,
  MapPin,
  Landmark,
  Briefcase,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useProjects } from '../../hooks/useAPI';
import { useSidebar } from './SidebarContext';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { toggleSidebar, isCollapsed } = useSidebar();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Profile data
  const [displayName] = useState(
    () => localStorage.getItem('infralytix-display-name') || user?.full_name || 'Government Officer'
  );
  const [displayRole] = useState(
    () => localStorage.getItem('infralytix-display-role') || user?.role || 'Authorized Officer'
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live multi-attribute query
  const { data: projectsData, isLoading: isSearchLoading } = useProjects({
    search: searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined,
    limit: 6,
  });
  const liveProjects = projectsData?.projects || projectsData?.items || [];

  // Keyboard shortcut Ctrl+K & Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  const handleSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 400);
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 w-full bg-white dark:bg-[#0A0F1D] border-b border-[#E2E8F0] dark:border-[#1E2B45] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200 select-none shadow-xs"
      role="banner"
    >
      {/* ── Left Context ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label="Toggle Navigation Menu"
        >
          <span className="text-xl font-bold leading-none">≡</span>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            PAIMANA / CLR Monitoring Protocol — GoI
          </span>
          <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">•</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            Demonstration Environment
          </span>
        </div>
      </div>

      {/* ── Right Controls ───────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Phase 11: Multi-Attribute Search Launcher */}
        <div className="relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search Project, Ministry, State, Sector... (Ctrl+K)"
                aria-label="Global Project Multi-Attribute Search"
                className="w-36 sm:w-60 md:w-80 lg:w-96 max-w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-slate-100 dark:bg-[#111A2E] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#1E2B45] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#0E1626] transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {searchFocused && searchQuery.trim().length >= 2 && (
            <div className="absolute right-0 mt-2 w-96 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-[#1E2B45] shadow-2xl p-2.5 z-50 animate-in fade-in">
              <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>Matching Results ({liveProjects.length})</span>
                <span className="text-[10px] text-indigo-500 font-normal">Press Enter for full list</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
                {liveProjects.length > 0 ? (
                  liveProjects.map((proj: any) => (
                    <div
                      key={proj.id}
                      onClick={() => {
                        navigate(`/projects/${proj.id}`);
                        setSearchFocused(false);
                      }}
                      className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#14233C] cursor-pointer text-xs transition-colors space-y-1"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {proj.project_name || proj.name || 'Project name unavailable'}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                          {proj.project_id || proj.id}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">{proj.ministry || 'Railways'}</span>
                        <span>•</span>
                        <span>{proj.state || 'National'}</span>
                      </div>
                    </div>
                  ))
                ) : isSearchLoading ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Searching multi-attribute index...</span>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching records found for "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
          title="Profile & Settings"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
            {displayName[0] || 'U'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[130px]">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
          title="Sign Out"
        >
          {isSigningOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
