import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Settings, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnvVariables: React.FC = () => {
  const navigate = useNavigate();
  const [vars, setVars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVars = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/env');
      setVars(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVars(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setSaving(true);
    try {
      await axios.post('/api/admin/env', { envKey: newKey.trim(), envVal: newVal });
      setNewKey('');
      setNewVal('');
      fetchVars();
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
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400" />
            Environment Variables
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage runtime env keys for database, API tokens, and integration credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add new */}
        <form onSubmit={handleSave} className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-slate-200">Add / Update Variable</h3>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px]">Variable Key</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder="REDIS_URL"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 font-mono focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold uppercase text-[9px]">Variable Value</label>
            <input
              type="text"
              value={newVal}
              onChange={e => setNewVal(e.target.value)}
              placeholder="redis://localhost:6379"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Variable
          </button>
        </form>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0F172A] text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
                  <tr>
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {vars.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="px-5 py-3 font-mono font-bold text-indigo-400">{v.envKey}</td>
                      <td className="px-5 py-3 font-mono text-slate-400">{v.envVal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvVariables;
export { EnvVariables };
