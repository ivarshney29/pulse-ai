import React, { useState } from 'react';
import { X, Flame, ShieldAlert, CheckCircle2, Copy, Check, ExternalLink, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FirebaseConfig } from '../types/auth';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { isFirebaseConfigured, firebaseConfig, saveConfig, clearConfig } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [jsonInput, setJsonInput] = useState('');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleParseJson = () => {
    try {
      // Clean up JS object or JSON string
      let cleaned = jsonInput.trim();
      if (cleaned.startsWith('const firebaseConfig =')) {
        cleaned = cleaned.replace('const firebaseConfig =', '').replace(/;$/, '').trim();
      }
      // If object keys are unquoted, quote them
      const jsonFormatted = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      const parsed = JSON.parse(jsonFormatted);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);

      setSaveStatus('Config JSON parsed successfully! Click "Save & Connect" below.');
    } catch {
      setSaveStatus('Invalid JSON format. Please verify the snippet from Firebase Console.');
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setSaveStatus('Error: API Key and Project ID are required.');
      return;
    }

    const newConfig: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    const ok = saveConfig(newConfig);
    if (ok) {
      setSaveStatus('Firebase configuration saved successfully! Firebase Auth is now active.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setSaveStatus('Failed to persist Firebase configuration.');
    }
  };

  const handleReset = () => {
    clearConfig();
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setStorageBucket('');
    setMessagingSenderId('');
    setAppId('');
    setSaveStatus('Stored Firebase config removed. System switched to local cryptographic verification mode.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-xs text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Flame className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 font-sans">
                  Firebase Authentication Configuration & Setup
                </span>
                {isFirebaseConfigured ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Setup Needed
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-0.5">
                Required values and Firebase Console settings for live email/password authentication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className={`p-3.5 rounded-xl border ${isFirebaseConfigured ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          <div className="flex items-start gap-2.5">
            {isFirebaseConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Key className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-xs">
                {isFirebaseConfigured
                  ? `Active Firebase Project: ${firebaseConfig?.projectId || 'Configured'}`
                  : 'Operating in Cryptographically Verified Authentication Mode'}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {isFirebaseConfigured
                  ? 'Sign-up, login, and password resets are verified directly against your live Firebase Authentication project.'
                  : 'Firebase credentials have not been configured yet. Full authentication (registration, sign-in, session persistence, and logout) is running via Web Cryptography (PBKDF2/SHA-256 with salts). You can plug in your Firebase keys below anytime.'}
              </p>
            </div>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider font-mono text-[11px]">
            1. Firebase Console Settings Required
          </h4>

          <div className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-700 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <div>
                <strong>Create or Open Project:</strong> Go to the{' '}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-700 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and select your project.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <div>
                <strong>Enable Email/Password Provider:</strong> In the left sidebar, navigate to <strong>Build → Authentication</strong>. Click the <strong>Sign-in method</strong> tab. Select <strong>Email/Password</strong>, toggle <strong>Enable</strong> to ON, and click <strong>Save</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <div>
                <strong>Get Web App Credentials:</strong> Go to <strong>Project Settings (⚙️) → General</strong>, scroll down to <strong>Your apps</strong>, click the <strong>Web (&lt;/&gt;)</strong> icon to register a web app, and copy your configuration object.
              </div>
            </div>
          </div>
        </div>

        {/* Required Keys & Quick Paste */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider font-mono text-[11px]">
              2. Required Configuration Values
            </h4>
            <span className="text-[11px] text-slate-500">Provide via .env or input below</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-700">
              Option A: Paste Firebase Config Object (JSON / JS)
            </label>
            <div className="flex gap-2">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-app.firebaseapp.com",\n  "projectId": "my-app",\n  "storageBucket": "my-app.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}'}
                rows={3}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleParseJson}
                disabled={!jsonInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 shrink-0 self-start disabled:opacity-50"
              >
                Autofill
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase font-mono">
                apiKey <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 mt-1"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase font-mono">
                projectId <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="pulseai-hospital"
                className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 mt-1"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase font-mono">authDomain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="pulseai-hospital.firebaseapp.com"
                className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 mt-1"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase font-mono">appId</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef..."
                className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 mt-1"
              />
            </div>
          </div>

          {/* Environment Variables Reference */}
          <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Or set in your .env:</span>
              <button
                onClick={() =>
                  handleCopy(
                    `VITE_FIREBASE_API_KEY="${apiKey || 'your_api_key'}"\nVITE_FIREBASE_PROJECT_ID="${projectId || 'your_project_id'}"\nVITE_FIREBASE_AUTH_DOMAIN="${authDomain || 'your_project_id.firebaseapp.com'}"\nVITE_FIREBASE_APP_ID="${appId || 'your_app_id'}"`,
                    'env'
                  )
                }
                className="flex items-center gap-1 hover:text-white"
              >
                {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'env' ? 'Copied' : 'Copy Env'}</span>
              </button>
            </div>
            <div>VITE_FIREBASE_API_KEY="AIzaSy..."</div>
            <div>VITE_FIREBASE_PROJECT_ID="pulseai-hospital"</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN="pulseai-hospital.firebaseapp.com"</div>
            <div>VITE_FIREBASE_APP_ID="1:..."</div>
          </div>

          {saveStatus && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${saveStatus.includes('Error') ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {saveStatus}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isFirebaseConfigured ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Disconnect Firebase
            </button>
          ) : (
            <span className="text-slate-400 text-[11px]">Local cryptographic mode is active & secure</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-xs"
            >
              Save & Connect Firebase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
