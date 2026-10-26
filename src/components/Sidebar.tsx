import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  BedDouble, 
  ShieldCheck, 
  Activity, 
  Mic, 
  Truck, 
  BarChart3, 
  Server, 
  Settings, 
  Plus, 
  LogOut, 
  X,
  Stethoscope
} from 'lucide-react';
import { AuthUser } from '../types/auth';

export type DashboardTab = 
  | 'overview' 
  | 'triage' 
  | 'beds' 
  | 'clinician' 
  | 'risk' 
  | 'speech' 
  | 'transfers' 
  | 'analytics' 
  | 'monitoring' 
  | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  criticalCount: number;
  onOpenNewPatient: () => void;
  currentUser?: AuthUser | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  onOpenNewPatient,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const navSections = [
    {
      heading: 'Clinical Operations',
      items: [
        { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
        { id: 'triage' as DashboardTab, label: 'Emergency Triage', icon: AlertCircle, badge: criticalCount > 0 ? criticalCount : undefined },
        { id: 'beds' as DashboardTab, label: 'Bed Management', icon: BedDouble },
        { id: 'clinician' as DashboardTab, label: 'Clinician Desk', icon: Stethoscope },
      ]
    },
    {
      heading: 'Clinical Tools',
      items: [
        { id: 'risk' as DashboardTab, label: 'Vital Monitoring & Risk', icon: Activity },
        { id: 'speech' as DashboardTab, label: 'Clinical Documentation', icon: Mic },
        { id: 'transfers' as DashboardTab, label: 'Hospital Transfers', icon: Truck },
      ]
    },
    {
      heading: 'Administration',
      items: [
        { id: 'analytics' as DashboardTab, label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'monitoring' as DashboardTab, label: 'System Monitoring', icon: Server },
        { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
      ]
    }
  ];

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 select-none ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top: Brand Header & Emergency Intake Button */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base font-sans">
                  Pulse<span className="text-cyan-600">AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-mono -mt-0.5">
                  Hospital Command
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              onOpenNewPatient();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Emergency Intake</span>
          </button>
        </div>

        {/* Center: Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map(section => (
            <div key={section.heading} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {section.heading}
              </div>

              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-cyan-50 text-cyan-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-mono font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Staff Profile & Functional Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-800 text-xs truncate">
                  {currentUser.displayName || 'Authorized Clinician'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.role || 'Staff Member'}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout Session</span>
          </button>
        </div>

      </aside>
    </>
  );
};
