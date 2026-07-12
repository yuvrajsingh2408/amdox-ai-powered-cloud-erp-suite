import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MFASettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Setup state
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/mfa/setup');
      setMfaSecret(res.data?.data?.secret || null);
      setQrCode(res.data?.data?.qrCodeUrl || null);
      setRecoveryCodes(res.data?.data?.recoveryCodes || []);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert('Failed to retrieve TOTP credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setVerifying(true);
    try {
      await axios.post('/api/security/mfa/verify', { token });
      alert('MFA enrollment verified successfully.');
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Verification failed. Check token code digit count.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/security')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
            <span>MFA Security Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Enroll in multi-factor authenticator TOTP keys and backup recovery keys.</p>
        </div>
      </div>

      <div className="max-w-xl bg-[#0F172A] border border-slate-900 rounded-3xl p-6 text-xs space-y-5 shadow-sm">
        
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 text-slate-350 leading-relaxed">
              <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Multi-Factor Authentication (MFA) adds an extra layer of access protection. After configuration, you must verify code tokens generated from Google Authenticator or Microsoft Authenticator apps to sign in.
              </p>
            </div>

            <button
              onClick={startSetup}
              disabled={loading}
              className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Enroll MFA Authenticator</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex flex-col items-center justify-center p-5 bg-slate-950 border border-slate-900 rounded-2xl gap-3">
              {/* Simulated QR block layout */}
              <div className="w-32 h-32 bg-white flex items-center justify-center p-2 rounded-xl">
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black rounded-lg flex items-center justify-center text-white text-[8px] font-bold text-center uppercase leading-tight p-2">
                  OTP QR MOCKUP
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-bold font-mono">Secret: {mfaSecret}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Enter 6-digit Authenticator Token</label>
              <input
                type="text"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none font-mono text-center tracking-widest text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
            >
              {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify Code & Enable'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">MFA Status Active</span>
              <p className="text-slate-350">Secure authenticator bindings configured successfully.</p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-450 font-bold uppercase text-[9px] block">MFA Backup Recovery Codes</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-indigo-400 bg-slate-950 p-4 rounded-xl border border-slate-900">
                {recoveryCodes.map((code, idx) => (
                  <span key={idx}>{code}</span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">Save these backup codes. They permit sign ins should access to authenticator tokens be lost.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default MFASettings;
export { MFASettings };
