import React, { useState, useEffect, useRef } from 'react';
import { 
  CLINICAL_PRESETS, 
  ClinicalDictationPreset, 
  parseClinicalEntities 
} from '../utils/medicalSpeechNlp';
import { ExtractedMedicalEntities, Patient } from '../types/hospital';
import { 
  Mic, 
  Play, 
  Square, 
  Copy, 
  Check, 
  UserPlus, 
  FileText, 
  AlertCircle,
  Activity,
  Heart,
  Pill,
  Stethoscope,
  Save
} from 'lucide-react';

interface SpeechTranscriptionProps {
  onPushToTriage: (entities: ExtractedMedicalEntities, transcript: string) => void;
  patients: Patient[];
  onAppendNoteToPatient: (patientId: string, noteText: string) => void;
}

export const SpeechTranscription: React.FC<SpeechTranscriptionProps> = ({
  onPushToTriage,
  patients,
  onAppendNoteToPatient
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingPreset, setIsPlayingPreset] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>(CLINICAL_PRESETS[0].transcript);
  const [activePreset, setActivePreset] = useState<ClinicalDictationPreset>(CLINICAL_PRESETS[0]);
  const [entities, setEntities] = useState<ExtractedMedicalEntities>(() => parseClinicalEntities(CLINICAL_PRESETS[0].transcript));
  const [isCopied, setIsCopied] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [transcriptSource, setTranscriptSource] = useState<'preset' | 'microphone'>('preset');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
        setTranscriptSource('microphone');
        const parsed = parseClinicalEntities(currentTranscript);
        setEntities(parsed);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Audio Waveform Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const active = isRecording || isPlayingPreset !== null;
      const barsCount = 48;
      const barWidth = width / barsCount;

      for (let i = 0; i < barsCount; i++) {
        const x = i * barWidth;
        let amplitude = 4;
        if (active) {
          amplitude = Math.sin((i * 0.3) + phase) * 18 + Math.cos((i * 0.15) - phase) * 12 + 8;
          amplitude = Math.max(4, Math.min(34, amplitude));
        }

        ctx.fillStyle = active ? '#0891b2' : '#cbd5e1';
        ctx.fillRect(x + 2, centerY - (amplitude / 2), barWidth - 4, amplitude);
      }

      phase += active ? 0.15 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isPlayingPreset]);

  // Handle Preset Dictation Click
  const handleSelectPreset = (preset: ClinicalDictationPreset) => {
    setActivePreset(preset);
    setIsPlayingPreset(preset.id);
    setIsRecording(false);
    setTranscriptSource('preset');

    setTimeout(() => {
      setTranscript(preset.transcript);
      const parsed = parseClinicalEntities(preset.transcript);
      setEntities(parsed);
      setIsPlayingPreset(null);
    }, 1000);
  };

  // Toggle Live Microphone
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Microphone speech recognition is not available in this browser window. You can select one of the clinical dictation presets below for immediate scenario testing.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setTranscript('');
        setTranscriptSource('microphone');
        recognitionRef.current.start();
        setIsRecording(true);
        setIsPlayingPreset(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyNote = () => {
    const formatted = `PULSEAI CLINICAL DICTATION SUMMARY
Date: ${new Date().toLocaleDateString()}
Chief Complaint: ${entities.chiefComplaint}
Suspected Diagnosis: ${entities.suspectedDiagnosis}
Recommended Urgency: Level ${entities.recommendedUrgency}
Vitals: ${JSON.stringify(entities.vitals)}
Symptoms: ${entities.symptoms.join(', ')}
Recommended Meds: ${entities.recommendedMedications.join(', ')}

DICTATION TRANSCRIPT:
${transcript}`;

    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePushToQueue = () => {
    onPushToTriage(entities, transcript);
  };

  const handleAttachNote = () => {
    if (!selectedPatientId) return;
    onAppendNoteToPatient(selectedPatientId, transcript);
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Module Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Clinical Voice Dictation & Documentation
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Captures clinical spoken notes and extracts structured triage indicators, vital tokens, symptoms, and orders into patient records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNote}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePushToQueue}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Triage Intake</span>
            </button>
          </div>
        </div>

        {/* Audio Waveform & Recording Controller */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center gap-6">
          <button
            onClick={toggleRecording}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-xs'
            }`}
            title="Start/Stop live microphone recording"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-6 h-6 text-cyan-600" />}
          </button>

          {/* Canvas Waveform */}
          <div className="flex-1 w-full space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={isRecording ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-600 font-medium'}>
                {isRecording && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
                {isRecording ? 'Listening live via station microphone...' : isPlayingPreset ? 'Loading clinical audio scenario...' : 'Microphone ready'}
              </span>
              <span className="text-slate-400">
                16kHz PCM Stream
              </span>
            </div>

            <div className="w-full h-11 bg-white rounded-lg overflow-hidden border border-slate-200">
              <canvas
                ref={canvasRef}
                width={600}
                height={44}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Clinical Scenarios Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Standard Clinical Dictation Scenarios (Click to test parsing):
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Emergency Presets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CLINICAL_PRESETS.map(preset => {
              const isSelected = activePreset.id === preset.id;
              const isPlaying = isPlayingPreset === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  disabled={isPlaying}
                  className={`p-2.5 rounded-lg text-left transition-all border text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-50/80 border-cyan-400 text-slate-900 shadow-xs ring-1 ring-cyan-400/30'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-bold text-slate-900 truncate">{preset.title}</span>
                    {isPlaying ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
                    ) : (
                      <Play className="w-3 h-3 text-cyan-600 shrink-0 fill-current" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {preset.doctorName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {preset.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Raw Transcript vs Structured Extracted Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Raw Clinical Transcript */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Dictated Transcript</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                transcriptSource === 'microphone' 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {transcriptSource === 'microphone' ? 'Source: Live Microphone' : 'Source: Clinical Scenario'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {transcript.split(' ').filter(Boolean).length} words
              </span>
            </div>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setEntities(parseClinicalEntities(e.target.value));
            }}
            rows={10}
            className="flex-1 min-h-[240px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Awaiting voice input or enter clinical progress dictation..."
          />

          {/* Quick attach note to an existing admitted patient */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs text-slate-600 whitespace-nowrap">Append to Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select admitted patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn})
                </option>
              ))}
            </select>
            <button
              onClick={handleAttachNote}
              disabled={!selectedPatientId}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Chart</span>
            </button>
            {noteSuccess && (
              <span className="text-xs text-emerald-600 font-mono font-bold">Saved!</span>
            )}
          </div>
        </div>

        {/* Right: Structured Clinical Extraction */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              <span>Extracted Clinical Profile</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              Suggested: ESI Level {entities.recommendedUrgency}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Chief Complaint */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold uppercase tracking-wider">Chief Complaint</span>
              </div>
              <p className="text-slate-900 font-bold">
                {entities.chiefComplaint}
              </p>
            </div>

            {/* Presumptive Diagnosis */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-cyan-600" />
                <span className="font-semibold uppercase tracking-wider">Presumptive Clinical Impression</span>
              </div>
              <p className="text-cyan-900 font-bold">
                {entities.suspectedDiagnosis}
              </p>
            </div>

            {/* Extracted Vitals */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold uppercase tracking-wider">Extracted Vitals</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">BP:</span>
                  <span className="text-slate-900 font-bold">{entities.vitals.bp || '—'}</span>
                </div>
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Pulse:</span>
                  <span className="text-slate-900 font-bold">{entities.vitals.hr || '—'}</span>
                </div>
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">SpO2:</span>
                  <span className="text-slate-900 font-bold">{entities.vitals.spo2 || '—'}</span>
                </div>
                <div className="p-1.5 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Resp Rate:</span>
                  <span className="text-slate-900 font-bold">{entities.vitals.rr || '—'}</span>
                </div>
              </div>
            </div>

            {/* Symptoms & Medications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Symptoms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Pill className="w-3 h-3 text-purple-600" />
                  <span>Ordered Medications</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entities.recommendedMedications.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Actions */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Suggested Clinical Actions:
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {entities.clinicalActions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
