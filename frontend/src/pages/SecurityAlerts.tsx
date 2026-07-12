import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SecurityAlert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  status: string;
  detectedAt: string;
}

const SecurityAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/alerts');
      setAlerts(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await axios.post(`/api/security/alerts/${id}/resolve`);
      alert('Alert marked as resolved.');
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === 'CRITICAL' || sev === 'HIGH') return 'text-red-400 border-red-900/40 bg-red-950/20';
    return 'text-yellow-450 border-yellow-900/30 bg-yellow-950/20';
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
              <ShieldAlert className="h-5.5 w-5.5 text-indigo-400" />
              <span>Real-time Security Warnings</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Verify intrusion warnings and configure threat alerts thresholds.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Connecting to threat detection engines...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Alerts stream list (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
                No active security threats detected.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="p-4.5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between text-xs gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{a.alertType}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${getSeverityStyle(a.severity)}`}>
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{a.message}</p>
                      <span className="text-[9px] text-slate-600 block">Detected: {new Date(a.detectedAt).toLocaleString()}</span>
                    </div>

                    {a.status === 'OPEN' ? (
                      <button
                        onClick={() => handleResolve(a.id)}
                        className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-slate-400"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold text-slate-500 bg-slate-900/60 border border-slate-905">
                        RESOLVED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Threat analysis card (Col span 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Threat Inspector</h3>
            
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900 px-2 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Insight</span>
              </div>

              <div className="space-y-2 pt-6">
                <h4 className="font-bold text-slate-250 block">Suspicious Login Detection</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Failed login attempts on admin dashboard match dictionary brute-force signatures. Automatic IP block is triggered to quarantine IP 198.51.100.42.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default SecurityAlerts;
export { SecurityAlerts };
