import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Layers, Box, 
  Award, RefreshCw, Landmark, ArrowUpRight, Scale, Briefcase, Users, Activity 
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B'];

interface MetricGroup {
  finance: { cashBalance: number; apOutstanding: number; arOutstanding: number; netEquity: number };
  hr: { activeEmployees: number; attendanceRate: number; lateRatio: number };
  scm: { totalSKUs: number; stockValuation: number; lowStockAlerts: number };
  projects: { activeProjects: number; totalBudget: number; actualCost: number; variance: number };
}

const ExecutiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ceo' | 'cfo' | 'hr' | 'scm'>('ceo');
  const [metrics, setMetrics] = useState<MetricGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bi/metrics');
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setMetrics({
        finance: { cashBalance: 185200, apOutstanding: 29400, arOutstanding: 42800, netEquity: 198600 },
        hr: { activeEmployees: 14, attendanceRate: 95.2, lateRatio: 4.8 },
        scm: { totalSKUs: 42, stockValuation: 345900, lowStockAlerts: 3 },
        projects: { activeProjects: 6, totalBudget: 580000, actualCost: 410000, variance: 170000 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const overallGrowthData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 49000, expenses: 38000 },
    { month: 'Apr', revenue: 61000, expenses: 40000 },
    { month: 'May', revenue: 73000, expenses: 44000 },
    { month: 'Jun', revenue: 68000, expenses: 41000 }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive BI Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">C-Suite analytics, aggregated department metrics, and financial cash holdings</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recalculate metrics
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveTab('ceo')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'ceo' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          CEO Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('cfo')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'cfo' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          CFO Financial Ratios
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'hr' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          HR Operations
        </button>
        <button
          onClick={() => setActiveTab('scm')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeTab === 'scm' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Supply Chain
        </button>
      </div>

      {loading || !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 border border-slate-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: CEO SUMMARY */}
          {activeTab === 'ceo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Scale className="h-5 w-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Capital Equity</span>
                    <span className="text-xl font-bold text-slate-800">${metrics.finance.netEquity.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Users className="h-5 w-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attendance Rate</span>
                    <span className="text-xl font-bold text-slate-800">{metrics.hr.attendanceRate.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Box className="h-5 w-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Warehouse Stock Value</span>
                    <span className="text-xl font-bold text-slate-800">${metrics.scm.stockValuation.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Briefcase className="h-5 w-5" /></div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget variance</span>
                    <span className="text-xl font-bold text-slate-800">${metrics.projects.variance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-slate-800" />
                  Operating Revenues vs. Expenses Trends
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overallGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#0F172A" fill="#F1F5F9" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" stroke="#64748B" fill="#F8FAFC" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CFO VIEW */}
          {activeTab === 'cfo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Cash reserves</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">${metrics.finance.cashBalance.toLocaleString()}</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Accounts Receivable (Outstanding Assets)</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">${metrics.finance.arOutstanding.toLocaleString()}</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Accounts Payable (Outstanding Liability)</span>
                  <span className="text-2xl font-extrabold text-slate-900 block mt-1">${metrics.finance.apOutstanding.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HR VIEW */}
          {activeTab === 'hr' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Headcount</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.hr.activeEmployees} Employees</span>
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance Ratio</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.hr.attendanceRate.toFixed(1)}% Present</span>
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Late Arrivals Percent</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.hr.lateRatio.toFixed(1)}% Lates</span>
              </div>
            </div>
          )}

          {/* TAB 4: SCM VIEW */}
          {activeTab === 'scm' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Value holding</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">${metrics.scm.stockValuation.toLocaleString()}</span>
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Low Stock SKU Items</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.scm.lowStockAlerts} Items</span>
              </div>
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total SKUs catalog</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.scm.totalSKUs} Products</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
