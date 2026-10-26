import React, { useState } from 'react';
import { Patient, PatientVitals } from '../types/hospital';
import { calculateDeteriorationRisk } from '../utils/mlPredictor';
import { 
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Sliders,
  ShieldAlert,
  Info
} from 'lucide-react';

interface RiskPredictorProps {
  patients: Patient[];
  selectedPatientId?: string;
  onUpdatePatientVitals: (patientId: string, updatedVitals: PatientVitals) => void;
}

export const RiskPredictor: React.FC<RiskPredictorProps> = ({
  patients,
  selectedPatientId,
  onUpdatePatientVitals
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || (patients.length > 0 ? patients[0].id : '')
  );

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const [simulatedVitals, setSimulatedVitals] = useState<PatientVitals>(
    activePatient ? { ...activePatient.vitals } : {
      heartRate: 118,
      bloodPressureSys: 88,
      bloodPressureDia: 54,
      spo2: 90,
      respiratoryRate: 26,
      temperature: 37.8,
      gcs: 14,
      lactate: 3.6
    }
  );

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    const target = patients.find(p => p.id === id);
    if (target) {
      setSimulatedVitals({ ...target.vitals });
    }
  };

  const prediction = calculateDeteriorationRisk(simulatedVitals, activePatient?.age || 60);

  const handleApplyToPatient = () => {
    if (activePatient) {
      onUpdatePatientVitals(activePatient.id, simulatedVitals);
    }
  };

  const handleResetVitals = () => {
    if (activePatient) {
      setSimulatedVitals({ ...activePatient.vitals });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Clinical Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block font-sans">
            Demonstration Decision Support Module
          </span>
          <p className="text-amber-900/80 leading-relaxed">
            The vital sign trends and deterioration risk calculations below demonstrate early-warning clinical scoring interfaces. These algorithmic risk scores represent simulated decision support and are not intended for unverified clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Patient Selection & Vitals Sync Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">Reviewing Patient:</span>
          <select
            value={activePatientId}
            onChange={(e) => handleSelectPatient(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) · ESI-{p.esiOverride?.newLevel || p.esiLevel} · {p.chiefComplaint.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetVitals}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>

          <button
            onClick={handleApplyToPatient}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Vitals to Chart</span>
          </button>
        </div>
      </div>

      {/* Primary Risk Gauges & Vitals Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Probability Scores & Alerts */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center relative overflow-hidden">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Calculated Deterioration Risk
            </div>

            <div className="my-4 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-100"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className={
                      prediction.riskScore >= 75
                        ? 'stroke-rose-500'
                        : prediction.riskScore >= 50
                        ? 'stroke-amber-500'
                        : prediction.riskScore >= 25
                        ? 'stroke-yellow-500'
                        : 'stroke-emerald-500'
                    }
                    strokeWidth="9"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * prediction.riskScore) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {prediction.riskScore}%
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded mt-0.5 border ${
                    prediction.riskLevel === 'Critical'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : prediction.riskLevel === 'High'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : prediction.riskLevel === 'Moderate'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {prediction.riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* ICU Transfer & Readmission Risk Meters */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-left text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">ICU Transfer Risk</span>
                <span className="text-base font-bold text-rose-600 mt-0.5 block">
                  {prediction.icuTransferRisk}%
                </span>
                <span className="text-[10px] text-slate-400">Next 12 Hours</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">30-Day Readmission</span>
                <span className="text-base font-bold text-amber-700 mt-0.5 block">
                  {prediction.readmissionRisk}%
                </span>
                <span className="text-[10px] text-slate-400">Post-Discharge</span>
              </div>
            </div>
          </div>

          {/* Clinical Interventions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
              <span>Recommended Clinical Precautions</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              {prediction.clinicalRecommendations.map((rec, i) => (
                <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="text-cyan-700 font-mono text-[11px] mt-0.5 font-bold">&bull;</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Bedside Vitals Simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <span>Bedside Vitals Simulator</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-700 font-semibold">Live Testing</span>
          </div>
          <p className="text-xs text-slate-500">
            Simulate vital signs changes to inspect real-time risk recalculation:
          </p>

          <div className="space-y-3.5 text-xs">
            {/* SpO2 */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-semibold">Oxygen Saturation (SpO2)</span>
                <span className={`font-mono font-bold ${simulatedVitals.spo2 < 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulatedVitals.spo2}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={simulatedVitals.spo2}
                onChange={(e) => setSimulatedVitals({ ...simulatedVitals, spo2: Number(e.target.value) })}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>70% (Severe)</span>
                <span>95%+ (Normal)</span>
              </div>
            </div>

            {/* Systolic BP */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-semibold">Systolic Blood Pressure</span>
                <span className={`font-mono font-bold ${simulatedVitals.bloodPressureSys < 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulatedVitals.bloodPressureSys} mmHg
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="210"
                value={simulatedVitals.bloodPressureSys}
                onChange={(e) => setSimulatedVitals({ ...simulatedVitals, bloodPressureSys: Number(e.target.value) })}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>60 (Hypotensive)</span>
                <span>120 (Normal)</span>
                <span>200 (Crisis)</span>
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-semibold">Heart Rate (Pulse)</span>
                <span className={`font-mono font-bold ${simulatedVitals.heartRate > 110 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulatedVitals.heartRate} bpm
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={simulatedVitals.heartRate}
                onChange={(e) => setSimulatedVitals({ ...simulatedVitals, heartRate: Number(e.target.value) })}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>40 (Brady)</span>
                <span>75 (Normal)</span>
                <span>160 (Tachy)</span>
              </div>
            </div>

            {/* Serum Lactate */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-semibold">Serum Lactate</span>
                <span className={`font-mono font-bold ${simulatedVitals.lactate >= 2.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulatedVitals.lactate} mmol/L
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={simulatedVitals.lactate}
                onChange={(e) => setSimulatedVitals({ ...simulatedVitals, lactate: Number(e.target.value) })}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>&lt;2.0 (Normal)</span>
                <span>&gt;4.0 (Severe)</span>
              </div>
            </div>

            {/* GCS */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-semibold">Glasgow Coma Scale (GCS)</span>
                <span className={`font-mono font-bold ${simulatedVitals.gcs <= 9 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {simulatedVitals.gcs} / 15
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={simulatedVitals.gcs}
                onChange={(e) => setSimulatedVitals({ ...simulatedVitals, gcs: Number(e.target.value) })}
                className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3 (Coma)</span>
                <span>15 (Alert)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contributing Physiological Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-600" />
              <span>Contributing Physiological Factors</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Weight Analysis</span>
          </div>

          <p className="text-xs text-slate-500">
            Key vital signs driving the current deterioration assessment:
          </p>

          <div className="space-y-2.5">
            {prediction.featureContributions.map((fc, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${fc.isAbnormal ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <span className="font-bold text-slate-900">{fc.feature}</span>
                  </div>
                  <span className="font-mono text-cyan-700 font-bold">
                    +{fc.weight}% weight
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Value: {fc.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {fc.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
