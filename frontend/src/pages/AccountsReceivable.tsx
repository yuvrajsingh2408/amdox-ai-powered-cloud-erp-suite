import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, CheckCircle2, ShieldAlert, 
  HelpCircle, Trash2, Edit2, Users, DollarSign, X, Check, ArrowDownLeft 
} from 'lucide-react';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string | null;
  address: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  dueDate: string;
  status: string;
  customer?: { name: string };
}

const AccountsReceivable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'customers'>('invoices');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Add Invoice states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('0');
  const [dueDate, setDueDate] = useState('');

  // Add Customer states
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cCode, setCCode] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');

  // Collect Payment states
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchARData = async () => {
    try {
      const cRes = await axios.get('/api/ar/customers');
      if (cRes.data.success) setCustomers(cRes.data.data);

      const iRes = await axios.get('/api/ar/invoices');
      if (iRes.data.success) setInvoices(iRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setCustomers([
        { id: 'c1', name: 'Acme Global Retail', code: 'CUST-001', email: 'billing@acmeglobal.com', phone: '555-4022', address: 'Main Blvd, Plaza 1A' },
        { id: 'c2', name: 'Zeta Distribution Hub', code: 'CUST-002', email: 'finance@zetadist.com', phone: '555-3399', address: 'Cargo Terminal West' }
      ]);
      setInvoices([
        { id: 'i1', invoiceNumber: 'SINV-Acme-101', amount: 8900, tax: 890, dueDate: '2026-07-20', status: 'SENT', customer: { name: 'Acme Global Retail' } },
        { id: 'i2', invoiceNumber: 'SINV-Zeta-202', amount: 24500, tax: 2450, dueDate: '2026-07-15', status: 'PAID', customer: { name: 'Zeta Distribution Hub' } }
      ]);
    }
  };

  useEffect(() => {
    fetchARData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ar/invoices', {
        invoiceNumber,
        customerId,
        amount: parseFloat(amount),
        tax: parseFloat(tax),
        dueDate
      });
      if (res.data.success) {
        setSuccess('Sales invoice created and dispatched successfully!');
        setIsInvoiceModalOpen(false);
        setInvoiceNumber('');
        setAmount('');
        setTax('0');
        setDueDate('');
        fetchARData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invoice creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ar/customers', {
        name: cName,
        code: cCode,
        email: cEmail,
        phone: cPhone || undefined,
        address: cAddress || undefined
      });
      if (res.data.success) {
        setSuccess('Customer account registered successfully!');
        setIsCustomerModalOpen(false);
        setCName('');
        setCCode('');
        setCEmail('');
        setCPhone('');
        setCAddress('');
        fetchARData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/ar/invoices/${selectedInvoiceId}/pay`, {
        amount: parseFloat(payAmount),
        paymentMethod,
        reference: paymentRef || undefined
      });
      if (res.data.success) {
        setSuccess('Payment collected and general ledger receivables adjusted.');
        setIsPayModalOpen(false);
        setPayAmount('');
        setPaymentRef('');
        fetchARData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Log collection payment failed');
    } finally {
      setLoading(false);
    }
  };

  const totalReceivables = invoices
    .filter(i => i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accounts Receivable (AR)</h2>
          <p className="text-xs text-slate-500 font-medium">Register sales invoices, process customer checks, and track outstanding receivables</p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'invoices' ? (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsInvoiceModalOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Sales Invoice
            </button>
          ) : (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsCustomerModalOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Register Customer
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
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'invoices' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Sales Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'customers' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Customer Directory ({customers.length})
        </button>
      </div>

      {/* Outstanding Receivables summary block */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm max-w-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AR Outstanding Receivables</span>
              <p className="text-xl font-extrabold text-slate-900">${totalReceivables.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tables content */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                      No sales invoices registered.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-750">{inv.customer?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                          inv.status === 'PAID' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => { setSelectedInvoiceId(inv.id); setPayAmount(String(inv.amount)); setIsPayModalOpen(true); }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 ml-auto"
                          >
                            <ArrowDownLeft className="h-3 w-3" />
                            Collect
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

      {activeTab === 'customers' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Phone</th>
                  <th className="py-2.5 px-4">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      No customer accounts registered.
                    </td>
                  </tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-750">{c.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{c.email}</td>
                      <td className="py-3 px-4 text-slate-400">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{c.address || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Sales Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Dispatch Sales Invoice</h4>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Invoice #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SINV-891"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Customer Account</label>
                  <select
                    value={customerId}
                    required
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Base Amount</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Tax (GST)</label>
                  <input
                    type="number"
                    required
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Save and Dispatch Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Process Receipt Payment</h4>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCollectPayment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Amount Collected</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Collection Method</label>
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
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Receipt Reference</label>
                <input
                  type="text"
                  placeholder="e.g. DEPOSIT-77812"
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
                Deposit Payment Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register Customer Account</h4>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Customer Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CUST-SMITH"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
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
                    placeholder="john@smith.com"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Phone</label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Billing Address</label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
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
                Save Customer Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsReceivable;
