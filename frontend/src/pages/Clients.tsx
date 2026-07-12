import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Building2, User, 
  DollarSign, ArrowUpRight, ShieldAlert, CheckCircle2, X 
} from 'lucide-react';
import axios from 'axios';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  client?: Client;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'deals'>('directory');
  
  // Drawer forms
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [isDealDrawerOpen, setIsDealDrawerOpen] = useState(false);

  // Client form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Deal form
  const [dealName, setDealName] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [clientId, setClientId] = useState('');
  const [dealStage, setDealStage] = useState('NEW');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const resClients = await axios.get('/api/crm/clients');
      if (resClients.data.success) {
        setClients(resClients.data.data);
      }
      const resDeals = await axios.get('/api/crm/deals');
      if (resDeals.data.success) {
        setDeals(resDeals.data.data);
      }
    } catch (err) {
      setClients([
        { id: 'c1', name: 'John Doe', company: 'Austin Supplies LLC', email: 'john@austinsupplies.com' }
      ]);
      setDeals([
        { id: 'd1', name: 'Expansion Contract', amount: 80000, stage: 'PROPOSAL', client: { id: 'c1', name: 'John Doe', company: 'Austin Supplies LLC', email: 'john@austinsupplies.com' } }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/crm/clients', { name, company, email, phone });
      if (res.data.success) {
        setSuccess('Corporate client registered successfully!');
        fetchData();
        setIsClientDrawerOpen(false);
        setName('');
        setCompany('');
        setEmail('');
        setPhone('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/crm/deals', { name: dealName, amount: dealAmount, clientId, stage: dealStage });
      if (res.data.success) {
        setSuccess('New CRM deal logged in pipeline!');
        fetchData();
        setIsDealDrawerOpen(false);
        setDealName('');
        setDealAmount('');
        setClientId('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clients & Deals Pipeline</h2>
          <p className="text-xs text-slate-500 font-medium">Verify active customer accounts, review open opportunity deals, and log contracts</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'directory' ? (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsClientDrawerOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register Client
            </button>
          ) : (
            <button
              onClick={() => { setError(''); setSuccess(''); setIsDealDrawerOpen(true); }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Log Deal
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

      {/* Tabs */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'directory' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Corporate Directory
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'deals' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Deals Pipeline
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Client Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Contact Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {clients.map(c => (
                <tr key={c.id}>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    {c.name}
                  </td>
                  <td className="p-4">{c.company}</td>
                  <td className="p-4 text-slate-655">{c.email}</td>
                  <td className="p-4 font-mono">{c.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Deal Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Estimated Amount</th>
                <th className="p-4">Pipeline Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deals.map(d => (
                <tr key={d.id}>
                  <td className="p-4 font-bold text-slate-900">{d.name}</td>
                  <td className="p-4 text-slate-500">{d.client?.company || '-'}</td>
                  <td className="p-4 font-bold text-slate-900">${d.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider">
                      {d.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Client Drawer */}
      {isClientDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col font-sans">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register corporate client</h4>
            <button onClick={() => setIsClientDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateClient} className="p-5 flex-1 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Austin Powers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Company Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Austin Powers International"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. austin@powers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +1 512 400 9000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Configure Client
            </button>
          </form>
        </div>
      )}

      {/* Deal Drawer */}
      {isDealDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col font-sans">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Log opportunity deal</h4>
            <button onClick={() => setIsDealDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateDeal} className="p-5 flex-1 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Deal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Expansion Contract"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Deal Amount</label>
              <input
                type="number"
                required
                placeholder="e.g. 50000"
                value={dealAmount}
                onChange={(e) => setDealAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Corporate Client</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="">Select corporate client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Pipeline Stage</label>
              <select
                value={dealStage}
                onChange={(e) => setDealStage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="NEW">New</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Log Deal
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Clients;
