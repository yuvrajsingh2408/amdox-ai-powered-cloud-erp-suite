import React from 'react';
import ApprovalInbox from './ApprovalInbox';
import { UserCheck } from 'lucide-react';

const ManagerApprovals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-slate-950 text-white pb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <UserCheck className="h-5.5 w-5.5 text-indigo-400" />
          <span>Supervisor Manager Approvals Gateway</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review validation requests escalated directly to your supervisor role.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
};

export default ManagerApprovals;
export { ManagerApprovals };
