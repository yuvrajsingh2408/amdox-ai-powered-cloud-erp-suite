import React from 'react';
import ApprovalInbox from './ApprovalInbox';
import { Landmark } from 'lucide-react';

const FinanceApprovals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-slate-950 text-white pb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Landmark className="h-5.5 w-5.5 text-emerald-400" />
          <span>Finance & Expenses Approvals Gateway</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review operational claims, balance sheet journals, and capital expenditures logs.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
};

export default FinanceApprovals;
export { FinanceApprovals };
