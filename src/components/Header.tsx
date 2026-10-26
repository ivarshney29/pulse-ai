import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  X
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { DashboardTab } from './Sidebar';
import { HospitalAlert } from '../types/hospital';

interface HeaderProps {
  activeTab: DashboardTab;
  onOpenMobileMenu: () => void;
  currentUser?: AuthUser | null;
  onLogout: () => void;
  onGoToLanding?: () => void;
  alerts: HospitalAlert[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  currentUser,
  onLogout,
  onGoToLanding,
  alerts
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getPageTitle = (tab: DashboardTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'overview':
        return { title: 'Hospital Command Overview', subtitle: 'Real-time department census and bed capacity' };
      case 'triage':
        return { title: 'Emergency Triage Queue', subtitle: 'Patient prioritization and acute severity assessment' };
      case 'beds':
        return { title: 'Bed Management & Capacity', subtitle: 'Real-time ward allocation and turnover coordination' };
      case 'clinician':
        return { title: 'Clinician Desk & Patient Chart', subtitle: 'EHR management, triage overrides, and clinical orders' };
      case 'risk':
        return { title: 'Vital Monitoring & Risk Assessment', subtitle: 'Bedside vital signs trends and early deterioration warnings' };
      case 'speech':
        return { title: 'Clinical Documentation Station', subtitle: 'Voice dictation and automated medical entity extraction' };
      case 'transfers':
        return { title: 'Inter-Hospital Emergency Transfers', subtitle: 'Regional partner bed coordination and transport dispatch' };
      case 'analytics':
        return { title: 'Operational Reports & Analytics', subtitle: 'Census metrics, throughput analytics, and CSV data export' };
      case 'monitoring':
        return { title: 'System Infrastructure Monitoring', subtitle: 'Subsystem health, atomic booking guards, and database status' };
      case 'settings':
        return { title: 'Facility & Station Settings', subtitle: 'Terminal parameters, alert preferences, and security' };
    }
  };

  const { title, subtitle } = getPageTitle(activeTab);
  const unreadAlertsCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between select-none">
      
      {/* Left Zone: Hamburger + Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 font-normal leading-none mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Zone: Operational Status + Notifications + Profile + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Public Site Link */}
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="View Public Landing Page"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        )}

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="View Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">
                  Operational Alerts & Notifications ({alerts.length})
                </span>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                {alerts.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No active notifications.</p>
                ) : (
                  alerts.slice(0, 6).map(a => (
                    <div key={a.id} className="pt-2 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{a.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{a.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{a.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile Capsule (Desktop) */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                {currentUser.displayName || 'Staff Clinician'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                {currentUser.role || 'Attending'}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button (Always functional and visible) */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-2xs hover:shadow-xs whitespace-nowrap"
          title="Sign out of clinical session"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </header>
  );
};
