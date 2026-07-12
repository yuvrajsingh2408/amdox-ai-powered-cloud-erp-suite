import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, ArrowLeft, Loader2, CheckCircle, AlertTriangle, ShieldCheck, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Instance {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  currentStepIndex: number;
  startedBy: string;
  createdAt: string;
  workflow: {
    name: string;
  };
  approvals: Array<{
    id: string;
    stepOrder: number;
    name: string;
    status: string;
  }>;
}

const WorkflowInstances: React.FC = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/workflows/instances');
      setInstances(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    if (status === 'REJECTED') return 'text-red-400 border-red-950 bg-red-950/20';
    if (status === 'ESCALATED') return 'text-rose-400 border-rose-950 bg-rose-950/20';
    return 'text-indigo-400 border-indigo-950 bg-indigo-950/20';
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
              <Play className="h-5.5 w-5.5 text-indigo-400" />
              <span>Active Workflow Executions</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Real-time status tracking of leaves reviews, expense approvals, and PO orders.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Traced execution logs...</span>
        </div>
      ) : instances.length === 0 ? (
        <div className="text-center py-20 text-slate-650 text-xs border border-dashed border-slate-850 rounded-2xl">
          No execution instances found. Run approval routes inside HR or SCM pages to trigger.
        </div>
      ) : (
        <div className="space-y-4">
          {instances.map((inst) => (
            <div key={inst.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-200">{inst.workflow?.name}</h3>
                  <span className="text-[10px] text-slate-500 block">
                    Instance Ref: {inst.id} • Trigger: {inst.entityType} ID: {inst.entityId}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${getStatusColor(inst.status)}`}>
                    {inst.status}
                  </span>
                </div>
              </div>

              {/* Progress timeline tracker */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {inst.approvals.map((app) => (
                  <div key={app.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-300">{app.name}</span>
                      <span className={`font-bold ${
                        app.status === 'APPROVED' ? 'text-emerald-400' : app.status === 'PENDING' ? 'text-indigo-400' : 'text-slate-500'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${
                        app.status === 'APPROVED' ? 'bg-emerald-500' : app.status === 'PENDING' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'
                      }`} style={{ width: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-900/60">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Initiator: {inst.startedBy}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Started: {new Date(inst.createdAt).toLocaleString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WorkflowInstances;
export { WorkflowInstances };
