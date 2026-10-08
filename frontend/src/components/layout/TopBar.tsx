import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, ChevronDown, Settings, LogOut, User as UserIcon,
  Building2, Landmark, MapPin, AlertTriangle, ArrowRight, X,
  Check, CheckCheck, Sparkles, FileText, Clock, Loader2
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useProjects } from '../../hooks/useAPI';
import EmblemLogo from '../common/EmblemLogo';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Notification items state for interactive notification center
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Anomaly Alert Assigned',
      description: 'Delhi–Mumbai Expressway milestone variance exceeded threshold (14 mos).',
      category: 'Alert Assignment',
      time: '12 min ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-2',
      title: 'Intervention Approval Request',
      description: 'Fast-track environmental clearance submitted for Bharatmala Package 4.',
      category: 'Approval Request',
      time: '45 min ago',
      read: false,
      type: 'approval',
    },
    {
      id: 'notif-3',
      title: 'Cabinet Briefing Dossier Complete',
      description: 'Quarterly infrastructure telemetry report generated successfully.',
      category: 'Report Ready',
      time: '2 hours ago',
      read: false,
      type: 'report',
    },
    {
      id: 'notif-4',
      title: 'Profile Security Policy Synced',
      description: 'NIC 2FA credential handshake validated under Ministry protocol.',
      category: 'System Update',
      time: '1 day ago',
      read: true,
      type: 'system',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Profile fields with persistence
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('infralytix-display-name') || user?.full_name || 'Harshitha Raj'
  );
  const [displayRole, setDisplayRole] = useState(
    () => localStorage.getItem('infralytix-display-role') || 'Authorized Officer'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('infralytix-avatar-url') || ''
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Live project query for autocomplete suggestions
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects({
    search: searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined,
    limit: 5,
  });

  const liveProjects = projectsData?.projects || projectsData?.items || [];
  const [keyboardIndex, setKeyboardIndex] = useState<number>(-1);

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('infralytix-recent-searches');
      return raw ? JSON.parse(raw) : ['Delhi-Mumbai Expressway', 'Bharatmala Pariyojana', 'Western Dedicated Freight Corridor'];
    } catch {
      return ['Delhi-Mumbai Expressway', 'Bharatmala Pariyojana', 'Western Dedicated Freight Corridor'];
    }
  });

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      localStorage.setItem('infralytix-recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem('infralytix-recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Date & Time Live Telemetry (Updated every minute)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(() => new Date());
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatISTDateTime = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = hours.toString().padStart(2, '0');
    return `${day} ${month} ${year} | ${hoursStr}:${minutes} ${ampm} IST`;
  };

  const getRelativeTimeStr = () => {
    const diffMins = Math.floor((currentTime.getTime() - lastUpdatedTime.getTime()) / 60000);
    if (diffMins <= 0) return 'Updated just now';
    if (diffMins === 1) return 'Updated 1 minute ago';
    return `Updated ${diffMins} minutes ago`;
  };

  // Permanent Dark Mode enforcement
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('infralytix-theme', 'dark');
  }, []);

  // Synchronize on storage changes
  useEffect(() => {
    const handleUpdate = () => {
      const storedName = localStorage.getItem('infralytix-display-name');
      const storedRole = localStorage.getItem('infralytix-display-role');
      const storedAvatar = localStorage.getItem('infralytix-avatar-url');
      if (storedName) setDisplayName(storedName);
      if (storedRole) setDisplayRole(storedRole);
      if (storedAvatar) setAvatarUrl(storedAvatar);
    };
    window.addEventListener('infralytix-user-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('infralytix-user-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
        setUserMenuOpen(false);
        setNotifDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
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
      saveRecentSearch(searchQuery.trim());
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  // Notification actions
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Animated Sign Out Interaction
  const handleSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HR';

  const filteredNotifications = notifications.filter((n) =>
    notifFilter === 'unread' ? !n.read : true
  );

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#08101E]/95 backdrop-blur-md border-b border-[#14233C] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200 select-none shadow-xs">
      {/* ── Left: Emblem + Brand ──────────────────────────────────── */}
      <div
        onClick={() => navigate('/dashboard')}
        className="cursor-pointer group shrink-0 pr-4 sm:pr-8"
      >
        <EmblemLogo />
      </div>

      {/* ── Center: Search Input with Autocomplete Dropdown ───────── */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6 relative" ref={searchContainerRef}>
        <form onSubmit={handleSearchSubmit} className="relative" role="search" aria-label="Global search">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {isProjectsLoading && searchQuery.trim().length >= 2 ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-blue-400' : 'text-slate-400'}`} />
            )}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchFocused(false);
                searchInputRef.current?.blur();
                return;
              }
              const currentItems = searchQuery.trim().length >= 2 ? liveProjects : recentSearches;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setKeyboardIndex((prev) => (prev < currentItems.length - 1 ? prev + 1 : 0));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setKeyboardIndex((prev) => (prev > 0 ? prev - 1 : currentItems.length - 1));
              } else if (e.key === 'Enter') {
                if (keyboardIndex >= 0 && keyboardIndex < currentItems.length) {
                  e.preventDefault();
                  const selected = currentItems[keyboardIndex];
                  if (typeof selected === 'string') {
                    setSearchQuery(selected);
                    navigate(`/projects?search=${encodeURIComponent(selected)}`);
                  } else {
                    saveRecentSearch(selected.project_name || selected.name);
                    navigate(`/projects/${selected.project_id || selected.id}`);
                  }
                  setSearchFocused(false);
                }
              }
            }}
            placeholder="Search projects, ministries, states, contractors..."
            aria-label="Search projects, ministries, states, contractors"
            className="w-full h-[46px] pl-11 pr-20 py-2.5 text-sm rounded-2xl bg-[#091529] border border-[#1E3354] text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isProjectsLoading && searchQuery.trim().length >= 2 && (
              <span className="text-[11px] font-medium text-blue-400/90 hidden sm:inline-block animate-pulse">
                Searching...
              </span>
            )}
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setKeyboardIndex(-1);
                  searchInputRef.current?.focus();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-[#14233D] rounded border border-[#1E3354] select-none">
                Ctrl K
              </span>
            )}
          </div>
        </form>

        {/* Live Autocomplete Dropdown */}
        {searchFocused && (
          <div
            role="listbox"
            className="absolute left-0 right-0 mt-2 bg-[#091529]/95 backdrop-blur-xl border border-[#1E3354] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto"
          >
            {searchQuery.trim().length >= 2 ? (
              <div className="p-2 border-b border-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Projects ({liveProjects.length})</span>
                  {isProjectsLoading && <span className="text-blue-400 text-[10px] font-medium">Searching...</span>}
                </div>
                {liveProjects.length > 0 ? (
                  <div className="space-y-1">
                    {liveProjects.map((p: any, idx: number) => {
                      const isSelected = keyboardIndex === idx;
                      return (
                        <div
                          key={p.project_id || p.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            saveRecentSearch(p.project_name || p.name);
                            navigate(`/projects/${p.project_id || p.id}`);
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          onMouseEnter={() => setKeyboardIndex(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-white border border-blue-500/30'
                              : 'hover:bg-[#14233C] text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="truncate">
                              <div className="text-sm font-semibold text-slate-100 truncate">
                                {p.project_name || p.name}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {p.ministry} • {p.sector} {p.state ? `• ${p.state}` : ''}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-7 px-4 text-center">
                    <Search className="w-6 h-6 text-slate-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-slate-200">No matching projects found</p>
                    <p className="text-xs text-slate-400 mt-1">Try checking for typos or search by ministry, state, or contractor.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Recent Searches Section */
              recentSearches.length > 0 && (
                <div className="p-2 border-b border-slate-800">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Recent Searches</span>
                    <span className="text-[10px] text-slate-500 font-normal">Last 5 queries</span>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(`/projects?search=${encodeURIComponent(term)}`);
                          setSearchFocused(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#14233C] cursor-pointer transition-colors text-xs text-slate-300 font-medium"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-200 text-xs">{term}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-750"
                          title="Remove from history"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Quick Navigation Suggestions */}
            <div className="p-2.5">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Suggested Categorical Searches
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { label: 'High Risk Projects', path: '/radar', icon: AlertTriangle, color: 'text-rose-400' },
                  { label: 'MoRTH Highways', path: '/projects?ministry=Ministry%20of%20Road%20Transport%20%26%20Highways', icon: Landmark, color: 'text-blue-400' },
                  { label: 'Railways Corridors', path: '/projects?ministry=Ministry%20of%20Railways', icon: Landmark, color: 'text-amber-400' },
                  { label: 'National GIS Map', path: '/map', icon: MapPin, color: 'text-emerald-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setSearchFocused(false);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#14233C] cursor-pointer transition-colors text-xs text-slate-200 font-medium"
                    >
                      <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Date & Time Telemetry Display ────────────────────── */}
      <div className="hidden xl:flex flex-col items-end px-3.5 py-1.5 bg-[#0C172C]/90 border border-[#1A2E4E] rounded-xl text-right shrink-0 shadow-inner">
        <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Last Updated: <strong className="text-white font-semibold">{formatISTDateTime(lastUpdatedTime)}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{getRelativeTimeStr()}</span>
        </div>
      </div>

      {/* ── Right Controls: Notification Center + User Pill ──────── */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Notification Center Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            title="User Activity Notifications"
            className="relative w-9 h-9 rounded-full bg-[#0D182E] border border-[#1A2E4E] flex items-center justify-center text-slate-300 hover:text-blue-400 transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-[#08101E] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notification Center Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0E1B33] border border-[#1A2E4E] shadow-2xl p-3 z-50 animate-in fade-in space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-[#152542] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    notifFilter === 'unread'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-[#152542] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 pr-1">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={(e) => handleMarkSingleRead(n.id, e)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                        n.read
                          ? 'bg-[#091326]/60 border-slate-800/60 opacity-75 hover:opacity-100'
                          : 'bg-[#122240] border-blue-500/30 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
                            {n.category}
                          </span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 truncate">{n.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {n.description}
                        </div>
                      </div>

                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No {notifFilter === 'unread' ? 'unread' : ''} notifications
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  View All Activity Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching Reference (HR - Harshitha Raj, Authorized Officer) */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#0D182E] border border-[#1A2E4E] hover:bg-[#14233C] cursor-pointer transition-all shadow-2xs select-none"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover shadow-xs border border-blue-500"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 leading-none truncate max-w-[120px]">
                {displayRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* User Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0E1B33] border border-[#1A2E4E] shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2.5 border-b border-slate-800">
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">harshitha.raj@infralytix.gov.in</div>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {displayRole}
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-[#152542] rounded-xl transition-colors text-left font-medium cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings & Preferences</span>
                </button>

                {/* Premium Animated Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all text-left font-medium cursor-pointer active:scale-[0.98]"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
