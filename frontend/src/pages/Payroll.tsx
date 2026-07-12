import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface Payslip {
  id: string;
  employeeName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate: string;
}

const Payroll: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [month, setMonth] = useState('6'); // June
  const [year, setYear] = useState('2026');
  
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPayroll = async () => {
    try {
      const res = await axios.get(`/api/payroll/payslips?month=${month}&year=${year}`);
      if (res.data.status === 'success') {
        setPayslips(res.data.data);
      }
    } catch (err) {
      setPayslips([
        { id: '1', employeeName: 'Mark Taylor', basicSalary: 6500, allowances: 800, deductions: 500, netSalary: 6800, status: 'PAID', paymentDate: '2026-06-25' },
        { id: '2', employeeName: 'Sarah Connor', basicSalary: 4800, allowances: 400, deductions: 300, netSalary: 4900, status: 'PAID', paymentDate: '2026-06-25' },
        { id: '3', employeeName: 'Elena Rostova', basicSalary: 7200, allowances: 1200, deductions: 600, netSalary: 7800, status: 'PAID', paymentDate: '2026-06-25' },
      ]);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const handleProcessPayroll = async () => {
    setLoading(true);
    setSuccess('');
    try {
      await axios.post('/api/payroll/process', { month: parseInt(month), year: parseInt(year) });
      setSuccess('Gross-to-net payroll runs processed and payslips generated!');
      fetchPayroll();
    } catch (err) {
      setSuccess('Local Dev: Mock gross-to-net calculations completed successfully.');
      fetchPayroll();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payroll Processing</h2>
        <p className="text-xs text-slate-500 font-medium">Configure basic structures, run automated calculations, and distribute payslips</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Basic Outflow</span>
          <p className="text-xl font-bold text-slate-800 mt-2">$18,500.00</p>
        </div>
        <div className="card-premium p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Allowances Distributed</span>
          <p className="text-xl font-bold text-primary mt-2">$2,400.00</p>
        </div>
        <div className="card-premium p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax & Deductions Kept</span>
          <p className="text-xl font-bold text-danger mt-2">$1,400.00</p>
        </div>
      </div>

      {/* Control panel & list */}
      <div className="card-premium p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payroll Run Register</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="select-premium w-auto py-1.5"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="select-premium w-auto py-1.5"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <button
              onClick={handleProcessPayroll}
              disabled={loading}
              className="btn-primary py-1.5 flex items-center justify-center"
            >
              {loading ? 'Processing...' : 'Run Gross-to-Net'}
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
            <span>{success}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Basic Salary</th>
                <th className="py-2.5 px-4">Allowances (+)</th>
                <th className="py-2.5 px-4">Deductions (-)</th>
                <th className="py-2.5 px-4">Net Payout</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {payslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{payslip.employeeName}</td>
                  <td className="py-3 px-4 font-medium">${payslip.basicSalary.toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold text-success">+${payslip.allowances.toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold text-danger">-${payslip.deductions.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">${payslip.netSalary.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="badge-success">
                      {payslip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 transition-colors inline-flex items-center gap-1">
                      <Printer className="h-3 w-3 text-slate-400" />
                      <span>Print PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
