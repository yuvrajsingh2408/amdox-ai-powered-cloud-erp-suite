import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComplianceRule {
  id: string;
  standard: string;
  controlId: string;
  description: string;
  status: string;
  checkedAt: string;
}

const ComplianceCenter: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/compliance');
      setRules(res.data?.data?.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const triggerScan = async () => {
    setScanning(true);
    try {
      const res = await axios.post('/api/security/compliance/scan');
      alert(res.data?.data?.summary || 'Scan audit complete.');
      fetchCompliance();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
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
              <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
              <span>Compliance Standards Audit Center</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Audit system configurations against SOC2 Type II, ISO 27001, and GDPR criteria rules.</p>
          </div>
        </div>

        <button
          onClick={triggerScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>Trigger Compliance Scan</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering audit logs controls checklist...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Rules lists (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            {rules.length === 0 ? (
              <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
                No compliance rules configured.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4.5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between text-xs gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">{rule.standard} ({rule.controlId})</span>
                        <p className="text-[10px] text-slate-550 block font-medium">Checked: {new Date(rule.checkedAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-slate-350">{rule.description}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      rule.status === 'COMPLIANT' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-yellow-400 bg-yellow-950/20 border border-yellow-900/30'
                    }`}>
                      {rule.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Compliance card (Col span 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI compliance Summary</h3>
            
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900 px-2 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Inspector</span>
              </div>

              <div className="space-y-2 pt-6">
                <h4 className="font-bold text-slate-250 block flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>SOC2 Control Gap Detected</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  MFA settings must be configured to block access from outside whitelisted networks. Enable user-wide TOTP requirements to satisfy SOC2 CC6.3 logical access parameters.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ComplianceCenter;
export { ComplianceCenter };
