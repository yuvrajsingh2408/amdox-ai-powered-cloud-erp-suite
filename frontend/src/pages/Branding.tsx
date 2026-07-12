import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Branding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [whiteLabel, setWhiteLabel] = useState(false);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/branding');
      const brand = res.data?.data?.brand;
      if (brand) {
        setCompanyName(brand.companyName);
        setPrimaryColor(brand.primaryColor);
        setWhiteLabel(brand.whiteLabel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/admin/branding', {
        companyName,
        primaryColor,
        whiteLabel,
      });
      alert('Custom branding properties updated.');
      fetchBranding();
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
            <span>Theme & Branding Controls</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Control company titles, brand layouts, and whitelabel attributes.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading branding parameters...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="max-w-xl bg-[#0F172A] border border-slate-900 rounded-3xl p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-450 font-bold uppercase text-[9px]">Branding Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-455 font-bold uppercase text-[9px]">Theme Hex Color Code</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-8 bg-slate-950 border border-slate-855 rounded-lg focus:outline-none cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-300 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={whiteLabel}
              onChange={(e) => setWhiteLabel(e.target.checked)}
              className="rounded border-slate-800 text-indigo-650 bg-slate-950 focus:ring-0"
            />
            <span>Enable White Labeling (Hide Amdox brand marks)</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Branding Theme</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default Branding;
export { Branding };
