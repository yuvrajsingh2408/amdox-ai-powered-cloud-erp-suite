import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Check, X, ShieldAlert, CheckCircle2, 
  HelpCircle, UserCheck, CalendarDays 
} from 'lucide-react';
import axios from 'axios';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  employee: {
    firstName: string;
    lastName: string;
    designation: string;
  };
}

const LeaveApproval: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      setLeaves([
        { id: '1', employee: { firstName: 'Mark', lastName: 'Taylor', designation: 'Technical Architect' }, leaveType: 'ANNUAL', startDate: '2026-07-01', endDate: '2026-07-05', status: 'PENDING', reason: 'Family vacation' },
        { id: '2', employee: { firstName: 'Sarah', lastName: 'Connor', designation: 'SCM Specialist' }, leaveType: 'SICK', startDate: '2026-06-28', endDate: '2026-06-29', status: 'APPROVED', reason: 'Dental appointment' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.patch(`/api/hr/leaves/${id}/status`, { status: decision });
      if (res.data.success) {
        setSuccess(`Leave request status updated to ${decision.toLowerCase()} successfully`);
        fetchLeaves();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update leave request status');
    }
  };

  const filteredLeaves = leaves.filter(l => statusFilter === '' || l.status === statusFilter);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Time Off Review Board</h2>
        <p className="text-xs text-slate-500 font-medium">Review pending leave applications and approve or reject submissions</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Content panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-slate-800" />
            Applications Review Board
          </h3>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="">All Applications</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2.5 animate-pulse">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-lg w-full border border-slate-100"></div>
              ))}
            </div>
          ) : filteredLeaves.length === 0 ? (
            <p className="text-xs text-slate-450 text-center py-6">
              No leave requests require review matching the filter criteria.
            </p>
          ) : (
            filteredLeaves.map(leave => (
              <div 
                key={leave.id} 
                className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-800">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">— {leave.employee?.designation}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Leave category: <span className="font-bold text-slate-800">{leave.leaveType}</span> | Duration:{' '}
                    <span className="font-medium text-slate-655">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-xs text-slate-450 italic">" {leave.reason} "</p>
                </div>

                <div className="flex gap-2 self-end md:self-center">
                  {leave.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleReview(leave.id, 'APPROVED')}
                        className="px-3 py-1 bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(leave.id, 'REJECTED')}
                        className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                      leave.status === 'APPROVED' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApproval;
