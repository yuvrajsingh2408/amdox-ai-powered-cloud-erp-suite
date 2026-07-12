import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, XCircle, Loader2, Play, 
  Trash2, FileText, Check, TrendingUp, Info, HelpCircle
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  module: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

const AIRecommendations: React.FC = () => {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ai/recommendations');
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleResolveAction = async (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    setActioningId(id);
    try {
      await axios.post(`/api/ai/recommendations/${id}/resolve`, { action });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Action failed', err);
    } finally {
      setActioningId(null);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-900/40 text-[9px] font-bold uppercase tracking-wider">
            <ShieldAlert className="h-3 w-3" />
            <span>Critical</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-900/40 text-[9px] font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" />
            <span>Warning</span>
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-400 border border-indigo-900/40 text-[9px] font-bold uppercase tracking-wider">
            <Info className="h-3 w-3" />
            <span>Info</span>
          </span>
        );
    }
  };

  const getModuleBadge = (mod: string) => {
    let color = 'text-slate-400 bg-slate-900 border-slate-800';
    if (mod === 'HR') color = 'text-purple-300 bg-purple-950/40 border-purple-900/40';
    if (mod === 'FINANCE') color = 'text-emerald-300 bg-emerald-950/40 border-emerald-900/40';
    if (mod === 'SCM') color = 'text-blue-300 bg-blue-950/40 border-blue-900/40';
    if (mod === 'PROJECT') color = 'text-amber-300 bg-amber-950/40 border-amber-900/40';

    return (
      <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[9px] font-bold tracking-wider ${color}`}>
        {mod}
      </span>
    );
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-amber-500" />
            <span>Proactive AI Risk Alerts & Recommendations</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time audit rules scanning for SCM inventory, HR employee attrition risks, and Accounts Receivable overdue invoice limits.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-lg hover:text-white transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Scan Ledger Now</span>
        </button>
      </div>

      {/* Grid Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-red-950 text-red-400 border border-red-900/50">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Critical Risks</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {items.filter(i => i.severity === 'CRITICAL').length}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-900/50">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Warning Warnings</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {items.filter(i => i.severity === 'WARNING').length}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900/50">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Health Level</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {items.length === 0 ? '98.5%' : '88.2%'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Alert List */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Pending Recommendations Feed
          </h2>
          <span className="text-[10px] text-slate-500 font-bold bg-[#1E293B] border border-slate-800 px-2 py-0.5 rounded">
            {items.length} Pending Actions
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Scanning tables for inventory levels and ledger terms...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <div className="text-center space-y-1">
              <h4 className="text-xs font-bold text-white">System in Optimal Health</h4>
              <p className="text-[11px] text-slate-500">
                No active critical exceptions, supply chain reorder bottlenecks, or attrition warnings logged.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-900/10 transition-colors"
              >
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    {getModuleBadge(item.module)}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolveAction(item.id, 'RESOLVED')}
                    disabled={actioningId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {actioningId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Auto-Resolve</span>
                  </button>

                  <button
                    onClick={() => handleResolveAction(item.id, 'DISMISSED')}
                    disabled={actioningId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 disabled:opacity-50"
                  >
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AIRecommendations;
export { AIRecommendations };
