import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, FirebaseConfig } from '../types/auth';
import {
  authService,
  getFirebaseConfig,
  saveFirebaseConfig,
  removeStoredFirebaseConfig
} from '../services/firebaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  firebaseConfig: FirebaseConfig | null;
  login: (email: string, pass: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser>;
  signup: (
    email: string,
    pass: string,
    displayName: string,
    role: AuthUser['role'],
    department: string
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  saveConfig: (config: FirebaseConfig) => boolean;
  clearConfig: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredSession());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig | null>(() => getFirebaseConfig());
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(() => authService.isFirebaseConfigured());

  useEffect(() => {
    // Subscribe to auth state updates
    const unsubscribe = authService.subscribe((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<AuthUser> => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, pass);
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthUser> => {
    setError(null);
    setLoading(true);
    try {
      const googleUser = await authService.signInWithGoogle();
      setUser(googleUser);
      return googleUser;
    } catch (err: any) {
      const msg = err.message || 'Google sign-in failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    pass: string,
    displayName: string,
    role: AuthUser['role'],
    department: string
  ): Promise<AuthUser> => {
    setError(null);
    setLoading(true);
    try {
      const newUser = await authService.signUp(email, pass, displayName, role, department);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      const msg = err.message || 'Signup failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      console.warn('Logout error', err);
      setUser(null);
    }
  };

  const resetPassword = async (email: string): Promise<string> => {
    setError(null);
    try {
      return await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
      throw err;
    }
  };

  const saveConfig = (config: FirebaseConfig): boolean => {
    const success = saveFirebaseConfig(config);
    if (success) {
      setFirebaseConfig(config);
      setIsFirebaseConfigured(authService.isFirebaseConfigured());
      // Re-initialize listener
      authService.subscribe((authUser) => {
        setUser(authUser);
      });
    }
    return success;
  };

  const clearConfig = () => {
    removeStoredFirebaseConfig();
    setFirebaseConfig(null);
    setIsFirebaseConfigured(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isFirebaseConfigured,
        firebaseConfig,
        login,
        signInWithGoogle,
        signup,
        logout,
        resetPassword,
        saveConfig,
        clearConfig,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
