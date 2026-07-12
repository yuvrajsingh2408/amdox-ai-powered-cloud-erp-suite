import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Loader2, Sparkles, AlertCircle, RefreshCw, Key, 
  Smartphone, UserCheck, ShieldAlert, Database, HelpCircle 
} from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';

interface SecurityScore {
  score: number;
  grade: string;
  recommendations: string[];
}

const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [scoreData, setScoreData] = useState<SecurityScore | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulated metrics
  const trendsData = [
    { name: 'Mon', logins: 120, blocks: 2 },
    { name: 'Tue', logins: 150, blocks: 0 },
    { name: 'Wed', logins: 180, blocks: 5 },
    { name: 'Thu', logins: 140, blocks: 1 },
    { name: 'Fri', logins: 220, blocks: 0 },
    { name: 'Sat', logins: 90, blocks: 0 },
    { name: 'Sun', logins: 80, blocks: 3 },
  ];

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/score');
      setScoreData(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
            <span>Enterprise Security Center & Control Hub</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor authentication security, manage device sessions, schedule backups, and track regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/security/sessions"
            className="px-3 py-1.5 bg-[#0F172A] border border-slate-850 hover:bg-slate-900 rounded-lg font-bold text-slate-350"
          >
            Sessions
          </Link>
          <Link
            to="/security/backups"
            className="px-3 py-1.5 bg-[#0F172A] border border-slate-850 hover:bg-slate-900 rounded-lg font-bold text-slate-350"
          >
            Backup Center
          </Link>
          <Link
            to="/security/compliance"
            className="px-3 py-1.5 bg-[#0F172A] border border-slate-850 hover:bg-slate-900 rounded-lg font-bold text-slate-350"
          >
            Compliance
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Computing AI security scores...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main cards row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Security Score</span>
                <h3 className="text-lg font-extrabold text-white mt-1">{scoreData?.score || 90}% ({scoreData?.grade || 'A'})</h3>
              </div>
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Sessions</span>
                <h3 className="text-lg font-extrabold text-white mt-1">4 Devices</h3>
              </div>
              <Smartphone className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Security Alerts</span>
                <h3 className="text-lg font-extrabold text-rose-400 mt-1">1 Critical</h3>
              </div>
              <ShieldAlert className="h-6 w-6 text-rose-500" />
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Database Backup</span>
                <h3 className="text-lg font-extrabold text-emerald-400 mt-1">SECURE</h3>
              </div>
              <Database className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Login trends chart (Col span 2) */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Authentication volume vs. Block attempts</h3>
              
              <div className="h-60 text-xs text-slate-450">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData}>
                    <defs>
                      <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="logins" name="Valid Logins" stroke="#6366f1" fillOpacity={1} fill="url(#colorLogins)" />
                    <Area type="monotone" dataKey="blocks" name="IP Blocks" stroke="#f43f5e" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Recommendations panel (Col span 1) */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <span>AI Security Recommendations</span>
              </h3>

              <div className="space-y-3">
                {scoreData?.recommendations?.map((rec, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-start gap-2 relative overflow-hidden text-xs text-slate-350">
                    <p className="leading-relaxed">"{rec}"</p>
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

export default SecurityDashboard;
export { SecurityDashboard };
