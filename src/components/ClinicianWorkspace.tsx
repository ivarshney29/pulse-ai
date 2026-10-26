import React, { useState } from 'react';
import { Patient, HospitalBed, EsiLevel } from '../types/hospital';
import { 
  ShieldCheck, 
  Bed, 
  Edit3, 
  FileText, 
  Send,
  Truck,
  Plus,
  X,
  Heart,
  Stethoscope,
  Pill,
  AlertCircle
} from 'lucide-react';

interface ClinicianWorkspaceProps {
  patients: Patient[];
  beds: HospitalBed[];
  selectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
  onOverrideEsi: (patientId: string, newLevel: EsiLevel, reason: string, clinician: string) => void;
  onAssignBed: (bedId: string, patientId: string) => Promise<void>;
  onAddClinicalNote: (patientId: string, note: string, author: string, role: any) => void;
  onDischargePatient: (patientId: string) => void;
  onTransferPatient: (patient: Patient) => void;
}

export const ClinicianWorkspace: React.FC<ClinicianWorkspaceProps> = ({
  patients,
  beds,
  selectedPatientId,
  onSelectPatient,
  onOverrideEsi,
  onAssignBed,
  onAddClinicalNote,
  onDischargePatient,
  onTransferPatient
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || (patients.length > 0 ? patients[0].id : '')
  );

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  // Override Form state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newEsiLevel, setNewEsiLevel] = useState<EsiLevel>(1);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideClinician, setOverrideClinician] = useState('Attending Physician');

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Attending Physician');
  const [noteRole, setNoteRole] = useState<'Attending Physician' | 'Triage Nurse' | 'Resident'>('Attending Physician');

  // Bed Assign dropdown
  const [targetBedId, setTargetBedId] = useState('');

  // Add Allergy / Med state
  const [newAllergy, setNewAllergy] = useState('');
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newMed, setNewMed] = useState('');
  const [showAddMed, setShowAddMed] = useState(false);

  const availableBeds = beds.filter(b => b.status === 'Available');

  const handleExecuteOverride = () => {
    if (!activePatient || !overrideReason) return;
    onOverrideEsi(activePatient.id, newEsiLevel, overrideReason, overrideClinician);
    setOverrideModalOpen(false);
    setOverrideReason('');
  };

  const handlePostNote = () => {
    if (!activePatient || !newNoteText.trim()) return;
    onAddClinicalNote(activePatient.id, newNoteText.trim(), noteAuthor, noteRole);
    setNewNoteText('');
  };

  const handleExecuteBedAssignment = async () => {
    if (!activePatient || !targetBedId) return;
    await onAssignBed(targetBedId, activePatient.id);
    setTargetBedId('');
  };

  const handleAddAllergy = () => {
    if (!activePatient || !newAllergy.trim()) return;
    activePatient.allergies.push(newAllergy.trim());
    setNewAllergy('');
    setShowAddAllergy(false);
  };

  const handleAddMed = () => {
    if (!activePatient || !newMed.trim()) return;
    activePatient.medications.push(newMed.trim());
    setNewMed('');
    setShowAddMed(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-600" />
            <span>Clinician Desk & Patient Chart</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive patient EHR, bedside telemetry, triage severity override, and progress documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">Select Patient:</span>
          <select
            value={activePatientId}
            onChange={(e) => {
              setActivePatientId(e.target.value);
              const p = patients.find(pt => pt.id === e.target.value);
              if (p) onSelectPatient(p);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) · ESI-{p.esiOverride?.newLevel || p.esiLevel} · {p.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activePatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Patient Overview Column (1 col) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activePatient.name}
                </h3>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  MRN: {activePatient.mrn} &middot; {activePatient.age}y &middot; {activePatient.gender}
                </div>
              </div>

              <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${
                activePatient.status === 'Triage Queue'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : activePatient.status === 'Transferred'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {activePatient.status}
              </span>
            </div>

            {/* If Transferred, Show Transfer Banner */}
            {activePatient.status === 'Transferred' && activePatient.transferDetails && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Truck className="w-4 h-4 text-purple-700" />
                  <span>Regional Transfer Dispatched</span>
                </div>
                <div>Destination: <strong>{activePatient.transferDetails.targetHospital}</strong></div>
                <div className="text-[11px] text-purple-800 font-mono">
                  Ambulance: {activePatient.transferDetails.ambulanceUnit} &middot; ETA: {activePatient.transferDetails.transitMinutes} mins
                </div>
              </div>
            )}

            {/* Current ESI Severity & Override Button */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Triage Urgency:</span>
                <button
                  onClick={() => {
                    setNewEsiLevel(activePatient.esiOverride ? activePatient.esiOverride.newLevel : activePatient.esiLevel);
                    setOverrideModalOpen(true);
                  }}
                  className="text-cyan-700 hover:text-cyan-900 flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Override ESI</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded border ${
                  (activePatient.esiOverride?.newLevel || activePatient.esiLevel) === 1
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : (activePatient.esiOverride?.newLevel || activePatient.esiLevel) === 2
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                }`}>
                  Level {activePatient.esiOverride?.newLevel || activePatient.esiLevel} (
                  {(activePatient.esiOverride?.newLevel || activePatient.esiLevel) === 1
                    ? 'Resuscitation'
                    : (activePatient.esiOverride?.newLevel || activePatient.esiLevel) === 2
                    ? 'Emergent'
                    : 'Urgent'}
                  )
                </span>
              </div>

              {activePatient.esiOverride && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 mt-2">
                  <div className="font-semibold">Clinician Severity Override Log:</div>
                  <div>Original: ESI-{activePatient.esiOverride.originalLevel} &rarr; New: ESI-{activePatient.esiOverride.newLevel}</div>
                  <div className="text-slate-600 mt-0.5">Rationale: "{activePatient.esiOverride.reason}"</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Signed by {activePatient.esiOverride.clinician} at {activePatient.esiOverride.timestamp}</div>
                </div>
              )}
            </div>

            {/* Bed Status & Assignment / Transfer Control */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-slate-600 font-semibold block">Bed Assignment:</span>
              <div className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>{activePatient.assignedBedId ? `Bed ${activePatient.assignedBedId}` : 'Awaiting Bed in Queue'}</span>
                {activePatient.assignedBedId && (
                  <button
                    onClick={() => onDischargePatient(activePatient.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold"
                  >
                    Discharge / Release
                  </button>
                )}
              </div>

              {!activePatient.assignedBedId && activePatient.status !== 'Transferred' && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={targetBedId}
                      onChange={(e) => setTargetBedId(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Choose Available Bed...</option>
                      {availableBeds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.code} ({b.ward})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleExecuteBedAssignment}
                      disabled={!targetBedId}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-40 shadow-xs"
                    >
                      Book
                    </button>
                  </div>

                  <button
                    onClick={() => onTransferPatient(activePatient)}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Transfer to Regional Network Hospital</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bedside Vitals Telemetry */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Bedside Vitals</span>
                <span className="font-mono text-cyan-700">Telemetry</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Heart Rate</span>
                  <span className="text-slate-900 font-bold">{activePatient.vitals.heartRate} bpm</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Blood Pressure</span>
                  <span className="text-slate-900 font-bold">{activePatient.vitals.bloodPressureSys}/{activePatient.vitals.bloodPressureDia}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Oxygen Sat</span>
                  <span className={`font-bold ${activePatient.vitals.spo2 < 92 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {activePatient.vitals.spo2}%
                  </span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-sans">Lactate</span>
                  <span className={`font-bold ${activePatient.vitals.lactate >= 2.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {activePatient.vitals.lactate} mmol/L
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Profile, Allergies, Meds & Notes (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Presentation, Allergies, Medications */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Clinical Presentation & Profile
              </h4>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <span className="text-slate-500 block text-[11px] font-semibold mb-0.5">Chief Complaint:</span>
                {activePatient.chiefComplaint}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Allergies */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[11px]">Known Allergies</span>
                    <button
                      onClick={() => setShowAddAllergy(!showAddAllergy)}
                      className="text-cyan-700 hover:text-cyan-900 text-[11px] flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {showAddAllergy && (
                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="e.g. Codeine"
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded flex-1"
                      />
                      <button
                        onClick={handleAddAllergy}
                        className="px-2 py-1 bg-cyan-600 text-white rounded text-xs"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {activePatient.allergies.length > 0 ? (
                      activePatient.allergies.map((all, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                          {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">No known drug allergies (NKDA)</span>
                    )}
                  </div>
                </div>

                {/* Medications */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[11px]">Active Medications</span>
                    <button
                      onClick={() => setShowAddMed(!showAddMed)}
                      className="text-cyan-700 hover:text-cyan-900 text-[11px] flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  {showAddMed && (
                    <div className="flex gap-1 pt-1">
                      <input
                        type="text"
                        value={newMed}
                        onChange={(e) => setNewMed(e.target.value)}
                        placeholder="e.g. Lisinopril 10mg"
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded flex-1"
                      />
                      <button
                        onClick={handleAddMed}
                        className="px-2 py-1 bg-cyan-600 text-white rounded text-xs"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {activePatient.medications.length > 0 ? (
                      activePatient.medications.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs">No active medications on chart</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <span>Clinical Progress Notes</span>
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {activePatient.clinicalNotes.length} entries
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {activePatient.clinicalNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No clinical progress notes on record yet.
                  </p>
                ) : (
                  activePatient.clinicalNotes.map(n => (
                    <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-900">
                          {n.author} ({n.role})
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          {n.source === 'speech' && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-semibold">
                              Voice Dictation
                            </span>
                          )}
                          <span>{n.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-slate-800 leading-relaxed pt-1 font-sans">
                        {n.note}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Write New Note Form */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Add Clinical Note:</span>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="text"
                      value={noteAuthor}
                      onChange={(e) => setNoteAuthor(e.target.value)}
                      placeholder="Doctor Name"
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 text-xs w-40"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter clinical assessment, bedside observations, or treatment plan..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <button
                    onClick={handlePostNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center disabled:opacity-40 shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          No patient selected.
        </div>
      )}

      {/* Triage Override Modal */}
      {overrideModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Clinical Severity ESI Override
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                  Audit Logged
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Patient: <strong className="text-slate-900">{activePatient.name}</strong> ({activePatient.mrn})
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Urgency ESI Level:
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
                {([1, 2, 3, 4, 5] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewEsiLevel(lvl)}
                    className={`py-2 rounded-lg border font-bold transition-colors ${
                      newEsiLevel === lvl
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ESI-{lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Rationale for Severity Override:
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State clinical rationale (e.g. silent ischemia risk, atypical presentation, hemodynamic instability)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorizing Clinician Name:
              </label>
              <input
                type="text"
                value={overrideClinician}
                onChange={(e) => setOverrideClinician(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                Sign & Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
