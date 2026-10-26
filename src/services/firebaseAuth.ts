import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  Auth as FirebaseAuth
} from 'firebase/auth';
import { AuthUser, FirebaseConfig } from '../types/auth';
import appletConfig from '../../firebase-applet-config.json';

const STORAGE_KEY_FIREBASE_CONFIG = 'pulseai_firebase_config';
const STORAGE_KEY_SESSION_USER = 'pulseai_auth_session';
const STORAGE_KEY_LOCAL_USERS = 'pulseai_verified_clinical_users';

// Pre-seeded clinical staff credentials for immediate testing if Firebase is not yet linked
// Note: Passwords are cryptographically verified via Web Crypto SHA-256 + salt
interface LocalUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: AuthUser['role'];
  department: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

// Helper: Web Cryptography SHA-256 hashing with salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'pulseai_salt_pepper_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Retrieve configured Firebase credentials from applet config, env, or local storage
export function getFirebaseConfig(): FirebaseConfig | null {
  if (appletConfig && appletConfig.apiKey && appletConfig.projectId) {
    return {
      apiKey: appletConfig.apiKey,
      authDomain: appletConfig.authDomain || `${appletConfig.projectId}.firebaseapp.com`,
      projectId: appletConfig.projectId,
      storageBucket: appletConfig.storageBucket || `${appletConfig.projectId}.appspot.com`,
      messagingSenderId: appletConfig.messagingSenderId || '',
      appId: appletConfig.appId || '',
      firestoreDatabaseId: appletConfig.firestoreDatabaseId
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config', e);
  }

  // Check Vite environment variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config', e);
    return false;
  }
}

export function removeStoredFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

// Initialize Firebase Auth instance if config exists
let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: FirebaseAuth | null = null;

export function getFirebaseAuth(): { app: FirebaseApp | null; auth: FirebaseAuth | null; isConfigured: boolean } {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, auth: null, isConfigured: false };
  }

  try {
    if (!firebaseAppInstance) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        firebaseAppInstance = getApp();
      } else {
        firebaseAppInstance = initializeApp(config);
      }
      firebaseAuthInstance = getAuth(firebaseAppInstance);
    }
    return { app: firebaseAppInstance, auth: firebaseAuthInstance, isConfigured: true };
  } catch (err) {
    console.warn('Firebase initialization note:', err);
    return { app: null, auth: null, isConfigured: false };
  }
}

// Local verified user repository helpers
async function getLocalUsers(): Promise<LocalUserRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_USERS);
    if (!raw) {
      // Seed an initial demo doctor account with secure hash
      const defaultSalt = 'a8f9c2d1e0b4a7f6';
      const defaultHash = await hashPassword('PulseAI@2026', defaultSalt);
      const initialUsers: LocalUserRecord[] = [
        {
          uid: 'USR-CLINIC-01',
          email: 'doctor@pulseai.health',
          displayName: 'Dr. Sarah Connor, MD',
          role: 'Attending Physician',
          department: 'Emergency Medicine',
          salt: defaultSalt,
          passwordHash: defaultHash,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveLocalUser(user: LocalUserRecord): Promise<void> {
  const users = await getLocalUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(users));
}

// Main Authentication Service
export const authService = {
  isFirebaseConfigured(): boolean {
    return getFirebaseAuth().isConfigured;
  },

  getStoredSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION_USER);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setStoredSession(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION_USER);
    }
  },

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: AuthUser['role'],
    department: string
  ): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const { auth, isConfigured } = getFirebaseAuth();

    if (isConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(userCredential.user, { displayName });

        const authUser: AuthUser = {
          uid: userCredential.user.uid,
          email: cleanEmail,
          displayName,
          role,
          department,
          createdAt: new Date().toISOString(),
          authProvider: 'firebase'
        };

        this.setStoredSession(authUser);
        return authUser;
      } catch (fbError: any) {
        throw new Error(formatFirebaseError(fbError));
      }
    }

    // Cryptographic Secure Local Registration (Verified with salt & SHA-256)
    const users = await getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this clinical email already exists. Please log in instead.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUid = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;

    const newUserRecord: LocalUserRecord = {
      uid: newUid,
      email: cleanEmail,
      displayName,
      role,
      department: department || 'General Medicine',
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await saveLocalUser(newUserRecord);

    const authUser: AuthUser = {
      uid: newUid,
      email: cleanEmail,
      displayName,
      role,
      department: department || 'General Medicine',
      createdAt: newUserRecord.createdAt,
      authProvider: 'local_secure'
    };

    this.setStoredSession(authUser);
    return authUser;
  },

  async signInWithGoogle(): Promise<AuthUser> {
    const { auth, isConfigured } = getFirebaseAuth();
    if (!isConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured yet. Please configure your Firebase credentials.');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser: FirebaseUser = result.user;

      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Clinical Practitioner',
        role: 'Attending Physician',
        department: 'Emergency & Critical Care',
        createdAt: new Date().toISOString(),
        authProvider: 'firebase',
        photoURL: fbUser.photoURL || undefined
      };

      this.setStoredSession(authUser);
      return authUser;
    } catch (fbError: any) {
      throw new Error(formatFirebaseError(fbError));
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const { auth, isConfigured } = getFirebaseAuth();

    if (isConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser: FirebaseUser = userCredential.user;

        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email || cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split('@')[0],
          role: 'Attending Physician', // Default or custom claim if available
          department: 'Emergency & Critical Care',
          createdAt: new Date().toISOString(),
          authProvider: 'firebase',
          photoURL: fbUser.photoURL || undefined
        };

        this.setStoredSession(authUser);
        return authUser;
      } catch (fbError: any) {
        throw new Error(formatFirebaseError(fbError));
      }
    }

    // Cryptographic Secure Local Authentication (Hash verification)
    const users = await getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No clinical account found with this email. Please check your credentials or sign up.');
    }

    const testHash = await hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    const authUser: AuthUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
      authProvider: 'local_secure'
    };

    this.setStoredSession(authUser);
    return authUser;
  },

  async logout(): Promise<void> {
    const { auth, isConfigured } = getFirebaseAuth();
    if (isConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase signout note:', e);
      }
    }
    this.setStoredSession(null);
  },

  async resetPassword(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const { auth, isConfigured } = getFirebaseAuth();

    if (isConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox.`;
      } catch (fbError: any) {
        throw new Error(formatFirebaseError(fbError));
      }
    }

    const users = await getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('No registered clinical account was found for this email address.');
    }

    return `Password reset protocol initiated for ${cleanEmail}. In live production mode with Firebase Auth, a secure reset token is emailed. For local verification, your account (${user.displayName}) is active.`;
  },

  subscribe(callback: (user: AuthUser | null) => void): () => void {
    const { auth, isConfigured } = getFirebaseAuth();

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const current = this.getStoredSession();
          const authUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || current?.displayName || 'Clinical Practitioner',
            role: current?.role || 'Attending Physician',
            department: current?.department || 'Emergency Medicine',
            createdAt: current?.createdAt || new Date().toISOString(),
            authProvider: 'firebase',
            photoURL: fbUser.photoURL || undefined
          };
          this.setStoredSession(authUser);
          callback(authUser);
        } else {
          this.setStoredSession(null);
          callback(null);
        }
      });
      return unsubscribe;
    }

    // Local session subscription check
    const current = this.getStoredSession();
    callback(current);
    return () => {};
  }
};

function formatFirebaseError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No registered account found with this email. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error connecting to Firebase Authentication servers. Check your connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in provider is disabled in Firebase Console. Please enable it in Authentication -> Sign-in method.';
    default:
      return error?.message || 'Authentication failed. Please verify your credentials.';
  }
}
