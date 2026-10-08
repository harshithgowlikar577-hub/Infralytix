import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Settings as SettingsIcon, User, Bell, Clock,
  Sliders, Mail, Lock, CheckCircle2, Camera, LogOut, Loader2,
  RefreshCw, Check, AlertCircle, Eye, X, Shield, LayoutDashboard
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile Section State ──────────────────────────────────────────
  const [name, setName] = useState(
    () => localStorage.getItem('infralytix-display-name') || user?.full_name || 'Harshitha Raj'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('infralytix-avatar-url') || ''
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Photo modal preview & validation error
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Read-only email: connected Gmail account (NEVER editable)
  const connectedEmail = user?.email || 'harshitha.raj@gmail.com';

  // ── General Settings State ─────────────────────────────────────────
  // 1. Notification Preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-notifications-enabled') !== 'false'
  );
  const [emailAlerts, setEmailAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-email-alerts') !== 'false'
  );
  const [pushAlerts, setPushAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-push-alerts') === 'true'
  );

  // 2. Dashboard Preferences
  const [defaultLandingPage, setDefaultLandingPage] = useState<string>(
    () => localStorage.getItem('infralytix-pref-landing-page') || '/dashboard'
  );
  const [showRecentAlerts, setShowRecentAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-alerts') !== 'false'
  );
  const [showRiskSummary, setShowRiskSummary] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-risk-summary') !== 'false'
  );
  const [showHealthSummary, setShowHealthSummary] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-health-summary') !== 'false'
  );

  // 3. Auto Refresh (Options: Off, 1 Minute, 5 Minutes, 15 Minutes, 30 Minutes)
  const [autoRefresh, setAutoRefresh] = useState<string>(
    () => localStorage.getItem('infralytix-pref-auto-refresh') || '15 Minutes'
  );

  // 4. Time Zone: Detected system time zone (Read-Only as backend does not have tz API)
  const [systemTimeZone] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return `${tz} (IST, UTC+05:30)`;
    } catch {
      return 'Asia/Kolkata (IST, UTC+05:30)';
    }
  });

  // General Settings save feedback
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ── Animated Sign Out State ────────────────────────────────────────
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutStep, setSignOutStep] = useState<'idle' | 'loading' | 'done'>('idle');

  // ── Photo Management Handlers ──────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    setPhotoSuccess('');

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // File format validation: JPG, PNG, WEBP
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!validMimes.includes(file.type) && !hasValidExtension) {
      setPhotoError('Invalid format. Only JPG, PNG, and WEBP files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Max size validation: 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError('File size exceeds the 5MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read and save photo
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
      setPhotoError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected if replaced
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    localStorage.removeItem('infralytix-avatar-url');
    window.dispatchEvent(new Event('infralytix-user-updated'));
    setPhotoError('');
    setPhotoSuccess('Profile photo removed.');
    setTimeout(() => setPhotoSuccess(''), 4000);
  };

  // ── Profile Save Handler ───────────────────────────────────────────
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

    // Realistic saving delay with feedback
    setTimeout(() => {
      localStorage.setItem('infralytix-display-name', trimmedName);
      if (avatarUrl) {
        localStorage.setItem('infralytix-avatar-url', avatarUrl);
      } else {
        localStorage.removeItem('infralytix-avatar-url');
      }

      window.dispatchEvent(new Event('infralytix-user-updated'));
      setProfileSaving(false);
      setProfileSuccess('Settings updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    }, 450);
  };

  // ── General Settings Save Handler ──────────────────────────────────
  const handleSaveGeneral = () => {
    setGeneralError('');
    setGeneralSuccess('');
    setGeneralSaving(true);

    setTimeout(() => {
      // 1. Notification preferences
      localStorage.setItem('infralytix-pref-notifications-enabled', String(notificationsEnabled));
      localStorage.setItem('infralytix-pref-email-alerts', String(emailAlerts));
      localStorage.setItem('infralytix-pref-push-alerts', String(pushAlerts));

      // 2. Dashboard preferences
      localStorage.setItem('infralytix-pref-landing-page', defaultLandingPage);
      localStorage.setItem('infralytix-pref-show-alerts', String(showRecentAlerts));
      localStorage.setItem('infralytix-pref-show-risk-summary', String(showRiskSummary));
      localStorage.setItem('infralytix-pref-show-health-summary', String(showHealthSummary));

      // 3. Auto Refresh
      localStorage.setItem('infralytix-pref-auto-refresh', autoRefresh);

      // Dispatch global preferences update event
      window.dispatchEvent(new Event('infralytix-pref-updated'));

      setGeneralSaving(false);
      setGeneralSuccess('Settings updated successfully.');
      setTimeout(() => setGeneralSuccess(''), 4000);
    }, 450);
  };

  // ── Animated Sign Out ──────────────────────────────────────────────
  const handleAnimatedSignOut = () => {
    setSignOutStep('loading');
    setIsSigningOut(true);

    setTimeout(() => {
      setSignOutStep('done');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 600);
    }, 1100);
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HR';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 select-none">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="pb-4 border-b border-[#14233C]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Security & Governance</span>
          <span>/</span>
          <span className="text-slate-200">System Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-blue-400" />
          <span>Platform Settings & Officer Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage officer identification credentials, telemetry auto-refresh parameters, and dashboard preferences.
        </p>
      </div>

      {/* ── SECTION 1: PROFILE SECTION ───────────────────────────── */}
      <div className="ref-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#162744]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Officer Profile
              </h2>
              <p className="text-[11px] text-slate-400">
                Authorized identity credentials and biometric visual representation
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            GovID Verified
          </span>
        </div>

        {/* Profile Success / Error Alerts */}
        {profileSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Photo Management Feedback */}
        {photoSuccess && (
          <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{photoSuccess}</span>
          </div>
        )}
        {photoError && (
          <div className="flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        {/* Photo Management Box */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-2xl bg-[#081121] border border-[#14233C]">
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md cursor-pointer"
                onClick={() => setPreviewModalOpen(true)}
              />
            ) : (
              <div
                onClick={() => setPreviewModalOpen(true)}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-md cursor-pointer"
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-semibold gap-1"
            >
              <Camera className="w-5 h-5" />
              <span>Replace</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2 flex-1">
            <div>
              <div className="text-xs font-bold text-white">Profile Photograph</div>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Upload, replace, preview, or remove your official portrait. Supported formats: <strong className="text-slate-300">JPG, PNG, WEBP</strong> (Max 5MB).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* Upload / Replace */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-blue-500/30 flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Replace Photo' : 'Upload Photo'}</span>
              </button>

              {/* Preview Photo */}
              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Preview Photo</span>
              </button>

              {/* Remove Photo */}
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-colors cursor-pointer border border-rose-500/20 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Editable: Full Name */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Editable</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#081121] border border-[#162744] text-white text-xs focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Read Only: Connected Gmail Account */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Connected Account</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Read-Only</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={connectedEmail}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#060D1A] border border-[#14233C] text-slate-400 text-xs font-mono font-medium cursor-not-allowed opacity-90 select-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Connected account is permanently bound to single sign-on authentication and cannot be edited.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#162744]">
            <span className="text-[11px] text-slate-500">
              Changes reflect immediately across Top Navigation and command sessions.
            </span>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
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

      {/* ── SECTION 2: GENERAL SETTINGS ───────────────────────────── */}
      <div className="ref-card p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#162744]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                General Settings
              </h2>
              <p className="text-[11px] text-slate-400">
                Operational notification dispatch, dashboard layout preferences, and telemetry auto-refresh
              </p>
            </div>
          </div>
        </div>

        {/* General Success / Error Alerts */}
        {generalSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{generalSuccess}</span>
          </div>
        )}
        {generalError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* 1. Notification Preferences */}
        <div className="space-y-3 pb-5 border-b border-[#162744]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Bell className="w-4 h-4 text-blue-400" />
              <span>1. Notification Preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
              </span>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Control automated notifications and alert delivery channels for mission-critical project anomalies.
          </p>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-opacity ${notificationsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {/* Email Alerts */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#081121] border border-[#14233C] cursor-pointer hover:border-blue-500/40 transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                disabled={!notificationsEnabled}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email Alerts</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Dispatch priority alerts to {connectedEmail}
                </div>
              </div>
            </label>

            {/* Push Alerts */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#081121] border border-[#14233C] cursor-pointer hover:border-blue-500/40 transition-colors">
              <input
                type="checkbox"
                checked={pushAlerts}
                disabled={!notificationsEnabled}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Push Alerts</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Real-time browser notifications for schedule breaches
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Dashboard Preferences */}
        <div className="space-y-3 pb-5 border-b border-[#162744]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>2. Dashboard Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Landing Page */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Default Landing Page
              </label>
              <select
                value={defaultLandingPage}
                onChange={(e) => setDefaultLandingPage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#081121] border border-[#162744] text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="/dashboard">Command Center Dashboard (/dashboard)</option>
                <option value="/projects">Project Portfolio (/projects)</option>
                <option value="/radar">Risk Monitor (/radar)</option>
                <option value="/early-warnings">Early Warnings (/early-warnings)</option>
                <option value="/health">Project Health Center (/health)</option>
              </select>
              <p className="text-[10px] text-slate-500">
                The primary view rendered upon opening the application or root URL.
              </p>
            </div>

            {/* Show Recent Alerts */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#081121] border border-[#14233C] cursor-pointer hover:border-purple-500/40 transition-colors">
              <input
                type="checkbox"
                checked={showRecentAlerts}
                onChange={(e) => setShowRecentAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-xs text-white">Show Recent Alerts</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Render the live project alert feed on the Command Center
                </div>
              </div>
            </label>

            {/* Show Risk Summary */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#081121] border border-[#14233C] cursor-pointer hover:border-purple-500/40 transition-colors">
              <input
                type="checkbox"
                checked={showRiskSummary}
                onChange={(e) => setShowRiskSummary(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-xs text-white">Show Risk Summary</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Display quarterly risk insights and cost overrun indicators
                </div>
              </div>
            </label>

            {/* Show Project Health Summary */}
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#081121] border border-[#14233C] cursor-pointer hover:border-purple-500/40 transition-colors sm:col-span-2">
              <input
                type="checkbox"
                checked={showHealthSummary}
                onChange={(e) => setShowHealthSummary(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <div className="font-semibold text-xs text-white">Show Project Health Summary</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Display healthy project distribution and performance trends
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Auto Refresh & 4. Time Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-2">
          {/* 3. Auto Refresh */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Telemetry Auto Refresh</span>
            </label>
            <select
              value={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#081121] border border-[#162744] text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Off">Off</option>
              <option value="1 Minute">1 Minute</option>
              <option value="5 Minutes">5 Minutes</option>
              <option value="15 Minutes">15 Minutes</option>
              <option value="30 Minutes">30 Minutes</option>
            </select>
            <p className="text-[10px] text-slate-500">
              Configures periodic automatic polling of live project analytics.
            </p>
          </div>

          {/* 4. Time Zone (Read-Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>4. Operational Time Zone</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                <Lock className="w-2.5 h-2.5" />
                <span>Read-Only</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={systemTimeZone}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060D1A] border border-[#14233C] text-slate-400 text-xs font-mono cursor-not-allowed opacity-90"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Synchronized with the client system clock. Modifiable only when server-level override is active.
            </p>
          </div>
        </div>

        {/* Save General Settings Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#162744]">
          <span className="text-[11px] text-slate-500">
            Preferences persist locally across all command center sessions.
          </span>
          <button
            type="button"
            onClick={handleSaveGeneral}
            disabled={generalSaving}
            className="px-5 py-2.5 rounded-xl bg-[#152542] hover:bg-[#1C3258] disabled:bg-slate-800 disabled:cursor-wait text-white text-xs font-bold transition-all border border-[#1E3A66] flex items-center gap-2 cursor-pointer shadow-md"
          >
            {generalSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save General Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── SECTION 3: SESSION TERMINATION (SIGN OUT) ─────────────── */}
      <div className="ref-card p-6 border-rose-900/30 bg-[#0E121E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Session Termination</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gracefully clear authorization tokens and return to the secure single sign-on gateway.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnimatedSignOut}
            disabled={isSigningOut}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg ${
              signOutStep === 'loading'
                ? 'bg-rose-600/80 text-white cursor-wait scale-98'
                : signOutStep === 'done'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white hover:shadow-rose-950/50 hover:scale-[1.02]'
            }`}
          >
            {signOutStep === 'loading' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Terminating Session...</span>
              </>
            )}
            {signOutStep === 'done' && (
              <>
                <Check className="w-4 h-4" />
                <span>Signed Out</span>
              </>
            )}
            {signOutStep === 'idle' && (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out from INFRALYTIX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── PHOTO PREVIEW MODAL ───────────────────────────────────── */}
      {previewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className="ref-card max-w-sm w-full p-6 space-y-4 relative border-blue-500/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#162744] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Profile Photo Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-48 h-48 rounded-2xl object-cover border-2 border-blue-500 shadow-2xl"
                />
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-6xl shadow-2xl border-2 border-blue-500/50">
                  {initials}
                </div>
              )}

              <div className="mt-4 text-center space-y-1">
                <div className="text-base font-bold text-white">{name}</div>
                <div className="text-xs font-mono text-slate-400">{connectedEmail}</div>
                <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                  {avatarUrl ? 'Custom Photograph Active' : 'Default System Monogram'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#162744]">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
