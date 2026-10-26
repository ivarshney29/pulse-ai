import { Patient, HospitalBed } from '../types/hospital';
import { calculateDeteriorationRisk } from '../utils/mlPredictor';

export const INITIAL_BEDS: HospitalBed[] = [
  // ICU / Critical Care (8 beds)
  {
    id: 'BED-ICU-01',
    code: 'ICU-101',
    ward: 'ICU / Critical',
    room: 'Critical Pod A',
    status: 'Occupied',
    currentPatientId: 'PT-1001',
    currentPatientName: 'Robert Vance',
    equipment: ['Hamilton-C6 Ventilator', 'Mindray BeneVision N17', 'Alaris Syringe Pump'],
    lastCleanedAt: '2026-10-09 06:30'
  },
  {
    id: 'BED-ICU-02',
    code: 'ICU-102',
    ward: 'ICU / Critical',
    room: 'Critical Pod A',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Hamilton-C6 Ventilator', 'Mindray Telemetry N17', 'Defibrillator Unit'],
    lastCleanedAt: '2026-10-09 09:15'
  },
  {
    id: 'BED-ICU-03',
    code: 'ICU-103',
    ward: 'ICU / Critical',
    room: 'Isolation Pod B (Negative Pressure)',
    status: 'Occupied',
    currentPatientId: 'PT-1002',
    currentPatientName: 'Margaret O\'Connor',
    equipment: ['Servo-u Ventilator', 'CRRT Dialysis Port', 'Phillips IntelliVue'],
    lastCleanedAt: '2026-10-09 05:40'
  },
  {
    id: 'BED-ICU-04',
    code: 'ICU-104',
    ward: 'ICU / Critical',
    room: 'Critical Pod B',
    status: 'Cleaning',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['GE Datex Ohmeda', 'ECMO Connector Line'],
    lastCleanedAt: '2026-10-09 10:20'
  },
  {
    id: 'BED-ICU-05',
    code: 'ICU-105',
    ward: 'ICU / Critical',
    room: 'Critical Pod C',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Draeger Evita XL', 'IntelliVue MX800'],
    lastCleanedAt: '2026-10-09 08:50'
  },

  // Emergency Ward (8 beds)
  {
    id: 'BED-ER-01',
    code: 'ER-BAY-1',
    ward: 'Emergency Ward',
    room: 'Resuscitation Bay 1 (Red Zone)',
    status: 'Occupied',
    currentPatientId: 'PT-1003',
    currentPatientName: 'Daniel Chen',
    equipment: ['Zoll X Series Defib', 'Rapid Infuser Level 1', 'Lucas CPR Unit'],
    lastCleanedAt: '2026-10-09 07:15'
  },
  {
    id: 'BED-ER-02',
    code: 'ER-BAY-2',
    ward: 'Emergency Ward',
    room: 'Resuscitation Bay 2 (Red Zone)',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Zoll R Series Defib', 'Arterial Line Monitor', 'Suction Canister'],
    lastCleanedAt: '2026-10-09 10:10'
  },
  {
    id: 'BED-ER-03',
    code: 'ER-BAY-3',
    ward: 'Emergency Ward',
    room: 'Acute Trauma Bay (Yellow Zone)',
    status: 'Occupied',
    currentPatientId: 'PT-1004',
    currentPatientName: 'Amara Jackson',
    equipment: ['Mindray ePM 12M Monitor', 'Crash Cart #4'],
    lastCleanedAt: '2026-10-09 08:30'
  },
  {
    id: 'BED-ER-04',
    code: 'ER-BAY-4',
    ward: 'Emergency Ward',
    room: 'Acute Triage Bed 4',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Welch Allyn Vital Monitor', 'Oxygen Flowmeter'],
    lastCleanedAt: '2026-10-09 09:45'
  },
  {
    id: 'BED-ER-05',
    code: 'ER-BAY-5',
    ward: 'Emergency Ward',
    room: 'Acute Triage Bed 5',
    status: 'Cleaning',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Welch Allyn Vital Monitor'],
    lastCleanedAt: '2026-10-09 10:25'
  },

  // Step-Down / CCU (6 beds)
  {
    id: 'BED-CCU-01',
    code: 'CCU-201',
    ward: 'Step-Down CCU',
    room: 'Cardiac Telemetry Unit 1',
    status: 'Occupied',
    currentPatientId: 'PT-1005',
    currentPatientName: 'Elena Rostova',
    equipment: ['GE ApexPro Telemetry', 'Syringe Infusion Tower'],
    lastCleanedAt: '2026-10-09 06:00'
  },
  {
    id: 'BED-CCU-02',
    code: 'CCU-202',
    ward: 'Step-Down CCU',
    room: 'Cardiac Telemetry Unit 2',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['GE ApexPro Telemetry Transmitter'],
    lastCleanedAt: '2026-10-09 09:30'
  },
  {
    id: 'BED-CCU-03',
    code: 'CCU-203',
    ward: 'Step-Down CCU',
    room: 'Cardiac Telemetry Unit 3',
    status: 'Reserved',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Continuous Pulse Oximetry Hub'],
    lastCleanedAt: '2026-10-09 08:00'
  },

  // General Ward (6 beds)
  {
    id: 'BED-GW-01',
    code: 'GW-301',
    ward: 'General Ward',
    room: 'Medical Inpatient Room 301',
    status: 'Occupied',
    currentPatientId: 'PT-1006',
    currentPatientName: 'David Miller',
    equipment: ['Standard Bedside Monitor', 'Call Bell System'],
    lastCleanedAt: '2026-10-08 18:00'
  },
  {
    id: 'BED-GW-02',
    code: 'GW-302',
    ward: 'General Ward',
    room: 'Medical Inpatient Room 302',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Standard Bedside Monitor'],
    lastCleanedAt: '2026-10-09 09:00'
  },
  {
    id: 'BED-GW-03',
    code: 'GW-303',
    ward: 'General Ward',
    room: 'Medical Inpatient Room 303',
    status: 'Available',
    currentPatientId: null,
    currentPatientName: null,
    equipment: ['Standard Bedside Monitor', 'IV Pole'],
    lastCleanedAt: '2026-10-09 09:10'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  // 1. Critical Patient in Queue (ESI 1)
  {
    id: 'PT-1011',
    mrn: 'MRN-849201',
    name: 'Samuel Hayes',
    age: 64,
    gender: 'Male',
    arrivalTime: '10:32 AM',
    waitMinutes: 8,
    chiefComplaint: 'Acute retrosternal crushing pain, diaphoresis, impending syncope',
    esiLevel: 1,
    vitals: {
      heartRate: 122,
      bloodPressureSys: 84,
      bloodPressureDia: 52,
      spo2: 89,
      respiratoryRate: 26,
      temperature: 36.8,
      gcs: 14,
      lactate: 3.8
    },
    riskScore: 91,
    riskLevel: 'Critical',
    icuTransferRisk: 86,
    readmissionRisk: 72,
    riskFactors: [
      { factor: 'Cardiogenic Hypotension (84/52)', impact: '+32% Risk', severity: 'high' },
      { factor: 'Acute Hypoxemia (89% SpO2)', impact: '+28% Risk', severity: 'high' },
      { factor: 'Elevated Serum Lactate (3.8 mmol/L)', impact: '+18% Risk', severity: 'high' },
      { factor: 'Severe Tachycardia (122 bpm)', impact: '+12% Risk', severity: 'medium' }
    ],
    targetWard: 'ICU / Critical',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medications: ['Metoprolol 25mg', 'Atorvastatin 40mg'],
    clinicalNotes: [
      {
        id: 'note-01',
        author: 'Nurse Sarah Jenkins, RN',
        role: 'Triage Nurse',
        timestamp: '10:33 AM',
        note: 'EMS arrived with Code STEMI alert. 12-lead ECG reveals 3mm ST-segment elevation in leads V1-V4. Patient is pale, cool to touch, clammy. Priority resuscitation bed requested immediately.',
        source: 'speech'
      }
    ]
  },

  // 2. High Risk Emergent Patient in Queue (ESI 2)
  {
    id: 'PT-1012',
    mrn: 'MRN-773190',
    name: 'Priya Sharma',
    age: 48,
    gender: 'Female',
    arrivalTime: '10:15 AM',
    waitMinutes: 25,
    chiefComplaint: 'Severe acute asthma attack, unresponsive to home albuterol inhaler',
    esiLevel: 2,
    vitals: {
      heartRate: 114,
      bloodPressureSys: 142,
      bloodPressureDia: 90,
      spo2: 90,
      respiratoryRate: 30,
      temperature: 37.1,
      gcs: 15,
      lactate: 2.1
    },
    riskScore: 68,
    riskLevel: 'High',
    icuTransferRisk: 62,
    readmissionRisk: 48,
    riskFactors: [
      { factor: 'Marked Tachypnea (30 breaths/min)', impact: '+26% Risk', severity: 'high' },
      { factor: 'Hypoxia with Accessory Muscle Use (90% SpO2)', impact: '+24% Risk', severity: 'high' },
      { factor: 'Sinus Tachycardia (114 bpm)', impact: '+14% Risk', severity: 'medium' }
    ],
    targetWard: 'Emergency Ward',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: ['Aspirin'],
    medications: ['Fluticasone/Salmeterol 250/50'],
    clinicalNotes: [
      {
        id: 'note-02',
        author: 'Dr. Alexis Vance, MD',
        role: 'Attending Physician',
        timestamp: '10:20 AM',
        note: 'Speaking in monosyllables. Severe intercostal indrawing and audible wheezing throughout all lung fields. Continuous duo-neb initiated in triage corridor.',
        source: 'manual'
      }
    ]
  },

  // 3. Geriatric Sepsis in Queue (ESI 2)
  {
    id: 'PT-1013',
    mrn: 'MRN-920481',
    name: 'Evelyn Wright',
    age: 79,
    gender: 'Female',
    arrivalTime: '10:05 AM',
    waitMinutes: 35,
    chiefComplaint: 'High fever, somnolence, confusion, productive discolored sputum',
    esiLevel: 2,
    vitals: {
      heartRate: 108,
      bloodPressureSys: 96,
      bloodPressureDia: 58,
      spo2: 92,
      respiratoryRate: 24,
      temperature: 39.1,
      gcs: 13,
      lactate: 3.4
    },
    riskScore: 78,
    riskLevel: 'Critical',
    icuTransferRisk: 74,
    readmissionRisk: 68,
    riskFactors: [
      { factor: 'Hyperlactatemia & Pyrexia (39.1°C)', impact: '+28% Risk', severity: 'high' },
      { factor: 'Altered Mental Status (GCS 13)', impact: '+22% Risk', severity: 'high' },
      { factor: 'Geriatric Sepsis Vulnerability (Age 79)', impact: '+16% Risk', severity: 'medium' }
    ],
    targetWard: 'ICU / Critical',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: ['Ciprofloxacin'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    clinicalNotes: [
      {
        id: 'note-03',
        author: 'Nurse Rachel Kim, RN',
        role: 'Triage Nurse',
        timestamp: '10:10 AM',
        note: 'Patient lethargic, oriented only to self. Sepsis screen positive (qSOFA = 2). IV access secured, blood cultures sent before antibiotics.',
        source: 'speech'
      }
    ]
  },

  // 4. Urgent Patient in Queue (ESI 3)
  {
    id: 'PT-1014',
    mrn: 'MRN-338291',
    name: 'Marcus Brody',
    age: 39,
    gender: 'Male',
    arrivalTime: '09:50 AM',
    waitMinutes: 50,
    chiefComplaint: 'Right lower quadrant severe sharp pain, fever, anorexia for 14 hrs',
    esiLevel: 3,
    vitals: {
      heartRate: 92,
      bloodPressureSys: 126,
      bloodPressureDia: 78,
      spo2: 98,
      respiratoryRate: 18,
      temperature: 38.3,
      gcs: 15,
      lactate: 1.4
    },
    riskScore: 34,
    riskLevel: 'Moderate',
    icuTransferRisk: 18,
    readmissionRisk: 22,
    riskFactors: [
      { factor: 'Elevated Temperature (38.3°C)', impact: '+14% Risk', severity: 'low' },
      { factor: 'Localized Peritoneal Irritation', impact: '+12% Risk', severity: 'low' }
    ],
    targetWard: 'Emergency Ward',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: [],
    medications: [],
    clinicalNotes: [
      {
        id: 'note-04',
        author: 'Dr. Marcus Lee, MD',
        role: 'Resident',
        timestamp: '10:02 AM',
        note: 'Positive McBurney sign and Rovsing sign. Suspected acute uncomplicated appendicitis. Ordered STAT contrast CT abdomen/pelvis and CBC.',
        source: 'manual'
      }
    ]
  },

  // 5. Less Urgent Patient in Queue (ESI 4)
  {
    id: 'PT-1015',
    mrn: 'MRN-551240',
    name: 'Chloe Bennett',
    age: 26,
    gender: 'Female',
    arrivalTime: '09:20 AM',
    waitMinutes: 80,
    chiefComplaint: 'Twisted left ankle during basketball, swelling and unable to bear weight',
    esiLevel: 4,
    vitals: {
      heartRate: 76,
      bloodPressureSys: 118,
      bloodPressureDia: 74,
      spo2: 99,
      respiratoryRate: 14,
      temperature: 36.6,
      gcs: 15,
      lactate: 0.9
    },
    riskScore: 12,
    riskLevel: 'Low',
    icuTransferRisk: 4,
    readmissionRisk: 8,
    riskFactors: [
      { factor: 'Stable Hemodynamics', impact: 'Baseline Risk', severity: 'low' }
    ],
    targetWard: 'General Ward',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: ['Latex'],
    medications: ['Oral Contraceptive'],
    clinicalNotes: []
  },

  // 6. Non-urgent Patient in Queue (ESI 5)
  {
    id: 'PT-1016',
    mrn: 'MRN-112093',
    name: 'Liam Vance',
    age: 33,
    gender: 'Male',
    arrivalTime: '08:45 AM',
    waitMinutes: 115,
    chiefComplaint: 'Suture removal from forearm laceration sustained 10 days ago',
    esiLevel: 5,
    vitals: {
      heartRate: 70,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      spo2: 100,
      respiratoryRate: 12,
      temperature: 36.5,
      gcs: 15,
      lactate: 0.8
    },
    riskScore: 8,
    riskLevel: 'Low',
    icuTransferRisk: 2,
    readmissionRisk: 5,
    riskFactors: [],
    targetWard: 'General Ward',
    assignedBedId: null,
    status: 'Triage Queue',
    allergies: [],
    medications: [],
    clinicalNotes: []
  },

  // 7. Already Admitted Patient in ICU Bed 01
  {
    id: 'PT-1001',
    mrn: 'MRN-609124',
    name: 'Robert Vance',
    age: 67,
    gender: 'Male',
    arrivalTime: '06:15 AM',
    waitMinutes: 0,
    chiefComplaint: 'Post-cardiac arrest with ROSC, mechanical ventilation required',
    esiLevel: 1,
    vitals: {
      heartRate: 98,
      bloodPressureSys: 102,
      bloodPressureDia: 64,
      spo2: 96,
      respiratoryRate: 16,
      temperature: 36.4,
      gcs: 8,
      lactate: 2.8
    },
    riskScore: 84,
    riskLevel: 'Critical',
    icuTransferRisk: 95,
    readmissionRisk: 80,
    riskFactors: [
      { factor: 'Hypoxic Brain Injury Risk (GCS 8)', impact: '+35% Risk', severity: 'high' },
      { factor: 'Mechanical Ventilatory Dependence', impact: '+30% Risk', severity: 'high' }
    ],
    targetWard: 'ICU / Critical',
    assignedBedId: 'BED-ICU-01',
    status: 'Bed Allocated',
    allergies: [],
    medications: ['Norepinephrine 0.08 mcg/kg/min', 'Propofol infusion', 'Aspirin 81mg'],
    clinicalNotes: []
  },

  // 8. Admitted Patient in ER Bay 1
  {
    id: 'PT-1003',
    mrn: 'MRN-489012',
    name: 'Daniel Chen',
    age: 52,
    gender: 'Male',
    arrivalTime: '07:05 AM',
    waitMinutes: 0,
    chiefComplaint: 'Acute gastrointestinal massive hemorrhage, hematemesis',
    esiLevel: 1,
    vitals: {
      heartRate: 120,
      bloodPressureSys: 92,
      bloodPressureDia: 58,
      spo2: 94,
      respiratoryRate: 22,
      temperature: 36.7,
      gcs: 14,
      lactate: 3.1
    },
    riskScore: 76,
    riskLevel: 'Critical',
    icuTransferRisk: 72,
    readmissionRisk: 60,
    riskFactors: [
      { factor: 'Hypovolemic Shock from Upper GI Bleed', impact: '+30% Risk', severity: 'high' }
    ],
    targetWard: 'Emergency Ward',
    assignedBedId: 'BED-ER-01',
    status: 'Bed Allocated',
    allergies: [],
    medications: ['Pantoprazole IV bolus & drip', 'Octreotide 50mcg'],
    clinicalNotes: []
  }
];

export const NETWORK_HOSPITALS = [
  {
    id: 'HOSP-SHARDA',
    name: 'Sharda Hospital & Medical College',
    location: 'Knowledge Park III, Greater Noida',
    distanceKm: 3.4,
    transitMinutes: 8,
    availableBeds: {
      icu: 4,
      emergency: 6,
      stepDown: 2,
      general: 6
    },
    totalBedsAvailable: 18,
    specialties: ['Level 1 Trauma', 'Cardiac Care Unit', 'Pediatric ICU', 'Hemodialysis'],
    contact: '+91 (120) 232-9700',
    ambulanceReady: true
  },
  {
    id: 'HOSP-KAILASH',
    name: 'Kailash Hospital & Neuro Institute',
    location: 'Alpha 1, Greater Noida',
    distanceKm: 5.1,
    transitMinutes: 12,
    availableBeds: {
      icu: 3,
      emergency: 4,
      stepDown: 3,
      general: 5
    },
    totalBedsAvailable: 15,
    specialties: ['Stroke Center', 'Emergency Resuscitation', 'Interventional Neurology'],
    contact: '+91 (120) 232-7000',
    ambulanceReady: true
  },
  {
    id: 'HOSP-JAYPEE',
    name: 'Jaypee Hospital Super Speciality',
    location: 'Sector 128, Noida Expressway',
    distanceKm: 12.8,
    transitMinutes: 18,
    availableBeds: {
      icu: 7,
      emergency: 8,
      stepDown: 4,
      general: 9
    },
    totalBedsAvailable: 28,
    specialties: ['Cath Lab 24/7', 'ECMO Protocol', 'Emergency Angioplasty', 'Organ Transplant'],
    contact: '+91 (120) 412-2222',
    ambulanceReady: true
  },
  {
    id: 'HOSP-FORTIS',
    name: 'Fortis Hospital Noida',
    location: 'Sector 62, Noida',
    distanceKm: 19.5,
    transitMinutes: 26,
    availableBeds: {
      icu: 5,
      emergency: 5,
      stepDown: 4,
      general: 7
    },
    totalBedsAvailable: 21,
    specialties: ['Critical Care', 'Comprehensive Oncology', 'Burns & Plastic Surgery'],
    contact: '+91 (120) 430-0222',
    ambulanceReady: true
  },
  {
    id: 'HOSP-MAX',
    name: 'Max Super Speciality Hospital',
    location: 'W-3, Sector 1, Vaishali / NCR',
    distanceKm: 24.2,
    transitMinutes: 32,
    availableBeds: {
      icu: 4,
      emergency: 7,
      stepDown: 5,
      general: 8
    },
    totalBedsAvailable: 24,
    specialties: ['Neuro-Trauma', 'Robotic Surgery', 'Coronary Care Unit'],
    contact: '+91 (120) 418-8000',
    ambulanceReady: false
  }
];

