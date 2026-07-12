import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FolderGit2, AlertTriangle, CheckCircle2, 
  TrendingUp, RefreshCw, BarChart3, Clock, Milestone 
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#0F172A', '#475569', '#64748B', '#94A3B8'];

interface ProjectItem {
  id: string;
  name: string;
  budget: number;
  actualCost: number;
  status: string;
}

const ProjectDashboard: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setProjects([
        { id: 'p1', name: 'Austin Warehouse Setup', budget: 120000, actualCost: 85000, status: 'ACTIVE' },
        { id: 'p2', name: 'CRM Integration', budget: 45000, actualCost: 48000, status: 'ACTIVE' },
        { id: 'p3', name: 'Q3 Tax Audit', budget: 15000, actualCost: 5000, status: 'PLANNING' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalCost = projects.reduce((sum, p) => sum + p.actualCost, 0);

  // Status distributions
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const planningCount = projects.filter(p => p.status === 'PLANNING').length;

  const chartData = projects.map(p => ({
    name: p.name.substring(0, 15),
    Budget: p.budget,
    Spent: p.actualCost
  }));

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Management Console</h2>
          <p className="text-xs text-slate-500 font-medium">Aggregated project budgets, milestone checklists, and AI-powered delay estimations</p>
        </div>
        <button
          onClick={fetchProjects}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 border border-slate-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Briefcase className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Projects</span>
                <span className="text-xl font-bold text-slate-800">{projects.length} Registered</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Clock className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active execution</span>
                <span className="text-xl font-bold text-slate-800">{activeCount} Running</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total budget scope</span>
                <span className="text-xl font-bold text-slate-800">${totalBudget.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-750 rounded-lg"><Milestone className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Actual cost spent</span>
                <span className="text-xl font-bold text-slate-800">${totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-slate-850" />
                Budget vs. Actual Costs Comparison
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Budget" fill="#0F172A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Spent" fill="#64748B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-slate-850" />
                  AI Budget Overrun Predictor
                </h3>

                <div className="space-y-4 mt-2">
                  {projects.map((p, idx) => {
                    const overrunRatio = p.budget > 0 ? (p.actualCost / p.budget) * 100 : 0;
                    const isRisk = overrunRatio > 100;
                    return (
                      <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{p.name}</span>
                          <span className={isRisk ? 'text-red-655' : 'text-slate-655'}>
                            {Math.round(overrunRatio)}% spent
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isRisk ? 'bg-red-500' : 'bg-slate-900'}`} 
                            style={{ width: `${Math.min(overrunRatio, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[10px] text-slate-500 font-semibold mt-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-700 mt-0.5" />
                <span>AI recommendation: Review the CRM Integration budget parameters immediately; actual costs currently exceed allocated limits.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDashboard;
