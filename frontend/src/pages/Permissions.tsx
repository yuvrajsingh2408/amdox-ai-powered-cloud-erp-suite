import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, ShieldAlert as AlertIcon, Trash2, KeyRound, Plus } from 'lucide-react';
import axios from 'axios';

interface PermissionItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/rbac/permissions');
      if (res.data.success) {
        setPermissions(res.data.data);
      }
    } catch (err) {
      setPermissions([
        { id: '1', name: 'READ_USERS', description: 'Access users listing page', createdAt: new Date().toISOString() },
        { id: '2', name: 'WRITE_USERS', description: 'Create and update users', createdAt: new Date().toISOString() },
        { id: '3', name: 'PROCESS_PAYROLL', description: 'Initiate finance salary payslips', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreateLoading(true);

    try {
      const res = await axios.post('/api/rbac/permissions', { name, description });
      if (res.data.success) {
        setSuccess(`Permission '${name}' created successfully!`);
        setName('');
        setDescription('');
        fetchPermissions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create permission.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/rbac/permissions/${id}`);
      setSuccess('Permission removed successfully');
      fetchPermissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete permission.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Permissions Catalog</h2>
        <p className="text-xs text-slate-500 font-medium">Create and configure granular authorization permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create Permission Form */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-slate-800" />
            Add New Permission
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

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Permission Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="e.g. READ_ACCOUNTS"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the authorization scope..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
            >
              {createLoading && (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
              )}
              Register Permission
            </button>
          </form>
        </div>

        {/* Right: Permissions List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-800" />
            Registered Scopes
          </h3>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Scope Key</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-1/3"></div></td>
                      <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-2/3"></div></td>
                      <td className="py-3 px-4 text-right"><div className="h-3.5 bg-slate-100 rounded w-10 ml-auto"></div></td>
                    </tr>
                  ))
                ) : permissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                      No system authorization permissions registered.
                    </td>
                  </tr>
                ) : (
                  permissions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{item.description || 'System scope'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Remove permission"
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
