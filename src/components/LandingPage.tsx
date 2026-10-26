import React from 'react';
import { Activity, ArrowRight, Lock, Plus, Heart, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import doctorPatientImg from '../assets/images/doctor_patient_care_1792776260710.jpg';

interface LandingPageProps {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
  onOpenProjectReport?: () => void;
  onOpenFirebaseSetup?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onGetStartedClick
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#faf9f5] text-slate-900 font-sans antialiased flex flex-col justify-between overflow-x-hidden lg:overflow-hidden relative selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* BACKGROUND ELEMENTS: Subtle ECG Waveform & Ambient Teal/Blue Glows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-15 z-0 overflow-hidden flex justify-center">
        <svg
          className="w-full max-w-6xl h-28 sm:h-36 text-cyan-800/40"
          viewBox="0 0 1200 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 L240,60 L265,60 L275,25 L288,95 L300,40 L310,75 L320,60 L780,60 L805,60 L815,25 L828,95 L840,40 L850,75 L860,60 L1200,60"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="shrink-0 w-full bg-[#faf9f5]/90 backdrop-blur-md border-b border-slate-200/70 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Top-Left: PulseAI Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Pulse<span className="text-cyan-600">AI</span>
              </span>
            </div>

            {/* Top-Right: Login & Get Started Buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={onGetStartedClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-cyan-700 transition-colors rounded-xl hover:bg-slate-200/60"
                  >
                    Login
                  </button>
                  <button
                    onClick={onGetStartedClick}
                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-cyan-600 rounded-xl transition-all shadow-sm hover:shadow"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 2. DEDICATED HERO WRAPPER WITH FULL-WIDTH RELATIVE CANVAS */}
      <main className="flex-1 w-full relative flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-0 overflow-hidden">
        
        {/* FOUR FLOATING DECORATIVE CARDS (Pinned to outer corners, completely clear of text & illustration) */}
        
        {/* Card 1: Top-Left — Purple Medical Cross "Patient First" */}
        <div className="hidden lg:flex absolute top-4 xl:top-6 left-4 xl:left-10 z-20 animate-float-1 flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-purple-200/80 shadow-md shadow-purple-500/10 backdrop-blur-md w-[110px] xl:w-[122px] select-none pointer-events-none -rotate-3 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-purple-100/80 border border-purple-200 flex items-center justify-center text-purple-600 mb-1 shadow-2xs">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
            Patient First
          </span>
        </div>

        {/* Card 2: Top-Right — Mint-Green Heart "Smart Care" */}
        <div className="hidden lg:flex absolute top-4 xl:top-6 right-4 xl:right-10 z-20 animate-float-2 flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-emerald-200/80 shadow-md shadow-emerald-500/10 backdrop-blur-md w-[110px] xl:w-[122px] select-none pointer-events-none rotate-3 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1 shadow-2xs">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-500/20 stroke-[2.3]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
            Smart Care
          </span>
        </div>

        {/* Card 3: Bottom-Left — Dark Teal Shield "Secure Health" */}
        <div className="hidden lg:flex absolute bottom-5 xl:bottom-7 left-4 xl:left-10 z-20 animate-float-3 flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-teal-200/80 shadow-md shadow-teal-500/10 backdrop-blur-md w-[110px] xl:w-[122px] select-none pointer-events-none -rotate-2 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-teal-100/80 border border-teal-200 flex items-center justify-center text-teal-700 mb-1 shadow-2xs">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 fill-teal-600/20 stroke-[2.3]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
            Secure Health
          </span>
        </div>

        {/* Card 4: Bottom-Right — Soft Lavender Heartbeat "Real-Time Care" */}
        <div className="hidden lg:flex absolute bottom-5 xl:bottom-7 right-4 xl:right-10 z-20 animate-float-4 flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/95 border border-indigo-200/80 shadow-md shadow-indigo-500/10 backdrop-blur-md w-[110px] xl:w-[122px] select-none pointer-events-none rotate-2 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-1 shadow-2xs">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
            Real-Time Care
          </span>
        </div>

        {/* CENTRAL HERO CONTENT (Inwardly padded so text and image stay completely clear of cards) */}
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 my-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: HERO HEADLINE, DESCRIPTION & BUTTONS */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-semibold tracking-wide uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                <span>SMART HEALTHCARE PLATFORM</span>
              </div>

              {/* Main Heading & Tagline */}
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-sans leading-none">
                  <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-slate-900 bg-clip-text text-transparent">
                    PulseAI
                  </span>
                </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Smarter Care. Better Outcomes.
                </h2>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
                An intelligent hospital platform designed to improve patient care, simplify hospital operations, and support faster clinical decisions.
              </p>

              {/* Action Buttons: Get Started & Login */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onGetStartedClick}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md hover:shadow-lg shadow-cyan-600/20 transition-all scale-100 hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  onClick={onLoginClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow transition-all"
                >
                  <Lock className="w-4 h-4 text-cyan-600" />
                  <span>Login</span>
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: DOCTOR & PATIENT ILLUSTRATION */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* Soft Teal Glow */}
              <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-tr from-cyan-400/20 via-teal-300/25 to-indigo-300/15 rounded-3xl blur-3xl -z-10" />

              {/* Main Visual: Doctor-and-Patient Illustration */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white w-full max-w-md lg:max-w-lg transition-transform duration-500 hover:scale-[1.01]">
                <img
                  src={doctorPatientImg}
                  alt="Doctor examining patient on hospital bed"
                  className="w-full h-auto object-cover max-h-[340px] sm:max-h-[390px] lg:max-h-[430px]"
                  loading="eager"
                />
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* Clean Bottom Spacer for Single-Screen Desktop Layout */}
      <div className="h-2 sm:h-4 shrink-0" />
    </div>
  );
};
