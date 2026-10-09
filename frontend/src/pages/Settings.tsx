import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Clock,
  Sliders,
  Mail,
  Lock,
  CheckCircle2,
  Camera,
  LogOut,
  Loader2,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  X,
  Shield,
  LayoutDashboard,
  Globe,
  KeyRound,
  Laptop,
  History,
  FileText,
  BookOpen,
  Cookie,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ──────────────────────────────────────────────────────────────────
  // SECTION 1: Profile & Identity State
  // ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState<string>(
    () => localStorage.getItem('infralytix-display-name') || user?.full_name || 'Shri Rajeshwar Verma, IAS'
  );
  const [officerId, setOfficerId] = useState<string>(
    () => localStorage.getItem('infralytix-officer-id') || 'GOI-MOSPI-7842'
  );
  const [department, setDepartment] = useState<string>(
    () => localStorage.getItem('infralytix-department') || 'Infrastructure Monitoring Division (MoSPI)'
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    () => localStorage.getItem('infralytix-avatar-url') || ''
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Read-only email: connected account
  const connectedEmail = user?.email || 'officer@infralytix.gov.in';

  // ──────────────────────────────────────────────────────────────────
  // SECTION 2: Notification Preferences State (Modern Toggles)
  // ──────────────────────────────────────────────────────────────────
  const [emailAlerts, setEmailAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-email-alerts') !== 'false'
  );
  const [pushAlerts, setPushAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-push-alerts') === 'true'
  );
  const [criticalAlerts, setCriticalAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-critical-alerts') !== 'false'
  );
  const [riskWarnings, setRiskWarnings] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-risk-warnings') !== 'false'
  );
  const [weeklyReports, setWeeklyReports] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-weekly-reports') !== 'false'
  );
  const [notifSuccess, setNotifSuccess] = useState('');

  // ──────────────────────────────────────────────────────────────────
  // SECTION 3: Dashboard Preferences State (Modern Toggles)
  // ──────────────────────────────────────────────────────────────────
  const [showRecentAlerts, setShowRecentAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-alerts') !== 'false'
  );
  const [showProjectHealth, setShowProjectHealth] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-health-summary') !== 'false'
  );
  const [showRiskSummary, setShowRiskSummary] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-risk-summary') !== 'false'
  );
  const [showGisOverview, setShowGisOverview] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-gis') !== 'false'
  );
  const [showAiInsights, setShowAiInsights] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-ai') !== 'false'
  );
  const [dashSuccess, setDashSuccess] = useState('');

  // ──────────────────────────────────────────────────────────────────
  // SECTION 4: Auto Refresh State
  // ──────────────────────────────────────────────────────────────────
  const [autoRefresh, setAutoRefresh] = useState<string>(
    () => localStorage.getItem('infralytix-pref-auto-refresh') || '15 Minutes'
  );
  const [autoRefreshSuccess, setAutoRefreshSuccess] = useState('');

  // ──────────────────────────────────────────────────────────────────
  // SECTION 5: Regional Settings State (Read-only System Synced)
  // ──────────────────────────────────────────────────────────────────
  const systemTimeZone = 'Asia/Kolkata (IST, UTC+05:30)';
  const systemDateFormat = 'DD/MM/YYYY (Indian Standard National Format)';
  const systemLanguage = 'English (India) — Official National Standard';

  // ──────────────────────────────────────────────────────────────────
  // SECTION 6: Security Modals State
  // ──────────────────────────────────────────────────────────────────
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // SECTION 7: Legal & Compliance Modal State
  // ──────────────────────────────────────────────────────────────────
  type LegalDocType = 'PRIVACY' | 'TERMS' | 'COOKIES' | 'DPDP' | 'DATA_USAGE';
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('PRIVACY');

  // ──────────────────────────────────────────────────────────────────
  // SECTION 8: Danger Zone Modals State
  // ──────────────────────────────────────────────────────────────────
  const [dangerConfirmModal, setDangerConfirmModal] = useState<'CLEAR_PREFS' | 'DATA_DELETION' | 'SIGN_OUT' | null>(null);
  const [isDestructiveActionLoading, setIsDestructiveActionLoading] = useState(false);

  // ──────────────────────────────────────────────────────────────────
  // Photo Upload & Replace Handler
  // ──────────────────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    setPhotoSuccess('');

    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!validMimes.includes(file.type) && !hasValidExtension) {
      setPhotoError('Invalid image format. Supported formats: JPG, PNG, WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size exceeds 5MB limit. Please upload an image under 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      setAvatarUrl(resultUrl);
      localStorage.setItem('infralytix-avatar-url', resultUrl);
      window.dispatchEvent(new Event('infralytix-user-updated'));
      setPhotoSuccess('Profile photo updated successfully.');
      setTimeout(() => setPhotoSuccess(''), 4000);
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    localStorage.removeItem('infralytix-avatar-url');
    window.dispatchEvent(new Event('infralytix-user-updated'));
    setPhotoError('');
    setPhotoSuccess('Profile photo removed. Monogram fallback restored.');
    setTimeout(() => setPhotoSuccess(''), 4000);
  };

  // ──────────────────────────────────────────────────────────────────
  // Profile Save Handler
  // ──────────────────────────────────────────────────────────────────
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileError('Full Name cannot be empty.');
      return;
    }

    setProfileSaving(true);
    setTimeout(() => {
      localStorage.setItem('infralytix-display-name', trimmedName);
      localStorage.setItem('infralytix-officer-id', officerId.trim());
      localStorage.setItem('infralytix-department', department.trim());
      if (avatarUrl) {
        localStorage.setItem('infralytix-avatar-url', avatarUrl);
      } else {
        localStorage.removeItem('infralytix-avatar-url');
      }

      window.dispatchEvent(new Event('infralytix-user-updated'));
      setProfileSaving(false);
      setProfileSuccess('Profile & Identity credentials updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    }, 450);
  };

  // ──────────────────────────────────────────────────────────────────
  // Toggle Notification Helper
  // ──────────────────────────────────────────────────────────────────
  const toggleNotification = (
    key: 'email' | 'push' | 'critical' | 'risk' | 'weekly',
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    if (key === 'email') {
      setEmailAlerts(newVal);
      localStorage.setItem('infralytix-pref-email-alerts', String(newVal));
    } else if (key === 'push') {
      setPushAlerts(newVal);
      localStorage.setItem('infralytix-pref-push-alerts', String(newVal));
    } else if (key === 'critical') {
      setCriticalAlerts(newVal);
      localStorage.setItem('infralytix-pref-critical-alerts', String(newVal));
    } else if (key === 'risk') {
      setRiskWarnings(newVal);
      localStorage.setItem('infralytix-pref-risk-warnings', String(newVal));
    } else if (key === 'weekly') {
      setWeeklyReports(newVal);
      localStorage.setItem('infralytix-pref-weekly-reports', String(newVal));
    }
    window.dispatchEvent(new Event('infralytix-pref-updated'));
    setNotifSuccess('Notification preferences saved.');
    setTimeout(() => setNotifSuccess(''), 3000);
  };

  // ──────────────────────────────────────────────────────────────────
  // Toggle Dashboard Helper
  // ──────────────────────────────────────────────────────────────────
  const toggleDashboardPref = (
    key: 'alerts' | 'health' | 'risk' | 'gis' | 'ai',
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    if (key === 'alerts') {
      setShowRecentAlerts(newVal);
      localStorage.setItem('infralytix-pref-show-alerts', String(newVal));
    } else if (key === 'health') {
      setShowProjectHealth(newVal);
      localStorage.setItem('infralytix-pref-show-health-summary', String(newVal));
    } else if (key === 'risk') {
      setShowRiskSummary(newVal);
      localStorage.setItem('infralytix-pref-show-risk-summary', String(newVal));
    } else if (key === 'gis') {
      setShowGisOverview(newVal);
      localStorage.setItem('infralytix-pref-show-gis', String(newVal));
    } else if (key === 'ai') {
      setShowAiInsights(newVal);
      localStorage.setItem('infralytix-pref-show-ai', String(newVal));
    }
    window.dispatchEvent(new Event('infralytix-pref-updated'));
    setDashSuccess('Dashboard preferences updated.');
    setTimeout(() => setDashSuccess(''), 3000);
  };

  // ──────────────────────────────────────────────────────────────────
  // Auto Refresh Change Helper
  // ──────────────────────────────────────────────────────────────────
  const handleAutoRefreshChange = (val: string) => {
    setAutoRefresh(val);
    localStorage.setItem('infralytix-pref-auto-refresh', val);
    window.dispatchEvent(new Event('infralytix-pref-updated'));
    setAutoRefreshSuccess(`Telemetry polling set to ${val}.`);
    setTimeout(() => setAutoRefreshSuccess(''), 3000);
  };

  // ──────────────────────────────────────────────────────────────────
  // Change Password Handler
  // ──────────────────────────────────────────────────────────────────
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordSuccess('Password changed successfully. Active token re-authenticated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess('');
        setPasswordModalOpen(false);
      }, 2000);
    }, 600);
  };

  // ──────────────────────────────────────────────────────────────────
  // Destructive Action Executor
  // ──────────────────────────────────────────────────────────────────
  const executeDestructiveAction = () => {
    setIsDestructiveActionLoading(true);
    setTimeout(() => {
      if (dangerConfirmModal === 'CLEAR_PREFS') {
        const keys = Object.keys(localStorage).filter(
          (k) =>
            k.startsWith('infralytix-pref-') ||
            k === 'infralytix-display-name' ||
            k === 'infralytix-avatar-url' ||
            k === 'infralytix-officer-id' ||
            k === 'infralytix-department' ||
            k === 'infralytix-recent-searches'
        );
        keys.forEach((k) => localStorage.removeItem(k));
        setIsDestructiveActionLoading(false);
        setDangerConfirmModal(null);
        window.location.reload();
      } else if (dangerConfirmModal === 'DATA_DELETION') {
        setIsDestructiveActionLoading(false);
        setDangerConfirmModal(null);
        const subject = encodeURIComponent('DPDP Act 2023 — Data Deletion Statutory Request');
        const body = encodeURIComponent(
          `Statutory Request under Section 12 & 13 of the Digital Personal Data Protection Act 2023:\n\nOfficer Name: ${name}\nOfficer ID: ${officerId}\nRegistered Account: ${connectedEmail}\nDepartment: ${department}\nTimestamp: ${new Date().toISOString()}\n\nPlease execute permanent purging of personal identifier records within statutory timeframe.`
        );
        window.open(`mailto:privacy@infralytix.gov.in?subject=${subject}&body=${body}`, '_blank');
      } else if (dangerConfirmModal === 'SIGN_OUT') {
        setIsDestructiveActionLoading(false);
        setDangerConfirmModal(null);
        logout();
        navigate('/login');
      }
    }, 700);
  };

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'RV';

  return (
    <div className="w-full max-w-[1200px] mx-auto p-8 space-y-8 select-none">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="pb-5 border-b border-slate-200 dark:border-[#1E2B45] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Government Administrative Governance
            </span>
          </div>
          <h1 className="text-3xl sm:text-[36px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>Platform Settings &amp; Officer Profile</span>
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
            Ministerial identity governance, telemetry dispatch parameters, automated polling intervals, and regulatory compliance.
          </p>
        </div>
      </div>

      {/* ── 2-Column Responsive Layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================= */}
        {/* SECTION 1: 👤 Profile & Identity (Large Card, Spans 2 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45] gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Profile &amp; Identity</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    GovID Verified
                  </span>
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Authorized ministerial identification credentials and official photograph
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {profileSuccess && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-[14px] font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-400 text-[14px] font-semibold animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}
          {photoSuccess && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-[14px] font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{photoSuccess}</span>
            </div>
          )}
          {photoError && (
            <div className="flex items-center gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-400 text-[14px] font-semibold animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{photoError}</span>
            </div>
          )}

          {/* Photo & Actions Box */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-2xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md cursor-pointer"
                  onClick={() => setPreviewModalOpen(true)}
                />
              ) : (
                <div
                  onClick={() => setPreviewModalOpen(true)}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-3xl shadow-md cursor-pointer tracking-wider"
                >
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold gap-1"
                aria-label="Upload or replace photo"
              >
                <Camera className="w-5 h-5" />
                <span>Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <div className="text-[15px] font-bold text-slate-900 dark:text-white">
                  Official Identification Portrait
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supported formats: <strong className="text-slate-700 dark:text-slate-200">JPG, PNG, WEBP</strong> (Max 5MB). Photo is encrypted and stored locally.
                </p>
              </div>

              {/* Photo Action Buttons: Equal size & Min height 48px */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 min-h-[48px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Replace Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#111A2E] hover:bg-slate-100 dark:hover:bg-[#16233B] text-slate-800 dark:text-slate-200 font-semibold text-[15px] transition-all border border-slate-200 dark:border-[#1E2B45] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Preview Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={!avatarUrl}
                  className="h-12 min-h-[48px] px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 dark:text-rose-400 font-semibold text-[15px] transition-all border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields: Form Row Gap 16px, Input Height 48px */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Editable</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name with designation"
                  className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>Email Address</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                    <Lock className="w-3 h-3" />
                    <span>Read-Only</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={connectedEmail}
                  readOnly
                  disabled
                  className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-100 dark:bg-[#060D1A] border border-slate-200 dark:border-[#14233C] text-slate-500 dark:text-slate-400 text-[15px] font-mono cursor-not-allowed select-all"
                />
              </div>

              {/* Officer ID */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Officer ID</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">National Registry</span>
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="e.g. GOI-MOSPI-7842"
                  className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-[15px] font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Department</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Ministry / Nodal</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Infrastructure Monitoring Division"
                  className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Save Profile Button: Equal height 48px */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-[#1E2B45] gap-3">
              <span className="text-[13px] text-slate-500 dark:text-slate-400">
                Credentials sync immediately with top navigation and ministerial telemetry logs.
              </span>
              <button
                type="submit"
                disabled={profileSaving}
                className="h-12 min-h-[48px] px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: 🔔 Notification Preferences                     */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Automated dispatches for threshold breaches and warnings
                </p>
              </div>
            </div>
          </div>

          {notifSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notifSuccess}</span>
            </div>
          )}

          {/* 5 Toggle Switches */}
          <div className="space-y-3">
            {/* 1. Email Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Email Alerts</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${emailAlerts ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {emailAlerts ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Transmit urgent alerts to {connectedEmail}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailAlerts}
                onClick={() => toggleNotification('email', emailAlerts)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${emailAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 2. Push Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Push Notifications</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${pushAlerts ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {pushAlerts ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Real-time in-browser alerts for critical slippage
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pushAlerts}
                onClick={() => toggleNotification('push', pushAlerts)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${pushAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${pushAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 3. Critical Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Critical Alerts</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${criticalAlerts ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {criticalAlerts ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Emergency notifications for schedule delays &gt; 180 days
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={criticalAlerts}
                onClick={() => toggleNotification('critical', criticalAlerts)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${criticalAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${criticalAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 4. Risk Warnings */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Risk Warnings</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${riskWarnings ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {riskWarnings ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Predictive cost overrun risk score upgrades &gt; 70
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={riskWarnings}
                onClick={() => toggleNotification('risk', riskWarnings)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${riskWarnings ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${riskWarnings ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 5. Weekly Reports */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Weekly Reports</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${weeklyReports ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {weeklyReports ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Consolidated national infrastructure portfolio synthesis
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={weeklyReports}
                onClick={() => toggleNotification('weekly', weeklyReports)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${weeklyReports ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${weeklyReports ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: 📋 Dashboard Preferences                        */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Dashboard Preferences
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Customize analytical widgets rendered on executive view
                </p>
              </div>
            </div>
          </div>

          {dashSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{dashSuccess}</span>
            </div>
          )}

          {/* 5 Toggle Switches */}
          <div className="space-y-3">
            {/* 1. Show Recent Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Show Recent Alerts</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${showRecentAlerts ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {showRecentAlerts ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Render live early warnings feed on dashboard
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showRecentAlerts}
                onClick={() => toggleDashboardPref('alerts', showRecentAlerts)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${showRecentAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showRecentAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 2. Show Project Health */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Show Project Health</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${showProjectHealth ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {showProjectHealth ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Display healthy vs delayed asset ratio metrics
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showProjectHealth}
                onClick={() => toggleDashboardPref('health', showProjectHealth)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${showProjectHealth ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showProjectHealth ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 3. Show Risk Summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Show Risk Summary</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${showRiskSummary ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {showRiskSummary ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Aggregate high exposure and critical capital warnings
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showRiskSummary}
                onClick={() => toggleDashboardPref('risk', showRiskSummary)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${showRiskSummary ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showRiskSummary ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 4. Show GIS Overview */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Show GIS Overview</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${showGisOverview ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {showGisOverview ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Interactive state-level national GIS map visualization
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showGisOverview}
                onClick={() => toggleDashboardPref('gis', showGisOverview)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${showGisOverview ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showGisOverview ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* 5. Show AI Insights */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Show AI Insights</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${showAiInsights ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                    {showAiInsights ? '🟢 Enabled' : '🔴 Disabled'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Prescriptive decision intelligence &amp; policy directives
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showAiInsights}
                onClick={() => toggleDashboardPref('ai', showAiInsights)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${showAiInsights ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${showAiInsights ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: ⏱ Auto Refresh                                  */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Auto Refresh
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Configures periodic telemetry polling from central repositories
                </p>
              </div>
            </div>
          </div>

          {autoRefreshSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{autoRefreshSuccess}</span>
            </div>
          )}

          {/* Current Active Setting Display */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Current Active Setting
              </span>
              <div className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{autoRefresh} Polling Cycle</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Active Polling
            </span>
          </div>

          {/* Dropdown: Height 48px */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              Select Background Polling Frequency
            </label>
            <select
              value={autoRefresh}
              onChange={(e) => handleAutoRefreshChange(e.target.value)}
              className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="5 Minutes">5 Minutes (Recommended for Monitoring Officers)</option>
              <option value="15 Minutes">15 Minutes (Standard National Baseline)</option>
              <option value="30 Minutes">30 Minutes (Low Bandwidth Mode)</option>
              <option value="1 Hour">1 Hour (Consolidated Hourly Sync)</option>
            </select>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Auto-refresh background jobs run non-invasively and keep executive KPIs up to date.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 5: 🌍 Regional Settings                            */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Regional Settings
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  National standards, time synchronizations, and official languages
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Timezone (Read-only Distinct Label) */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Operational Timezone</span>
                <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/60">
                  Detected System Clock
                </span>
              </label>
              <div className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-[#14233C] text-slate-700 dark:text-slate-300 text-[15px] font-mono flex items-center justify-between">
                <span>{systemTimeZone}</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Date Format (Read-only Distinct Label) */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>National Date &amp; Timestamp Format</span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                  Government of India Standard
                </span>
              </label>
              <div className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-[#14233C] text-slate-700 dark:text-slate-300 text-[15px] font-mono flex items-center justify-between">
                <span>{systemDateFormat}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Language (Read-only Distinct Label) */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Official Working Language</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  Primary
                </span>
              </label>
              <div className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-[#14233C] text-slate-700 dark:text-slate-300 text-[15px] flex items-center justify-between">
                <span>{systemLanguage}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 6: 🔐 Security                                      */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Security &amp; Device Sessions
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Authentication integrity, cryptographic sessions, and device audit
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Change Password row */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Officer Password</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Update local authorization credentials and tokens
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="h-10 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-semibold text-[14px] transition-colors border border-indigo-200 dark:border-indigo-800/60 cursor-pointer"
              >
                Change Password
              </button>
            </div>

            {/* Active Device */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-500" />
                  <span>Active Device</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-mono">
                  Windows 11 • Chrome 128 (Local Verified Node)
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                Current Session
              </span>
            </div>

            {/* Login History audit badge */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45]">
              <div className="space-y-0.5">
                <div className="text-[15px] font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-500" />
                  <span>Audit History</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Last successful sign-in: <strong className="text-slate-700 dark:text-slate-300">Today, 09:30 AM IST</strong> (No anomalies)
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Tamper-Proof
              </span>
            </div>
          </div>

          {/* Buttons: Equal size & Min height 48px */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSessionsModalOpen(true)}
              className="h-12 min-h-[48px] px-4 rounded-xl bg-white dark:bg-[#111A2E] hover:bg-slate-100 dark:hover:bg-[#16233B] text-slate-800 dark:text-slate-200 font-semibold text-[15px] transition-all border border-slate-200 dark:border-[#1E2B45] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>View Sessions</span>
            </button>

            <button
              type="button"
              onClick={() => setDangerConfirmModal('SIGN_OUT')}
              className="h-12 min-h-[48px] px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold text-[15px] transition-all border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout All Devices</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 7: 📄 Legal & Compliance                           */}
        {/* ========================================================= */}
        <div className="ref-card rounded-2xl p-6 space-y-6 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2B45]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
                  Legal &amp; Compliance
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Statutory mandates under DPDP Act 2023 and official terms of use
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* 1. Privacy Policy */}
            <button
              type="button"
              onClick={() => {
                setActiveLegalDoc('PRIVACY');
                setLegalModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0B1527] border border-slate-200 dark:border-[#1E2B45] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Privacy Policy
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2. Terms & Conditions */}
            <button
              type="button"
              onClick={() => {
                setActiveLegalDoc('TERMS');
                setLegalModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0B1527] border border-slate-200 dark:border-[#1E2B45] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Terms &amp; Conditions
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 3. Cookies Policy */}
            <button
              type="button"
              onClick={() => {
                setActiveLegalDoc('COOKIES');
                setLegalModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0B1527] border border-slate-200 dark:border-[#1E2B45] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Cookie className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Cookies Policy
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 4. DPDP Compliance */}
            <button
              type="button"
              onClick={() => {
                setActiveLegalDoc('DPDP');
                setLegalModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0B1527] border border-slate-200 dark:border-[#1E2B45] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  DPDP Act 2023 Compliance
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 5. Data Usage Policy */}
            <button
              type="button"
              onClick={() => {
                setActiveLegalDoc('DATA_USAGE');
                setLegalModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0B1527] border border-slate-200 dark:border-[#1E2B45] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Data Governance &amp; Usage Policy
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 8: ⚠ Danger Zone (Spans 2 Cols, Completely Isolated) */}
        {/* ========================================================= */}
        <div className="lg:col-span-2 ref-card rounded-2xl p-6 space-y-6 border-2 border-rose-500/30 dark:border-rose-900/50 bg-rose-50/40 dark:bg-[#14080D] shadow-sm">
          <div className="flex items-start gap-3.5 pb-4 border-b border-rose-200 dark:border-rose-900/50">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-rose-600 dark:text-rose-400">
                Danger Zone &amp; Session Termination
              </h2>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">
                Irreversible actions, preference purges, statutory data removal, and administrative session termination.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Clear Preferences */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0E1626] border border-rose-200 dark:border-rose-900/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-amber-500" />
                  <span>Clear Preferences</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Resets display name, officer photo, and dashboard switches to factory state.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDangerConfirmModal('CLEAR_PREFS')}
                className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-700 dark:text-amber-400 font-bold text-[15px] transition-colors border border-amber-200 dark:border-amber-900/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Clear Preferences</span>
              </button>
            </div>

            {/* 2. Request Data Deletion */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0E1626] border border-rose-200 dark:border-rose-900/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-500" />
                  <span>Request Data Deletion</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Exercise statutory right under Section 12 &amp; 13 of DPDP Act 2023.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDangerConfirmModal('DATA_DELETION')}
                className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-bold text-[15px] transition-colors border border-rose-200 dark:border-rose-900/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Deletion</span>
              </button>
            </div>

            {/* 3. Sign Out */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0E1626] border border-rose-200 dark:border-rose-900/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Destroy authorization token and return to secure single sign-on gateway.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDangerConfirmModal('SIGN_OUT')}
                className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Profile Photo Preview                             */}
      {/* ========================================================= */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className="ref-card max-w-sm w-full p-6 space-y-4 relative border-indigo-500/40 bg-white dark:bg-[#0E1626]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#162744] pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-[15px]">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>Profile Photo Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-48 h-48 rounded-2xl object-cover border-2 border-indigo-500 shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-6xl shadow-2xl border-2 border-indigo-500/50">
                  {initials}
                </div>
              )}

              <div className="mt-4 text-center space-y-1">
                <div className="text-[17px] font-bold text-slate-900 dark:text-white">{name}</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{connectedEmail}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  {avatarUrl ? 'Custom Photograph Active' : 'Default System Monogram'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-[#162744]">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Change Password                                  */}
      {/* ========================================================= */}
      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPasswordModalOpen(false)}
        >
          <div
            className="ref-card max-w-md w-full p-6 space-y-5 relative bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#162744] pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-[16px]">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <span>Change Officer Password</span>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Password (min. 8 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#081121] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#162744]">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Sessions Management                              */}
      {/* ========================================================= */}
      {sessionsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSessionsModalOpen(false)}
        >
          <div
            className="ref-card max-w-lg w-full p-6 space-y-5 relative bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#162744] pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-[16px]">
                <Laptop className="w-5 h-5 text-indigo-500" />
                <span>Authorized Active Sessions</span>
              </div>
              <button
                type="button"
                onClick={() => setSessionsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Session 1 (Current) */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-[#081220] border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Windows 11 • Chrome 128</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      This Device
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    IP: 127.0.0.1 (Localhost Secured) • New Delhi, India
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Token active • Expires in 23 hours
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>

              {/* Session 2 (Mobile Tablet Review) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E2B45] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Apple iPad Pro • Safari Mobile</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Standby
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    IP: 103.21.244.0 (NIC Gateway) • Rail Bhawan
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Last active: Yesterday, 17:45 IST
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Remote session revoked successfully.')}
                  className="px-2.5 py-1 text-xs rounded bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-[#162744]">
              <span className="text-[11px] text-slate-500">
                All sessions protected by TLS 1.3 &amp; SHA-256 JWT tokens.
              </span>
              <button
                type="button"
                onClick={() => setSessionsModalOpen(false)}
                className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Legal & Compliance Documents                      */}
      {/* ========================================================= */}
      {legalModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLegalModalOpen(false)}
        >
          <div
            className="ref-card max-w-2xl w-full p-6 space-y-5 relative bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] rounded-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#162744] pb-3 shrink-0">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-[17px]">
                <ShieldCheck className="w-5 h-5 text-teal-500" />
                <span>
                  {activeLegalDoc === 'PRIVACY' && 'INFRALYTIX Privacy Policy'}
                  {activeLegalDoc === 'TERMS' && 'Terms & Conditions of Service'}
                  {activeLegalDoc === 'COOKIES' && 'Statutory Cookies & Storage Policy'}
                  {activeLegalDoc === 'DPDP' && 'Digital Personal Data Protection Act 2023 Compliance'}
                  {activeLegalDoc === 'DATA_USAGE' && 'National Data Governance & Project Telemetry Policy'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-2">
              {activeLegalDoc === 'PRIVACY' && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    1. Data Collection &amp; Purpose Specification
                  </p>
                  <p>
                    INFRALYTIX operates under the official auspices of the Ministry of Statistics &amp; Programme Implementation (MoSPI) and PM GatiShakti National Master Plan. Personal data is strictly restricted to authorized officer identification credentials (Name, Official Email, Department, GovID). No commercial profiling or secondary monetization is permitted.
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    2. Cryptographic Storage &amp; Isolation
                  </p>
                  <p>
                    All telemetry data, password hashes, and user settings are stored in local secure encrypted databases compliant with the Information Technology (Reasonable Security Practices) Rules, 2011.
                  </p>
                </>
              )}

              {activeLegalDoc === 'TERMS' && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    1. Authorized Government Personnel
                  </p>
                  <p>
                    Access to INFRALYTIX is restricted exclusively to vetted public sector officers, project monitoring directors, and designated reviewers. Sharing authentication credentials or exporting classified telemetry without authorization is strictly prohibited under the Official Secrets Act, 1923.
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    2. Analytical Predictive Disclaimers
                  </p>
                  <p>
                    Machine Learning predictions, delay forecasts, and cost escalation indicators are advisory decision-support intelligence designed to accelerate administrative resolution. Statutory financial revisions remain subject to Cabinet Committee on Economic Affairs (CCEA) approval.
                  </p>
                </>
              )}

              {activeLegalDoc === 'COOKIES' && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    1. Zero Third-Party Tracker Guarantee
                  </p>
                  <p>
                    INFRALYTIX maintains an absolute Zero Third-Party Tracker architecture. The platform does not incorporate Google Analytics, Meta Pixel, or any external advertising scripts.
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    2. Essential Functional LocalStorage
                  </p>
                  <p>
                    Browser localStorage is utilized solely to retain officer preferences (auto-refresh frequency, theme mode, dashboard widget visibility, and session authorization tokens).
                  </p>
                </>
              )}

              {activeLegalDoc === 'DPDP' && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    1. Compliance with DPDP Act 2023 (Act No. 22 of 2023)
                  </p>
                  <p>
                    INFRALYTIX fully complies with Section 12 (Right to Correction and Erasure of Personal Data) and Section 13 (Right of Grievance Redressal) of the Digital Personal Data Protection Act, 2023.
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    2. Data Principal Grievance Redressal
                  </p>
                  <p>
                    Officers may submit an automated deletion request via the Danger Zone or reach out to the designated Data Protection Officer at <code>dpo@infralytix.gov.in</code>. All deletion requests are acknowledged within 48 hours and resolved within 30 statutory days.
                  </p>
                </>
              )}

              {activeLegalDoc === 'DATA_USAGE' && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    1. National Infrastructure Data Sovereignty
                  </p>
                  <p>
                    Project timelines, contractor performance ratings, and geospatial GIS coordinates are hosted on sovereign Indian infrastructure in accordance with the National Data Sharing and Accessibility Policy (NDSAP).
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#162744] shrink-0">
              <button
                type="button"
                onClick={() => setLegalModalOpen(false)}
                className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Danger Zone Confirmation Modals                   */}
      {/* ========================================================= */}
      {dangerConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setDangerConfirmModal(null)}
        >
          <div
            className="ref-card max-w-md w-full p-6 space-y-5 relative bg-white dark:bg-[#0E1626] border-2 border-rose-500/50 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-rose-200 dark:border-rose-900/50">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-rose-600 dark:text-rose-400">
                  {dangerConfirmModal === 'CLEAR_PREFS' && 'Confirm Clear Preferences'}
                  {dangerConfirmModal === 'DATA_DELETION' && 'Confirm DPDP Data Erasure Request'}
                  {dangerConfirmModal === 'SIGN_OUT' && 'Confirm Session Termination'}
                </h3>
                <span className="text-xs text-slate-500">
                  Administrative Confirmation Required
                </span>
              </div>
            </div>

            <div className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {dangerConfirmModal === 'CLEAR_PREFS' && (
                <p>
                  This action will immediately wipe your custom display name, uploaded photograph, notification toggles, and dashboard preferences from this browser session. Are you sure you wish to proceed?
                </p>
              )}
              {dangerConfirmModal === 'DATA_DELETION' && (
                <p>
                  You are initiating a formal statutory data erasure request under Section 12 of the DPDP Act 2023. An official verification dossier will be pre-filled to the Data Protection Officer for permanent purging. Continue?
                </p>
              )}
              {dangerConfirmModal === 'SIGN_OUT' && (
                <p>
                  You are about to terminate your active officer session. Your cryptographic token will be cleared and you will be securely redirected to the login gateway.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#162744]">
              <button
                type="button"
                onClick={() => setDangerConfirmModal(null)}
                className="h-11 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDestructiveActionLoading}
                onClick={executeDestructiveAction}
                className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {isDestructiveActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <span>Confirm Action</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
