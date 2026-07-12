import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, Sparkles, TrendingUp, Landmark, Users, Truck } from 'lucide-react';

const ExecutiveReports: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'Financial Cash Flow Summary', module: 'FINANCE', desc: 'Operating revenues vs expenses tracking with consolidated margin analysis.' },
    { title: 'Workforce Attendance & Headcount Roster', module: 'HR', desc: 'Roster directory overview including designations, attendance rates and salaries.' },
    { title: 'SCM Inventory Valuation & Stock levels', module: 'SCM', desc: 'Stock quantities tracking, safety buffers reorders and bins placement details.' },
    { title: 'CRM Pipelines Opportunities Funnel', module: 'CRM', desc: 'Active lead values, deal closing rates and customer status reviews.' },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5.5 w-5.5 text-primary" />
          <span>Executive Enterprise Reports</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Preconfigured dynamic report modules for corporate audits and operational assessments.
        </p>
      </div>

      {/* Security Info */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-200 block">Strict Confidentiality Watermark active</span>
          <p className="text-slate-500 mt-0.5">
            Reports run under your active session are isolation checked. Prints are digitally signed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, index) => (
          <div key={index} className="p-6 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-900">
                {c.module}
              </span>
              <h3 className="text-sm font-bold text-slate-200">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
            </div>

            <button
              onClick={() => navigate('/reports/builder', { state: { template: { title: c.title, module: c.module, filters: '{}', chartType: 'BAR', fileType: 'PDF' } } })}
              className="mt-4 w-full text-center py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <span>Compile Executive Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ExecutiveReports;
export { ExecutiveReports };
