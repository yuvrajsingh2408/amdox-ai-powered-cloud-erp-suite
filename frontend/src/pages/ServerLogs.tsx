import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Terminal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServerLogs: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/logs');
        setLogs(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const levelColor = (l: string) =>
    l === 'ERROR' ? 'text-rose-400' : l === 'WARN' ? 'text-yellow-400' : 'text-emerald-400';

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              Server Transaction Logs
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Real-time ERP platform request and error telemetry.</p>
          </div>
        </div>
        <div className="flex gap-1">
          {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border transition-colors ${
                filter === lvl
                  ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400'
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Streaming log entries...</span>
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl overflow-hidden font-mono text-xs">
          <div className="p-2 bg-slate-950 border-b border-slate-900 flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500 opacity-60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 opacity-60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-60" />
            <span className="text-slate-600 ml-2">amdox-erp-server.log</span>
          </div>
          <div className="p-4 space-y-1.5 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <span className="text-slate-600">No log entries match this filter.</span>
            ) : (
              filtered.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  <span className={`shrink-0 font-bold w-10 ${levelColor(log.level)}`}>{log.level}</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerLogs;
export { ServerLogs };
