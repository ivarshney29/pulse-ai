import { ExtractedMedicalEntities, EsiLevel } from '../types/hospital';

export interface ClinicalDictationPreset {
  id: string;
  title: string;
  doctorName: string;
  durationSeconds: number;
  transcript: string;
  category: 'Cardiac Emergency' | 'Respiratory / Sepsis' | 'Trauma / Neuro' | 'General Acute';
}

export const CLINICAL_PRESETS: ClinicalDictationPreset[] = [
  {
    id: 'stemi-01',
    title: 'Acute Coronary Syndrome / STEMI Alert',
    doctorName: 'Dr. Sarah Lin, MD (Emergency Medicine)',
    durationSeconds: 18,
    category: 'Cardiac Emergency',
    transcript: 'Patient presents with severe retrosternal crushing chest pain radiating to the left jaw and arm for 45 minutes. Profuse diaphoresis, nausea, and dyspnea. Vital signs show blood pressure 86 over 54, heart rate 118 beats per minute, SpO2 91% on room air, and respiratory rate 24. Presumptive diagnosis is acute ST-elevation myocardial infarction. Recommend immediate cath lab activation, chewable aspirin 325 mg, sublingual nitroglycerin withheld due to hypotension, IV heparin, and urgent CCU bed lock.'
  },
  {
    id: 'sepsis-02',
    title: 'Septic Shock in Geriatric Patient',
    doctorName: 'Dr. Michael Chen, MD (Lead Intensivist)',
    durationSeconds: 22,
    category: 'Respiratory / Sepsis',
    transcript: '72-year-old female presenting from nursing home with altered mental status, lethargy, and productive cough for 3 days. High fever 39.4 degrees Celsius. Tachycardic at 130 beats per minute, blood pressure profoundly low at 82 over 48 mmHg, respiratory rate 30, SpO2 88%. Point-of-care lactate is 4.6 mmol per liter. High suspicion for severe sepsis secondary to community-acquired pneumonia. Immediate 30 mL per kg IV normal saline bolus initiated, empiric IV Vancomycin and Piperacillin-Tazobactam ordered. Reserve immediate ICU isolation bed with continuous telemetry.'
  },
  {
    id: 'asthma-03',
    title: 'Severe Acute Asthma Exacerbation',
    doctorName: 'Dr. Emily Watson, MD (Pulmonary Specialist)',
    durationSeconds: 15,
    category: 'Respiratory / Sepsis',
    transcript: '28-year-old male with known brittle asthma presents in acute distress, speaking in 2-word sentences. Audible bilateral expiratory wheezing and accessory muscle use. Heart rate 112 bpm, blood pressure 138 over 88, SpO2 89% on ambient air, respiratory rate 28 breaths per minute. Administer back-to-back nebulized Albuterol 5 mg and Ipratropium bromide 0.5 mg, IV Methylprednisolone 60 mg, and supplemental oxygen via non-rebreather mask at 10 liters per minute. Assign ESI level 2.'
  },
  {
    id: 'trauma-04',
    title: 'Motorcycle Accident / Polytrauma Triage',
    doctorName: 'Dr. David Rodriguez, MD (Trauma Surgery)',
    durationSeconds: 20,
    category: 'Trauma / Neuro',
    transcript: '34-year-old male rider involved in high-speed collision. Glasgow Coma Scale is 11, confused and opening eyes to speech only. Open right femur deformity and abdominal guarding. Blood pressure 94 over 60, heart rate 124 bpm, SpO2 93%, respiratory rate 26. Trauma resuscitation code activated. Two large-bore 16-gauge IV lines established, type and cross-match for 4 units PRBCs, urgent FAST exam and whole-body trauma CT scan. Priority 1 resuscitation room allocation.'
  }
];

/**
 * PulseAI Medical NLP Entity Parser
 * Extracts clinical keywords, vitals, symptoms, medications, and computes suggested ESI score.
 */
export function parseClinicalEntities(transcript: string): ExtractedMedicalEntities {
  const text = transcript.toLowerCase();

  // Extract Vitals
  const vitals: ExtractedMedicalEntities['vitals'] = {};

  // BP regex (e.g. "86 over 54", "86/54", "138 over 88")
  const bpMatch = transcript.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i);
  if (bpMatch) {
    vitals.bp = `${bpMatch[1]}/${bpMatch[2]} mmHg`;
  }

  // Heart rate regex (e.g. "118 beats per minute", "118 bpm", "heart rate 118")
  const hrMatch = transcript.match(/(?:heart rate|pulse|tachycardic at|rate)\s*(\d{2,3})|\b(\d{2,3})\s*(?:bpm|beats per minute)/i);
  if (hrMatch) {
    vitals.hr = `${hrMatch[1] || hrMatch[2]} bpm`;
  }

  // SpO2 regex
  const spo2Match = transcript.match(/(?:spo2|oxygen saturation|o2 sat)\s*(?:is|at)?\s*(\d{2,3})%?|\b(\d{2,3})%\s*(?:on room air|on ambient air|spo2)/i);
  if (spo2Match) {
    vitals.spo2 = `${spo2Match[1] || spo2Match[2]}%`;
  }

  // Temperature regex
  const tempMatch = transcript.match(/(?:temp|temperature|fever)\s*(?:is|of)?\s*(\d{2}(?:\.\d+)?)\s*(?:degrees|c|f)?/i);
  if (tempMatch) {
    vitals.temp = `${tempMatch[1]} °C`;
  }

  // Respiratory rate regex
  const rrMatch = transcript.match(/(?:respiratory rate|rr)\s*(?:is|at)?\s*(\d{1,2})|\b(\d{1,2})\s*(?:breaths per minute|\/min)/i);
  if (rrMatch) {
    vitals.rr = `${rrMatch[1] || rrMatch[2]} /min`;
  }

  // Symptoms extraction
  const potentialSymptoms = [
    { key: 'chest pain', label: 'Crushing Chest Pain' },
    { key: 'retrosternal', label: 'Retrosternal Discomfort' },
    { key: 'radiating', label: 'Radiation to Left Arm / Jaw' },
    { key: 'diaphoresis', label: 'Profuse Diaphoresis' },
    { key: 'dyspnea', label: 'Acute Dyspnea / Shortness of Breath' },
    { key: 'shortness of breath', label: 'Shortness of Breath' },
    { key: 'wheezing', label: 'Bilateral Expiratory Wheezing' },
    { key: 'altered mental status', label: 'Altered Mental Status / Confusion' },
    { key: 'lethargy', label: 'Severe Lethargy' },
    { key: 'fever', label: 'Pyrexia / High Fever' },
    { key: 'cough', label: 'Productive Cough' },
    { key: 'hypotension', label: 'Systemic Hypotension' },
    { key: 'nausea', label: 'Nausea & Vomiting' },
    { key: 'guarding', label: 'Abdominal Peritoneal Guarding' },
    { key: 'deformity', label: 'Traumatic Skeletal Deformity' }
  ];

  const extractedSymptoms: string[] = [];
  potentialSymptoms.forEach(s => {
    if (text.includes(s.key)) {
      extractedSymptoms.push(s.label);
    }
  });

  // Medications extraction
  const potentialMeds = [
    'Aspirin 325 mg',
    'Nitroglycerin',
    'Heparin IV',
    'Vancomycin IV',
    'Piperacillin-Tazobactam',
    'Normal Saline 30 mL/kg',
    'Albuterol Nebulizer',
    'Ipratropium Bromide',
    'Methylprednisolone 60 mg',
    'PRBCs Transfusion',
    'Atropine',
    'Morphine'
  ];

  const extractedMeds: string[] = [];
  potentialMeds.forEach(m => {
    const rootName = m.split(' ')[0].toLowerCase();
    if (text.includes(rootName)) {
      extractedMeds.push(m);
    }
  });

  // Suspected diagnosis determination
  let suspectedDiagnosis = 'Undifferentiated Acute Presentation';
  let suggestedUrgency: EsiLevel = 3;
  let chiefComplaint = 'Acute Distress Evaluation';

  if (text.includes('stemi') || text.includes('infarction') || text.includes('chest pain')) {
    suspectedDiagnosis = 'Acute ST-Elevation Myocardial Infarction (STEMI)';
    chiefComplaint = 'Severe Retrosternal Chest Pain radiating to Left Arm';
    suggestedUrgency = 1;
  } else if (text.includes('sepsis') || text.includes('lactate') || text.includes('nursing home')) {
    suspectedDiagnosis = 'Severe Sepsis with Septic Shock Risk (Pulmonary Source)';
    chiefComplaint = 'Altered Mental Status, High Fever & Lethargy';
    suggestedUrgency = 1;
  } else if (text.includes('asthma') || text.includes('wheezing')) {
    suspectedDiagnosis = 'Status Asthmaticus / Severe Acute Exacerbation';
    chiefComplaint = 'Severe Dyspnea, Inability to Complete Sentences';
    suggestedUrgency = 2;
  } else if (text.includes('collision') || text.includes('motorcycle') || text.includes('trauma')) {
    suspectedDiagnosis = 'Polytrauma with Suspected Intracranial / Skeletal Injury';
    chiefComplaint = 'High-Speed Traffic Collision with Depressed GCS';
    suggestedUrgency = 1;
  }

  // Clinical actions
  const clinicalActions: string[] = [];
  if (suggestedUrgency <= 2) {
    clinicalActions.push('Immediate Red-Alert Bed Allocation');
    clinicalActions.push('Stat IV line access & Blood cultures / Cardiac Enzymes');
    clinicalActions.push('Continuous Vital Signs & Telemetry Lead placement');
  } else {
    clinicalActions.push('Urgent secondary physician triage assessment');
    clinicalActions.push('Basic metabolic profile & point-of-care workup');
  }

  return {
    chiefComplaint,
    symptoms: extractedSymptoms.length > 0 ? extractedSymptoms : ['Acute physical distress'],
    vitals,
    suspectedDiagnosis,
    recommendedMedications: extractedMeds.length > 0 ? extractedMeds : ['Empiric supportive care'],
    recommendedUrgency: suggestedUrgency,
    clinicalActions
  };
}
