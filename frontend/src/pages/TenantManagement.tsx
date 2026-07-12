import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Users, Loader2, Play, CircleSlash } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  createdAt: string;
}

const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/tenants');
      setTenants(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await axios.put(`/api/admin/tenants/${id}/status`, { status: nextStatus });
      alert(`Tenant status changed to ${nextStatus}.`);
      fetchTenants();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-400" />
              <span>Multi-Tenant Administration</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Control tenant instances, domains configuration, and account suspensions.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering active tenants...</span>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No system tenants registered.
        </div>
      ) : (
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F172A] text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
              <tr>
                <th className="px-5 py-3">Tenant Name</th>
                <th className="px-5 py-3">Subdomain Domain</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855 text-slate-300">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-200">
                    <Link to={`/admin/tenants/${t.id}`} className="hover:text-indigo-400 transition-colors">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono">{t.subdomain}.amdoxerp.com</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      t.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-rose-400 bg-rose-950/20 border border-rose-900/30'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(t.id, t.status)}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold transition-colors ${
                        t.status === 'ACTIVE' 
                          ? 'bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-950/40' 
                          : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                    >
                      {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
export { TenantManagement };
