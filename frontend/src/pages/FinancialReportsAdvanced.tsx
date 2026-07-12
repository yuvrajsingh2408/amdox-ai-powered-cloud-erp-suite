import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ShieldCheck, Landmark, DollarSign, Wallet } from 'lucide-react';

const FinancialReportsAdvanced: React.FC = () => {
  const navigate = useNavigate();

  const presets = [
    { title: 'Double Entry Ledger Trial Balance', filter: { status: 'PAID' }, desc: 'List of cash flow debits vs credit invoice transactions.' },
    { title: 'Accounts Receivable (AR) Aging Summary', filter: { status: 'OVERDUE' }, desc: 'Audits customers payments terms delays and overdue amounts.' },
    { title: 'Operating Cost Outlays', filter: { status: 'AP' }, desc: 'Accounts Payable supplier billing summaries.' },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Landmark className="h-5.5 w-5.5 text-emerald-400" />
          <span>Advanced Financial Statements & Reports</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Generate double-entry ledgers trial sheets, accounts payable, accounts receivable, and treasury cash holdings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {presets.map((p, idx) => (
          <div key={idx} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="bg-emerald-950/40 p-2 w-fit rounded border border-emerald-900/30 text-emerald-400">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-200">{p.title}</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed">{p.desc}</p>
            </div>

            <button
              onClick={() => navigate('/reports/builder', { state: { template: { title: p.title, module: 'FINANCE', filters: JSON.stringify(p.filter), chartType: 'BAR', fileType: 'EXCEL' } } })}
              className="w-full text-center py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg text-[10px] font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <span>Build Spreadsheet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FinancialReportsAdvanced;
export { FinancialReportsAdvanced };
