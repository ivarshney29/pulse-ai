import React, { useState } from 'react';
import { Patient, HospitalBed, EsiLevel } from '../types/hospital';
import { 
  AlertTriangle, 
  Clock, 
  Search, 
  Bed, 
  Activity, 
  Flame, 
  ChevronRight,
  Truck,
  Heart,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

interface TriageDashboardProps {
  patients: Patient[];
  beds: HospitalBed[];
  onSelectPatient: (patient: Patient) => void;
  onAllocateBed: (patient: Patient) => void;
  onViewRisk: (patient: Patient) => void;
  onTransferPatient: (patient: Patient) => void;
  onSimulateNewArrival: () => void;
}

export const TriageDashboard: React.FC<TriageDashboardProps> = ({
  patients,
  beds,
  onSelectPatient,
  onAllocateBed,
  onViewRisk,
  onTransferPatient,
  onSimulateNewArrival
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEsiFilter, setSelectedEsiFilter] = useState<number | 'ALL'>('ALL');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'PRIORITY' | 'WAIT' | 'RECENT'>('PRIORITY');

  const queuedPatients = patients.filter(p => p.status === 'Triage Queue' || p.status === 'Transferred');
  const activeQueued = queuedPatients.filter(p => p.status === 'Triage Queue');
  const totalInQueue = activeQueued.length;
  const criticalCount = activeQueued.filter(p => p.esiLevel <= 2 || p.riskLevel === 'Critical').length;
  
  // Wait times
  const avgWaitTime = totalInQueue > 0
    ? Math.round(activeQueued.reduce((acc, p) => acc + p.waitMinutes, 0) / totalInQueue)
    : 0;

  // Bed stats
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const totalBeds = beds.length;
  const bedOccupancyRate = Math.round(((totalBeds - availableBeds) / totalBeds) * 100);

  // Sorting
  const sortedPatients = [...queuedPatients].sort((a, b) => {
    if (sortOrder === 'PRIORITY') {
      const getScore = (p: Patient) => {
        const esi = p.esiOverride ? p.esiOverride.newLevel : p.esiLevel;
        const base = esi === 1 ? 1000 : esi === 2 ? 750 : esi === 3 ? 500 : esi === 4 ? 250 : 100;
        return base + p.waitMinutes * 5 + p.riskScore;
      };
      return getScore(b) - getScore(a);
    }
    if (sortOrder === 'WAIT') {
      return b.waitMinutes - a.waitMinutes;
    }
    return b.arrivalTime.localeCompare(a.arrivalTime);
  });

  // Filtered patients
  const filteredPatients = sortedPatients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    
    const effectiveEsi = p.esiOverride ? p.esiOverride.newLevel : p.esiLevel;
    const matchesEsi = selectedEsiFilter === 'ALL' || effectiveEsi === selectedEsiFilter;
    const matchesWard = selectedWardFilter === 'ALL' || p.targetWard === selectedWardFilter;

    return matchesSearch && matchesEsi && matchesWard;
  });

  const getEsiBadge = (level: EsiLevel, hasOverride?: boolean) => {
    switch (level) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>ESI-1 Resuscitation</span>
            {hasOverride && <span className="text-[10px] text-amber-700 ml-1 font-mono">(OVERRIDDEN)</span>}
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>ESI-2 Emergent</span>
            {hasOverride && <span className="text-[10px] text-amber-700 ml-1 font-mono">(OVERRIDDEN)</span>}
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-50/70 text-amber-900 border border-amber-200/80">
            <span>ESI-3 Urgent</span>
            {hasOverride && <span className="text-[10px] text-amber-700 ml-1 font-mono">(OVERRIDDEN)</span>}
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>ESI-4 Less Urgent</span>
          </span>
        );
      case 5:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <span>ESI-5 Non-urgent</span>
          </span>
        );
    }
  };

  const getRiskMeter = (score: number) => {
    let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let barColor = 'bg-emerald-500';
    if (score >= 75) {
      colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
      barColor = 'bg-rose-500';
    } else if (score >= 50) {
      colorClass = 'text-amber-800 bg-amber-50 border-amber-200';
      barColor = 'bg-amber-500';
    } else if (score >= 25) {
      colorClass = 'text-yellow-800 bg-yellow-50 border-yellow-200';
      barColor = 'bg-yellow-500';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div 
            className={`h-full ${barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded border ${colorClass}`}>
          {score}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Census & Triage Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Triage Waiting Queue</span>
            <Activity className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {totalInQueue} <span className="text-sm font-normal text-slate-500">patients</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>High urgency:</span>
            <span className="font-mono text-rose-600 font-semibold">{criticalCount} critical</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Average Queue Wait</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{avgWaitTime}</span>
            <span className="text-sm font-normal text-slate-500">minutes</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            <span>From initial presentation</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Inpatient Bed Load</span>
            <Bed className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {bedOccupancyRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span className="text-cyan-700 font-semibold">{availableBeds}</span> beds currently open
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Triage Prioritization</span>
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-sm font-semibold text-slate-900 tracking-tight mt-0.5 truncate">
            {sortOrder === 'PRIORITY' && 'Clinical Urgency & Wait'}
            {sortOrder === 'WAIT' && 'Longest Wait First'}
            {sortOrder === 'RECENT' && 'Arrival Time Order'}
          </div>
          <div className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1 font-mono">
            <span>Dynamic triage active</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Sorting, Search, Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Sort Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Queue Order:
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSortOrder('PRIORITY')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                sortOrder === 'PRIORITY'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Urgency
            </button>
            <button
              onClick={() => setSortOrder('WAIT')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                sortOrder === 'WAIT'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wait Time
            </button>
            <button
              onClick={() => setSortOrder('RECENT')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                sortOrder === 'RECENT'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recent Arrivals
            </button>
          </div>
        </div>

        {/* Search & Intake Simulation */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, complaint, MRN..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onSimulateNewArrival}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            title="Admit simulated emergency patient"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Arrival</span>
          </button>
        </div>
      </div>

      {/* Triage Urgency & Ward Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-500 mr-1">Urgency Tier:</span>
          {(['ALL', 1, 2, 3, 4, 5] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedEsiFilter(tier)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedEsiFilter === tier
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tier === 'ALL' ? 'All Urgencies' : `ESI-${tier}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Destination Ward:</span>
          {['ALL', 'ICU / Critical', 'Emergency Ward', 'General Ward'].map(ward => (
            <button
              key={ward}
              onClick={() => setSelectedWardFilter(ward)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedWardFilter === ward
                  ? 'text-cyan-900 bg-cyan-50 border border-cyan-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ward === 'ALL' ? 'All Wards' : ward.replace(' Ward', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Triage Patient Queue Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Patient & MRN</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">ESI Urgency</th>
                <th className="py-3 px-4 text-center">Wait Time</th>
                <th className="py-3 px-4">Risk Indicator</th>
                <th className="py-3 px-4">Target Ward</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No patients currently match the filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust your filters or admit an emergency patient.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => {
                  const effectiveEsi = patient.esiOverride ? patient.esiOverride.newLevel : patient.esiLevel;
                  const isTransferred = patient.status === 'Transferred';

                  return (
                    <tr 
                      key={patient.id}
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${
                        isTransferred ? 'bg-amber-50/40' : ''
                      }`}
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Queue Position */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        <span className={`inline-block w-6 h-6 rounded-full leading-6 text-center text-xs ${
                          index === 0 && !isTransferred 
                            ? 'bg-cyan-100 text-cyan-800 font-extrabold' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Patient Name & Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{patient.name}</span>
                          <span className="text-slate-500 font-normal">
                            ({patient.age}y, {patient.gender[0]})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>{patient.mrn}</span>
                          <span>&middot;</span>
                          <span>Arr: {patient.arrivalTime}</span>
                        </div>
                        {isTransferred && patient.transferDetails && (
                          <div className="text-[11px] font-mono text-amber-800 flex items-center gap-1 mt-0.5 font-semibold">
                            <Truck className="w-3 h-3" />
                            <span>Transferred &rarr; {patient.transferDetails.targetHospital}</span>
                          </div>
                        )}
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-800 truncate" title={patient.chiefComplaint}>
                          {patient.chiefComplaint}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-0.5">
                          <span>HR: {patient.vitals.heartRate}</span>
                          <span>BP: {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                          <span className={patient.vitals.spo2 < 92 ? 'text-rose-600 font-bold' : ''}>
                            SpO2: {patient.vitals.spo2}%
                          </span>
                        </div>
                      </td>

                      {/* ESI Severity Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getEsiBadge(effectiveEsi, Boolean(patient.esiOverride))}
                      </td>

                      {/* Wait Time */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums whitespace-nowrap">
                        <span className={`font-semibold ${
                          patient.waitMinutes > 60 ? 'text-rose-600' : patient.waitMinutes > 30 ? 'text-amber-700' : 'text-slate-600'
                        }`}>
                          {isTransferred ? 'In Transit' : `${patient.waitMinutes}m`}
                        </span>
                      </td>

                      {/* Risk Indicator */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRiskMeter(patient.riskScore)}
                      </td>

                      {/* Target Ward */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {patient.targetWard}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isTransferred && (
                            <>
                              <button
                                onClick={() => onAllocateBed(patient)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-xs flex items-center gap-1"
                                title="Allocate patient to local available bed"
                              >
                                <Bed className="w-3.5 h-3.5" />
                                <span>Assign Bed</span>
                              </button>

                              <button
                                onClick={() => onTransferPatient(patient)}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                                title="Transfer patient to regional network facility"
                              >
                                <Truck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Transfer</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onViewRisk(patient)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                            title="Inspect Bedside Vitals Risk"
                          >
                            <Heart className="w-4 h-4 text-rose-500" />
                          </button>

                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Open Patient Chart"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
