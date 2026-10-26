import React, { useState } from 'react';
import { 
  Patient, 
  HospitalBed, 
  HospitalAlert, 
  WardType, 
  EsiLevel 
} from '../types/hospital';
import { 
  Activity, 
  Bed, 
  AlertTriangle, 
  Truck, 
  ArrowRight, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Heart,
  ChevronRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface HospitalOverviewProps {
  patients: Patient[];
  beds: HospitalBed[];
  alerts: HospitalAlert[];
  onNavigate: (tab: any) => void;
  onSelectPatient: (patient: Patient) => void;
  onAllocateBed: (patient: Patient) => void;
  onTransferPatient: (patient: Patient) => void;
  onOpenNewPatient: () => void;
}

export const HospitalOverview: React.FC<HospitalOverviewProps> = ({
  patients,
  beds,
  alerts,
  onNavigate,
  onSelectPatient,
  onAllocateBed,
  onTransferPatient,
  onOpenNewPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState<string>('ALL');

  // Operational metrics
  const activeQueued = patients.filter(p => p.status === 'Triage Queue');
  const totalAdmissions = patients.filter(p => p.status === 'Bed Allocated' || p.status === 'In Treatment').length;
  const criticalPatients = patients.filter(
    p => p.status === 'Triage Queue' && (p.esiLevel <= 2 || p.riskLevel === 'Critical')
  );
  const pendingTransfers = patients.filter(p => p.status === 'Transferred').length;

  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const totalBeds = beds.length;
  const occupancyRate = Math.round(((totalBeds - availableBeds) / totalBeds) * 100);

  // Wards summary
  const wards: WardType[] = ['Emergency Ward', 'ICU / Critical', 'Step-Down CCU', 'General Ward'];
  const wardStats = wards.map(ward => {
    const wardBeds = beds.filter(b => b.ward === ward);
    const free = wardBeds.filter(b => b.status === 'Available').length;
    const occ = wardBeds.filter(b => b.status === 'Occupied').length;
    const clean = wardBeds.filter(b => b.status === 'Cleaning').length;
    const res = wardBeds.filter(b => b.status === 'Reserved').length;
    const pct = wardBeds.length > 0 ? Math.round((occ / wardBeds.length) * 100) : 0;
    return { ward, total: wardBeds.length, free, occ, clean, res, pct };
  });

  // Filtered queue for quick triage list
  const filteredPatients = activeQueued.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'ALL' || p.targetWard === wardFilter;
    return matchesSearch && matchesWard;
  });

  const getEsiBadge = (level: EsiLevel) => {
    switch (level) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>ESI-1 Resuscitation</span>
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>ESI-2 Emergent</span>
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50/80 text-amber-800 border border-amber-200/80">
            <span>ESI-3 Urgent</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <span>ESI-{level}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Admissions */}
        <div 
          onClick={() => onNavigate('triage')} 
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Admissions</span>
            <Activity className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {totalAdmissions + activeQueued.length}{' '}
            <span className="text-xs font-normal text-slate-500">total</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span>{totalAdmissions} in beds</span>
            <span className="text-cyan-700 font-semibold">{activeQueued.length} in queue</span>
          </div>
        </div>

        {/* Available Beds */}
        <div 
          onClick={() => onNavigate('beds')} 
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Available Beds</span>
            <Bed className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {availableBeds}{' '}
            <span className="text-xs font-normal text-slate-500">/ {totalBeds}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span>Occupancy:</span>
            <span className={occupancyRate >= 85 ? 'text-amber-700 font-bold' : 'text-slate-700 font-semibold'}>
              {occupancyRate}%
            </span>
          </div>
        </div>

        {/* Critical Attention Required */}
        <div 
          onClick={() => onNavigate('triage')} 
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Critical Attention</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tracking-tight">
            {criticalPatients.length}{' '}
            <span className="text-xs font-normal text-slate-500">patients</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span>ESI-1 / Critical</span>
            <span className="text-rose-600 font-semibold">Immediate action</span>
          </div>
        </div>

        {/* Pending Network Transfers */}
        <div 
          onClick={() => onNavigate('transfers')} 
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Network Transfers</span>
            <Truck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {pendingTransfers}{' '}
            <span className="text-xs font-normal text-slate-500">en route</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono">
            <span>Regional network</span>
            <span className="text-amber-700 font-semibold">Active diversion</span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS & WARD OCCUPANCY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ward Bed Occupancy Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-sans">
                Ward Bed Occupancy & Capacity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time bed distribution and turnover status across inpatient units.
              </p>
            </div>
            <button
              onClick={() => onNavigate('beds')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
            >
              <span>Manage Beds</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {wardStats.map(w => (
              <div key={w.ward} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{w.ward}</span>
                    <span className="text-slate-400 font-mono">({w.occ}/{w.total} beds in use)</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-semibold">{w.free} available</span>
                    {w.clean > 0 && <span className="text-amber-700">{w.clean} cleaning</span>}
                    <span className="font-bold text-slate-800">{w.pct}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div 
                    className="bg-cyan-600 h-full transition-all duration-500" 
                    style={{ width: `${w.pct}%` }}
                    title={`Occupied: ${w.occ}`}
                  />
                  {w.clean > 0 && (
                    <div 
                      className="bg-amber-400 h-full transition-all duration-500" 
                      style={{ width: `${(w.clean / w.total) * 100}%` }}
                      title={`Cleaning: ${w.clean}`}
                    />
                  )}
                  {w.res > 0 && (
                    <div 
                      className="bg-purple-400 h-full transition-all duration-500" 
                      style={{ width: `${(w.res / w.total) * 100}%` }}
                      title={`Reserved: ${w.res}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                <span>Occupied</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Sanitizing</span>
              </span>
            </div>
            <span className="text-slate-400">Station Auto-Sync Active</span>
          </div>
        </div>

        {/* Operational Alerts & Activity (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 font-sans">
                Clinical Activity & Alerts
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Live</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs mt-2 max-h-[260px] overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No active operational alerts.</p>
              ) : (
                alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="py-2.5 flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      alert.type === 'critical' ? 'bg-rose-500' :
                      alert.type === 'warning' ? 'bg-amber-500' :
                      alert.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-800 truncate">{alert.title}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={onOpenNewPatient}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Admit Emergency Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. PATIENTS REQUIRING ATTENTION (Triage Queue Table) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-sans">
              Patients Requiring Attention ({activeQueued.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active triage queue ranked by clinical urgency and presentation wait times.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or MRN..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Wards</option>
              <option value="ICU / Critical">ICU / Critical</option>
              <option value="Emergency Ward">Emergency</option>
              <option value="General Ward">General</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Patient & MRN</th>
                <th className="py-2.5 px-3">Chief Complaint</th>
                <th className="py-2.5 px-3">Triage Urgency</th>
                <th className="py-2.5 px-3 text-center">Wait</th>
                <th className="py-2.5 px-3">Target Ward</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No patients currently waiting in triage matching your filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.slice(0, 5).map(patient => (
                  <tr 
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {patient.name} <span className="font-normal text-slate-500 text-[11px]">({patient.age}y, {patient.gender[0]})</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {patient.mrn} &middot; Arr: {patient.arrivalTime}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 max-w-xs">
                      <p className="truncate text-slate-700" title={patient.chiefComplaint}>
                        {patient.chiefComplaint}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        HR: {patient.vitals.heartRate} &middot; BP: {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia} &middot; SpO2: {patient.vitals.spo2}%
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getEsiBadge(patient.esiOverride?.newLevel || patient.esiLevel)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                      <span className={patient.waitMinutes > 30 ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                        {patient.waitMinutes}m
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {patient.targetWard}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAllocateBed(patient)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-2xs"
                        >
                          Assign Bed
                        </button>
                        <button
                          onClick={() => onTransferPatient(patient)}
                          className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => onSelectPatient(patient)}
                          className="p-1 text-slate-400 hover:text-slate-900 rounded"
                          title="View Patient Chart"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {activeQueued.length > 5 && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('triage')}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 inline-flex items-center gap-1"
            >
              <span>View all {activeQueued.length} patients in Full Triage Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
