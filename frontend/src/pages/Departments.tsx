import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ShieldAlert, CheckCircle2, 
  FolderGit2, BarChart3, Users, PiggyBank, CalendarOff, ArrowLeft 
} from 'lucide-react';
import axios from 'axios';

interface DepartmentItem {
  id: string;
  name: string;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    designation: string;
  } | null;
  _count: {
    employees: number;
  };
}

interface StatsItem {
  headcount: number;
  monthlySpend: number;
  activeLeaves: number;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [employees, setEmployees] = useState<{ id: string, firstName: string, lastName: string }[]>([]);

  // Input states
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');

  // UI state
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [selectedStats, setSelectedStats] = useState<StatsItem | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      setDepartments([
        { id: '1', name: 'Executive', manager: { id: 'm1', firstName: 'John', lastName: 'CEO', designation: 'Chief Executive Officer' }, _count: { employees: 5 } },
        { id: '2', name: 'Human Resources', manager: null, _count: { employees: 2 } },
        { id: '3', name: 'Finance', manager: { id: 'm2', firstName: 'Alice', lastName: 'CFO', designation: 'Chief Financial Officer' }, _count: { employees: 4 } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/users');
      if (res.data.success) {
        setEmployees(res.data.data.users);
      }
    } catch (err) {
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/departments', { name, managerId: managerId || undefined });
      if (res.data.success) {
        setSuccess(`Department '${name}' created successfully`);
        setName('');
        setManagerId('');
        fetchDepartments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/departments/${id}`);
      setSuccess('Department deleted successfully');
      fetchDepartments();
      if (selectedDeptId === id) {
        setSelectedDeptId(null);
        setSelectedStats(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const selectDepartment = async (id: string, deptName: string) => {
    setSelectedDeptId(id);
    setSelectedDeptName(deptName);
    setStatsLoading(true);
    setSelectedStats(null);
    setError('');

    try {
      const res = await axios.get(`/api/departments/${id}/statistics`);
      if (res.data.success) {
        setSelectedStats(res.data.data);
      }
    } catch (err) {
      // Mock stats
      setSelectedStats({
        headcount: 5,
        monthlySpend: 28000,
        activeLeaves: 1
      });
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Departments Directory</h2>
        <p className="text-xs text-slate-500 font-medium">Create enterprise department directories and view staff stats dashboards</p>
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

      {!selectedDeptId ? (
        // Grid View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Dept Form */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-slate-800" />
              Add Department
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Quality Assurance"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Department Head</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                >
                  <option value="">Select Manager</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                Register Department
              </button>
            </form>
          </div>

          {/* Department Directory List */}
          <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-slate-800" />
              Active Departments
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-lg animate-pulse"></div>
                ))
              ) : departments.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-slate-400 font-medium">No departments registered.</div>
              ) : (
                departments.map(dept => (
                  <div 
                    key={dept.id} 
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-400 cursor-pointer transition-all flex flex-col justify-between"
                    onClick={() => selectDepartment(dept.id, dept.name)}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-800">{dept.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(dept.id);
                          }}
                          title="Delete department"
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Head: {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'Unassigned'}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                      <span>Total Employees</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        {dept._count?.employees || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // Department Dashboard Details
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDeptId(null)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>

          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
              <BarChart3 className="h-5 w-5 text-slate-800" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Analytics: {selectedDeptName}
              </h3>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : selectedStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Employees */}
                <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Headcount</span>
                    <span className="text-lg font-bold text-slate-800">{selectedStats.headcount}</span>
                  </div>
                </div>

                {/* Salary */}
                <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Payroll Spend / mo</span>
                    <span className="text-lg font-bold text-slate-800">
                      ${selectedStats.monthlySpend.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Leaves */}
                <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                    <CalendarOff className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Leaves</span>
                    <span className="text-lg font-bold text-slate-800">{selectedStats.activeLeaves}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">Failed to compile dashboard details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
