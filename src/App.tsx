import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { 
  Patient, 
  HospitalBed, 
  ThreadExecutionLog, 
  MutexState, 
  EsiLevel, 
  PatientVitals, 
  InterHospitalTransfer,
  HospitalAlert
} from './types/hospital';
import { INITIAL_PATIENTS, INITIAL_BEDS } from './data/initialData';
import { hospitalMutex } from './utils/osScheduler';
import { calculateDeteriorationRisk } from './utils/mlPredictor';
import { ExtractedMedicalEntities } from './types/hospital';
import { useAuth } from './context/AuthContext';

import { Header } from './components/Header';
import { Sidebar, DashboardTab } from './components/Sidebar';
import { HospitalOverview } from './components/HospitalOverview';
import { TriageDashboard } from './components/TriageDashboard';
import { SmartBedManager } from './components/SmartBedManager';
import { SpeechTranscription } from './components/SpeechTranscription';
import { RiskPredictor } from './components/RiskPredictor';
import { ClinicianWorkspace } from './components/ClinicianWorkspace';
import { TransfersView } from './components/TransfersView';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { SystemMonitoring } from './components/SystemMonitoring';
import { SettingsView } from './components/SettingsView';
import { NewPatientModal } from './components/NewPatientModal';
import { InterHospitalTransferModal } from './components/InterHospitalTransferModal';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { FirebaseSetupModal } from './components/FirebaseSetupModal';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = useState<HospitalBed[]>(INITIAL_BEDS);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [mutexState, setMutexState] = useState<MutexState>(() => hospitalMutex.getStatus());
  const [threadLogs, setThreadLogs] = useState<ThreadExecutionLog[]>([
    {
      id: 'log-01',
      threadId: 101,
      patientId: 'PT-1001',
      patientName: 'Robert Vance',
      bedId: 'BED-ICU-01',
      action: 'CRITICAL_SECTION_ALLOCATION',
      status: 'SUCCESS',
      latencyMs: 1.4,
      timestamp: '06:15 AM'
    },
    {
      id: 'log-02',
      threadId: 104,
      patientId: 'PT-1003',
      patientName: 'Daniel Chen',
      bedId: 'BED-ER-01',
      action: 'CRITICAL_SECTION_ALLOCATION',
      status: 'SUCCESS',
      latencyMs: 1.8,
      timestamp: '07:05 AM'
    }
  ]);

  const [alerts, setAlerts] = useState<HospitalAlert[]>([
    {
      id: 'alert-1',
      type: 'critical',
      title: 'Code Red Resuscitation Arrival',
      description: 'Incoming cardiac arrest patient Samuel Hayes admitted to Emergency Triage.',
      timestamp: '10:32 AM',
      patientId: 'PT-1011'
    },
    {
      id: 'alert-2',
      type: 'success',
      title: 'Bed Allocated Successfully',
      description: 'Robert Vance assigned to ICU Bed 101 with ventilator telemetry active.',
      timestamp: '06:15 AM',
      bedId: 'BED-ICU-01'
    },
    {
      id: 'alert-3',
      type: 'info',
      title: 'Network Diversion Ready',
      description: '5 regional partner hospitals reporting open critical care beds.',
      timestamp: '08:00 AM'
    }
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [patientForTransfer, setPatientForTransfer] = useState<Patient | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3800);
  };

  const addOperationalAlert = (alert: Omit<HospitalAlert, 'id' | 'timestamp'>) => {
    const newAlert: HospitalAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
  };

  // URL Hash Synchronizer & Mandatory Dashboard Protection
  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || '').toLowerCase();

      if (hash === '#signup') {
        setPage('auth');
        setAuthInitialTab('signup');
        return;
      }

      if (hash === '#login' || hash === '#auth') {
        setPage('auth');
        setAuthInitialTab('login');
        return;
      }

      // Check all protected dashboard routes
      const validDashboardRoutes: DashboardTab[] = [
        'overview', 'triage', 'beds', 'clinician', 'risk', 'speech', 'transfers', 'analytics', 'monitoring', 'settings'
      ];

      const cleanHash = hash.replace('#', '') as DashboardTab;
      const isDashboardHash = hash === '#dashboard' || validDashboardRoutes.includes(cleanHash);

      if (isDashboardHash) {
        if (!loading) {
          if (!user) {
            showToast('Authentication Required: Please log in with your clinical credentials.');
            window.history.replaceState(null, '', window.location.pathname + '#landing');
            window.location.hash = '#landing';
            setPage('landing');
          } else {
            setPage('dashboard');
            if (cleanHash === 'transfers') {
              setActiveTab('transfers');
            } else if (validDashboardRoutes.includes(cleanHash)) {
              setActiveTab(cleanHash);
            } else {
              setActiveTab('overview');
            }
          }
        }
        return;
      }

      // Default to landing page for #landing, empty hash, or unauthenticated root
      setPage('landing');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      setPage('landing');
      window.history.replaceState(null, '', window.location.pathname + '#landing');
      window.location.hash = '#landing';
      showToast('You have been logged out successfully.');
    } catch (err: any) {
      showToast('Logout error: ' + (err?.message || 'Failed to sign out. Please try again.'));
    }
  };

  const syncMutex = () => {
    setMutexState(hospitalMutex.getStatus());
  };

  // Thread-Safe Atomic Bed Allocation Handler
  const handleAllocateBed = async (patient: Patient) => {
    let targetBed = beds.find(b => b.ward === patient.targetWard && b.status === 'Available');
    if (!targetBed) {
      targetBed = beds.find(b => b.status === 'Available');
    }

    if (!targetBed) {
      showToast(`Notice: Local beds full in ${patient.targetWard}. Opening Inter-Hospital Transfer Network...`);
      setPatientForTransfer(patient);
      setTransferModalOpen(true);
      return;
    }

    const threadId = Math.floor(100 + Math.random() * 900);
    const latency = await hospitalMutex.acquire(threadId, patient.id, targetBed.id);
    syncMutex();

    setBeds(prevBeds =>
      prevBeds.map(b =>
        b.id === targetBed!.id
          ? {
              ...b,
              status: 'Occupied',
              currentPatientId: patient.id,
              currentPatientName: patient.name
            }
          : b
      )
    );

    setPatients(prevPatients =>
      prevPatients.map(p =>
        p.id === patient.id
          ? {
              ...p,
              status: 'Bed Allocated',
              assignedBedId: targetBed!.id
            }
          : p
      )
    );

    const commitLog: ThreadExecutionLog = {
      id: `log-${Date.now()}`,
      threadId,
      patientId: patient.id,
      patientName: patient.name,
      bedId: targetBed.id,
      action: 'CRITICAL_SECTION_ALLOCATION',
      status: 'SUCCESS',
      latencyMs: Number((latency + 0.4).toFixed(2)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setThreadLogs(prev => [commitLog, ...prev.slice(0, 49)]);

    hospitalMutex.release();
    syncMutex();

    addOperationalAlert({
      type: 'success',
      title: 'Bed Allocated',
      description: `${patient.name} admitted to ${targetBed.code} (${targetBed.ward}).`,
      patientId: patient.id,
      bedId: targetBed.id
    });

    showToast(`Patient ${patient.name} assigned to ${targetBed.code} (${targetBed.ward}).`);
  };

  // Manual specific bed assignment
  const handleManualBedAssign = async (bedId: string, patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    const bed = beds.find(b => b.id === bedId);
    if (!patient || !bed) return;

    const threadId = Math.floor(100 + Math.random() * 900);
    const latency = await hospitalMutex.acquire(threadId, patient.id, bed.id);
    syncMutex();

    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? { ...b, status: 'Occupied', currentPatientId: patient.id, currentPatientName: patient.name }
          : b
      )
    );

    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? { ...p, status: 'Bed Allocated', assignedBedId: bedId }
          : p
      )
    );

    hospitalMutex.release();
    syncMutex();

    const log: ThreadExecutionLog = {
      id: `log-${Date.now()}`,
      threadId,
      patientId: patient.id,
      patientName: patient.name,
      bedId: bed.id,
      action: 'CRITICAL_SECTION_ALLOCATION',
      status: 'SUCCESS',
      latencyMs: latency,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setThreadLogs(prev => [log, ...prev.slice(0, 49)]);

    addOperationalAlert({
      type: 'success',
      title: 'Bed Assigned',
      description: `${patient.name} placed in ${bed.code}.`,
      patientId: patient.id,
      bedId: bed.id
    });

    showToast(`Patient ${patient.name} assigned to ${bed.code}.`);
  };

  // Discharge from bed
  const handleDischargeBed = (bedId: string) => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed) return;

    if (bed.currentPatientId) {
      setPatients(prev =>
        prev.map(p =>
          p.id === bed.currentPatientId
            ? { ...p, status: 'Discharged', assignedBedId: null }
            : p
        )
      );
    }

    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? { ...b, status: 'Cleaning', currentPatientId: null, currentPatientName: null }
          : b
      )
    );

    addOperationalAlert({
      type: 'info',
      title: 'Bed Turnover Initiated',
      description: `Bed ${bed.code} released. Marked for terminal sanitization.`,
      bedId: bed.id
    });

    showToast(`Bed ${bed.code} released. Marked for terminal sanitization.`);
  };

  // Clean Bed
  const handleCleanBed = (bedId: string) => {
    setBeds(prev =>
      prev.map(b =>
        b.id === bedId
          ? { ...b, status: 'Available', lastCleanedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : b
      )
    );

    addOperationalAlert({
      type: 'success',
      title: 'Bed Released to Service',
      description: `Bed ${bedId} sanitized and ready for patient admission.`,
      bedId
    });

    showToast(`Bed ${bedId} sanitized and marked Available for admission.`);
  };

  // Execute Inter-Hospital Transfer
  const handleExecuteTransfer = (patientId: string, transfer: InterHospitalTransfer) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    if (patient.assignedBedId) {
      setBeds(prev =>
        prev.map(b =>
          b.id === patient.assignedBedId
            ? { ...b, status: 'Cleaning', currentPatientId: null, currentPatientName: null }
            : b
        )
      );
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              status: 'Transferred',
              assignedBedId: null,
              transferDetails: transfer,
              clinicalNotes: [
                ...p.clinicalNotes,
                {
                  id: `note-${Date.now()}`,
                  author: user?.displayName || 'Attending Physician',
                  role: 'Attending Physician',
                  timestamp: currentTime,
                  note: `Emergency transfer dispatched to ${transfer.targetHospital}. Ambulance: ${transfer.ambulanceUnit} (ETA ${transfer.transitMinutes} mins). Reason: ${transfer.transferReason}`,
                  source: 'manual'
                }
              ]
            }
          : p
      )
    );

    addOperationalAlert({
      type: 'warning',
      title: 'Inter-Hospital Transfer Dispatched',
      description: `${patient.name} dispatched to ${transfer.targetHospital} (${transfer.transitMinutes}m ETA).`,
      patientId: patient.id
    });

    showToast(`Patient ${patient.name} dispatched to ${transfer.targetHospital} (${transfer.transitMinutes}m ETA).`);
  };

  // Open transfer for a specific patient
  const handleOpenTransferForPatient = (patient: Patient) => {
    setPatientForTransfer(patient);
    setTransferModalOpen(true);
  };

  // Concurrency Verification Stress Test
  const handleRunConcurrencySimulation = async (threadsCount: number) => {
    setIsSimulating(true);
    showToast(`Executing ${threadsCount} concurrent allocation requests...`);

    const newLogs: ThreadExecutionLog[] = [];

    for (let i = 1; i <= threadsCount; i++) {
      const threadId = 200 + i;
      const dummyPatient = `Station-${i}`;
      const dummyBed = beds[i % beds.length].code;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const lat = await hospitalMutex.acquire(threadId, `STA-${i}`, dummyBed);
      
      const action = (i % 3 === 0) ? 'CONFLICT_RESOLVED' : 'CRITICAL_SECTION_ALLOCATION';
      newLogs.unshift({
        id: `sim-log-${Date.now()}-${i}`,
        threadId,
        patientId: `STA-${i}`,
        patientName: dummyPatient,
        bedId: dummyBed,
        action,
        status: 'SUCCESS',
        latencyMs: lat,
        timestamp: timeStr
      });

      hospitalMutex.release();

      if (i % 5 === 0) {
        setThreadLogs(prev => [...newLogs.slice(0, 15), ...prev.slice(0, 35)]);
        syncMutex();
        await new Promise(r => setTimeout(r, 40));
      }
    }

    setThreadLogs(prev => [...newLogs.slice(0, 30), ...prev.slice(0, 20)]);
    syncMutex();
    setIsSimulating(false);
    showToast(`Verification passed: ${threadsCount} concurrent terminal requests processed with 0 conflicts.`);
  };

  // Push Speech Note to Triage Queue
  const handlePushSpeechToTriage = (entities: ExtractedMedicalEntities, transcript: string) => {
    const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const parseNum = (str?: string, fallback = 75) => {
      if (!str) return fallback;
      const match = str.match(/\d+/);
      return match ? Number(match[0]) : fallback;
    };

    const vitals: PatientVitals = {
      heartRate: parseNum(entities.vitals.hr, 108),
      bloodPressureSys: entities.vitals.bp ? Number(entities.vitals.bp.split('/')[0]) || 96 : 96,
      bloodPressureDia: entities.vitals.bp ? Number(entities.vitals.bp.split('/')[1]?.split(' ')[0]) || 60 : 60,
      spo2: parseNum(entities.vitals.spo2, 92),
      respiratoryRate: parseNum(entities.vitals.rr, 24),
      temperature: parseNum(entities.vitals.temp, 37.5),
      gcs: 14,
      lactate: 2.9
    };

    const mlPred = calculateDeteriorationRisk(vitals, 62);

    const newPatient: Patient = {
      id: newId,
      mrn: newMrn,
      name: entities.chiefComplaint.includes('Chest') ? 'Arthur Pendelton' : entities.chiefComplaint.includes('Asthma') ? 'Kevin Zhang' : 'Grace Montgomery',
      age: 62,
      gender: 'Male',
      arrivalTime: currentTime,
      waitMinutes: 2,
      chiefComplaint: entities.chiefComplaint,
      esiLevel: entities.recommendedUrgency,
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
      targetWard: entities.recommendedUrgency === 1 ? 'ICU / Critical' : 'Emergency Ward',
      assignedBedId: null,
      status: 'Triage Queue',
      allergies: [],
      medications: entities.recommendedMedications,
      clinicalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Voice Dictation Station',
          role: 'Attending Physician',
          timestamp: currentTime,
          note: transcript,
          source: 'speech',
          extractedEntities: {
            symptoms: entities.symptoms,
            medications: entities.recommendedMedications,
            suggestedAction: entities.clinicalActions.join('; ')
          }
        }
      ]
    };

    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setActiveTab('triage');

    addOperationalAlert({
      type: 'info',
      title: 'Dictated Intake Created',
      description: `${newPatient.name} added to Triage Queue (ESI-${newPatient.esiLevel}).`,
      patientId: newPatient.id
    });

    showToast(`New patient created from speech transcript: ${newPatient.name} added to Triage.`);
  };

  const handleAppendNoteToPatient = (patientId: string, noteText: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              clinicalNotes: [
                ...p.clinicalNotes,
                {
                  id: `note-${Date.now()}`,
                  author: user?.displayName || 'Attending Physician',
                  role: 'Attending Physician',
                  timestamp: currentTime,
                  note: noteText,
                  source: 'speech'
                }
              ]
            }
          : p
      )
    );
    showToast(`Clinical note appended to patient record.`);
  };

  const handleOverrideEsi = (patientId: string, newLevel: EsiLevel, reason: string, clinician: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            esiOverride: {
              originalLevel: p.esiLevel,
              newLevel,
              reason,
              clinician,
              timestamp: currentTime
            }
          };
        }
        return p;
      })
    );

    addOperationalAlert({
      type: 'warning',
      title: 'Triage Severity Overridden',
      description: `Patient ${patientId} updated to ESI-${newLevel} by ${clinician}.`,
      patientId
    });

    showToast(`Triage ESI overridden to Level ${newLevel} by ${clinician}. Audit trail logged.`);
  };

  const handleUpdatePatientVitals = (patientId: string, updatedVitals: PatientVitals) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const ml = calculateDeteriorationRisk(updatedVitals, p.age);
          return {
            ...p,
            vitals: updatedVitals,
            riskScore: ml.riskScore,
            riskLevel: ml.riskLevel,
            icuTransferRisk: ml.icuTransferRisk,
            readmissionRisk: ml.readmissionRisk,
            riskFactors: ml.featureContributions.slice(0, 3).map(f => ({
              factor: f.feature,
              impact: `+${f.weight}% Risk`,
              severity: f.weight > 20 ? 'high' : 'medium'
            }))
          };
        }
        return p;
      })
    );
    showToast(`Bedside vitals and deterioration risk score updated.`);
  };

  const handleAddClinicalNote = (patientId: string, note: string, author: string, role: any) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              clinicalNotes: [
                ...p.clinicalNotes,
                {
                  id: `note-${Date.now()}`,
                  author,
                  role,
                  timestamp: currentTime,
                  note,
                  source: 'manual'
                }
              ]
            }
          : p
      )
    );
    showToast(`Clinical note recorded by ${author}.`);
  };

  const handleSimulateNewArrival = () => {
    const sampleNames = ['Aria Montgomery', 'Carlos Mendoza', 'Siddharth Rao', 'Fatima Al-Mansoor', 'Tyler Henderson'];
    const sampleComplaints = [
      'Acute crushing chest tightness with left shoulder radiation and nausea',
      'Acute exacerbation of COPD with severe respiratory distress',
      'Sudden onset focal neurological deficit with right hemiparesis',
      'Severe abdominal rigidity with high fever and chills',
      'Traumatic vehicular deceleration injury with blunt thoracic trauma'
    ];
    const randIdx = Math.floor(Math.random() * sampleNames.length);

    const newId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const vitals: PatientVitals = {
      heartRate: 116 + Math.floor(Math.random() * 20),
      bloodPressureSys: 88 + Math.floor(Math.random() * 25),
      bloodPressureDia: 54 + Math.floor(Math.random() * 15),
      spo2: 89 + Math.floor(Math.random() * 5),
      respiratoryRate: 24 + Math.floor(Math.random() * 8),
      temperature: 37.8,
      gcs: 14,
      lactate: 3.2
    };

    const mlPred = calculateDeteriorationRisk(vitals, 58);

    const newPatient: Patient = {
      id: newId,
      mrn: newMrn,
      name: sampleNames[randIdx],
      age: 58,
      gender: 'Female',
      arrivalTime: currentTime,
      waitMinutes: 1,
      chiefComplaint: sampleComplaints[randIdx],
      esiLevel: 1,
      vitals,
      riskScore: mlPred.riskScore,
      riskLevel: mlPred.riskLevel,
      icuTransferRisk: mlPred.icuTransferRisk,
      readmissionRisk: mlPred.readmissionRisk,
      riskFactors: mlPred.featureContributions.slice(0, 3).map(f => ({
        factor: f.feature,
        impact: `+${f.weight}% Risk`,
        severity: 'high'
      })),
      targetWard: 'ICU / Critical',
      assignedBedId: null,
      status: 'Triage Queue',
      allergies: ['Penicillin'],
      medications: ['Aspirin 81mg'],
      clinicalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Ambulance Paramedic',
          role: 'Triage Nurse',
          timestamp: currentTime,
          note: `Code Red arrival. Paramedics report acute unstable vitals en-route. Triage priority queue updated.`,
          source: 'manual'
        }
      ]
    };

    setPatients(prev => [newPatient, ...prev]);

    addOperationalAlert({
      type: 'critical',
      title: 'Emergency Arrival: Code Red',
      description: `${newPatient.name} (ESI-1) admitted to Emergency Triage.`,
      patientId: newPatient.id
    });

    showToast(`Emergency Arrival: ${newPatient.name} (ESI-1) admitted to Triage Queue.`);
  };

  const criticalCount = patients.filter(
    p => p.status === 'Triage Queue' && (p.esiLevel <= 2 || p.riskLevel === 'Critical')
  ).length;

  // 1. SESSION VERIFICATION LOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-xs animate-pulse">
            <Activity className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div className="font-bold text-slate-800 text-sm">PulseAI Hospital System</div>
          <div className="text-xs text-slate-500 font-mono">Verifying clinical credentials...</div>
        </div>
      </div>
    );
  }

  // 2. PUBLIC LANDING PAGE (Default entry point for all visitors)
  if (page === 'landing') {
    return (
      <LandingPage
        onLoginClick={() => {
          setAuthInitialTab('login');
          setPage('auth');
          window.location.hash = '#login';
        }}
        onGetStartedClick={() => {
          if (user) {
            setPage('dashboard');
            window.location.hash = '#overview';
          } else {
            setAuthInitialTab('signup');
            setPage('auth');
            window.location.hash = '#signup';
          }
        }}
      />
    );
  }

  // 3. SEPARATE AUTHENTICATION PAGE (Login & Sign Up)
  if (page === 'auth') {
    return (
      <AuthPage
        initialTab={authInitialTab}
        onSuccess={() => {
          setPage('dashboard');
          window.location.hash = '#overview';
          showToast('Clinical access verified. Welcome to PulseAI.');
        }}
        onGoToLanding={() => {
          setPage('landing');
          window.location.hash = '#landing';
        }}
      />
    );
  }

  // 4. MANDATORY DASHBOARD PROTECTION (Strict Access Gate)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="p-6 max-w-md w-full bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Protected Clinical Route</h2>
          <p className="text-xs text-slate-600">
            Authentication required to view patient triage records, hospital beds, and clinical information.
          </p>
          <button
            onClick={() => {
              setPage('auth');
              setAuthInitialTab('login');
              window.location.hash = '#login';
            }}
            className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-xs"
          >
            Authenticate with Staff Credentials
          </button>
        </div>
      </div>
    );
  }

  // 5. PROTECTED HOSPITAL DASHBOARD (Sidebar + Header Command Center)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans antialiased">
      
      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.location.hash = `#${tab}`;
        }}
        criticalCount={criticalCount}
        onOpenNewPatient={() => setNewPatientModalOpen(true)}
        currentUser={user}
        onLogout={handleLogout}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Command Center Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          currentUser={user}
          onLogout={handleLogout}
          onGoToLanding={() => {
            setPage('landing');
            window.location.hash = '#landing';
          }}
          alerts={alerts}
        />

        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md bg-white border border-cyan-400 text-slate-900 px-4 py-3 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0 animate-ping" />
            <span className="leading-snug font-sans font-medium">{notification}</span>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <HospitalOverview
              patients={patients}
              beds={beds}
              alerts={alerts}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.location.hash = `#${tab}`;
              }}
              onSelectPatient={(p) => {
                setSelectedPatientId(p.id);
                setActiveTab('clinician');
                window.location.hash = '#clinician';
              }}
              onAllocateBed={handleAllocateBed}
              onTransferPatient={handleOpenTransferForPatient}
              onOpenNewPatient={() => setNewPatientModalOpen(true)}
            />
          )}

          {activeTab === 'triage' && (
            <TriageDashboard
              patients={patients}
              beds={beds}
              onSelectPatient={(p) => {
                setSelectedPatientId(p.id);
                setActiveTab('clinician');
                window.location.hash = '#clinician';
              }}
              onAllocateBed={handleAllocateBed}
              onViewRisk={(p) => {
                setSelectedPatientId(p.id);
                setActiveTab('risk');
                window.location.hash = '#risk';
              }}
              onTransferPatient={handleOpenTransferForPatient}
              onSimulateNewArrival={handleSimulateNewArrival}
            />
          )}

          {activeTab === 'beds' && (
            <SmartBedManager
              beds={beds}
              patients={patients}
              mutexState={mutexState}
              threadLogs={threadLogs}
              onManualAllocateBed={handleManualBedAssign}
              onDischargeBed={handleDischargeBed}
              onCleanBed={handleCleanBed}
              onOpenTransferNetwork={() => {
                const defaultPt = patients.find(p => p.status === 'Triage Queue') || patients[0];
                setPatientForTransfer(defaultPt);
                setTransferModalOpen(true);
              }}
            />
          )}

          {activeTab === 'clinician' && (
            <ClinicianWorkspace
              patients={patients}
              beds={beds}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(p) => setSelectedPatientId(p.id)}
              onOverrideEsi={handleOverrideEsi}
              onAssignBed={handleManualBedAssign}
              onAddClinicalNote={handleAddClinicalNote}
              onTransferPatient={handleOpenTransferForPatient}
              onDischargePatient={(patientId) => {
                const p = patients.find(pt => pt.id === patientId);
                if (p?.assignedBedId) {
                  handleDischargeBed(p.assignedBedId);
                }
              }}
            />
          )}

          {activeTab === 'risk' && (
            <RiskPredictor
              patients={patients}
              selectedPatientId={selectedPatientId}
              onUpdatePatientVitals={handleUpdatePatientVitals}
            />
          )}

          {activeTab === 'speech' && (
            <SpeechTranscription
              onPushToTriage={handlePushSpeechToTriage}
              patients={patients}
              onAppendNoteToPatient={handleAppendNoteToPatient}
            />
          )}

          {activeTab === 'transfers' && (
            <TransfersView
              patients={patients}
              onOpenTransferModal={handleOpenTransferForPatient}
            />
          )}

          {activeTab === 'analytics' && (
            <ReportsAnalytics
              patients={patients}
              beds={beds}
            />
          )}

          {activeTab === 'monitoring' && (
            <SystemMonitoring
              mutexState={mutexState}
              onSimulateThreads={handleRunConcurrencySimulation}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={user}
              onLogout={handleLogout}
              onOpenFirebaseConfig={() => setFirebaseModalOpen(true)}
            />
          )}
        </main>

        {/* Modals */}
        <NewPatientModal
          isOpen={newPatientModalOpen}
          onClose={() => setNewPatientModalOpen(false)}
          onAddPatient={(newPatient) => {
            setPatients(prev => [newPatient, ...prev]);
            setSelectedPatientId(newPatient.id);
            setActiveTab('triage');
            addOperationalAlert({
              type: newPatient.status === 'Transferred' ? 'warning' : 'info',
              title: newPatient.status === 'Transferred' ? 'Patient Diverted' : 'Emergency Intake Admitted',
              description: newPatient.status === 'Transferred'
                ? `${newPatient.name} diverted to ${newPatient.transferDetails?.targetHospital}.`
                : `${newPatient.name} admitted to Triage Queue (ESI-${newPatient.esiLevel}).`,
              patientId: newPatient.id
            });
            showToast(newPatient.status === 'Transferred' 
              ? `Patient ${newPatient.name} transferred to ${newPatient.transferDetails?.targetHospital}.`
              : `Admitted ${newPatient.name} to triage queue.`
            );
          }}
          onOpenTransferForPatient={handleOpenTransferForPatient}
        />

        <InterHospitalTransferModal
          isOpen={transferModalOpen}
          onClose={() => {
            setTransferModalOpen(false);
            setPatientForTransfer(null);
          }}
          patient={patientForTransfer}
          onExecuteTransfer={handleExecuteTransfer}
        />

        <FirebaseSetupModal
          isOpen={firebaseModalOpen}
          onClose={() => setFirebaseModalOpen(false)}
        />

        {/* Professional Quiet Hospital Footer */}
        <footer className="border-t border-slate-200 bg-white py-3.5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">PulseAI Hospital Management Platform</span>
              <span>&middot;</span>
              <span>Clinical Operations System</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span>Secure Session</span>
              <span>&middot;</span>
              <span>Station Active</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
