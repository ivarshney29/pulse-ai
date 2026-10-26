import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  User, 
  Bell, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Check, 
  Save 
} from 'lucide-react';
import { AuthUser } from '../types/auth';

interface SettingsViewProps {
  currentUser?: AuthUser | null;
  onLogout: () => void;
  onOpenFirebaseConfig?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogout,
  onOpenFirebaseConfig
}) => {
  const [hospitalName, setHospitalName] = useState('City General Hospital - Regional Trauma Center');
  const [stationId, setStationId] = useState('TRIAGE-STATION-01');
  const [alertAudioEnabled, setAlertAudioEnabled] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState('ESI-1 and ESI-2');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-800 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-600" />
          <span>Hospital & Clinical Station Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical station parameters, operational notification rules, and user security.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Station settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hospital Facility Profile */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Facility Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hospital / Medical Center Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Clinical Terminal ID</label>
              <input
                type="text"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Staff User Profile */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Active Clinician Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Clinician Name</label>
              <input
                type="text"
                readOnly
                value={currentUser?.displayName || 'Clinical Staff Member'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Clinical Role</label>
              <input
                type="text"
                readOnly
                value={currentUser?.role || 'Attending Physician'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hospital Email</label>
              <input
                type="text"
                readOnly
                value={currentUser?.email || 'clinician@hospital.org'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Notification & Clinical Alert Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Clinical Alert Rules & Notifications
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertAudioEnabled}
                onChange={(e) => setAlertAudioEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <strong className="block text-slate-900">Audio Chime for Code Red / ESI-1 Arrivals</strong>
                <span className="text-slate-500 text-[11px]">Play audible bedside chime when resuscitation level patient arrives</span>
              </div>
            </label>

            <div className="pt-2">
              <label className="block text-slate-700 font-semibold mb-1">Alert Priority Threshold</label>
              <select
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
              >
                <option value="ESI-1 only">ESI-1 Resuscitation only</option>
                <option value="ESI-1 and ESI-2">ESI-1 and ESI-2 (Emergent)</option>
                <option value="All Triage Changes">All Triage Changes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Session Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Security & Session Management
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="text-slate-900 block font-sans">Firebase Authentication Status</strong>
              <span className="text-slate-500 text-[11px]">Connected to Firebase project with session protection</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenFirebaseConfig && (
                <button
                  type="button"
                  onClick={onOpenFirebaseConfig}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Auth Configuration</span>
                </button>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
