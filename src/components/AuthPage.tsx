import React, { useState } from 'react';
import {
  Activity,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthUser } from '../types/auth';

interface AuthPageProps {
  initialTab?: 'login' | 'signup';
  onSuccess: () => void;
  onGoToLanding: () => void;
  onOpenFirebaseSetup?: () => void;
  onOpenProjectReport?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'login',
  onSuccess,
  onGoToLanding
}) => {
  const { login, signup, signInWithGoogle, resetPassword, error, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<AuthUser['role']>('Attending Physician');
  const [department, setDepartment] = useState('Emergency & Trauma');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // State feedback
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clear errors on tab change
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setLocalError(null);
    clearError();
    setResetSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!loginEmail.trim()) {
      setLocalError('Please enter your hospital email address.');
      return;
    }

    if (!loginPassword) {
      setLocalError('Please enter your account password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName.trim()) {
      setLocalError('Please enter your full clinical name.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setLocalError('Please provide a valid clinical email address.');
      return;
    }

    if (signupPassword.length < 6) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setLocalError('You must acknowledge clinical data protection compliance to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(signupEmail, signupPassword, fullName, role, department);
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Sign up failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!forgotPasswordEmail.trim()) {
      setLocalError('Please enter your email to receive password reset instructions.');
      return;
    }

    setSubmitting(true);
    try {
      const msg = await resetPassword(forgotPasswordEmail);
      setResetSuccessMessage(msg);
    } catch (err: any) {
      setLocalError(err.message || 'Could not initiate password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50/40 flex flex-col justify-between text-slate-800 antialiased font-sans">
      
      {/* 1. CLEAN TOP BAR (PulseAI Logo + Back to Home Button Only) */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
        <button
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 group text-slate-700 hover:text-slate-900 transition-colors"
          title="Return to Public Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4 stroke-[2.4]" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base font-sans">
            Pulse<span className="text-cyan-600">AI</span>
          </span>
        </button>

        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* 2. CENTERED CLINICAL ACCESS CARD */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-7 space-y-4">
          
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 mb-0.5 shadow-2xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Clinical Access Portal
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Authorized medical staff gateway for PulseAI hospital triage and patient management.
            </p>
          </div>

          {/* Login / Sign Up Tabs */}
          {!isResettingPassword && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register Staff
              </button>
            </div>
          )}

          {/* Feedback & Error Banner */}
          {(localError || error) && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{localError || error}</div>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium">{resetSuccessMessage}</div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {isResettingPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Clinical Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="physician@hospital.org"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetSuccessMessage(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              
              {/* Google Sign-In with Firebase Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* CLEAN SINGLE-LINE DIVIDER (Guaranteed No Wrapping) */}
              <div className="flex items-center my-3.5 w-full">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap select-none">
                  ——— OR SIGN IN WITH EMAIL ———
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Hospital Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="doctor@pulseai.health"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(true);
                      setForgotPasswordEmail(loginEmail);
                      setLocalError(null);
                    }}
                    className="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Stay logged in on this clinical station</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1"
              >
                {submitting ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Enter Clinical Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3 text-xs">
              
              {/* Google Register with Firebase Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Register with Google</span>
              </button>

              {/* CLEAN SINGLE-LINE DIVIDER (Guaranteed No Wrapping) */}
              <div className="flex items-center my-3.5 w-full">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 whitespace-nowrap select-none">
                  ——— OR REGISTER WITH EMAIL ———
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Full Name & Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Alexis Vance, MD"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Clinical Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AuthUser['role'])}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 bg-white"
                  >
                    <option value="Attending Physician">Attending Physician</option>
                    <option value="Triage Nurse">Triage Nurse</option>
                    <option value="Emergency Resident">Emergency Resident</option>
                    <option value="ICU Specialist">ICU Specialist</option>
                    <option value="Bed Flow Manager">Bed Flow Manager</option>
                    <option value="Hospital Administrator">Hospital Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Department</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Emergency / Critical"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Hospital Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="alexis.vance@hospital.org"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Confirm</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-0.5 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="leading-tight text-[10.5px]">
                  I confirm that I am authorized clinical personnel adhering to Hospital Information Security Protocols.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1"
              >
                {submitting ? 'Registering Staff Account...' : 'Complete Registration & Sign In'}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* 3. CLEAN MINIMAL FOOTER */}
      <footer className="py-3 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white/70 shrink-0">
        PulseAI Hospital OS &middot; Smart Hospital Patient Management System
      </footer>
    </div>
  );
};
