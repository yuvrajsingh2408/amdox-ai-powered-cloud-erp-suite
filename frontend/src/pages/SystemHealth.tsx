import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Activity, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemHealth: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/health');
        setHealth(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statusColor = (s: string) =>
    s === 'HEALTHY' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
    : s === 'DEGRADED' ? 'text-yellow-400 bg-yellow-950/20 border-yellow-900/30'
    : 'text-rose-400 bg-rose-950/20 border-rose-900/30';

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            System Health Monitor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Live heartbeat checks across all ERP backend services.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Running service diagnostics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {health.map((h, i) => (
            <div key={i} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 text-sm">{h.service}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${statusColor(h.status)}`}>
                  {h.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Latency:</span>
                <span className="font-bold text-indigo-400">{h.latencyMs} ms</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${h.latencyMs < 20 ? 'bg-emerald-500' : h.latencyMs < 100 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, h.latencyMs)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
export { SystemHealth };
