import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart4, ArrowLeft, GitBranch, Cpu } from 'lucide-react';

const WorkflowAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // Simulated metrics
  const departmentData = [
    { name: 'Finance (EXP)', avgTime: 4.2, slaBreaches: 1 },
    { name: 'HR (LEAVE)', avgTime: 2.1, slaBreaches: 0 },
    { name: 'SCM (PO)', avgTime: 8.5, slaBreaches: 3 },
    { name: 'Admin Operations', avgTime: 1.5, slaBreaches: 0 },
  ];

  const monthlyVolume = [
    { name: 'Jan', processed: 140 },
    { name: 'Feb', processed: 210 },
    { name: 'Mar', processed: 195 },
    { name: 'Apr', processed: 320 },
    { name: 'May', processed: 290 },
    { name: 'Jun', processed: 410 },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/workflows')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart4 className="h-5.5 w-5.5 text-indigo-400" />
            <span>Workflow Operations & SLA Analytics</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Scans workflow completion velocity rates, bottlenecks detection, and monthly volumes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department SLA Speed */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Resolution SLA hours by Department</h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="avgTime" name="Avg Hours to Approve" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly volume */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Processed Instances Trends</h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Line type="monotone" dataKey="processed" name="Completed Approvals" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default WorkflowAnalytics;
export { WorkflowAnalytics };
