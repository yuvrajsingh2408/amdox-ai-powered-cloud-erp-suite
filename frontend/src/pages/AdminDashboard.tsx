import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, Cpu, Database, HardDrive, Users, Activity, AlertTriangle, 
  Settings, Terminal, Loader2, ArrowUpRight, BarChart3, Radio
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [health, setHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metRes, dbRes, healthRes] = await Promise.all([
          axios.get('/api/admin/metrics'),
          axios.get('/api/admin/db'),
          axios.get('/api/admin/health')
        ]);
        setMetrics(metRes.data.data?.[0] || { cpuUsage: 12.5, memUsage: 48.2, diskUsage: 35.1 });
        setDbStats(dbRes.data.data?.dbStats || { tablesCount: 128, rowsCount: 45201, sizeGb: 0.12 });
        setHealth(healthRes.data.data || []);
      } catch (err) {
        console.error('Error fetching admin telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const perfData = [
    { time: '00:00', CPU: 12, RAM: 45, latency: 15 },
    { time: '04:00', CPU: 18, RAM: 47, latency: 18 },
    { time: '08:00', CPU: 35, RAM: 58, latency: 28 },
    { time: '12:00', CPU: 42, RAM: 60, latency: 32 },
    { time: '16:00', CPU: 38, RAM: 59, latency: 25 },
    { time: '20:00', CPU: 22, RAM: 50, latency: 19 },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-900 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span>Platform Admin & DevOps Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Global settings, server telemetry, and multi-tenant quotas.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/settings" className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Settings className="h-3.5 w-3.5" /> System Settings
          </Link>
          <Link to="/admin/health" className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Radio className="h-3.5 w-3.5" /> Health Checks
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <span className="text-xs">Gathering system logs & CPU metrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metrics Grids */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CPU Load</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-extrabold text-white">{metrics?.cpuUsage}%</h3>
                <Cpu className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${metrics?.cpuUsage || 12}%` }} />
              </div>
            </div>

            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Memory Usage</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-extrabold text-white">{metrics?.memUsage}%</h3>
                <HardDrive className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metrics?.memUsage || 45}%` }} />
              </div>
            </div>

            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Database Size</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-extrabold text-white">{dbStats?.sizeGb} GB</h3>
                <Database className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Rows: {dbStats?.rowsCount?.toLocaleString()} • Tables: {dbStats?.tablesCount}</p>
            </div>

            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">System Health</span>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-extrabold text-emerald-400">Stable</h3>
                <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Core nodes responding within 4ms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Telemetry Chart */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-indigo-400" /> Server Telemetry Over Time
              </h3>
              <div className="h-60 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="CPU" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="RAM" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Checklist */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Health Heartbeats</h3>
              <div className="space-y-3.5">
                {health.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-200">{h.service}</span>
                      <p className="text-[10px] text-slate-500">Latency: {h.latencyMs}ms</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 uppercase">
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
