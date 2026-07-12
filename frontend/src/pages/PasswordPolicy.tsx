import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Key, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PasswordPolicy: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Policy states
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [expiryDays, setExpiryDays] = useState(90);
  const [saving, setSaving] = useState(false);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/password-policy');
      const p = res.data?.data;
      if (p) {
        setMinLength(p.minLength);
        setRequireUppercase(p.requireUppercase);
        setRequireLowercase(p.requireLowercase);
        setRequireNumbers(p.requireNumbers);
        setRequireSpecial(p.requireSpecial);
        setExpiryDays(p.expiryDays);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/security/password-policy', {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecial,
        expiryDays,
      });
      alert('Password complexity policy updated.');
      fetchPolicy();
    } catch (err) {
      console.error(err);
      alert('Failed to save policy settings');
    } finally {
      setSaving(false);
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
            <Key className="h-5.5 w-5.5 text-indigo-400" />
            <span>Password Complexity Policy</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Define character parameters, min length checks, and security resets intervals.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading policy metrics...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-xl bg-[#0F172A] border border-slate-900 rounded-3xl p-6 space-y-5 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Minimum Length</label>
              <input
                type="number"
                value={minLength}
                onChange={(e) => setMinLength(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                min={6}
                max={32}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Password Expiry (Days)</label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                min={1}
              />
            </div>
          </div>

          <div className="space-y-3.5 border-t border-slate-900/60 pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requireUppercase}
                onChange={(e) => setRequireUppercase(e.target.checked)}
                className="rounded border-slate-800 text-indigo-650 bg-slate-950"
              />
              <span>Require at least one uppercase letter (A-Z)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requireLowercase}
                onChange={(e) => setRequireLowercase(e.target.checked)}
                className="rounded border-slate-800 text-indigo-650 bg-slate-950"
              />
              <span>Require at least one lowercase letter (a-z)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requireNumbers}
                onChange={(e) => setRequireNumbers(e.target.checked)}
                className="rounded border-slate-800 text-indigo-650 bg-slate-950"
              />
              <span>Require at least one number digit (0-9)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={requireSpecial}
                onChange={(e) => setRequireSpecial(e.target.checked)}
                className="rounded border-slate-800 text-indigo-650 bg-slate-950"
              />
              <span>Require at least one special symbol (!@#$%)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Policies Settings</span>
          </button>

        </form>
      )}

    </div>
  );
};

export default PasswordPolicy;
export { PasswordPolicy };
