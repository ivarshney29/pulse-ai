export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export interface PatientVitals {
  heartRate: number; // bpm
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  spo2: number; // %
  respiratoryRate: number; // breaths/min
  temperature: number; // °C
  gcs: number; // Glasgow Coma Scale (3-15)
  lactate: number; // mmol/L
}

export interface ClinicalNote {
  id: string;
  author: string;
  role: 'Attending Physician' | 'Triage Nurse' | 'Resident' | 'Speech AI Scribe';
  timestamp: string;
  note: string;
  source: 'speech' | 'manual';
  extractedEntities?: {
    symptoms?: string[];
    medications?: string[];
    vitalsMentioned?: string[];
    suggestedAction?: string;
  };
}

export interface InterHospitalTransfer {
  targetHospital: string;
  targetHospitalId: string;
  wardType: WardType;
  distanceKm: number;
  transitMinutes: number;
  status: 'Transit Dispatched' | 'En Route' | 'Accepted & Received';
  transferReason: string;
  dispatchedAt: string;
  ambulanceUnit: string;
}

export interface NetworkHospital {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  transitMinutes: number;
  availableBeds: {
    icu: number;
    emergency: number;
    stepDown: number;
    general: number;
  };
  totalBedsAvailable: number;
  specialties: string[];
  contact: string;
  ambulanceReady: boolean;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalTime: string;
  waitMinutes: number;
  chiefComplaint: string;
  esiLevel: EsiLevel;
  esiOverride?: {
    originalLevel: EsiLevel;
    newLevel: EsiLevel;
    reason: string;
    clinician: string;
    timestamp: string;
  };
  vitals: PatientVitals;
  riskScore: number; // 0-100%
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  icuTransferRisk: number; // 0-100%
  readmissionRisk: number; // 0-100%
  riskFactors: {
    factor: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  targetWard: 'Emergency Ward' | 'ICU / Critical' | 'Step-Down CCU' | 'General Ward';
  assignedBedId: string | null;
  status: 'Triage Queue' | 'Bed Allocated' | 'In Treatment' | 'Discharged' | 'Transferred';
  transferDetails?: InterHospitalTransfer;
  allergies: string[];
  medications: string[];
  clinicalNotes: ClinicalNote[];
}

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved';
export type WardType = 'Emergency Ward' | 'ICU / Critical' | 'Step-Down CCU' | 'General Ward';

export interface HospitalBed {
  id: string;
  code: string;
  ward: WardType;
  room: string;
  status: BedStatus;
  currentPatientId: string | null;
  currentPatientName: string | null;
  equipment: string[];
  lastCleanedAt: string;
}

export interface ThreadExecutionLog {
  id: string;
  threadId: number;
  patientId: string;
  patientName: string;
  bedId: string;
  action: 'LOCK_REQUEST' | 'MUTEX_ACQUIRED' | 'CRITICAL_SECTION_ALLOCATION' | 'MUTEX_RELEASED' | 'CONFLICT_RESOLVED';
  status: 'SUCCESS' | 'WAITING' | 'BLOCKED';
  latencyMs: number;
  timestamp: string;
}

export interface MutexState {
  isLocked: boolean;
  activeThreadId: number | null;
  lockQueue: number[];
  totalAllocations: number;
  conflictsPrevented: number;
  deadlocksCount: number;
  averageLockLatencyMs: number;
}

export interface ExtractedMedicalEntities {
  chiefComplaint: string;
  symptoms: string[];
  vitals: {
    bp?: string;
    hr?: string;
    spo2?: string;
    temp?: string;
    rr?: string;
  };
  suspectedDiagnosis: string;
  recommendedMedications: string[];
  recommendedUrgency: EsiLevel;
  clinicalActions: string[];
}

export interface HospitalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  patientId?: string;
  bedId?: string;
}

