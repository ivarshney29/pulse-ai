export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'Attending Physician' | 'Triage Nurse' | 'Emergency Resident' | 'ICU Specialist' | 'Bed Flow Manager' | 'Hospital Administrator';
  department: string;
  createdAt: string;
  authProvider: 'firebase' | 'local_secure';
  photoURL?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export type AuthMode = 'login' | 'signup' | 'forgot_password';
