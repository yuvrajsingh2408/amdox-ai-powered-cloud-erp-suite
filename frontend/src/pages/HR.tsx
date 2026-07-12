import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Trash2, Edit2, Eye, FileText, Upload, Download, X, Briefcase, CheckCircle2, ShieldAlert
} from 'lucide-react';
import axios from 'axios';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  designation: string;
  status: string;
  dateOfJoining: string;
  salary: number;
  department: { id: string, name: string };
  manager?: { id: string, firstName: string, lastName: string } | null;
}

const HR: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string, firstName: string, lastName: string }[]>([]);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('employeeCode');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form inputs for Hire & Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [salary, setSalary] = useState('50000');
  const [managerId, setManagerId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get('/api/hr/employees', {
        params: {
          search,
          departmentId: deptFilter || undefined,
          status: statusFilter || undefined,
          sortBy,
          sortOrder,
          page,
          limit: 8
        }
      });
      if (res.data.success) {
        setEmployees(res.data.data.employees);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.totalItems);
      }
    } catch (err) {
      // Mocks
      setEmployees([
        { id: '1', employeeCode: 'EMP-001', firstName: 'Mark', lastName: 'Taylor', email: 'mark@amdox.com', phone: '555-0101', designation: 'Technical Architect', department: { id: 'd1', name: 'IT Engineering' }, status: 'ACTIVE', dateOfJoining: '2025-01-10', salary: 120000 },
        { id: '2', employeeCode: 'EMP-002', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@amdox.com', phone: '555-0102', designation: 'SCM Specialist', department: { id: 'd2', name: 'Supply Chain' }, status: 'ACTIVE', dateOfJoining: '2025-02-15', salary: 85000 },
        { id: '3', employeeCode: 'EMP-003', firstName: 'Elena', lastName: 'Rostova', email: 'elena@amdox.com', phone: '555-0103', designation: 'Finance Controller', department: { id: 'd3', name: 'Finance & Accounts' }, status: 'ACTIVE', dateOfJoining: '2024-11-01', salary: 98000 },
      ]);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchAuxiliary = async () => {
    try {
      const deptRes = await axios.get('/api/departments');
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      
      const empRes = await axios.get('/api/hr/employees');
      if (empRes.data.success) setManagers(empRes.data.data.employees);
    } catch (err) {
      setDepartments([{ id: 'd1', name: 'IT Engineering' }, { id: 'd2', name: 'Supply Chain' }, { id: 'd3', name: 'Finance & Accounts' }]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, deptFilter, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchAuxiliary();
  }, []);

  const handleOpenForm = (emp?: Employee) => {
    setError('');
    setSuccess('');
    if (emp) {
      setEditingEmployeeId(emp.id);
      setFirstName(emp.firstName);
      setLastName(emp.lastName);
      setEmail(emp.email);
      setPhone(emp.phone || '');
      setEmployeeCode(emp.employeeCode);
      setDepartmentId(emp.department.id);
      setDesignation(emp.designation);
      setDateOfJoining(emp.dateOfJoining.split('T')[0]);
      setSalary(String(emp.salary));
      setManagerId(emp.manager?.id || '');
      setStatus(emp.status);
    } else {
      setEditingEmployeeId(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setEmployeeCode(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
      setDepartmentId('');
      setDesignation('');
      setDateOfJoining(new Date().toISOString().split('T')[0]);
      setSalary('60000');
      setManagerId('');
      setStatus('ACTIVE');
    }
    setIsFormModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      employeeCode,
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      departmentId,
      designation,
      dateOfJoining,
      salary: parseFloat(salary),
      managerId: managerId || null,
      status
    };

    try {
      if (editingEmployeeId) {
        await axios.patch(`/api/hr/employees/${editingEmployeeId}`, payload);
        setSuccess('Employee updated successfully');
      } else {
        await axios.post('/api/hr/employees', payload);
        setSuccess('Employee hired successfully');
      }
      setIsFormModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee profile?')) return;
    try {
      await axios.delete(`/api/hr/employees/${id}`);
      setSuccess('Employee record deleted successfully');
      fetchEmployees();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const openDetails = async (id: string) => {
    setIsDetailModalOpen(true);
    setSelectedEmployee(null);
    try {
      const res = await axios.get(`/api/hr/employees/${id}`);
      if (res.data.success) {
        setSelectedEmployee(res.data.data);
      }
    } catch (err) {
      setError('Failed to load profile details.');
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/hr/employees/import', { csv: csvText });
      if (res.data.success) {
        setSuccess(res.data.message);
        setIsImportModalOpen(false);
        setCsvText('');
        fetchEmployees();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Manage organization headcount, salaries, profiles, and reporting managers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <a
            href="/api/hr/employees/export"
            download
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          <button
            onClick={() => handleOpenForm()}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Hire Employee
          </button>
        </div>
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

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, designation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold border-r border-slate-200 pr-2.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('employeeCode')}>
                  <div className="flex items-center gap-1">Code <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('firstName')}>
                  <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-10"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-3.5 bg-slate-100 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No employees found matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{emp.employeeCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-850">{emp.firstName} {emp.lastName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.department.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{emp.designation}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">${emp.salary.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openDetails(emp.id)}
                          title="View Employee Profile"
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(emp)}
                          title="Edit Details"
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          title="Terminate / Delete Employee"
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing {employees.length} of {totalItems} employees</span>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 py-1 border border-slate-200 bg-white rounded text-slate-800">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hire/Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {editingEmployeeId ? 'Edit Employee Details' : 'Hire New Employee'}
              </h4>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingEmployeeId}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Accountant"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Reporting Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">No Reporting Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Monthly Base Salary</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {editingEmployeeId && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Employment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Save Employee Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Timeline Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-lg overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Employee Profile & Salary Mappings</h4>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {selectedEmployee ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">{selectedEmployee.firstName} {selectedEmployee.lastName}</h5>
                      <p className="text-slate-400 font-medium">{selectedEmployee.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Employee Code</span>
                      <span className="font-semibold text-slate-700">{selectedEmployee.employeeCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Designation</span>
                      <span className="font-semibold text-slate-700">{selectedEmployee.designation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department</span>
                      <span className="font-semibold text-slate-700">{selectedEmployee.department?.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reporting Manager</span>
                      <span className="font-semibold text-slate-700">
                        {selectedEmployee.manager ? `${selectedEmployee.manager.firstName} ${selectedEmployee.manager.lastName}` : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date of Joining</span>
                      <span className="font-semibold text-slate-700">{new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annual Base Salary</span>
                      <span className="font-semibold text-slate-700">${selectedEmployee.salary.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Salary Structure details */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-3 flex items-center gap-1.5 text-slate-400">
                      <FileText className="h-4 w-4 text-slate-800" />
                      Payroll Salary Structure
                    </h5>

                    {selectedEmployee.salaryStructure ? (
                      <div className="grid grid-cols-3 gap-y-3.5 gap-x-4 bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Basic (50%)</span>
                          <span className="font-bold text-slate-700">${selectedEmployee.salaryStructure.basicSalary.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Allowances</span>
                          <span className="font-bold text-slate-700">${selectedEmployee.salaryStructure.allowances.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Bonus</span>
                          <span className="font-bold text-slate-700">${selectedEmployee.salaryStructure.bonus.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">PF Deduction</span>
                          <span className="font-bold text-slate-700">${selectedEmployee.salaryStructure.pf.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Tax Deduction</span>
                          <span className="font-bold text-slate-700">${selectedEmployee.salaryStructure.tax.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Net Monthly</span>
                          <span className="font-bold text-slate-800 border-t border-slate-350 block mt-0.5">
                            ${selectedEmployee.salaryStructure.netSalary.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 font-medium">No custom salary structure mapped for this employee.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">Loading employee metadata details...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">CSV Import Portal</h4>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleImportCSV} className="p-5 space-y-4">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Paste comma-separated rows. Required headers: <span className="font-mono bg-slate-50 px-1 border rounded text-slate-700">employeecode,firstname,lastname,email,departmentname,designation,salary</span>
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="employeecode,firstname,lastname,email,departmentname,designation,salary&#10;EMP-9892,John,Doe,john@amdox.com,IT Engineering,Developer,75000"
                rows={8}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-450 font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Parse and Import Rows
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HR;
