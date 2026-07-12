import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Webhook {
  id: string;
  targetUrl: string;
  secret: string;
  isActive: boolean;
}

const Webhooks: React.FC = () => {
  const navigate = useNavigate();
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchHooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/webhooks');
      setHooks(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHooks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    setCreating(true);
    try {
      await axios.post('/api/admin/webhooks', { targetUrl });
      alert('Webhook created.');
      setTargetUrl('');
      fetchHooks();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook subscription?')) return;
    try {
      await axios.delete(`/api/admin/webhooks/${id}`);
      alert('Webhook deleted.');
      fetchHooks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
              <span>Event Webhooks Subscriptions</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Configure target receiver URLs for real-time transactional dispatches.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Create Webhook Form (Col span 1) */}
        <form onSubmit={handleCreate} className="bg-[#0F172A] border border-slate-900 rounded-3xl p-5 space-y-4 h-fit">
          <h3 className="font-bold text-slate-200">Register webhook</h3>
          <div className="space-y-1.5">
            <label className="text-slate-450 font-bold uppercase text-[9px]">Target Receiver URL</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://yourserver.com/hooks"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>Subscribe Hook</span>
          </button>
        </form>

        {/* Webhooks list (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Fetching active endpoints...</span>
            </div>
          ) : hooks.length === 0 ? (
            <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
              No active webhook targets.
            </div>
          ) : (
            <div className="space-y-3">
              {hooks.map((h) => (
                <div key={h.id} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between text-xs gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-indigo-400 font-bold">{h.targetUrl}</span>
                    <p className="text-[9px] text-slate-500 font-mono select-all">Secret Hash: {h.secret}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-1 hover:bg-slate-850 rounded text-slate-450 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
export { Webhooks };
