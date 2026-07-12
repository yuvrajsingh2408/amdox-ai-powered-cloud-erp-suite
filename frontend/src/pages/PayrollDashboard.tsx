import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Plus, ShieldAlert, CheckCircle2, 
  History, CalendarRange, Check, AlertTriangle, Eye 
} from 'lucide-react';
import axios from 'axios';

interface PayrollHistoryItem {
  id: string;
  month: number;
  year: number;
  status: string;
  processedAt: string;
  _count: {
    payslips: number;
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PayrollHistoryItem[]>([]);
  const [slipsMonth, setSlipsMonth] = useState(new Date().getMonth() + 1);
  const [slipsYear, setSlipsYear] = useState(new Date().getFullYear());
  const [slips, setSlips] = useState<any[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPayrollHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payroll/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      setHistory([
        { id: 'h1', month: 6, year: 2026, status: 'PAID', processedAt: '2026-06-30T17:00:00Z', _count: { payslips: 12 } },
        { id: 'h2', month: 7, year: 2026, status: 'DRAFT', processedAt: '2026-07-09T09:00:00Z', _count: { payslips: 12 } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodSlips = async () => {
    try {
      const res = await axios.get('/api/payroll/payslips', {
        params: { month: slipsMonth, year: slipsYear }
      });
      if (res.data.success) {
        setSlips(res.data.data);
      }
    } catch (err) {
      setSlips([]);
    }
  };

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  useEffect(() => {
    fetchPeriodSlips();
  }, [slipsMonth, slipsYear]);

  const handleApprovePayroll = async (runId: string) => {
    if (!window.confirm('Are you sure you want to approve and disburse salaries for this period?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/payroll/approve', { runId });
      if (res.data.success) {
        setSuccess('Payroll run approved and salaries disbursed successfully!');
        fetchPayrollHistory();
        fetchPeriodSlips();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Approval operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payroll Administration</h2>
          <p className="text-xs text-slate-500 font-medium">Verify employee payslip breakdown computations and process monthly disbursements</p>
        </div>
        <button
          onClick={() => navigate('/payroll/process')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Process New Run
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Previous Runs History */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-800" />
            Payroll Runs History
          </h3>

          <div className="space-y-3">
            {loading ? (
              <div className="h-20 bg-slate-50 rounded-lg animate-pulse w-full"></div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No payroll history found.</p>
            ) : (
              history.map(run => (
                <div key={run.id} className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between gap-3 bg-white hover:bg-slate-50/40 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-850">
                        {MONTH_NAMES[run.month - 1]} {run.year}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        run.status === 'PAID' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
                      Processed: {new Date(run.processedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      Slips count: {run._count.payslips}
                    </span>
                    {run.status === 'DRAFT' && (
                      <button
                        onClick={() => handleApprovePayroll(run.id)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        Disburse
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Payslips Directory details */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-slate-800" />
              Detailed Payslips Breakdown
            </h3>

            <div className="flex gap-2">
              <select
                value={slipsMonth}
                onChange={(e) => setSlipsMonth(parseInt(e.target.value))}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
              <select
                value={slipsYear}
                onChange={(e) => setSlipsYear(parseInt(e.target.value))}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Staff</th>
                  <th className="py-2.5 px-4">Basic</th>
                  <th className="py-2.5 px-4">Allowances</th>
                  <th className="py-2.5 px-4">Deductions</th>
                  <th className="py-2.5 px-4">Net Salary</th>
                  <th className="py-2.5 px-4">Slip Status</th>
                  <th className="py-2.5 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {slips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                      No payslips generated for the selected period.
                    </td>
                  </tr>
                ) : (
                  slips.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{item.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold block">{item.employeeCode}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">${item.basicSalary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">${item.allowances.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">${item.deductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">${item.netSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                          item.status === 'PAID' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/payroll/payslips/${item.id}`)}
                          title="View printable payslip"
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
