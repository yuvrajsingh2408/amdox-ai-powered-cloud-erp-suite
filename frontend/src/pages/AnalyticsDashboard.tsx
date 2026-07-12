import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Activity, Sparkles, TrendingUp, Landmark, ShieldCheck, 
  ArrowRight, Download, BarChart2, PieChart as PieIcon, RefreshCw, 
  CheckCircle, Loader2, FileText, Calendar, Layout, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

interface KPIStats {
  revenue: number;
  expenses: number;
  netIncome: number;
  attendanceRate: number;
  forecastMape: number;
  products: Array<{ name: string; stock: number; price: number; value: number }>;
  employees: Array<{ name: string; designation: string; completionRate: number }>;
}

interface AIReportData {
  summary: string;
  recommendations: string[];
}

const AnalyticsDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAIModule, setSelectedAIModule] = useState('FINANCE');
  const [aiReport, setAiReport] = useState<AIReportData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/analytics/kpis');
      setKpis(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAIReport = async (mod: string) => {
    setAiLoading(true);
    try {
      const res = await axios.get(`/api/analytics/ai-report?module=${mod}`);
      setAiReport(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  useEffect(() => {
    triggerAIReport(selectedAIModule);
  }, [selectedAIModule]);

  if (loading || !kpis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-500 gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs">Aggregating company ledger stats...</span>
      </div>
    );
  }

  // Finance trend chart data mock
  const financeTrendData = [
    { name: 'Jan', Revenue: kpis.revenue * 0.7, Expenses: kpis.expenses * 0.8 },
    { name: 'Feb', Revenue: kpis.revenue * 0.8, Expenses: kpis.expenses * 0.95 },
    { name: 'Mar', Revenue: kpis.revenue * 0.9, Expenses: kpis.expenses * 0.9 },
    { name: 'Apr', Revenue: kpis.revenue * 1.1, Expenses: kpis.expenses * 0.85 },
    { name: 'May', Revenue: kpis.revenue * 1.0, Expenses: kpis.expenses * 1.0 },
    { name: 'Jun', Revenue: kpis.revenue, Expenses: kpis.expenses },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5.5 w-5.5 text-primary" />
            <span>Interactive Analytics & KPI Center</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time charts, timeline aggregates, and AI-powered margin explanations.
          </p>
        </div>
      </div>

      {/* KPI Stats counters grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net margins */}
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Net Cash Margin</span>
            <h3 className="text-lg font-extrabold text-white">${kpis.netIncome.toLocaleString()}</h3>
            <span className="text-[9px] text-emerald-400 font-semibold block">Revenue: ${kpis.revenue.toLocaleString()}</span>
          </div>
          <Landmark className="h-8 w-8 text-indigo-500/20" />
        </div>

        {/* Expenses */}
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operating Expenses</span>
            <h3 className="text-lg font-extrabold text-white">${kpis.expenses.toLocaleString()}</h3>
            <span className="text-[9px] text-slate-500 block">Current fiscal cycle</span>
          </div>
          <TrendingUp className="h-8 w-8 text-rose-500/20" />
        </div>

        {/* Attendance */}
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attendance Rate</span>
            <h3 className="text-lg font-extrabold text-white">{kpis.attendanceRate}%</h3>
            <span className="text-[9px] text-indigo-400 font-semibold block">96% target baseline</span>
          </div>
          <Activity className="h-8 w-8 text-purple-500/20" />
        </div>

        {/* Forecast Accuracy */}
        <div className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Forecast MAPE Error</span>
            <h3 className="text-lg font-extrabold text-white">{kpis.forecastMape}%</h3>
            <span className="text-[9px] text-emerald-400 font-semibold block">Highly accurate rating</span>
          </div>
          <Sparkles className="h-8 w-8 text-emerald-500/20" />
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Expenses (Col span 2) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Flow Timeline Trend</h2>
          <div className="h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top stocks product value */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Valuation: Top Products</h2>
          <div className="h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.products}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sku" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="value" name="Inventory Value ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Auto Report Summary Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side AI Selector */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>AI Automated Diagnoses</span>
          </h2>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Select a target scope. The AI Copilot scans real-time database transactions to draft narrative executive summaries.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {['FINANCE', 'HR', 'SCM'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedAIModule(mod)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  selectedAIModule === mod
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mod} Analytics
              </button>
            ))}
          </div>
        </div>

        {/* Right Side summary display (Col span 2) */}
        <div className="lg:col-span-2 bg-[#0F172A]/40 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-4 top-4 text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
            Isolated Snapshot
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Computing AI Trend Models...</span>
            </div>
          ) : !aiReport ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-2 text-xs">
              <AlertCircle className="h-6 w-6" />
              <span>Could not compile automated snapshots.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-200">AI Report Explanation</h3>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{aiReport.summary}"
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold text-slate-200">Recommended Executive Actions</h3>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {aiReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AnalyticsDashboard;
export { AnalyticsDashboard };
