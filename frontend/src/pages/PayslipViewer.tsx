import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, ShieldAlert, FileText, CheckCircle2, 
  Building, User, Mail, Calendar, Coins 
} from 'lucide-react';
import axios from 'axios';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayslipViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slip, setSlip] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayslip = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/payroll/payslips/${id}`);
      if (res.data.success) {
        setSlip(res.data.data);
      }
    } catch (err) {
      // Mock details
      setSlip({
        id: id || 's1',
        basicSalary: 45000,
        allowances: 18000,
        grossSalary: 63000,
        bonus: 9000,
        incentives: 18000,
        tax: 6300,
        pf: 5040,
        professionalTax: 1260,
        deductions: 12600,
        netSalary: 77400,
        status: 'PAID',
        paymentDate: '2026-07-09T00:00:00.000Z',
        employee: {
          employeeCode: 'EMP-001',
          firstName: 'Mark',
          lastName: 'Taylor',
          email: 'mark@amdox.com',
          phone: '555-0101',
          designation: 'Technical Architect',
          department: { name: 'IT Engineering' }
        },
        payrollRun: {
          month: 7,
          year: 2026
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPayslip();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 font-medium">Compiling printable salary slip details...</div>;
  }

  if (!slip) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-12 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Payslip Not Found</h3>
        <button onClick={() => navigate('/payroll')} className="btn-primary text-xs px-4 py-2">
          Back to Payroll
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-900 max-w-3xl mx-auto">
      {/* Action Header (Hidden during Print) */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </button>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print Payslip
        </button>
      </div>

      {/* Printable Payslip Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 space-y-6 print:border-none print:shadow-none">
        {/* Company Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Amdox ERP</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Enterprise Cloud Suite</p>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Payslip Invoice</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Period: {MONTH_NAMES[slip.payrollRun.month - 1]} {slip.payrollRun.year}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-5">
          {/* Employee details */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Employee Information</h4>
            <p className="font-bold text-slate-800">{slip.employee.firstName} {slip.employee.lastName}</p>
            <p className="text-slate-500 font-medium">Code: <span className="font-semibold text-slate-700">{slip.employee.employeeCode}</span></p>
            <p className="text-slate-500 font-medium">Designation: <span className="font-semibold text-slate-700">{slip.employee.designation}</span></p>
            <p className="text-slate-500 font-medium">Department: <span className="font-semibold text-slate-700">{slip.employee.department?.name}</span></p>
          </div>

          {/* Disbursement details */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Payment Details</h4>
            <p className="text-slate-500 font-medium">Payment Date: <span className="font-semibold text-slate-700">{slip.paymentDate ? new Date(slip.paymentDate).toLocaleDateString() : 'Pending'}</span></p>
            <p className="text-slate-500 font-medium">Status: <span className="font-bold text-green-700">{slip.status}</span></p>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs border-b border-slate-100 pb-5">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-slate-450 font-bold uppercase tracking-wider border-b border-slate-100 pb-1 mb-2">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Basic Salary</span>
                <span className="font-bold text-slate-850">${slip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Allowances</span>
                <span className="font-bold text-slate-850">${slip.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Incentives</span>
                <span className="font-bold text-slate-850">${slip.incentives.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Bonuses</span>
                <span className="font-bold text-slate-850">${slip.bonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2">
                <span>Gross Earnings</span>
                <span>${(slip.grossSalary + slip.incentives + slip.bonus).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-slate-450 font-bold uppercase tracking-wider border-b border-slate-100 pb-1 mb-2">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Income Tax (TDS)</span>
                <span className="font-bold text-slate-850">${slip.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Provident Fund (PF)</span>
                <span className="font-bold text-slate-850">${slip.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Professional Tax</span>
                <span className="font-bold text-slate-850">${slip.professionalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2">
                <span>Total Deductions</span>
                <span>${slip.deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary summary block */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Net Take-Home Monthly Salary</span>
              <p className="text-xs text-slate-500 font-medium">Disbursed successfully to employee registered bank details</p>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">${slip.netSalary.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;
