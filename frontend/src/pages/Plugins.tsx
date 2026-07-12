import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PluginInst {
  id: string;
  pluginName: string;
  version: string;
  installedAt: string;
}

const Plugins: React.FC = () => {
  const navigate = useNavigate();
  const [plugins, setPlugins] = useState<PluginInst[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/plugins');
      setPlugins(res.data?.data?.installed || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleUninstall = async (id: string) => {
    if (!confirm('Are you sure you want to uninstall this system plugin?')) return;
    try {
      await axios.delete(`/api/admin/plugins/${id}`);
      alert('Plugin uninstalled.');
      fetchPlugins();
    } catch (e) {
      console.error(e);
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
            <Sparkles className="h-5.5 w-5.5 text-indigo-400" />
            <span>Installed System Plugins</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Control active developer addons, verify compliance versions, and disable modules.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Locating local configurations...</span>
        </div>
      ) : plugins.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No external system plugins installed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {plugins.map((pl) => (
            <div key={pl.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-3xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">{pl.pluginName}</h4>
                <p className="text-[10px] text-slate-500">Version: {pl.version} • Installed: {new Date(pl.installedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleUninstall(pl.id)}
                className="p-1 hover:bg-slate-850 rounded text-slate-450 hover:text-red-400 transition-colors"
                title="Uninstall plugin"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Plugins;
export { Plugins };
