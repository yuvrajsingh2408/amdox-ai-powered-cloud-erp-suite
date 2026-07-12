import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, BarChart2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TelemetryMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/metrics');
        setMetrics(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const chartData = metrics.map((m, i) => ({
    time: `T-${metrics.length - i}`,
    CPU: m.cpuUsage,
    RAM: m.memUsage,
    Disk: m.diskUsage,
  }));

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
            Server Telemetry Monitor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Live CPU, RAM, and disk usage tracking over time.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'CPU Usage', val: `${metrics[0]?.cpuUsage ?? 0}%`, color: 'text-indigo-400' },
              { label: 'Memory Usage', val: `${metrics[0]?.memUsage ?? 0}%`, color: 'text-emerald-400' },
              { label: 'Disk Usage', val: `${metrics[0]?.diskUsage ?? 0}%`, color: 'text-yellow-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
                <h3 className={`text-2xl font-extrabold mt-1 ${color}`}>{val}</h3>
              </div>
            ))}
          </div>

          <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Usage Trend (Last 10 Samples)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: 11 }} />
                  <Area type="monotone" dataKey="CPU" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="RAM" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="Disk" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryMonitor;
export { TelemetryMonitor };
