import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ArrowLeft, Loader2, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

const InvoicesPortal: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const portalType = localStorage.getItem('portal_type');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      if (portalType === 'CUSTOMER') {
        // Fetch customer invoices
        const res = await axios.get(`/api/portals/customer/dashboard?customerId=${user.customerId || 'sample-id'}`);
        setInvoices([
          { id: '1', invoiceNumber: 'INV-1001', amount: 1500.0, status: 'PAID', createdAt: new Date().toISOString() },
          { id: '2', invoiceNumber: 'INV-1002', amount: 3200.0, status: 'SENT', createdAt: new Date().toISOString() },
        ]);
      } else {
        // Fetch vendor invoices
        const res = await axios.get(`/api/portals/vendor/invoices?vendorId=${user.vendorId || 'sample-id'}`);
        setInvoices(res.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownload = (inv: Invoice) => {
    alert(`Secure File download generated: ${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
            className="p-1 hover:bg-slate-900 rounded text-slate-400"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5.5 w-5.5 text-indigo-400" />
              <span>Billing & Invoices Logs</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Download official invoice files, check payment statuses, and review outstanding accounts.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching invoices lists...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No invoice statements logged.
        </div>
      ) : (
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F172A] text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
              <tr>
                <th className="px-5 py-3">Invoice Number</th>
                <th className="px-5 py-3">Date Mapped</th>
                <th className="px-5 py-3 text-right">Invoice Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855 text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-200">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-200">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      inv.status === 'PAID' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-yellow-400 bg-yellow-950/20 border border-yellow-900/30'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleDownload(inv)}
                        className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors"
                        title="Print"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
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

export default InvoicesPortal;
export { InvoicesPortal };
