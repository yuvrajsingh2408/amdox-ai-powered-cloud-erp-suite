import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, Loader2, CheckCircle, XCircle, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryRecord {
  id: string;
  action: string;
  comments?: string;
  createdAt: string;
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  approval: {
    name: string;
    instance: {
      entityType: string;
      entityId: string;
      workflow: {
        name: string;
      };
    };
  };
}

const ApprovalHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/approvals/history');
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

  const getActionBadge = (act: string) => {
    if (act === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-lg">
          <CheckCircle className="h-3 w-3" />
          <span>Approved</span>
        </span>
      );
    }
    if (act === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded-lg">
          <XCircle className="h-3 w-3" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded-lg">
        <ShieldAlert className="h-3 w-3" />
        <span>Escalated</span>
      </span>
    );
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/workflows')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="h-5.5 w-5.5 text-indigo-400" />
              <span>Decisions & Approvals Audit History</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Audit trail logs mapping choices logged by supervisors and finance boards.</p>
          </div>
        </div>

        <button 
          onClick={fetchHistory}
          className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching decisions trail...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No approval decisions history logs found in this tenant.
        </div>
      ) : (
        <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Authorized Actor</th>
                <th className="px-5 py-3">Workflow Origin</th>
                <th className="px-5 py-3 text-center">Decision</th>
                <th className="px-5 py-3">Audit Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-805 text-slate-300">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-900/15 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-[10px] text-slate-500">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-200 block text-[11px]">
                      {record.actor ? `${record.actor.firstName} ${record.actor.lastName}` : 'System'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{record.actor?.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-200 block text-[11px]">
                      {record.approval?.instance?.workflow?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Scope: {record.approval?.instance?.entityType} (ID: {record.approval?.instance?.entityId})
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {getActionBadge(record.action)}
                  </td>
                  <td className="px-5 py-3.5 max-w-xs truncate text-slate-400 text-[11px]" title={record.comments || ''}>
                    {record.comments || 'No comments left.'}
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

export default ApprovalHistory;
export { ApprovalHistory };
