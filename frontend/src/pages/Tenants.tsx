import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, SwitchCamera, Check, ShieldAlert, CheckCircle2, Building } from 'lucide-react';
import axios from 'axios';

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  createdAt: string;
}

const Tenants: React.FC = () => {
  const { user, login } = useAuth();
  const [tenants, setTenants] = useState<TenantItem[]>([]);

  // Input fields
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tenants');
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (err) {
      setTenants([
        { id: '1', name: 'Amdox Main', subdomain: 'amdox', status: 'ACTIVE', createdAt: new Date().toISOString() },
        { id: '2', name: 'Stark Industries', subdomain: 'stark', status: 'ACTIVE', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/tenants', { name, subdomain });
      if (res.data.success) {
        setSuccess(`Tenant '${name}' created successfully`);
        setName('');
        setSubdomain('');
        fetchTenants();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant.');
    }
  };

  const handleSwitchTenant = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`/api/tenants/${id}/switch`);
      if (res.data.success) {
        // Force refresh session details
        const payload = res.data.data;
        login(payload.accessToken, {
          id: user?.id || '',
          email: user?.email || '',
          role: payload.role,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
        });
        setSuccess(`Successfully switched active tenant context to: ${payload.tenant.name}`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to switch tenant context.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tenant Workspaces</h2>
        <p className="text-xs text-slate-500 font-medium">Create client organizations and switch active tenant execution scopes</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create Tenant Form (ADMIN only) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-slate-800" />
              Add Tenant
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Organization Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stark Industries"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Subdomain Route</label>
                <input
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. stark"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                Create Workspace
              </button>
            </form>
          </div>
        )}

        {/* Right: Tenant Directory */}
        <div className={`bg-white border border-slate-200 shadow-sm rounded-lg p-5 ${user?.role === 'ADMIN' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-800" />
            Registered Workspaces
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-lg animate-pulse"></div>
              ))
            ) : tenants.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-400 font-medium">No tenants registered.</div>
            ) : (
              tenants.map(item => (
                <div 
                  key={item.id} 
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono">
                        {item.subdomain}.amdox.com
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 font-bold uppercase tracking-wider mt-2 inline-block">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Registered: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleSwitchTenant(item.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-lg text-slate-800 flex items-center gap-1 transition-colors border border-slate-300"
                    >
                      <SwitchCamera className="h-3.5 w-3.5" />
                      Switch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenants;
