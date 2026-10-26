import React, { useState } from 'react';
import { Patient, NetworkHospital, InterHospitalTransfer } from '../types/hospital';
import { NETWORK_HOSPITALS } from '../data/initialData';
import { 
  Truck, 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface TransfersViewProps {
  patients: Patient[];
  onOpenTransferModal: (patient: Patient) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  patients,
  onOpenTransferModal
}) => {
  const transferredPatients = patients.filter(p => p.status === 'Transferred');
  const queuedPatients = patients.filter(p => p.status === 'Triage Queue');

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-600" />
              <span>Inter-Hospital Emergency Transfer Coordination</span>
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              Demonstration Network Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time partner hospital capacity tracking, bed availability coordination, and ambulance dispatch.
          </p>
        </div>

        {queuedPatients.length > 0 && (
          <button
            onClick={() => onOpenTransferModal(queuedPatients[0])}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Initiate Patient Transfer</span>
          </button>
        )}
      </div>

      {/* Active Dispatches & Transit Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-sans">
            Active Network Transfers ({transferredPatients.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Live Dispatches</span>
        </div>

        {transferredPatients.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No active transfers currently en route. To transfer a patient when beds are saturated, select "Transfer" on any triage patient.
          </div>
        ) : (
          <div className="space-y-3">
            {transferredPatients.map(patient => (
              <div 
                key={patient.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                    <span className="font-mono text-slate-500">({patient.mrn})</span>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[11px] font-semibold">
                      In Transit
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Destination: <strong className="text-slate-800">{patient.transferDetails?.targetHospital}</strong> &middot; Target Ward: {patient.targetWard}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3">
                    <span>Ambulance: {patient.transferDetails?.ambulanceUnit}</span>
                    <span>&middot;</span>
                    <span>ETA: ~{patient.transferDetails?.transitMinutes} mins ({patient.transferDetails?.distanceKm} km)</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block font-mono">Dispatched at</span>
                  <span className="font-bold text-slate-800 font-mono">{patient.transferDetails?.dispatchedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regional Partner Facilities Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Regional Healthcare Network Grid
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Available partner centers with real-time ICU and Emergency bed capacity.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{NETWORK_HOSPITALS.length} Partner Centers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NETWORK_HOSPITALS.map(h => (
            <div 
              key={h.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-cyan-300 transition-all shadow-2xs space-y-3 flex flex-col justify-between text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="font-bold text-slate-900">{h.name}</span>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{h.location} ({h.distanceKm} km)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-700 font-semibold">{h.transitMinutes} min ETA</span>
                  </div>
                </div>

                {/* Bed counts */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 grid grid-cols-2 gap-2 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">ICU Beds</span>
                    <span className="text-sm font-bold text-emerald-700">{h.availableBeds.icu} open</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">ER Beds</span>
                    <span className="text-sm font-bold text-cyan-700">{h.availableBeds.emergency} open</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1">
                  {h.specialties.map((sp, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyan-600" />
                  <span>{h.contact}</span>
                </span>
                {h.ambulanceReady && (
                  <span className="text-emerald-700 font-semibold">Ambulance Ready</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
