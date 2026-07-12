import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ShieldAlert, CheckCircle2, Search, X } from 'lucide-react';
import axios from 'axios';

interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
}

const ChartOfAccounts: React.FC = () => {
  const [coa, setCoa] = useState<GLAccount[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Add Account form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('ASSET');
  const [balance, setBalance] = useState('0');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCOA = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get('/api/finance/accounts');
      if (res.data.success) {
        setCoa(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setCoa([
        { id: '1', code: '1010', name: 'Cash at Bank', type: 'ASSET', balance: 145000 },
        { id: '2', code: '1200', name: 'Accounts Receivable', type: 'ASSET', balance: 42800 },
        { id: '3', code: '2010', name: 'Accounts Payable', type: 'LIABILITY', balance: 29400 },
        { id: '4', code: '3000', name: 'Common Equity Shares', type: 'EQUITY', balance: 100000 },
        { id: '5', code: '4010', name: 'Product Sales Revenue', type: 'REVENUE', balance: 122700 },
        { id: '6', code: '5010', name: 'Payroll Expense Accounts', type: 'EXPENSE', balance: 58400 },
      ]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/finance/accounts', {
        code,
        name,
        type,
        balance: parseFloat(balance)
      });
      if (res.data.success) {
        setSuccess('GL Account added successfully to Chart of Accounts!');
        setIsModalOpen(false);
        setCode('');
        setName('');
        setBalance('0');
        fetchCOA();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create GL account');
    } finally {
      setLoading(false);
    }
  };

  const filteredCOA = coa.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || acc.code.includes(search);
    const matchesType = typeFilter === '' || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chart of Accounts (COA)</h2>
          <p className="text-xs text-slate-500 font-medium">Define general ledger accounts and inspect live asset, liability, and equity balances</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add GL Account
        </button>
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search account code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="ASSET">Assets</option>
          <option value="LIABILITY">Liabilities</option>
          <option value="EQUITY">Equity</option>
          <option value="REVENUE">Revenues</option>
          <option value="EXPENSE">Expenses</option>
        </select>
      </div>

      {/* Accounts Directory Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">GL Code</th>
                <th className="py-2.5 px-4">Account Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-40"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-3.5 bg-slate-100 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredCOA.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">
                    No general ledger accounts defined.
                  </td>
                </tr>
              ) : (
                filteredCOA.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{acc.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-850">{acc.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        acc.type === 'ASSET' || acc.type === 'EXPENSE' 
                          ? 'bg-slate-50 border-slate-200 text-slate-600' 
                          : 'bg-slate-900 text-white border-transparent'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add GL Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add Account to COA</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">GL Account Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1010"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Petty Cash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="ASSET">Assets</option>
                    <option value="LIABILITY">Liabilities</option>
                    <option value="EQUITY">Equity</option>
                    <option value="REVENUE">Revenues</option>
                    <option value="EXPENSE">Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Initial balance</label>
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

export default ChartOfAccounts;
