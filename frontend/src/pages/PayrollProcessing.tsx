import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ShieldAlert, CheckCircle2, 
  Settings2, ArrowLeft, AlertTriangle, Eye, CheckCircle 
} from 'lucide-react';
import axios from 'axios';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollProcessing: React.FC = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [processedRun, setProcessedRun] = useState<any>(null);
  const [previews, setPreviews] = useState<any[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProcessRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessedRun(null);
    setPreviews([]);
    setLoading(true);

    try {
      const res = await axios.post('/api/payroll/process', { month, year });
      if (res.data.success) {
        setProcessedRun(res.data.data);
        setSuccess('Payroll runs computed successfully in draft mode! Please review the preview before disbursing.');
        
        // Fetch the generated draft payslips
        const slipsRes = await axios.get('/api/payroll/payslips', {
          params: { month, year }
        });
        if (slipsRes.data.success) {
          setPreviews(slipsRes.data.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Processing calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!processedRun) return;
    setFinalizeLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/payroll/approve', { runId: processedRun.id });
      if (res.data.success) {
        setSuccess('Payroll approved, general ledger journal transactions posted, and funds disbursed.');
        setTimeout(() => {
          navigate('/payroll');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Finalization checkout failed.');
    } finally {
      setFinalizeLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Run Monthly Payroll Wizard</h2>
        <p className="text-xs text-slate-500 font-medium">Verify structural basic percentages and compute itemized deductions</p>
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
        {/* Setup Parameters Panel */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-slate-800" />
            Payroll Run parameters
          </h3>

          <form onSubmit={handleProcessRun} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
            >
              {loading && (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
              )}
              Run Processing calculations
            </button>
          </form>
        </div>

        {/* Preview Panel details */}
        <div className="lg:col-span-2 space-y-4">
          {processedRun && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Run Preview checkout</h4>
                  <p className="text-xs font-bold text-slate-850">
                    Draft Payroll run for {MONTH_NAMES[month - 1]} {year}
                  </p>
                </div>
                <button
                  onClick={handleFinalize}
                  disabled={finalizeLoading}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {finalizeLoading && (
                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2"></span>
                  )}
                  Disburse & Finalize Run
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-3">Employee</th>
                      <th className="py-2 px-3">Basic</th>
                      <th className="py-2 px-3">Allowances</th>
                      <th className="py-2 px-3">Deductions</th>
                      <th className="py-2 px-3">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {previews.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-semibold text-slate-800">{item.employeeName}</td>
                        <td className="py-3 px-3 text-slate-500">${item.basicSalary.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500">${item.allowances.toLocaleString()}</td>
                        <td className="py-3 px-3 text-slate-500">${item.deductions.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">${item.netSalary.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollProcessing;
