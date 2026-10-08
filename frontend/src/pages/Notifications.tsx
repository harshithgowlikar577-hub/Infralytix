import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCheck, AlertCircle, AlertTriangle, Info,
  Trash2, ExternalLink, RefreshCw, CheckCircle2, Filter, Search
} from 'lucide-react';
import SearchBar from '../components/ui/SearchBar';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDismissNotification
} from '../hooks/useAPI';
import { SeverityBadge } from '../components/ui/Badge';

export default function Notifications() {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [notifSearch, setNotifSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const queryParams = {
    page,
    limit: 20,
    unread_only: unreadOnly || undefined,
    warning_level: filterLevel !== 'all' ? filterLevel : undefined,
  };

  const { data, isLoading, refetch, isFetching } = useNotifications(queryParams);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const dismissMutation = useDismissNotification();

  const notifications = data?.notifications || [];
  const filteredNotifications = notifications.filter((n: any) => {
    if (!notifSearch.trim()) return true;
    const q = notifSearch.toLowerCase();
    return (
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || '').toLowerCase().includes(q) ||
      (n.project_id || '').toLowerCase().includes(q) ||
      (n.warning_type || '').toLowerCase().includes(q)
    );
  });
  const totalCount = data?.total_count || 0;
  const unreadCount = data?.unread_count || 0;
  const totalPages = Math.ceil(totalCount / 20) || 1;

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3">
            <Bell className="w-3.5 h-3.5" />
            <span>National Infrastructure Command Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Notification & Alert Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse tracking-wide">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time critical threshold breaches, early warning triggers, AI anomaly alerts, and executive directives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{markAllReadMutation.isPending ? 'Marking...' : 'Mark All as Read'}</span>
          </button>
        </div>
      </div>

      {/* 3-Question Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs backdrop-blur-md shadow-sm">
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Status</span>
          <span className="text-slate-300 leading-relaxed">Dispatch log active with <strong className="text-blue-400 font-semibold">{unreadCount} unread briefings</strong>.</span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Risk</span>
          <span className="text-slate-300 leading-relaxed">Critical alerts require immediate acknowledgment and inter-ministerial routing.</span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Action</span>
          <span className="text-slate-300 leading-relaxed">Use 'Mark All Read' after reviewing or filter by Critical severity to prioritize.</span>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Total Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Dispatched to Officer</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Unread Attention</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">{unreadCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires Acknowledgment</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Filter Severity</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-amber-300 capitalize">{filterLevel}</p>
          <p className="text-[11px] text-slate-500 mt-1">{unreadOnly ? 'Unread Only Active' : 'All States Visible'}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Dispatch Protocol</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-400">P1-AUTOMATED</p>
          <p className="text-[11px] text-slate-500 mt-1">Zero Human Latency</p>
        </div>
      </div>

      {/* Filter Tabs — Sticky top-right, Issue 13 */}
      <div className="sticky top-0 z-20 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#050D1A]/95 backdrop-blur-md border border-slate-800/90 p-3 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Severity</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'All', color: 'bg-blue-600 text-white' },
              { key: 'Critical', label: '🔴 Critical', color: 'bg-rose-600/90 text-white' },
              { key: 'High', label: '🟠 High', color: 'bg-orange-600/90 text-white' },
              { key: 'Medium', label: '🟡 Medium', color: 'bg-amber-600/90 text-white' },
              { key: 'Low', label: '🟢 Low', color: 'bg-emerald-700/90 text-white' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilterLevel(tab.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterLevel === tab.key
                    ? tab.color + ' border-transparent shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-700/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none px-3 py-1.5 rounded-xl hover:bg-slate-800/60 border border-slate-700/80 transition-colors">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40"
            />
            <span>Unread Only</span>
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl">
        <SearchBar
          value={notifSearch}
          onChange={setNotifSearch}
          placeholder="Search notifications..."
          ariaLabel="Search notifications"
          autoComplete={false}
          emptyText="No matching notifications found"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card p-4 rounded-xl border border-slate-800/80 animate-pulse space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">No matching notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No alerts or directives matched your search query or selected severity filters.
            </p>
            {(filterLevel !== 'all' || unreadOnly || notifSearch) && (
              <button
                onClick={() => { setFilterLevel('all'); setUnreadOnly(false); setNotifSearch(''); setPage(1); }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
              >
                Reset all filters &amp; search
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((n: {
            id: string;
            title: string;
            message: string;
            warning_level: string;
            project_id?: string;
            is_read: boolean;
            action_url?: string;
            created_at?: string;
          }) => {
            const isCritical = n.warning_level === 'Critical';
            const isWarning = n.warning_level === 'Warning';

            return (
              <div
                key={n.id}
                className={`glass-card p-4 rounded-2xl border transition-all duration-200 shadow-sm ${
                  n.is_read
                    ? 'border-slate-800/70 bg-slate-900/40 opacity-75 hover:opacity-100'
                    : isCritical
                    ? 'border-rose-500/40 bg-rose-950/15 shadow-lg shadow-rose-950/20'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-950/15'
                    : 'border-blue-500/30 bg-blue-950/15'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Indicator Icon & Body */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCritical ? (
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-sm">
                          <AlertCircle className="w-4 h-4 animate-pulse" />
                        </div>
                      ) : isWarning ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge level={n.warning_level || 'Info'} />
                        <h2 className={`text-sm font-semibold truncate ${n.is_read ? 'text-slate-300' : 'text-white font-bold'}`}>
                          {n.title}
                        </h2>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 animate-ping" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed break-words">
                        {n.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        {n.project_id && (
                          <Link
                            to={`/projects/${n.project_id}`}
                            className="text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 hover:underline"
                          >
                            <span>Ref: {n.project_id}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {n.created_at && (
                          <span>
                            {new Date(n.created_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.action_url && (
                      <Link
                        to={n.action_url}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        title="Mark as Read"
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(n.id)}
                      title="Dismiss Alert"
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>
            Showing Page {page} of {totalPages} ({totalCount} total alerts)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 border border-slate-700/80 transition-all font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 border border-slate-700/80 transition-all font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
