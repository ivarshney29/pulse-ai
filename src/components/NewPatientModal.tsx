import React, { useState } from 'react';
import { Patient, EsiLevel, WardType, PatientVitals } from '../types/hospital';
import { calculateDeteriorationRisk } from '../utils/mlPredictor';
import { NETWORK_HOSPITALS } from '../data/initialData';
import { X, UserPlus, Truck, Building2, MapPin, Clock } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
  onOpenTransferForPatient?: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
  onOpenTransferForPatient
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(55);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [targetWard, setTargetWard] = useState<WardType>('Emergency Ward');

  // Option for direct transfer
  const [transferImmediately, setTransferImmediately] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState(NETWORK_HOSPITALS[0].id);

  // Vitals
  const [vitals, setVitals] = useState<PatientVitals>({
    heartRate: 110,
    bloodPressureSys: 95,
    bloodPressureDia: 60,
    spo2: 91,
    respiratoryRate: 24,
    temperature: 37.5,
    gcs: 14,
    lactate: 2.8
  });

  const mlPred = calculateDeteriorationRisk(vitals, age);

  let suggestedEsi: EsiLevel = 3;
  if (vitals.spo2 < 90 || vitals.bloodPressureSys < 90 || vitals.gcs <= 9 || vitals.lactate >= 4.0 || mlPred.riskScore >= 75) {
    suggestedEsi = 1;
  } else if (vitals.spo2 < 94 || vitals.heartRate > 115 || vitals.respiratoryRate > 26 || mlPred.riskScore >= 50) {
    suggestedEsi = 2;
  } else if (mlPred.riskScore >= 25) {
    suggestedEsi = 3;
  } else if (mlPred.riskScore >= 15) {
    suggestedEsi = 4;
  } else {
    suggestedEsi = 5;
  }

  const [selectedEsi, setSelectedEsi] = useState<EsiLevel>(suggestedEsi);

  if (!isOpen) return null;

  const targetHospital = NETWORK_HOSPITALS.find(h => h.id === selectedHospitalId) || NETWORK_HOSPITALS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !chiefComplaint.trim()) return;

    const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient: Patient = {
      id: newId,
      mrn: newMrn,
      name: name.trim(),
      age: Number(age),
      gender,
      arrivalTime: currentTime,
      waitMinutes: 1,
      chiefComplaint: chiefComplaint.trim(),
      esiLevel: selectedEsi || suggestedEsi,
      vitals,
      riskScore: mlPred.riskScore,
      riskLevel: mlPred.riskLevel,
      icuTransferRisk: mlPred.icuTransferRisk,
      readmissionRisk: mlPred.readmissionRisk,
      riskFactors: mlPred.featureContributions.slice(0, 3).map(f => ({
        factor: f.feature,
        impact: `+${f.weight}% Risk`,
        severity: f.weight > 20 ? 'high' : 'medium'
      })),
      targetWard,
      assignedBedId: null,
      status: transferImmediately ? 'Transferred' : 'Triage Queue',
      transferDetails: transferImmediately ? {
        targetHospital: targetHospital.name,
        targetHospitalId: targetHospital.id,
        wardType: targetWard,
        distanceKm: targetHospital.distanceKm,
        transitMinutes: targetHospital.transitMinutes,
        status: 'Transit Dispatched',
        transferReason: 'Direct admission diversion: Local capacity threshold reached; diverted to network bed.',
        dispatchedAt: currentTime,
        ambulanceUnit: 'ALS Unit #01 (Emergency Transfer)'
      } : undefined,
      allergies: [],
      medications: [],
      clinicalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Triage Intake Nurse',
          role: 'Triage Nurse',
          timestamp: currentTime,
          note: transferImmediately 
            ? `Patient admitted and immediately transferred to ${targetHospital.name} (${targetHospital.location}) due to bed availability.`
            : `Patient presented to ED with: ${chiefComplaint}. Automated triage calculated ESI-${suggestedEsi} based on vitals.`,
          source: 'manual'
        }
      ]
    };

    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-600" />
              <span>Rapid Emergency Patient Intake</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admit incoming patient with real-time ESI severity and ML risk calculation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="110"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Chief Complaint / Symptoms *</label>
            <input
              type="text"
              required
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Severe acute chest pressure radiating to left jaw, diaphoresis..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Vitals Form */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-700 font-semibold block text-[11px] uppercase tracking-wider">
              Bedside Vital Signs
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-slate-500 block">HR (bpm)</label>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">BP Sys (mmHg)</label>
                <input
                  type="number"
                  value={vitals.bloodPressureSys}
                  onChange={(e) => setVitals({ ...vitals, bloodPressureSys: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">SpO2 (%)</label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Lactate (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.lactate}
                  onChange={(e) => setVitals({ ...vitals, lactate: Number(e.target.value) })}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* ML Calculated Preview */}
          <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-cyan-900 font-bold block">PulseAI Triage Assessment:</span>
              <span className="text-slate-600 text-[11px]">
                Recommended Urgency: <strong className="text-cyan-800">ESI-{suggestedEsi}</strong> · Predicted Deterioration Risk: <strong className="text-rose-600 font-mono">{mlPred.riskScore}% ({mlPred.riskLevel})</strong>
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono">
              {([1, 2, 3, 4, 5] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedEsi(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    (selectedEsi || suggestedEsi) === lvl
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Target Ward Destination */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Ward Needed</label>
            <select
              value={targetWard}
              onChange={(e) => setTargetWard(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              <option value="Emergency Ward">Emergency Ward</option>
              <option value="ICU / Critical">ICU / Critical Care</option>
              <option value="Step-Down CCU">Step-Down CCU</option>
              <option value="General Ward">General Ward</option>
            </select>
          </div>

          {/* Inter-Hospital Transfer Option for Bed Saturation */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transferImmediately}
                  onChange={(e) => setTransferImmediately(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Transfer directly to network hospital with available beds</span>
                </span>
              </label>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-800">
                Diversion Protocol
              </span>
            </div>

            {transferImmediately && (
              <div className="space-y-2 pt-2 border-t border-amber-200/80">
                <label className="block text-slate-700 font-medium text-[11px]">
                  Select Receiving Hospital:
                </label>
                <div className="space-y-1.5">
                  {NETWORK_HOSPITALS.map(h => (
                    <label
                      key={h.id}
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        selectedHospitalId === h.id
                          ? 'bg-white border-cyan-500 ring-1 ring-cyan-500 text-slate-900'
                          : 'bg-white/80 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="receivingHospital"
                          checked={selectedHospitalId === h.id}
                          onChange={() => setSelectedHospitalId(h.id)}
                          className="text-cyan-600"
                        />
                        <div>
                          <strong className="block text-slate-900">{h.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {h.distanceKm} km · {h.transitMinutes} min ETA
                          </span>
                        </div>
                      </div>

                      <span className="text-emerald-700 font-mono font-bold text-[11px]">
                        {h.availableBeds.icu} ICU / {h.availableBeds.emergency} ER beds free
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-semibold text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5 ${
                transferImmediately ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              {transferImmediately ? (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Transfer to {targetHospital.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Admit to Local Triage Queue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
