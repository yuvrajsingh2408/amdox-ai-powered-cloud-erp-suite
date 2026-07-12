import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HistoryLog {
  id: string;
  email: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  status: string;
  reason?: string;
  createdAt: string;
}

const LoginHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/login-history');
      setHistory(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const chartData = [
    { name: 'Jan', Success: 180, Failed: 4 },
    { name: 'Feb', Success: 200, Failed: 0 },
    { name: 'Mar', Success: 215, Failed: 8 },
    { name: 'Apr', Success: 190, Failed: 1 },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/security')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
              <span>Authentication Log History</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Audit login outcomes, check fail reasons, and identify potential account lockouts.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching auth transaction histories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Table list (Col span 2) */}
          <div className="lg:col-span-2 border border-slate-900 bg-[#0F172A] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-450 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
                <tr>
                  <th className="px-5 py-3">User / Email</th>
                  <th className="px-5 py-3">IP Signature</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855 text-slate-300">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-200">{h.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{h.ipAddress || '127.0.0.1'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        h.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-rose-400 bg-rose-950/20 border border-rose-900/30'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-550">{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side stats chart (Col span 1) */}
          <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Monthly Login Trends</h3>
            <div className="h-44 text-xs text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="Success" name="Success Logins" fill="#10b981" />
                  <Bar dataKey="Failed" name="Failed Blocks" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default LoginHistory;
export { LoginHistory };
