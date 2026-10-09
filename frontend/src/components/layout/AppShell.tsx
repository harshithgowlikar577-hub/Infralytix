import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastProvider } from '../common/ToastContext';
import { SidebarProvider, useSidebar } from './SidebarContext';
import ComplianceFooter from '../common/ComplianceFooter';

export default function AppShell() {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AppShellInner />
      </SidebarProvider>
    </ToastProvider>
  );
}

function AppShellInner() {
  return (
    <>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[1001] focus:px-4 focus:py-2 focus:rounded-md focus:bg-indigo-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* ── TRUE IN-FLOW TWO-PANEL FLEXBOX ARCHITECTURE ─────────────────── */}
      <div className="flex flex-row h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#070E1C] text-slate-900 dark:text-slate-100 transition-colors duration-200 select-none">
        {/* LEFT PANEL: In-flow Desktop Sidebar / Overlay Mobile Drawer */}
        <Sidebar />

        {/* RIGHT PANEL: Main Content Area (occupies 100% of remaining viewport width) */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Top Navigation Bar inside Right Panel */}
          <TopBar />

          {/* Main Content Area (independently scrollable) */}
          <main
            id="main-content"
            role="main"
            className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col justify-between scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800"
          >
            {/* Global Content Container: max-w: 1600px; margin: 0 auto; px: 4/6/8 */}
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 space-y-8 flex-1 min-w-0">
              <Outlet />
            </div>

            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <ComplianceFooter />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


