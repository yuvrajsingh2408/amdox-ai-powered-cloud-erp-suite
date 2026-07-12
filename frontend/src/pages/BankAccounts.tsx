import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Landmark, CheckCircle2, ShieldAlert, 
  HelpCircle, Trash2, Edit2, Upload, FileText, X, Check, FileCheck 
} from 'lucide-react';
import axios from 'axios';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string | null;
  bankName: string;
  balance: number;
  currency: string;
}

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string | null;
  isReconciled: boolean;
}

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  // Add Account states
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [balance, setBalance] = useState('0');
  const [currency, setCurrency] = useState('USD');

  // Statement import states
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementText, setStatementText] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get('/api/bank/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
        if (res.data.data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(res.data.data[0].id);
        }
      }
    } catch (err) {
      // Mock fallbacks
      setAccounts([
        { id: 'b1', accountName: 'Silicon Valley Operating Account', accountNumber: 'SVB-98311', routingNumber: '021000021', bankName: 'First Citizens Bank', balance: 145000, currency: 'USD' },
        { id: 'b2', accountName: 'EUR Petty Cash Reserve', accountNumber: 'DE-8831', routingNumber: null, bankName: 'Deutsche Bank', balance: 40200, currency: 'EUR' }
      ]);
      setSelectedAccountId('b1');
    }
  };

  const fetchTransactions = async () => {
    if (!selectedAccountId) return;
    setTxLoading(true);
    try {
      const res = await axios.get(`/api/bank/accounts/${selectedAccountId}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      setTransactions([
        { id: 'tx1', date: '2026-07-09T00:00:00Z', description: 'Acme Global Retail Payment Receipt', amount: 8900, reference: 'DEPOSIT-77812', isReconciled: true },
        { id: 'tx2', date: '2026-07-08T00:00:00Z', description: 'Delta Mfg Bill Settlement Payout', amount: -15400, reference: 'TXN-89112A', isReconciled: false }
      ]);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccountId]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/bank/accounts', {
        accountName,
        accountNumber,
        routingNumber: routingNumber || undefined,
        bankName,
        balance: parseFloat(balance),
        currency
      });
      if (res.data.success) {
        setSuccess('Bank account registered successfully!');
        setIsAccountModalOpen(false);
        setAccountName('');
        setAccountNumber('');
        setRoutingNumber('');
        setBankName('');
        setBalance('0');
        fetchBankAccounts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleStatementImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/bank/accounts/${selectedAccountId}/statement`, { statementText });
      if (res.data.success) {
        setSuccess(res.data.message);
        setIsStatementModalOpen(false);
        setStatementText('');
        fetchTransactions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reconciliation import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (transId: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`/api/bank/accounts/${selectedAccountId}/reconcile/${transId}`);
      if (res.data.success) {
        setSuccess('Transaction reconciled successfully!');
        fetchTransactions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Manual reconciliation trigger failed.');
    }
  };

  const activeAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Banking & Reconciliations</h2>
          <p className="text-xs text-slate-500 font-medium">Verify ledger cash holdings, parse bank statements, and match bank entries</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setError(''); setSuccess(''); setIsStatementModalOpen(true); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Import Bank Statement
          </button>
          <button
            onClick={() => { setError(''); setSuccess(''); setIsAccountModalOpen(true); }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Register Account
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Accounts selector details */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-slate-800" />
            Linked Bank Accounts
          </h3>

          <div className="space-y-2">
            {accounts.map(acc => (
              <div 
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAccountId === acc.id 
                    ? 'border-slate-900 bg-slate-50/50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:bg-slate-50/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-800 block truncate w-36">{acc.accountName}</span>
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-655 font-bold uppercase">{acc.currency}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-1.5">No: {acc.accountNumber}</span>
                <span className="text-sm font-extrabold text-slate-900 mt-3 block">${acc.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Transactions list / reconciliations registry */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-slate-800" />
                Transactions & Reconciliation Console
              </h3>
              {activeAccount && (
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                  Reconciling: {activeAccount.accountName}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4">Reconciled</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {txLoading ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">Loading registry...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                      No bank statements transactions logged.
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tx.description}</td>
                      <td className={`py-3 px-4 font-bold ${tx.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {tx.amount >= 0 ? '+' : ''}${tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{tx.reference || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          tx.isReconciled 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {tx.isReconciled ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!tx.isReconciled && (
                          <button
                            onClick={() => handleReconcile(tx.id)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                            title="Reconcile match"
                          >
                            <Check className="h-4 w-4" />
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
      </div>

      {/* Statement Import Portal Modal */}
      {isStatementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Auto Reconciliation statement Parser</h4>
              <button onClick={() => setIsStatementModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleStatementImport} className="p-5 space-y-4">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Paste CSV statement rows. Format: <span className="font-mono bg-slate-50 border rounded px-1 text-slate-700">date, description, amount, reference</span> (deposit: positive, withdrawal: negative).
              </p>
              <textarea
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="2026-07-09, Acme Retail Check payment, 8900, DEPOSIT-77812&#10;2026-07-08, Delta Mfg Bill disbursement, -15400, TXN-89112A"
                required
                rows={8}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Parse and Auto Match
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register Bank Account</h4>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Reserve"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102213192"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JPMorgan Chase"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Routing Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 021000021"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Initial Ledger Balance</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
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
                Save Account Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
