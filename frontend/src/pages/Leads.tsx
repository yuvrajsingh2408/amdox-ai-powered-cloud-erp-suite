import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, UserCheck, ShieldAlert, 
  CheckCircle2, RefreshCw, X, HelpCircle, Cpu 
} from 'lucide-react';
import axios from 'axios';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
}

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Drawer forms
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('WEBSITE');

  // AI Prediction drawer state
  const [predictedLead, setPredictedLead] = useState<Lead | null>(null);
  const [predictionData, setPredictionData] = useState<{ score: number; recommendation: string } | null>(null);
  const [predLoading, setPredLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/crm/leads');
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      setLeads([
        { id: 'l1', name: 'James Carter', company: 'Apex Logistics', email: 'j.carter@apex.com', source: 'REFERRAL', status: 'NEW' },
        { id: 'l2', name: 'Sophia Loren', company: 'NextGen Retail', email: 'sophia@nextgen.com', source: 'LINKEDIN', status: 'QUALIFIED' }
      ]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/crm/leads', { name, company, email, source });
      if (res.data.success) {
        setSuccess('Lead profile registered successfully!');
        fetchLeads();
        setIsDrawerOpen(false);
        setName('');
        setCompany('');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register lead');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictConversion = async (lead: Lead) => {
    setPredictedLead(lead);
    setPredictionData(null);
    setPredLoading(true);
    try {
      const res = await axios.get(`/api/crm/leads/${lead.id}/predict`);
      if (res.data.success) {
        setPredictionData(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      let score = 35;
      if (lead.source === 'REFERRAL') score = 75;
      setPredictionData({
        score,
        recommendation: score > 70 
          ? 'Highly positive conversion probability. Propose enterprise pricing tiers now.'
          : 'Low conversion rate probability. Maintain generic bi-weekly newsletter campaigns.'
      });
    } finally {
      setPredLoading(false);
    }
  };

  const filtered = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leads Registry Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Capture incoming leads, check referral weights, and invoke AI Conversion Predictors</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsDrawerOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Lead Profile
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

      {/* Filter panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
        >
          <option value="ALL">All Sources</option>
          <option value="WEBSITE">Website Form</option>
          <option value="REFERRAL">Referral Network</option>
          <option value="LINKEDIN">LinkedIn Pipeline</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4">Contact</th>
              <th className="p-4">Company</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">AI Predictor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div>
                    <span className="font-bold text-slate-900 block">{l.name}</span>
                    <span className="text-[10px] text-slate-500">{l.email}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-800">{l.company}</td>
                <td className="p-4 text-slate-655 font-mono">{l.source}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider">
                    {l.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handlePredictConversion(l)}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 ml-auto"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    Estimate Lead Conversion
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Predictor display drawer */}
      {predictedLead && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col font-sans">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
              <Cpu className="h-4 w-4 text-slate-800" />
              Conversion predictor
            </h4>
            <button onClick={() => setPredictedLead(null)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Lead Name</span>
              <span className="text-sm font-bold text-slate-900 block mt-1">{predictedLead.name}</span>
              <span className="text-[10px] text-slate-500 font-medium block">Source: {predictedLead.source}</span>
            </div>

            {predLoading ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">Running ML Predictor...</div>
            ) : predictionData ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 text-white rounded-lg text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Probability Score</span>
                  <span className="text-3xl font-extrabold block mt-1">{predictionData.score}%</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">AI recommendation</span>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{predictionData.recommendation}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Creation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col font-sans">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add Lead</h4>
            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreateLead} className="p-5 flex-1 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Contact Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Neeson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Company</label>
              <input
                type="text"
                required
                placeholder="e.g. Texas Freight Ltd"
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
                placeholder="e.g. liam@texasfreight.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Lead Acquisition Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <option value="WEBSITE">Website Form</option>
                <option value="REFERRAL">Referral Network</option>
                <option value="LINKEDIN">LinkedIn Pipeline</option>
                <option value="CAMPAIGN">Marketing Campaign</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Configure Lead
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Leads;
