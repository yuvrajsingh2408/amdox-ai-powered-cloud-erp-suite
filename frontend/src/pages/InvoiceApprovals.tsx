import React from 'react';
import ApprovalInbox from './ApprovalInbox';
import { FileText } from 'lucide-react';

const InvoiceApprovals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-slate-950 text-white pb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5.5 w-5.5 text-indigo-400" />
          <span>Accounts Payable (AP) Invoice Approvals Gateway</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review vendor billings records, invoices vouchers, and tax adjustments checks.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
};

export default InvoiceApprovals;
export { InvoiceApprovals };
