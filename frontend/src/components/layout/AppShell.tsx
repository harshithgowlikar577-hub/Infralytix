import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastProvider } from '../common/ToastContext';

export default function AppShell() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#070E1C] text-slate-100 flex flex-col transition-colors duration-200 overflow-hidden">
        {/* ── Top Header spanning full width matching reference ───── */}
        <TopBar />

        {/* ── Below TopBar: Sidebar on Left + Content on Right ────── */}
        <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
          {/* Fixed Viewport-Fit Left Sidebar */}
          <Sidebar />

          {/* Main Scrollable Canvas */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
