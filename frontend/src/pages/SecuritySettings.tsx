import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings, ArrowLeft, Loader2, Save, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IPWhitelist {
  id: string;
  ipAddress: string;
  description?: string;
  createdAt: string;
}

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason?: string;
  createdAt: string;
}

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();
  const [whitelist, setWhitelist] = useState<IPWhitelist[]>([]);
  const [blocked, setBlocked] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [whitelistIP, setWhitelistIP] = useState('');
  const [desc, setDesc] = useState('');
  const [blockingIP, setBlockingIP] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIPs = async () => {
    setLoading(true);
    try {
      const wRes = await axios.get('/api/security/ip-whitelist');
      setWhitelist(wRes.data?.data || []);

      const bRes = await axios.get('/api/security/blocked-ips');
      setBlocked(bRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPs();
  }, []);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistIP.trim()) return;
    setActionLoading(true);
    try {
      await axios.post('/api/security/ip-whitelist', { ipAddress: whitelistIP, description: desc });
      alert('IP whitelisted successfully.');
      setWhitelistIP('');
      setDesc('');
      fetchIPs();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingIP.trim()) return;
    setActionLoading(true);
    try {
      await axios.post('/api/security/blocked-ips', { ipAddress: blockingIP, reason });
      alert('IP blocked successfully.');
      setBlockingIP('');
      setReason('');
      fetchIPs();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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
            <Settings className="h-5.5 w-5.5 text-indigo-400" />
            <span>IP whitelists & Firewall Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Restrict backend endpoints access to defined IP ranges and block anomalies traffic.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering firewall status...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          
          {/* Whitelisting */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">IP Whitelist settings</h3>
            
            <form onSubmit={handleAddWhitelist} className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">IP Address</label>
                  <input
                    type="text"
                    value={whitelistIP}
                    onChange={(e) => setWhitelistIP(e.target.value)}
                    placeholder="e.g. 192.168.1.1"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">Description</label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Office HQ"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Add IP to Whitelist</span>
              </button>
            </form>

            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-3">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Currently Whitelisted IPs</span>
              <div className="space-y-2">
                {whitelist.map((ip) => (
                  <div key={ip.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between">
                    <span className="font-mono text-indigo-400">{ip.ipAddress}</span>
                    <span className="text-slate-500">{ip.description || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blocking */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Blocked IPs blacklist</h3>
            
            <form onSubmit={handleBlockIP} className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">Blacklist IP Address</label>
                  <input
                    type="text"
                    value={blockingIP}
                    onChange={(e) => setBlockingIP(e.target.value)}
                    placeholder="e.g. 198.51.100.42"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">Block Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Malicious scans"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2 bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/40 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Quarantine IP address</span>
              </button>
            </form>

            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-3">
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Currently Blocked IPs</span>
              <div className="space-y-2">
                {blocked.map((ip) => (
                  <div key={ip.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between">
                    <span className="font-mono text-rose-450">{ip.ipAddress}</span>
                    <span className="text-slate-500">{ip.reason || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SecuritySettings;
export { SecuritySettings };
