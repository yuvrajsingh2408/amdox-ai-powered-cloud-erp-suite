import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Briefcase, Calendar, 
  DollarSign, ArrowUpRight, ShieldAlert, CheckCircle2, X 
} from 'lucide-react';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  status: string;
  budget: number;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Drawer form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [budget, setBudget] = useState('10000');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      setProjects([
        { id: 'p1', name: 'Austin Warehouse Setup', description: 'Installing shelves and inventory tracking system', startDate: '2026-07-01', status: 'ACTIVE', budget: 120000 },
        { id: 'p2', name: 'CRM Integration', description: 'Connecting Leads pipeline modules', startDate: '2026-07-05', status: 'ACTIVE', budget: 45000 }
      ]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/projects', { name, description, startDate, budget });
      if (res.data.success) {
        setSuccess('New enterprise project registered successfully!');
        fetchProjects();
        setIsDrawerOpen(false);
        setName('');
        setDescription('');
        setStartDate('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Projects Registry</h2>
          <p className="text-xs text-slate-500 font-medium">Verify budgets, review project milestones, and inspect task execution boards</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsDrawerOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4">Project Name</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">Budget</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.description}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-655 font-mono">{p.startDate.substring(0, 10)}</td>
                <td className="p-4 font-bold text-slate-900">${p.budget.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                    p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    to={`/projects/${p.id}`}
                    className="px-2.5 py-1 bg-slate-900 text-white font-bold text-[10px] rounded hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Creation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col font-sans">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register new project</h4>
            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-650">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateProject} className="p-5 flex-1 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Project Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dallas Warehouse Setup"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Description</label>
              <textarea
                placeholder="Details about the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Allocated Budget</label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Configure Project
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Projects;
