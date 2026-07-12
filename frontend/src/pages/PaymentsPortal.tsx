import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string;
  orderNumber?: string;
  amount: number;
  status: string;
  createdAt: string;
}

const PaymentsPortal: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const portalType = localStorage.getItem('portal_type');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      if (portalType === 'CUSTOMER') {
        const res = await axios.get(`/api/portals/customer/payments?customerId=${user.customerId || 'sample-id'}`);
        setPayments(res.data?.data || []);
      } else {
        // Vendor payments
        setPayments([
          { id: '1', orderNumber: 'PO-7701', amount: 15000.0, status: 'SUCCESS', createdAt: new Date().toISOString() },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
          className="p-1 hover:bg-slate-900 rounded text-slate-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5.5 w-5.5 text-indigo-400" />
            <span>Payments History Ledger</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Trace double-entry journal receipt transactions and check outstanding invoice status clearances.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching payments history...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No payments recorded under this workspace.
        </div>
      ) : (
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F172A] text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
              <tr>
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Source Ref</th>
                <th className="px-5 py-3">Process Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855 text-slate-300">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-[10px]">{pay.id}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-200">{pay.orderNumber || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-slate-550">{new Date(pay.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-200">
                    ${pay.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/30">
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default PaymentsPortal;
export { PaymentsPortal };
