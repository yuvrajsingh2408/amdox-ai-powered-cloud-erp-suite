import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, ShieldCheck, FileKey } from 'lucide-react';

const AuditReports: React.FC = () => {
  const navigate = useNavigate();

  const presets = [
    { title: 'User Actions Audit Trail Logs', filter: {}, desc: 'Historical trace log recording user logins, configurations edits, and downloads actions.' },
    { title: 'Security Privilege Modifications', filter: { module: 'RBAC' }, desc: 'Audits modifications made to roles and permissions scopes configurations.' },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-5.5 w-5.5 text-red-400" />
          <span>Security Audit Trail & Logs Reports</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Trace security logs, IP addresses entries, and actions detail records to satisfy compliance requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presets.map((p, idx) => (
          <div key={idx} className="p-6 bg-[#0F172A] border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="bg-red-950/40 p-2.5 w-fit rounded border border-red-900/30 text-red-400">
                <FileKey className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>

            <button
              onClick={() => navigate('/reports/builder', { state: { template: { title: p.title, module: 'AUDIT', filters: JSON.stringify(p.filter), chartType: 'NONE', fileType: 'PDF' } } })}
              className="w-full text-center py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <span>Build Audit Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AuditReports;
export { AuditReports };
