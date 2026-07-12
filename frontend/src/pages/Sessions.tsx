import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Smartphone, ArrowLeft, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserSession {
  id: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  createdAt: string;
}

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/sessions');
      setSessions(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await axios.delete(`/api/security/sessions/${id}`);
      alert('Session revoked and device logged out.');
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to log out all other active devices?')) return;
    try {
      await axios.delete('/api/security/sessions-all');
      alert('All other devices successfully logged out.');
      fetchSessions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/security')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Smartphone className="h-5.5 w-5.5 text-indigo-400" />
              <span>Active Device Sessions</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Track sessions logged in from Mac/Windows devices and terminate session leases.</p>
          </div>
        </div>

        <button
          onClick={handleRevokeAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 border border-rose-900/30 text-xs font-bold text-rose-450 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Force Logout All Devices</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Traced session tokens...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No other active user sessions registered.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between text-xs gap-4 hover:border-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-indigo-400">
                  <Smartphone className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Device Fingerprint: {s.deviceFingerprint || 'Unknown Browser'}</span>
                  <p className="text-[10px] text-slate-550 block">IP: {s.ipAddress || 'Unknown IP'} • Logged: {new Date(s.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => handleRevoke(s.id)}
                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-850 rounded-lg transition-colors"
                title="Revoke session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Sessions;
export { Sessions };
