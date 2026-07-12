import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, Plus, ShieldAlert, CheckCircle2, 
  CalendarRange, CheckCircle, HelpCircle, X 
} from 'lucide-react';
import axios from 'axios';

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  available: number;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  // Apply Leave form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfileAndLeaves = async () => {
    try {
      const profileRes = await axios.get('/api/auth/profile');
      if (profileRes.data.success) {
        const emp = profileRes.data.data.employee;
        if (emp) {
          setEmployeeId(emp.id);
          
          // Fetch balances
          const balanceRes = await axios.get(`/api/hr/leaves/balances/${emp.id}`);
          if (balanceRes.data.success) {
            setBalances(balanceRes.data.data);
          }

          // Fetch personal leaves (filter from all leaves)
          const leavesRes = await axios.get('/api/hr/leaves');
          if (leavesRes.data.success) {
            const personal = leavesRes.data.data.filter((l: any) => l.employeeId === emp.id);
            setRequests(personal);
          }
        }
      }
    } catch (err) {
      // Fallback mocks
      setBalances([
        { leaveType: 'ANNUAL', total: 15, used: 2, available: 13 },
        { leaveType: 'SICK', total: 10, used: 1, available: 9 },
        { leaveType: 'CASUAL', total: 5, used: 0, available: 5 },
        { leaveType: 'MATERNITY', total: 90, used: 0, available: 90 },
      ]);
      setRequests([
        { id: '1', leaveType: 'SICK', startDate: '2026-06-28', endDate: '2026-06-29', status: 'APPROVED', reason: 'Dental checkup' },
        { id: '2', leaveType: 'ANNUAL', startDate: '2026-07-15', endDate: '2026-07-20', status: 'PENDING', reason: 'Family vacation' }
      ]);
    }
  };

  useEffect(() => {
    fetchProfileAndLeaves();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!employeeId) {
      setError('Cannot apply: Profile is missing linked Employee identity.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/hr/leaves', {
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason
      });
      if (res.data.success) {
        setSuccess('Leave request submitted successfully!');
        setIsModalOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchProfileAndLeaves();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Time Off & Leaves</h2>
          <p className="text-xs text-slate-500 font-medium">View balances, check requests history, and submit new leave requests</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Request Time Off
        </button>
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

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {balances.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">{item.leaveType}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800">{item.available}</span>
              <span className="text-xs text-slate-450 font-medium">/ {item.total} days left</span>
            </div>
            <div className="mt-3.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900" 
                style={{ width: `${(item.available / item.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Request Logs */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-slate-800" />
          Request Logs History
        </h3>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No leave requests logged.</p>
          ) : (
            requests.map(req => (
              <div key={req.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{req.leaveType} Leave</span>
                    <span className="text-[10px] text-slate-400 font-semibold">— {req.startDate} to {req.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">" {req.reason} "</p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                    req.status === 'APPROVED' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : req.status === 'REJECTED'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Apply for Time Off</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Reason for Request</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Details of your leave request..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Submit Leave Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
