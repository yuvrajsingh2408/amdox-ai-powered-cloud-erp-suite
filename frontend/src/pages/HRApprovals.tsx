import React from 'react';
import ApprovalInbox from './ApprovalInbox';
import { Users } from 'lucide-react';

const HRApprovals: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-slate-950 text-white pb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5.5 w-5.5 text-purple-400" />
          <span>HR & Talent Approvals Gateway</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review employee leave schedules, payroll structure adjustments, and candidate onboarding steps.</p>
      </div>
      <ApprovalInbox />
    </div>
  );
};

export default HRApprovals;
export { HRApprovals };
