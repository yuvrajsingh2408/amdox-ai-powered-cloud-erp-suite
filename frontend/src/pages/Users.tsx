import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldAlert, CheckCircle2, UserCheck, Shield, Search, 
  Trash2, Edit, Eye, Filter, ArrowUpDown, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import axios from 'axios';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  department: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [managers, setManagers] = useState<{ id: string, firstName: string, lastName: string }[]>([]);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('50000');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get('/api/users', {
        params: {
          search,
          status: statusFilter || undefined,
          role: roleFilter || undefined,
          sortBy,
          sortOrder,
          page,
          limit: 8
        }
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.totalItems);
      }
    } catch (err) {
      // Fallback mocks
      setUsers([
        { id: '1', email: 'admin@amdox.com', firstName: 'Amdox', lastName: 'Admin', role: 'ADMIN', status: 'ACTIVE', createdAt: new Date().toISOString(), department: 'Executive' },
        { id: '2', email: 'jane.hr@amdox.com', firstName: 'Jane', lastName: 'Doe', role: 'HR_MANAGER', status: 'ACTIVE', createdAt: new Date().toISOString(), department: 'Human Resources' },
        { id: '3', email: 'bob.finance@amdox.com', firstName: 'Bob', lastName: 'Smith', role: 'FINANCE_MANAGER', status: 'ACTIVE', createdAt: new Date().toISOString(), department: 'Finance' },
      ]);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchAuxiliary = async () => {
    try {
      const res = await axios.get('/api/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      setDepartments([{ id: '1', name: 'Executive' }, { id: '2', name: 'Human Resources' }, { id: '3', name: 'Finance' }]);
    }

    try {
      const res = await axios.get('/api/users');
      if (res.data.success) {
        setManagers(res.data.data.users);
      }
    } catch (err) {
      setManagers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, roleFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchAuxiliary();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/users', { 
        email, 
        password, 
        firstName, 
        lastName, 
        role,
        departmentId: departmentId || undefined,
        designation: designation || undefined,
        salary: salary || undefined
      });
      if (res.data.success) {
        setSuccess('New user account added successfully!');
        fetchUsers();
        // Clear fields
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setRole('EMPLOYEE');
        setDepartmentId('');
        setDesignation('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    setError('');
    setSuccess('');
    if (!email || !firstName || !lastName || !role) {
      setError('Please fill in email, first name, last name, and role to send an invite.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/users/invite', { email, firstName, lastName, role });
      if (res.data.success) {
        setSuccess(`User invited successfully! Temp password is: ${res.data.data.tempPassword}`);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await axios.patch(`/api/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setSuccess('User profile deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const openEditModal = async (userId: string) => {
    setSelectedUserId(userId);
    setIsEditModalOpen(true);
    setError('');
    try {
      const res = await axios.get(`/api/users/${userId}`);
      if (res.data.success) {
        const u = res.data.data;
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setRole(u.role);
        setDepartmentId(u.employeeDetails?.department?.id || '');
        setDesignation(u.employeeDetails?.designation || '');
        setSalary(u.employeeDetails?.salary || '50000');
      }
    } catch (err) {
      setError('Failed to fetch user edit details.');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.patch(`/api/users/${selectedUserId}`, {
        firstName,
        lastName,
        role,
        departmentId: departmentId || undefined,
        designation: designation || undefined,
        salary: salary || undefined
      });
      setSuccess('User updated successfully');
      setIsEditModalOpen(false);
      fetchUsers();
      // Clear states
      setFirstName('');
      setLastName('');
      setRole('EMPLOYEE');
      setDepartmentId('');
      setDesignation('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = async (userId: string) => {
    setIsDetailsModalOpen(true);
    setSelectedUserDetails(null);
    try {
      const res = await axios.get(`/api/users/${userId}`);
      if (res.data.success) {
        setSelectedUserDetails(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch profile details.');
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-xs text-slate-500 font-medium">Create system users, configure security levels, and manage roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create User Form */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-slate-800" />
            Add / Invite User
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (leave empty for invites)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="SCM_MANAGER">SCM Manager</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                Create Direct
              </button>
              <button
                type="button"
                onClick={handleInviteUser}
                disabled={loading}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Users List Table & Filters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold border-r border-slate-200 pr-2">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="FINANCE_MANAGER">Finance Manager</option>
                <option value="SCM_MANAGER">SCM Manager</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="VIEWER">Viewer</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="INVITED">Invited</option>
                <option value="LOCKED">Locked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('firstName')}>
                      <div className="flex items-center gap-1">
                        Name <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {tableLoading ? (
                    // Skeleton loader
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-2/3"></div></td>
                        <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-3/4"></div></td>
                        <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-1/2"></div></td>
                        <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-1/3"></div></td>
                        <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-1/4"></div></td>
                        <td className="py-4 px-4 text-right"><div className="h-3 bg-slate-100 rounded w-1/3 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No user profiles match the active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{item.firstName} {item.lastName}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{item.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wider bg-slate-100 border border-slate-200 text-slate-600 uppercase">
                            <Shield className="h-2.5 w-2.5" />
                            {item.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{item.department}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                            item.status === 'ACTIVE' 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : item.status === 'LOCKED'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openDetailsModal(item.id)}
                              title="View details"
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(item.id)}
                              title="Edit user"
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              title={item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(item.id)}
                              title="Delete user"
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
              <span>Showing {users.length} of {totalItems} users</span>
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
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Edit User Account</h4>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="SCM_MANAGER">SCM Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  >
                    <option value="">No Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Engineer"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Base Salary</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Save Settings Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">User Account Profile</h4>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedUserDetails ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                      {selectedUserDetails.firstName[0]}{selectedUserDetails.lastName[0]}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">{selectedUserDetails.firstName} {selectedUserDetails.lastName}</h5>
                      <p className="text-slate-400 font-medium">{selectedUserDetails.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Access Role</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.status}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Department</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.employeeDetails?.department?.name || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Designation</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.employeeDetails?.designation || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Employee Code</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.employeeDetails?.employeeCode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Two-Factor Status</span>
                      <span className="font-semibold text-slate-700">{selectedUserDetails.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">Loading profile metadata...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
