import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Settings, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default editable keys
  const [companyName, setCompanyName] = useState('Amdox ERP Corp');
  const [timezone, setTimezone] = useState('UTC+5:30');
  const [currency, setCurrency] = useState('USD');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/settings');
      setSettings(res.data?.data || []);
      // Map loaded values if exist
      const nameObj = res.data?.data?.find((s: any) => s.key === 'COMPANY_NAME');
      if (nameObj) setCompanyName(nameObj.value);
      const tzObj = res.data?.data?.find((s: any) => s.key === 'TIMEZONE');
      if (tzObj) setTimezone(tzObj.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        axios.post('/api/admin/settings', { key: 'COMPANY_NAME', value: companyName }),
        axios.post('/api/admin/settings', { key: 'TIMEZONE', value: timezone }),
        axios.post('/api/admin/settings', { key: 'DEFAULT_CURRENCY', value: currency })
      ]);
      alert('Global configuration saved successfully.');
      fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5.5 w-5.5 text-indigo-400" />
            <span>Global System Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage default system locale, timezone parameters, and corporate variables.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching system parameters...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl bg-[#0F172A] border border-slate-900 rounded-3xl p-6 space-y-4 text-xs shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Default Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-450 font-bold uppercase text-[9px]">Base Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Configuration Settings</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default SystemSettings;
export { SystemSettings };
