import React, { useState } from 'react';
import { Patient, NetworkHospital, WardType, InterHospitalTransfer } from '../types/hospital';
import { NETWORK_HOSPITALS } from '../data/initialData';
import { 
  X, 
  Building2, 
  Truck, 
  MapPin, 
  Clock, 
  Bed, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';

interface InterHospitalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onExecuteTransfer: (patientId: string, transfer: InterHospitalTransfer) => void;
}

export const InterHospitalTransferModal: React.FC<InterHospitalTransferModalProps> = ({
  isOpen,
  onClose,
  patient,
  onExecuteTransfer
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(NETWORK_HOSPITALS[0].id);
  const [selectedWard, setSelectedWard] = useState<WardType>(
    patient ? patient.targetWard : 'Emergency Ward'
  );
  const [transferReason, setTransferReason] = useState<string>(
    'Local hospital at peak bed occupancy — urgent transfer to facility with available critical beds.'
  );
  const [ambulanceUnit, setAmbulanceUnit] = useState<string>(
    'ALS Unit #04 (Advanced Cardiac & Ventilatory Support)'
  );

  if (!isOpen || !patient) return null;

  const selectedHospital = NETWORK_HOSPITALS.find(h => h.id === selectedHospitalId) || NETWORK_HOSPITALS[0];

  const getBedsForWard = (h: NetworkHospital, ward: WardType): number => {
    switch (ward) {
      case 'ICU / Critical':
        return h.availableBeds.icu;
      case 'Emergency Ward':
        return h.availableBeds.emergency;
      case 'Step-Down CCU':
        return h.availableBeds.stepDown;
      case 'General Ward':
        return h.availableBeds.general;
    }
  };

  const bedsInTargetWard = getBedsForWard(selectedHospital, selectedWard);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bedsInTargetWard <= 0) {
      alert('Selected hospital has no beds available in this ward! Please select another hospital or ward.');
      return;
    }

    const transferData: InterHospitalTransfer = {
      targetHospital: selectedHospital.name,
      targetHospitalId: selectedHospital.id,
      wardType: selectedWard,
      distanceKm: selectedHospital.distanceKm,
      transitMinutes: selectedHospital.transitMinutes,
      status: 'Transit Dispatched',
      transferReason: transferReason.trim(),
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ambulanceUnit
    };

    onExecuteTransfer(patient.id, transferData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-600" />
                <span>Inter-Hospital Emergency Transfer Network</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                Simulated Regional Network Grid Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transfer patient to partner healthcare facility with simulated regional bed availability and telemetry.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-semibold text-slate-900">{patient.name}</strong>
              <span className="font-mono text-slate-500">({patient.mrn})</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                patient.esiLevel === 1 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : patient.esiLevel === 2 
                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                ESI-{patient.esiOverride?.newLevel || patient.esiLevel}
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 truncate max-w-md">
              {patient.chiefComplaint}
            </p>
          </div>

          <div className="text-right sm:text-right shrink-0 font-mono text-[11px]">
            <span className="text-slate-500 block">Required Ward:</span>
            <span className="text-cyan-700 font-bold">{patient.targetWard}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Ward Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Select Destination Ward Required:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['ICU / Critical', 'Emergency Ward', 'Step-Down CCU', 'General Ward'] as WardType[]).map(ward => (
                <button
                  key={ward}
                  type="button"
                  onClick={() => setSelectedWard(ward)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedWard === ward
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{ward}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Network Hospitals Available */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Available Network Hospitals (Ranked by Transit ETA & Free Beds):
            </label>

            <div className="space-y-2">
              {NETWORK_HOSPITALS.map(h => {
                const isSelected = selectedHospitalId === h.id;
                const freeWardBeds = getBedsForWard(h, selectedWard);
                const hasBeds = freeWardBeds > 0;

                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {h.name}
                        </span>
                        {h.ambulanceReady && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ambulance Ready
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{h.location} ({h.distanceKm} km)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span className="font-semibold text-slate-700">{h.transitMinutes} min ETA</span>
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {h.specialties.slice(0, 3).map((sp, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bed Count in Target Ward */}
                    <div className="sm:text-right shrink-0 p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">
                        {selectedWard.replace(' Ward', '')} Free Beds:
                      </div>
                      <div className={`text-base font-bold font-mono ${hasBeds ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {freeWardBeds} available
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {h.totalBedsAvailable} total facility beds
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transfer Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Clinical Reason for Inter-Hospital Transfer:
              </label>
              <textarea
                rows={2}
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dispatch Ambulance Unit:
              </label>
              <select
                value={ambulanceUnit}
                onChange={(e) => setAmbulanceUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="ALS Unit #04 (Advanced Cardiac & Ventilatory Support)">
                  ALS Unit #04 (Advanced Cardiac & Ventilator)
                </option>
                <option value="ALS Unit #02 (Trauma & Resuscitation Rig)">
                  ALS Unit #02 (Trauma & Resuscitation Rig)
                </option>
                <option value="BLS Unit #07 (Basic Life Support with O2)">
                  BLS Unit #07 (Basic Life Support with O2)
                </option>
                <option value="Critical Care Transport Team 01 (ICU/ECMO)">
                  Critical Care Transport Team 01 (ICU/ECMO)
                </option>
              </select>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-cyan-600" />
                <span>Receiving Hospital Dispatch: {selectedHospital.contact}</span>
              </div>
            </div>
          </div>

          {/* Submission / Confirmation */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FHIR inter-hospital EHR handover packet will be transmitted.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch & Transfer Patient</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
