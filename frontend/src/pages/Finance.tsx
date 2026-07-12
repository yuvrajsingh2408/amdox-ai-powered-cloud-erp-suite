import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, FileText, PlusCircle } from 'lucide-react';
import axios from 'axios';

interface COAItem {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'AP' | 'AR';
  vendorName?: string;
  customerId?: string;
  amount: number;
  status: string;
  dueDate: string;
}

const Finance: React.FC = () => {
  const [coa, setCoa] = useState<COAItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'invoices'>('ledger');
  
  // Journal Entry form states
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [description, setDescription] = useState('');
  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchFinance = async () => {
    try {
      const coaRes = await axios.get('/api/finance/accounts');
      if (coaRes.data.status === 'success') setCoa(coaRes.data.data);
      
      const invRes = await axios.get('/api/finance/invoices');
      if (invRes.data.status === 'success') setInvoices(invRes.data.data);
    } catch (err) {
      setCoa([
        { id: '1', code: '1010', name: 'Cash and Bank Assets', type: 'ASSET', balance: 25400.00 },
        { id: '2', code: '1200', name: 'Accounts Receivables (AR)', type: 'ASSET', balance: 8400.00 },
        { id: '3', code: '2010', name: 'Accounts Payables (AP)', type: 'LIABILITY', balance: 4100.00 },
        { id: '4', code: '4010', name: 'Product Sales Revenues', type: 'REVENUE', balance: 34000.00 },
        { id: '5', code: '5010', name: 'Office Rental & Utility Expenses', type: 'EXPENSE', balance: 4300.00 },
      ]);

      setInvoices([
        { id: '1', invoiceNumber: 'INV-2026-001', type: 'AR', customerId: 'Industrial Global Inc.', amount: 4800.00, status: 'PAID', dueDate: '2026-07-15' },
        { id: '2', invoiceNumber: 'INV-2026-002', type: 'AP', vendorName: 'Alum Smelters Corp.', amount: 3200.00, status: 'DRAFT', dueDate: '2026-07-20' },
      ]);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handlePostJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (debitAccount === creditAccount) {
      setModalError('Debit and Credit accounts must be distinct.');
      return;
    }

    try {
      await axios.post('/api/finance/journal', {
        description,
        debitAccountId: debitAccount,
        creditAccountId: creditAccount,
        amount: parseFloat(entryAmount)
      });
      setShowEntryModal(false);
      fetchFinance();
    } catch (err) {
      // Direct local mock state adjustment if API isn't built yet
      const amount = parseFloat(entryAmount);
      setCoa(prev => prev.map(acc => {
        if (acc.id === debitAccount) return { ...acc, balance: acc.balance + amount };
        if (acc.id === creditAccount) return { ...acc, balance: acc.balance - amount };
        return acc;
      }));
      setShowEntryModal(false);
      setDescription('');
      setEntryAmount('');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Finance & Ledger</h2>
          <p className="text-xs text-slate-500 font-medium">Double-entry record books, invoice control (AR/AP), and balances sheets</p>
        </div>

        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold self-start md:self-center">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeSubTab === 'ledger' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            General Ledger
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeSubTab === 'invoices' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            AP & AR Invoices
          </button>
        </div>
      </div>

      {/* Ledger Tab */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          <div className="card-premium p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Chart of Accounts (COA)
              </h3>
              <button
                onClick={() => setShowEntryModal(true)}
                className="btn-primary"
              >
                + Journal Entry
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Account Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {coa.map((account) => (
                    <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">{account.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{account.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                          account.type === 'ASSET' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : account.type === 'LIABILITY' 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : account.type === 'REVENUE' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {account.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${account.balance >= 0 ? 'text-slate-800' : 'text-danger'}`}>
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === 'invoices' && (
        <div className="card-premium p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              AR / AP Invoices Tracker
            </h3>
            <button className="btn-primary">
              + Generate Invoice
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Invoice Number</th>
                  <th className="py-2.5 px-4">Ledger Type</th>
                  <th className="py-2.5 px-4">Vendor/Customer</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                        inv.type === 'AR' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {inv.type === 'AR' ? 'RECEIVABLE (AR)' : 'PAYABLE (AP)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.vendorName || inv.customerId}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">${inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Journal Entry Modal Overlay */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-lg shadow-lg space-y-4 animate-fade-in text-slate-900">
            <h4 className="text-sm font-bold text-slate-850 flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-primary" />
              Double-Entry Journal Post
            </h4>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handlePostJournalEntry} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rent utility adjustment"
                  className="input-premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Debit Account (+)</label>
                  <select
                    value={debitAccount}
                    onChange={(e) => setDebitAccount(e.target.value)}
                    required
                    className="select-premium"
                  >
                    <option value="">Select...</option>
                    {coa.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Credit Account (-)</label>
                  <select
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value)}
                    required
                    className="select-premium"
                  >
                    <option value="">Select...</option>
                    {coa.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-premium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Post Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
