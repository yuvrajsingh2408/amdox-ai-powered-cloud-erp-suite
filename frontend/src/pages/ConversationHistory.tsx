import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, Search, Sparkles, RefreshCw, Loader2, ArrowUpRight, CheckCircle, 
  Terminal, ShieldCheck, Tag, Cpu, MessageSquare, AlertCircle
} from 'lucide-react';

interface HistoryLog {
  id: string;
  query: string;
  response: string;
  module: string;
  tokensUsed: number;
  isSuccessful: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ConversationHistory: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/ai/history-logs?search=${search}`);
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load history logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  const handleRunAgain = (queryText: string) => {
    navigate('/ai/chat', { state: { initialPrompt: queryText } });
  };

  const getModuleColor = (mod: string) => {
    if (mod === 'HR') return 'text-purple-300 bg-purple-950/40 border-purple-900/40';
    if (mod === 'FINANCE') return 'text-emerald-300 bg-emerald-950/40 border-emerald-900/40';
    if (mod === 'SCM') return 'text-blue-300 bg-blue-950/40 border-blue-900/40';
    if (mod === 'PROJECT') return 'text-amber-300 bg-amber-950/40 border-amber-900/40';
    return 'text-slate-400 bg-slate-900 border-slate-800';
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5.5 w-5.5 text-primary" />
            <span>AI Copilot Conversation & Audit Logs</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Audit history of all natural language database queries, security bounds, and token calculations.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search query text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Banner */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-200 block">RBAC & Tenant Isolation Enforced</span>
          <p className="text-slate-500 mt-0.5">
            Only queries matching your workspace boundary are stored. Administrators can download audit histories for regulatory reviews.
          </p>
        </div>
      </div>

      {/* Logs Table / Roster */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Parsing security logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-xs text-slate-500 border border-dashed border-slate-850 rounded-2xl">
          No audit history matching the criteria.
        </div>
      ) : (
        <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 border-b border-slate-800">Timestamp</th>
                <th className="px-5 py-3 border-b border-slate-800">User Profile</th>
                <th className="px-5 py-3 border-b border-slate-800">Natural Language Prompt</th>
                <th className="px-5 py-3 border-b border-slate-800 text-center">Module</th>
                <th className="px-5 py-3 border-b border-slate-800 text-center">Tokens</th>
                <th className="px-5 py-3 border-b border-slate-800 text-center">Security</th>
                <th className="px-5 py-3 border-b border-slate-800 text-center">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/15 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-[10px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-200 block text-[11px]">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{log.user?.email || 'N/A'}</span>
                  </td>
                  <td className="px-5 py-4 max-w-sm">
                    <p className="text-slate-300 font-medium truncate" title={log.query}>
                      "{log.query}"
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1 line-clamp-1">
                      {log.response.replace(/[#*|`\-]/g, '').slice(0, 70)}...
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[9px] font-bold ${getModuleColor(log.module)}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center font-mono text-[10px] text-slate-400">
                    {log.tokensUsed}
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    {log.isSuccessful ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-lg">
                        <CheckCircle className="h-3 w-3" />
                        <span>Pass</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded-lg">
                        <AlertCircle className="h-3 w-3" />
                        <span>Fail</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleRunAgain(log.query)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg border border-slate-750 transition-all font-semibold"
                    >
                      <span>Run</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ConversationHistory;
export { ConversationHistory };
