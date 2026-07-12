import React, { useState, useEffect } from 'react';
import { 
  Coins, Plus, RefreshCw, AlertCircle, CheckCircle2, 
  Trash2, Landmark, HelpCircle, ArrowUpRight, Scale 
} from 'lucide-react';
import axios from 'axios';

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

interface RateItem {
  from: string;
  to: string;
  rate: number;
}

const CurrencyRates: React.FC = () => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);

  // Add Currency form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [isBase, setIsBase] = useState(false);

  // Add Rate Form
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rateVal, setRateVal] = useState('0.92');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCurrencyData = async () => {
    try {
      const res = await axios.get('/api/tenants');
      // Set mocks
      setCurrencies([
        { id: '1', code: 'USD', name: 'US Dollar', symbol: '$', isBase: true },
        { id: '2', code: 'EUR', name: 'Euro Currency', symbol: '€', isBase: false },
        { id: '3', code: 'INR', name: 'Indian Rupee', symbol: '₹', isBase: false }
      ]);
      setRates([
        { from: 'USD', to: 'EUR', rate: 0.92 },
        { from: 'USD', to: 'INR', rate: 83.45 },
        { from: 'EUR', to: 'INR', rate: 90.62 }
      ]);
    } catch (err) {
      setCurrencies([
        { id: '1', code: 'USD', name: 'US Dollar', symbol: '$', isBase: true },
        { id: '2', code: 'EUR', name: 'Euro Currency', symbol: '€', isBase: false },
        { id: '3', code: 'INR', name: 'Indian Rupee', symbol: '₹', isBase: false }
      ]);
      setRates([
        { from: 'USD', to: 'EUR', rate: 0.92 },
        { from: 'USD', to: 'INR', rate: 83.45 },
        { from: 'EUR', to: 'INR', rate: 90.62 }
      ]);
    }
  };

  useEffect(() => {
    fetchCurrencyData();
  }, []);

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (currencies.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      setError('Currency code already exists');
      return;
    }

    const newCur = {
      id: String(currencies.length + 1),
      code: code.toUpperCase(),
      name,
      symbol,
      isBase
    };

    setCurrencies([...currencies, newCur]);
    setSuccess(`Currency ${code.toUpperCase()} registered successfully`);
    setCode('');
    setName('');
    setSymbol('');
    setIsBase(false);
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const newRate = {
      from,
      to,
      rate: parseFloat(rateVal) || 1.0
    };

    setRates([newRate, ...rates]);
    setSuccess(`Exchange Rate ${from} to ${to} mapped successfully`);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Currency Exchange Portal</h2>
        <p className="text-xs text-slate-500 font-medium">Verify exchange rate tables and coordinate historical pricing values</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
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
        {/* Active Currencies */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Coins className="h-4 w-4 text-slate-800" />
            Currencies Registry
          </h3>

          <div className="space-y-2">
            {currencies.map(c => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800">{c.code} — {c.name}</span>
                  {c.isBase && (
                    <span className="ml-2 bg-slate-900 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                      Base currency
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-500 font-mono text-sm">{c.symbol}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddCurrency} className="border-t border-slate-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GBP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. £"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Currency Name</label>
              <input
                type="text"
                required
                placeholder="e.g. British Pound"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Add Currency
            </button>
          </form>
        </div>

        {/* Exchange rates table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-800" />
            Active Exchange Rates
          </h3>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-4">From</th>
                  <th className="py-2 px-4">To</th>
                  <th className="py-2 px-4 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {rates.map((r, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 font-bold text-slate-800">{r.from}</td>
                    <td className="py-3 px-4 font-bold text-slate-500">{r.to}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAddRate} className="border-t border-slate-100 pt-4 grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Rate</label>
              <input
                type="number"
                step="0.0001"
                required
                value={rateVal}
                onChange={(e) => setRateVal(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Add Rate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CurrencyRates;
