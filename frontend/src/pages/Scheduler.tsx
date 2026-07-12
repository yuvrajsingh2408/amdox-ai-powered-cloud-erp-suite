import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, Loader2, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Scheduler: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{ crons: any[]; queues: any[] }>({ crons: [], queues: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/scheduler');
        setData(res.data?.data || { crons: [], queues: [] });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            Job Scheduler & Queue Monitor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage cron jobs, background workers, and task queues.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Mapping job processors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cron Jobs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Scheduled Cron Jobs</h3>
            {data.crons.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850 rounded-xl">No cron jobs.</div>
            ) : (
              data.crons.map((c, i) => (
                <div key={i} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{c.name}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[8px] font-bold text-emerald-400 uppercase">ACTIVE</span>
                  </div>
                  <p className="font-mono text-indigo-400">{c.cronExpr}</p>
                  <p className="text-slate-500">Next run: {c.nextRun ? new Date(c.nextRun).toLocaleString() : 'N/A'}</p>
                </div>
              ))
            )}
          </div>

          {/* Queue Jobs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Message Queue Tasks</h3>
            {data.queues.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850 rounded-xl">Queue is empty.</div>
            ) : (
              data.queues.map((q, i) => (
                <div key={i} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 font-mono">{q.queueName}</span>
                    <span className="px-1.5 py-0.5 bg-yellow-950/20 border border-yellow-900/30 rounded text-[8px] font-bold text-yellow-400 uppercase">{q.status}</span>
                  </div>
                  <p className="text-slate-500">Attempts: {q.attempts}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
export { Scheduler };
