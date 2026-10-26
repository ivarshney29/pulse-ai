import React from 'react';
import { Patient, HospitalBed, WardType } from '../types/hospital';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Bed, 
  FileText, 
  Download,
  AlertCircle
} from 'lucide-react';

interface ReportsAnalyticsProps {
  patients: Patient[];
  beds: HospitalBed[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  patients,
  beds
}) => {
  // Compute real operational metrics
  const totalPatients = patients.length;
  const inQueue = patients.filter(p => p.status === 'Triage Queue').length;
  const allocated = patients.filter(p => p.status === 'Bed Allocated' || p.status === 'In Treatment').length;
  const transferred = patients.filter(p => p.status === 'Transferred').length;
  const discharged = patients.filter(p => p.status === 'Discharged').length;

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const cleaningBeds = beds.filter(b => b.status === 'Cleaning').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // ESI distribution
  const esiCounts = {
    1: patients.filter(p => (p.esiOverride?.newLevel || p.esiLevel) === 1).length,
    2: patients.filter(p => (p.esiOverride?.newLevel || p.esiLevel) === 2).length,
    3: patients.filter(p => (p.esiOverride?.newLevel || p.esiLevel) === 3).length,
    4: patients.filter(p => (p.esiOverride?.newLevel || p.esiLevel) === 4).length,
    5: patients.filter(p => (p.esiOverride?.newLevel || p.esiLevel) === 5).length,
  };

  // Ward bed distribution
  const wards: WardType[] = ['Emergency Ward', 'ICU / Critical', 'Step-Down CCU', 'General Ward'];
  const wardBreakdown = wards.map(w => {
    const wardBeds = beds.filter(b => b.ward === w);
    const occ = wardBeds.filter(b => b.status === 'Occupied').length;
    const avail = wardBeds.filter(b => b.status === 'Available').length;
    const rate = wardBeds.length > 0 ? Math.round((occ / wardBeds.length) * 100) : 0;
    return { ward: w, total: wardBeds.length, occ, avail, rate };
  });

  // Average wait times
  const activeQueued = patients.filter(p => p.status === 'Triage Queue');
  const avgWait = activeQueued.length > 0
    ? Math.round(activeQueued.reduce((acc, p) => acc + p.waitMinutes, 0) / activeQueued.length)
    : 0;

  // Total clinical notes
  const totalNotes = patients.reduce((acc, p) => acc + p.clinicalNotes.length, 0);

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "MRN,Patient Name,Age,Gender,ESI,Status,Target Ward,Wait Minutes\n" +
      patients.map(p => `"${p.mrn}","${p.name}",${p.age},"${p.gender}",${p.esiOverride?.newLevel || p.esiLevel},"${p.status}","${p.targetWard}",${p.waitMinutes}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PulseAI_Patient_Census_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header & Export Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            <span>Operational Reports & Census Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time department throughput, bed utilization, and clinical queue metrics.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Patient Census (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Total Census Managed</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalPatients}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Active department records</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Current Facility Bed Load</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {occupancyRate}%
          </div>
          <span className="text-[11px] text-emerald-700 font-mono mt-1 block font-semibold">{availableBeds} beds available</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Avg Triage Wait</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgWait} <span className="text-xs font-normal text-slate-500">mins</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Queue presentation time</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Clinical Notes Documented</span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalNotes}
          </div>
          <span className="text-[11px] text-cyan-700 font-mono mt-1 block font-semibold">Voice & manual entries</span>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Triage Severity Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Patient Census by Triage Urgency (ESI)
            </h3>
            <span className="text-xs font-mono text-slate-400">{totalPatients} total</span>
          </div>

          <div className="space-y-3 text-xs">
            {([1, 2, 3, 4, 5] as const).map(level => {
              const count = esiCounts[level];
              const pct = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;
              const labels = {
                1: 'ESI-1 Resuscitation (Immediate)',
                2: 'ESI-2 Emergent (High Risk)',
                3: 'ESI-3 Urgent',
                4: 'ESI-4 Less Urgent',
                5: 'ESI-5 Non-urgent'
              };
              const colors = {
                1: 'bg-rose-500',
                2: 'bg-amber-500',
                3: 'bg-yellow-500',
                4: 'bg-emerald-500',
                5: 'bg-slate-400'
              };

              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-700 font-medium font-sans">{labels[level]}</span>
                    <span className="text-slate-900 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${colors[level]} h-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward Bed Utilization Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Ward Bed Capacity Breakdown
            </h3>
            <span className="text-xs font-mono text-slate-400">{totalBeds} total beds</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {wardBreakdown.map(w => (
              <div key={w.ward} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900">{w.ward}</span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Capacity: {w.total} beds &middot; Free: {w.avail}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-sm font-bold ${w.rate >= 80 ? 'text-amber-700' : 'text-slate-800'}`}>
                    {w.rate}%
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {w.occ} occupied
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Status Distribution Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 font-sans">
            Department Status Census Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Triage Waiting Queue</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{inQueue}</span>
              <span className="text-[10px] text-slate-400 font-mono">Awaiting bed assignment</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">In Hospital Beds</span>
              <span className="text-xl font-bold font-mono text-cyan-800 mt-1 block">{allocated}</span>
              <span className="text-[10px] text-slate-400 font-mono">Under active inpatient care</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Network Transferred</span>
              <span className="text-xl font-bold font-mono text-amber-700 mt-1 block">{transferred}</span>
              <span className="text-[10px] text-slate-400 font-mono">Diverted to partner centers</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Sanitizing Beds</span>
              <span className="text-xl font-bold font-mono text-slate-700 mt-1 block">{cleaningBeds}</span>
              <span className="text-[10px] text-slate-400 font-mono">Terminal cleaning in progress</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
