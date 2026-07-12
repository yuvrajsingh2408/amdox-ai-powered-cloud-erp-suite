import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Trash2, CheckCircle2, ShieldAlert, 
  HelpCircle, CalendarRange, Clock, Lock 
} from 'lucide-react';
import axios from 'axios';

interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface JournalLineInput {
  accountId: string;
  debit: string;
  credit: string;
}

const JournalEntries: React.FC = () => {
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLineInput[]>([
    { accountId: '', debit: '0', credit: '0' },
    { accountId: '', debit: '0', credit: '0' }
  ]);

  // Period Locking states
  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/finance/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
      }
    } catch (err) {
      setAccounts([
        { id: '1', code: '1010', name: 'Cash at Bank', type: 'ASSET' },
        { id: '2', code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
        { id: '3', code: '2010', name: 'Accounts Payable', type: 'LIABILITY' },
        { id: '4', code: '4010', name: 'Product Sales Revenue', type: 'REVENUE' },
        { id: '5', code: '5010', name: 'Payroll Expense Accounts', type: 'EXPENSE' },
      ]);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: '0', credit: '0' }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof JournalLineInput, value: string) => {
    const updated = [...lines];
    updated[idx][field] = value;
    setLines(updated);
  };

  // Live totals compute
  const totalDebits = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const difference = totalDebits - totalCredits;
  const isBalanced = Math.abs(difference) < 0.001 && totalDebits > 0;

  const handleSubmitJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isBalanced) {
      setError('Debits and Credits must exactly balance before posting');
      return;
    }

    setLoading(true);
    // Format payload
    const payload = {
      description,
      lines: lines.map(l => ({
        accountId: l.accountId,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0
      }))
    };

    try {
      const res = await axios.post('/api/finance/journal', payload);
      if (res.data.success) {
        setSuccess('Journal entry posted to general ledger successfully!');
        setDescription('');
        setLines([
          { accountId: '', debit: '0', credit: '0' },
          { accountId: '', debit: '0', credit: '0' }
        ]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Posting journal entry failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLockLoading(true);

    try {
      const res = await axios.post('/api/finance/periods/lock', {
        name: periodName,
        startDate,
        endDate
      });
      if (res.data.success) {
        setSuccess(`Financial Period ${periodName} has been locked successfully!`);
        setPeriodName('');
        setStartDate('');
        setEndDate('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to lock period.');
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manual Journal Entries</h2>
        <p className="text-xs text-slate-500 font-medium">Post standard double-entry journal items and lock financial accounting periods</p>
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
        {/* Left: Journal Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-800" />
            Double Entry Journal Ledger
          </h3>

          <form onSubmit={handleSubmitJournal} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Entry Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Adjusting depreciation allocation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Lines array */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Transaction Lines</label>
              
              {lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <select
                    value={line.accountId}
                    required
                    onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="">Select GL Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                    ))}
                  </select>

                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Debit"
                      value={line.debit}
                      onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none text-right font-mono"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Credit"
                      value={line.credit}
                      onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none text-right font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length <= 2}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 w-fit shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Ledger Line
            </button>

            {/* Balancing stats bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-500 font-semibold">
              <div className="space-x-4">
                <span>Debits: <span className="font-bold text-slate-800">${totalDebits.toLocaleString()}</span></span>
                <span>Credits: <span className="font-bold text-slate-800">${totalCredits.toLocaleString()}</span></span>
              </div>
              <span className={isBalanced ? 'text-green-650' : 'text-amber-650'}>
                {isBalanced 
                  ? 'Balanced' 
                  : `Mismatch: $${Math.abs(difference).toLocaleString()}`}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !isBalanced}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
            >
              {loading && (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
              )}
              Post Journal Ledger Entry
            </button>
          </form>
        </div>

        {/* Right: Period closing locking portal */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-800" />
            Financial Period Locking
          </h3>

          <form onSubmit={handleLockPeriod} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Period Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Q1-2026, Jul-2026"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">End Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lockLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
            >
              {lockLoading && (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
              )}
              Lock Period Dates
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JournalEntries;
