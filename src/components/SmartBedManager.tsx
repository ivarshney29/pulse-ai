import React, { useState } from 'react';
import { HospitalBed, Patient, ThreadExecutionLog, MutexState, WardType } from '../types/hospital';
import { 
  Bed, 
  Lock, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Truck,
  Building2,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface SmartBedManagerProps {
  beds: HospitalBed[];
  patients: Patient[];
  mutexState: MutexState;
  threadLogs: ThreadExecutionLog[];
  onManualAllocateBed: (bedId: string, patientId: string) => Promise<void>;
  onDischargeBed: (bedId: string) => void;
  onCleanBed: (bedId: string) => void;
  onOpenTransferNetwork: () => void;
}

export const SmartBedManager: React.FC<SmartBedManagerProps> = ({
  beds,
  patients,
  mutexState,
  threadLogs,
  onManualAllocateBed,
  onDischargeBed,
  onCleanBed,
  onOpenTransferNetwork
}) => {
  const [selectedWard, setSelectedWard] = useState<WardType | 'ALL'>('ALL');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [assignPatientModalOpen, setAssignPatientModalOpen] = useState(false);
  const [selectedPatientToAssign, setSelectedPatientToAssign] = useState<string>('');

  const wards: WardType[] = ['Emergency Ward', 'ICU / Critical', 'Step-Down CCU', 'General Ward'];

  const filteredBeds = beds.filter(b => selectedWard === 'ALL' || b.ward === selectedWard);

  const availableBeds = beds.filter(b => b.status === 'Available');
  const occupiedBeds = beds.filter(b => b.status === 'Occupied');
  const cleaningBeds = beds.filter(b => b.status === 'Cleaning');
  const reservedBeds = beds.filter(b => b.status === 'Reserved');

  const queuedPatients = patients.filter(p => p.status === 'Triage Queue');

  const handleOpenAssign = (bed: HospitalBed) => {
    setSelectedBed(bed);
    if (queuedPatients.length > 0) {
      setSelectedPatientToAssign(queuedPatients[0].id);
    }
    setAssignPatientModalOpen(true);
  };

  const handleExecuteAssign = async () => {
    if (!selectedBed || !selectedPatientToAssign) return;
    await onManualAllocateBed(selectedBed.id, selectedPatientToAssign);
    setAssignPatientModalOpen(false);
    setSelectedBed(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Capacity & Operational Status Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                Hospital Inpatient Bed Capacity & Ward Allocation
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Capacity: {availableBeds.length} Free / {beds.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Real-time monitoring of acute care and ICU beds. Concurrent allocation protection ensures bed records remain strictly synchronized across all nursing and triage terminals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTransferNetwork}
              className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Regional network partner hospital bed transfer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>Network Bed Transfer</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-sans">Available for Admission</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{availableBeds.length} beds</span>
            <span className="text-[10px] text-slate-400">Ready immediately</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-sans">Occupied Beds</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{occupiedBeds.length} beds</span>
            <span className="text-[10px] text-slate-400">Under clinical care</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-sans">Terminal Sanitization</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">{cleaningBeds.length} beds</span>
            <span className="text-[10px] text-slate-400">Undergoing turnover</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-sans">Reserved / In-Transit</span>
            <span className="text-xl font-bold text-purple-700 mt-0.5 block">{reservedBeds.length} beds</span>
            <span className="text-[10px] text-slate-400">Held for intake</span>
          </div>
        </div>
      </div>

      {/* Ward Filter & Legend Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedWard('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedWard === 'ALL'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Wards ({beds.length})
          </button>
          {wards.map(ward => {
            const count = beds.filter(b => b.ward === ward).length;
            return (
              <button
                key={ward}
                onClick={() => setSelectedWard(ward)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedWard === ward
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {ward} ({count})
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available ({availableBeds.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Occupied ({occupiedBeds.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Cleaning ({cleaningBeds.length})</span>
          </div>
        </div>
      </div>

      {/* Bed Grid & Recent Activity Log Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Beds Interactive Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBeds.map(bed => {
              const isFree = bed.status === 'Available';
              const isOcc = bed.status === 'Occupied';
              const isClean = bed.status === 'Cleaning';
              const isRes = bed.status === 'Reserved';

              return (
                <div
                  key={bed.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFree 
                      ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs' 
                      : isOcc 
                      ? 'bg-slate-50 border-slate-200' 
                      : isClean 
                      ? 'bg-amber-50/50 border-amber-200' 
                      : 'bg-purple-50/50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {bed.code}
                        </span>
                        <span className="text-[11px] font-sans text-slate-500">
                          {bed.room}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {bed.ward}
                      </div>
                    </div>

                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      isFree 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' 
                        : isOcc 
                        ? 'bg-slate-100 text-slate-700 border-slate-200 font-semibold' 
                        : isClean 
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' 
                        : 'bg-purple-50 text-purple-800 border-purple-200 font-bold'
                    }`}>
                      {bed.status}
                    </span>
                  </div>

                  {/* Patient Info or Equipment */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    {isOcc && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Assigned Patient:</span>
                          <span className="font-bold text-slate-900">
                            {bed.currentPatientName || bed.currentPatientId}
                          </span>
                        </div>
                      </div>
                    )}

                    {isFree && (
                      <div className="text-slate-500 flex items-center justify-between">
                        <span>Ready for admission</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Cleaned: {bed.lastCleanedAt.split(' ')[1]}
                        </span>
                      </div>
                    )}

                    {isClean && (
                      <div className="text-amber-800 flex items-center justify-between">
                        <span>Terminal sanitization protocol</span>
                        <button
                          onClick={() => onCleanBed(bed.id)}
                          className="text-xs text-amber-700 hover:text-amber-900 underline font-mono font-bold"
                        >
                          Mark Ready
                        </button>
                      </div>
                    )}

                    {/* Equipment tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {bed.equipment.map((eq, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bed Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                    {isFree && (
                      <button
                        onClick={() => handleOpenAssign(bed)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Bed className="w-3.5 h-3.5" />
                        <span>Allocate Patient</span>
                      </button>
                    )}

                    {isOcc && (
                      <button
                        onClick={() => onDischargeBed(bed.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                        title="Discharge patient and queue bed for sanitization"
                      >
                        <LogOut className="w-3 h-3 text-rose-500" />
                        <span>Discharge / Turnover</span>
                      </button>
                    )}

                    {isClean && (
                      <button
                        onClick={() => onCleanBed(bed.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Release to Service</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-Time Operational Allocation Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Bed Allocation Activity Log</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              {threadLogs.length} logged
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-[520px] overflow-y-auto font-mono text-xs space-y-2 text-slate-200">
            {threadLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-center p-4">
                <p>Allocation events will appear here in real time as patients are assigned to beds.</p>
              </div>
            ) : (
              threadLogs.map(log => {
                let statusColor = 'text-cyan-400';
                if (log.action === 'CRITICAL_SECTION_ALLOCATION') statusColor = 'text-emerald-400';
                if (log.action === 'MUTEX_ACQUIRED') statusColor = 'text-amber-400';

                return (
                  <div key={log.id} className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Station #{log.threadId}</span>
                      <span>{log.timestamp} &middot; {log.latencyMs}ms</span>
                    </div>
                    <div className={`font-semibold mt-0.5 ${statusColor}`}>
                      [{log.action.replace(/_/g, ' ')}]
                    </div>
                    <div className="text-slate-300 mt-0.5 truncate">
                      {log.patientName} &rarr; {log.bedId}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Manual Patient Assignment Modal */}
      {assignPatientModalOpen && selectedBed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Inpatient Bed Allocation
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold">
                  {selectedBed.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ward: <strong className="text-slate-800">{selectedBed.ward}</strong> ({selectedBed.room})
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Patient from Triage Queue:
              </label>
              {queuedPatients.length === 0 ? (
                <p className="text-xs text-amber-800 p-2 rounded bg-amber-50 border border-amber-200">
                  No patients currently waiting in queue.
                </p>
              ) : (
                <select
                  value={selectedPatientToAssign}
                  onChange={(e) => setSelectedPatientToAssign(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                >
                  {queuedPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn}) · ESI-{p.esiOverride?.newLevel || p.esiLevel} · {p.chiefComplaint.slice(0, 35)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Concurrency Protection:</span>
                <span className="text-emerald-700 font-bold">Guaranteed Non-Conflicting</span>
              </div>
              <div className="flex justify-between">
                <span>Destination Ward:</span>
                <span className="text-slate-800 font-bold">{selectedBed.ward}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignPatientModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAssign}
                disabled={queuedPatients.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                Assign & Book Bed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
