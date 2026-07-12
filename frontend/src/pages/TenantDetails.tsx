import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Users, Loader2, HardDrive, Cpu, CircleSlash } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const TenantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/tenants/${id}`);
      setDetails(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin/tenants')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-indigo-400" />
            <span>Tenant Specific Details</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Tenant Reference ID: {id}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering database quotas...</span>
        </div>
      ) : !details ? (
        <div className="text-center py-20 text-slate-500">Tenant details missing.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* General info cards */}
          <div className="bg-[#0F172A] border border-slate-900 rounded-3xl p-5 space-y-4">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Client Metadata</span>
            <div className="space-y-2">
              <p className="text-slate-350">Company Name: <strong className="text-white">{details.tenant?.name}</strong></p>
              <p className="text-slate-350">Subdomain: <strong className="text-white">{details.tenant?.subdomain}.amdoxerp.com</strong></p>
              <p className="text-slate-350">Status: <span className="text-emerald-400 font-bold uppercase">{details.tenant?.status}</span></p>
            </div>
          </div>

          {/* Usage quotas */}
          <div className="bg-[#0F172A] border border-slate-900 rounded-3xl p-5 space-y-4">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Allocated Quotas Limits</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium">Storage Quota</span>
                  <p className="text-[10px] text-indigo-400 font-bold">{(Number(details.usage?.storageBytes || 0) / 1000000).toFixed(1)} MB used</p>
                </div>
                <HardDrive className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium">API Calls</span>
                  <p className="text-[10px] text-indigo-400 font-bold">{details.usage?.apiCalls} calls this billing period</p>
                </div>
                <Cpu className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetails;
export { TenantDetails };
