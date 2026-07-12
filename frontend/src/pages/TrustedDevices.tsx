import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ArrowLeft, Loader2, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Device {
  id: string;
  deviceFingerprint: string;
  deviceName: string;
  isTrusted: boolean;
  lastUsedAt: string;
}

const TrustedDevices: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/devices');
      setDevices(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleTrust = async (id: string) => {
    try {
      await axios.post(`/api/security/devices/${id}/trust`);
      alert('Device verified and trusted.');
      fetchDevices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/security')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="h-5.5 w-5.5 text-indigo-400" />
            <span>Trusted Browser signatures</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Whitelist specific client hardware fingerprints to bypass secondary MFA requirements checks.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering hardware signatures...</span>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No browser devices tracked.
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {devices.map((d) => (
            <div key={d.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">{d.deviceName}</h4>
                <p className="text-[10px] text-slate-550 block font-mono">Fingerprint Hash: {d.deviceFingerprint}</p>
                <p className="text-[9px] text-slate-600 block">Last Active: {new Date(d.lastUsedAt).toLocaleString()}</p>
              </div>

              <div>
                {d.isTrusted ? (
                  <span className="px-2.5 py-1 bg-indigo-950/20 border border-indigo-900/30 text-[9px] font-bold text-indigo-400 rounded-lg">
                    TRUSTED SYSTEM
                  </span>
                ) : (
                  <button
                    onClick={() => handleTrust(d.id)}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold text-slate-350 rounded-lg transition-colors"
                  >
                    Mark as Trusted
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TrustedDevices;
export { TrustedDevices };
