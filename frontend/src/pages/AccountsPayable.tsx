import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, CheckCircle2, ShieldAlert, 
  HelpCircle, Trash2, Edit2, Play, Users, DollarSign, X, Check 
} from 'lucide-react';
import axios from 'axios';

interface Vendor {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  address: string | null;
}

interface Bill {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  vendor?: { name: string };
}

const AccountsPayable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'vendors'>('bills');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Add Bill states
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Add Vendor states
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vName, setVName] = useState('');
  const [vCode, setVCode] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vAddress, setVAddress] = useState('');

  // Pay Bill states
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAPData = async () => {
    try {
      const vRes = await axios.get('/api/ap/vendors');
      if (vRes.data.success) setVendors(vRes.data.data);

      const bRes = await axios.get('/api/ap/bills');
      if (bRes.data.success) setBills(bRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setVendors([
        { id: 'v1', name: 'Global Logistics Partners', code: 'VEND-001', email: 'ap@globallogistics.com', phone: '555-9011', address: 'Cargo Hub, terminal 2' },
        { id: 'v2', name: 'Delta Manufacturing Corp', code: 'VEND-002', email: 'billing@deltamfg.com', phone: '555-8833', address: 'Industrial park 4' }
      ]);
      setBills([
        { id: 'b1', invoiceNumber: 'INV-Delta-9831', amount: 15400, dueDate: '2026-07-25', status: 'DRAFT', vendor: { name: 'Delta Manufacturing Corp' } },
        { id: 'b2', invoiceNumber: 'INV-GL-4432', amount: 3200, dueDate: '2026-07-10', status: 'APPROVED', vendor: { name: 'Global Logistics Partners' } }
      ]);
    }
  };

  useEffect(() => {
    fetchAPData();
  }, []);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ap/bills', {
        invoiceNumber,
        vendorId,
        amount: parseFloat(amount),
        purchaseOrderId: purchaseOrderId || undefined,
        dueDate
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        setIsBillModalOpen(false);
        setInvoiceNumber('');
        setAmount('');
        setPurchaseOrderId('');
        setDueDate('');
        fetchAPData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bill registry failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ap/vendors', {
        name: vName,
        code: vCode,
        email: vEmail,
        phone: vPhone || undefined,
        address: vAddress || undefined
      });
      if (res.data.success) {
        setSuccess('Vendor profile created successfully!');
        setIsVendorModalOpen(false);
        setVName('');
        setVCode('');
        setVEmail('');
        setVPhone('');
        setVAddress('');
        fetchAPData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/ap/bills/${selectedBillId}/pay`, {
        amount: parseFloat(payAmount),
        paymentMethod,
        reference: paymentRef || undefined
      });
      if (res.data.success) {
        setSuccess('Disbursement logged and bill status marked paid');
        setIsPayModalOpen(false);
        setPayAmount('');
        setPaymentRef('');
        fetchAPData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Log payment failed');
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = bills
    .filter(b => b.status !== 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accounts Payable (AP)</h2>
          <p className="text-xs text-slate-500 font-medium">Coordinate purchasing bills, complete 3-way matches, and process disbursements</p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'bills' ? (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsBillModalOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Log Purchase Bill
            </button>
          ) : (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsVendorModalOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Register Vendor
            </button>
          )}
        </div>
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

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'bills' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Purchase Bills ({bills.length})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'vendors' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Vendor Directory ({vendors.length})
        </button>
      </div>

      {/* KPI stats */}
      {activeTab === 'bills' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm max-w-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AP Outstanding Liability</span>
              <p className="text-xl font-extrabold text-slate-900">${totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content panels */}
      {activeTab === 'bills' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                      No purchase bills logged.
                    </td>
                  </tr>
                ) : (
                  bills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{bill.invoiceNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-750">{bill.vendor?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">${bill.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(bill.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                          bill.status === 'PAID' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : bill.status === 'APPROVED'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {bill.status !== 'PAID' && (
                          <button
                            onClick={() => { setSelectedBillId(bill.id); setPayAmount(String(bill.amount)); setIsPayModalOpen(true); }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors"
                          >
                            Pay Bill
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      No vendor accounts registered.
                    </td>
                  </tr>
                ) : (
                  vendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{v.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-750">{v.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{v.email}</td>
                      <td className="py-3 px-4 text-slate-400">{v.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{v.address || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Bill Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Log Vendor Invoice</h4>
              <button onClick={() => setIsBillModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Invoice Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delta-8911"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Vendor Profile</label>
                  <select
                    value={vendorId}
                    required
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Bill Amount</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Link PO ID (3-Way Matching)</label>
                <input
                  type="text"
                  placeholder="Optional Purchase Order UUID"
                  value={purchaseOrderId}
                  onChange={(e) => setPurchaseOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
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
                Save and Match Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Process Bill payment</h4>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handlePayBill} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Amount</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CHECK">Paper Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Payment Reference</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-89112A"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
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
                Disburse Settlement Fund
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register Vendor Profile</h4>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Vendor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Vendor Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VEND-ACME"
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@acme.com"
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Phone</label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Office Address</label>
                <input
                  type="text"
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
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
                Save Vendor Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPayable;
