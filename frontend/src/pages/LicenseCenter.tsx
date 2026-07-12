import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Key, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LicenseCenter: React.FC = () => {
  const navigate = useNavigate();
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const res = await axios.get('/api/admin/license');
        setLicense(res.data?.data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLicense();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="h-5.5 w-5.5 text-indigo-400" />
            <span>License Center</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Check plan allocations, maximum seat limits, and billing renewals timelines.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Connecting to license vaults...</span>
        </div>
      ) : !license ? (
        <div className="text-center py-20 text-slate-550">License profile details missing.</div>
      ) : (
        <div className="max-w-xl bg-[#0F172A] border border-slate-900 rounded-3xl p-6 text-xs space-y-5">
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Active Plan</span>
            <h3 className="text-sm font-bold text-white">{license.planName}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">User Seat Limit</span>
              <p className="font-extrabold text-white text-sm">{license.seatLimit} Max Seats</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">API Calls Cap</span>
              <p className="font-extrabold text-white text-sm">{license.apiLimit} / month</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-450 border-t border-slate-900/60 pt-4">
            <Calendar className="h-4 w-4" />
            <span>Expires: {new Date(license.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseCenter;
export { LicenseCenter };
