import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Plus, Calendar, Layers, ShieldAlert, 
  CheckCircle2, RefreshCw, Box, User, ArrowLeft,
  ChevronRight, ClipboardList, CheckSquare, X
} from 'lucide-react';
import axios from 'axios';

interface TaskItem {
  id: string;
  name: string;
  status: string;
  priority: string;
  assignee?: { firstName: string; lastName: string } | null;
}

interface MilestoneItem {
  id: string;
  name: string;
  dueDate: string;
  status: string;
}

interface SprintItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  startDate: string;
  budget: number;
  actualCost: number;
  progressPercent: number;
  status: string;
  tasks: TaskItem[];
  milestones: MilestoneItem[];
  sprints: SprintItem[];
  aiPredictions?: {
    delayRiskPercent: number;
    budgetOverrunRisk: string;
    budgetUsagePercent: number;
    estimatedDelayDays: number;
  };
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'kanban' | 'sprints' | 'milestones'>('kanban');
  const [loading, setLoading] = useState(true);

  // Form modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setProject({
        id: id || 'mock-p1',
        name: 'Austin Warehouse Setup',
        description: 'Installing shelves and inventory tracking system',
        startDate: '2026-07-01',
        budget: 120000,
        actualCost: 85000,
        progressPercent: 65,
        status: 'ACTIVE',
        tasks: [
          { id: 't1', name: 'Mount A1 steel racks', status: 'IN_PROGRESS', priority: 'HIGH', assignee: { firstName: 'Alice', lastName: 'Smith' } },
          { id: 't2', name: 'Configure bin allocations service', status: 'TODO', priority: 'MEDIUM', assignee: null },
          { id: 't3', name: 'Verify safety stock levels settings', status: 'DONE', priority: 'LOW', assignee: { firstName: 'Bob', lastName: 'Jones' } }
        ],
        milestones: [
          { id: 'm1', name: 'Shelves installation complete', dueDate: '2026-07-15', status: 'PENDING' }
        ],
        sprints: [
          { id: 's1', name: 'Sprint 1 - Foundation', startDate: '2026-07-01', endDate: '2026-07-10', status: 'ACTIVE' }
        ],
        aiPredictions: {
          delayRiskPercent: 12,
          budgetOverrunRisk: 'LOW',
          budgetUsagePercent: 70,
          estimatedDelayDays: 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    try {
      const res = await axios.post('/api/projects/tasks', {
        projectId: id,
        name: taskName,
        description: taskDescription,
        priority: taskPriority
      });
      if (res.data.success) {
        setIsTaskModalOpen(false);
        setTaskName('');
        setTaskDescription('');
        fetchProjectDetails();
      }
    } catch (err) {
      // fallback add
      if (project) {
        setProject({
          ...project,
          tasks: [
            ...project.tasks,
            { id: `t-${new Date().getTime()}`, name: taskName, status: 'TODO', priority: taskPriority, assignee: null }
          ]
        });
        setIsTaskModalOpen(false);
        setTaskName('');
        setTaskDescription('');
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`/api/projects/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectDetails();
    } catch (err) {
      if (project) {
        setProject({
          ...project,
          tasks: project.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        });
      }
    }
  };

  if (loading || !project) {
    return <div className="text-center py-20 text-slate-400 font-medium">Loading project specifications...</div>;
  }

  // Kanban status grouping
  const todoTasks = project.tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = project.tasks.filter(t => t.status === 'DONE');

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
        <Link to="/projects" className="hover:text-slate-655 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-bold">{project.name}</span>
      </div>

      {/* Hero Overview */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{project.description}</p>
          <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono font-bold pt-2">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase">Status: {project.status}</span>
            <span>Starts: {project.startDate.substring(0, 10)}</span>
          </div>
        </div>

        {/* AI Predictors cards */}
        {project.aiPredictions && (
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">AI Project Delay Risk</span>
              <span className="text-xl font-extrabold text-slate-850 mt-1 block">{project.aiPredictions.delayRiskPercent}%</span>
              <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block">
                {project.aiPredictions.estimatedDelayDays} days predicted
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Budget Overrun Alert</span>
              <span className="text-xl font-extrabold text-slate-850 mt-1 block">{project.aiPredictions.budgetOverrunRisk} Risk</span>
              <span className="text-[8px] text-slate-500 font-semibold block mt-2">
                Budget spent: ${project.actualCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'kanban' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setActiveTab('sprints')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'sprints' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Active Sprints
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'milestones' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Project Milestones
        </button>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Tasks Board</span>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: TODO */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 min-h-[300px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                Todo ({todoTasks.length})
              </span>
              {todoTasks.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm space-y-3">
                  <span className="font-bold text-xs text-slate-800 block">{t.name}</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                      {t.priority}
                    </span>
                    <button 
                      onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                      className="text-[9px] font-bold text-slate-850 hover:underline"
                    >
                      Start &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 min-h-[300px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                In Progress ({inProgressTasks.length})
              </span>
              {inProgressTasks.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm space-y-3">
                  <span className="font-bold text-xs text-slate-800 block">{t.name}</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                      {t.priority}
                    </span>
                    <button 
                      onClick={() => handleUpdateTaskStatus(t.id, 'DONE')}
                      className="text-[9px] font-bold text-slate-850 hover:underline"
                    >
                      Complete &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3: DONE */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 min-h-[300px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                Completed ({doneTasks.length})
              </span>
              {doneTasks.map(t => (
                <div key={t.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm space-y-3 opacity-80">
                  <span className="font-bold text-xs text-slate-850 line-through block">{t.name}</span>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
                      Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPRINTS */}
      {activeTab === 'sprints' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Sprint Name</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {project.sprints.map(s => (
                <tr key={s.id}>
                  <td className="p-4 font-bold text-slate-900">{s.name}</td>
                  <td className="p-4 text-slate-655 font-mono">
                    {s.startDate.substring(0, 10)} to {s.endDate.substring(0, 10)}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold text-[9px] uppercase tracking-wider">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Milestone</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {project.milestones.map(m => (
                <tr key={m.id}>
                  <td className="p-4 font-bold text-slate-900">{m.name}</td>
                  <td className="p-4 text-slate-655 font-mono">{m.dueDate.substring(0, 10)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add Project Task</h4>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify Texas warehouse bins allocation"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Insert Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
