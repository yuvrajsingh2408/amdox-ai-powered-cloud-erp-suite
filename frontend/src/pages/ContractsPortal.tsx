import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const ContractsPortal: React.FC = () => {
  const navigate = useNavigate();
  const portalType = localStorage.getItem('portal_type');

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
          className="p-1 hover:bg-slate-900 rounded text-slate-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-indigo-400" />
            <span>Partnership & Procurement Contracts</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Review active service level agreements, legal contracts, and pricing terms checks.</p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl space-y-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Legal Agreement #SLA-8801</span>
          <h4 className="text-xs font-bold text-slate-200">Mutual Net-30 Service Level Contract</h4>
          <p className="text-slate-400 text-[11px]">
            Pricing terms parameters: All items must comply with original quotations budgets. Delivery SLAs capped at 72 hours max overhead delay.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ContractsPortal;
export { ContractsPortal };
