import React from 'react';
import ApprovalInbox from './ApprovalInbox';
import { Truck } from 'lucide-react';

const PurchaseApprovals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-slate-950 text-white pb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Truck className="h-5.5 w-5.5 text-blue-400" />
          <span>SCM Purchase Orders Approvals Gateway</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review vendor contracts, requisitions, inventory replenishment rules, and goods receipts.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
};

export default PurchaseApprovals;
export { PurchaseApprovals };
