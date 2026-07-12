import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  GitBranch, Plus, Play, ToggleLeft, ToggleRight, Copy, Trash2, 
  Search, ShieldAlert, Clock, CheckSquare, Sparkles, Loader2, ArrowRight 
} from 'lucide-react';

interface WorkflowDef {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  steps: any[];
}

const WorkflowDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/workflows?search=${search}`);
      setWorkflows(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search]);

  const handleToggleActive = async (id: string) => {
    try {
      await axios.patch(`/api/workflows/${id}/toggle`);
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await axios.post(`/api/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow config?')) return;
    try {
      await axios.delete(`/api/workflows/${id}`);
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  };

  const getModuleColor = (mod: string) => {
    if (mod === 'HR' || mod === 'LEAVE' || mod === 'EMPLOYEE') return 'text-purple-400 border-purple-950 bg-purple-950/20';
    if (mod === 'FINANCE' || mod === 'EXPENSE' || mod === 'INVOICE') return 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    if (mod === 'SCM' || mod === 'PURCHASE_ORDER' || mod === 'VENDOR') return 'text-blue-400 border-blue-950 bg-blue-950/20';
    return 'text-slate-400 border-slate-800 bg-slate-900/60';
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="h-5.5 w-5.5 text-primary" />
            <span>Workflow Automation & Approval Dashboard</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Build multi-stage approval systems, check SLA deadlines, and run active business workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/workflows/builder"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Design Custom Workflow</span>
          </Link>
          <Link
            to="/workflows/templates"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Preset Templates</span>
          </Link>
          <Link
            to="/workflows/instances"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            <Play className="h-3.5 w-3.5 text-indigo-400" />
            <span>Active Executions</span>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Rules Configs</span>
          <h3 className="text-lg font-extrabold text-white mt-1">{workflows.filter(w => w.isActive).length}</h3>
        </div>
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg Approval SLA Time</span>
          <h3 className="text-lg font-extrabold text-white mt-1">6.2 Hours</h3>
        </div>
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Completed Approvals Today</span>
          <h3 className="text-lg font-extrabold text-white mt-1">24</h3>
        </div>
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Escalated Overdue Tasks</span>
          <h3 className="text-lg font-extrabold text-rose-400 mt-1">3</h3>
        </div>
      </div>

      {/* Workflows list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Design Roster Definitions</h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search workflows by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F172A] border border-slate-805 rounded-lg text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Loading workflow definitions...</span>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20 text-slate-650 text-xs border border-dashed border-slate-850 rounded-2xl">
            No workflows designed yet. Click "Design Custom Workflow" to construct rules.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4 hover:border-slate-800 transition-colors relative group">
                <div className="flex items-start justify-between">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold border ${getModuleColor(wf.triggerType)}`}>
                    {wf.triggerType}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(wf.id)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors ${wf.isActive ? 'text-indigo-400' : 'text-slate-500'}`}
                      title={wf.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {wf.isActive ? <ToggleRight className="h-5.5 w-5.5" /> : <ToggleLeft className="h-5.5 w-5.5" />}
                    </button>
                    <button
                      onClick={() => handleDuplicate(wf.id)}
                      className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(wf.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{wf.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{wf.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-3 border-t border-slate-850">
                  <span>Version: v{wf.version} • Steps: {wf.steps?.length || 0} stages</span>
                  <button
                    onClick={() => navigate('/workflows/builder', { state: { workflow: wf } })}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    <span>Edit Designer</span>
                    <ArrowRight className="h-3 w-3" />
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

export default WorkflowDashboard;
export { WorkflowDashboard };
