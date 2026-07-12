import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, Package, Briefcase, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Sparkles, Plus, Calendar, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data
  const financialPerformance = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 9800, expenses: 5000 },
    { name: 'Apr', revenue: 3908, expenses: 2780 },
    { name: 'May', revenue: 4800, expenses: 1890 },
    { name: 'Jun', revenue: 13000, expenses: 6900 },
  ];

  const inventoryLevels = [
    { name: 'Steel Pipes', quantity: 240 },
    { name: 'Alum Rods', quantity: 180 },
    { name: 'PVC Connect', quantity: 360 },
    { name: 'Braze Wire', quantity: 140 },
    { name: 'Copper Tubes', quantity: 90 },
  ];

  const projectStatus = [
    { name: 'Completed', value: 4 },
    { name: 'In Progress', value: 8 },
    { name: 'Planning', value: 3 },
    { name: 'Suspended', value: 1 },
  ];

  const sparklineData = [
    [30, 45, 35, 50, 40, 60, 55],
    [10, 15, 8, 12, 14, 18, 16],
    [90, 85, 88, 80, 75, 70, 78],
    [5, 6, 7, 7, 8, 9, 10]
  ];

  const COLORS = ['#10B981', '#2563EB', '#F59E0B', '#EF4444'];

  const stats = [
    { 
      name: 'Total Revenue', 
      value: '$84,250.00', 
      icon: DollarSign, 
      change: '+14.2%', 
      isPositive: true, 
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      gradient: 'from-emerald-500/5 to-teal-500/5',
      sparkline: sparklineData[0],
      today: '+$2,450 today',
      monthly: '$92.4k target'
    },
    { 
      name: 'Active Employees', 
      value: '184', 
      icon: Users, 
      change: '+2.4%', 
      isPositive: true, 
      color: 'text-blue-500 bg-blue-50 border-blue-100',
      gradient: 'from-blue-500/5 to-indigo-500/5',
      sparkline: sparklineData[1],
      today: '+4 onboarded',
      monthly: '200 cap limit'
    },
    { 
      name: 'Stock Items', 
      value: '1,240 units', 
      icon: Package, 
      change: '-4.1%', 
      isPositive: false, 
      color: 'text-amber-500 bg-amber-50 border-amber-100',
      gradient: 'from-amber-500/5 to-orange-500/5',
      sparkline: sparklineData[2],
      today: '-12 dispatched',
      monthly: '3 warehouses'
    },
    { 
      name: 'Running Projects', 
      value: '12 active', 
      icon: Briefcase, 
      change: '+3 new', 
      isPositive: true, 
      color: 'text-purple-500 bg-purple-50 border-purple-100',
      gradient: 'from-purple-500/5 to-pink-500/5',
      sparkline: sparklineData[3],
      today: '2 in review',
      monthly: '15 scheduled'
    },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-900 animate-fade-in">
      
      {/* Dashboard Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time enterprise metrics & demand forecasts</p>
        </div>
        
        {/* Quick actions panel */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/workflows/inbox')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all duration-200 active:scale-[0.98]"
          >
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Approvals Queue</span>
          </button>
          
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={stat.name} className="card-premium p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br bg-white">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40 pointer-events-none`} />
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.name}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                }`}>
                  {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>

            {/* Sparkline integration */}
            <div className="h-10 mt-4 relative w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stat.sparkline.map((val, i) => ({ val, i }))}>
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke={stat.isPositive ? "#10B981" : "#EF4444"} 
                    strokeWidth={1.5} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-400 relative">
              <span>{stat.today}</span>
              <span className="text-slate-500 font-semibold">{stat.monthly}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Performance AreaChart */}
        <div className="lg:col-span-2 card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Financial Performance</h3>
                <span className="text-lg font-bold text-slate-800 tracking-tight mt-1 block">Monthly Revenue Overview</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Expenses
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialPerformance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.005}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.005}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Project Status PieChart / Donut */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Project Status</h3>
            <span className="text-lg font-bold text-slate-800 tracking-tight block">Deliveries Metric</span>
            <div className="h-56 flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
            {projectStatus.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }}></span>
                <span className="truncate">{entry.name}: <span className="text-slate-800 font-bold">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Level BarChart */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Warehouse Stock</h3>
            <span className="text-lg font-bold text-slate-800 tracking-tight block">Inventory levels</span>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryLevels} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="quantity" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Logs & AI Insights Widget */}
        <div className="lg:col-span-2 card-premium p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Logs</h3>
                <span className="text-lg font-bold text-slate-800 tracking-tight block mt-1">Audit trail monitoring</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live Secure
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {[
                { text: "Admin posted a double-entry transaction ($2,500.00 AP Invoice)", time: "10 mins ago", color: "text-blue-500 bg-blue-50" },
                { text: "Inventory alert: Steel Pipes fell below reorder level (10)", time: "25 mins ago", color: "text-amber-500 bg-amber-50" },
                { text: "System processed gross-to-net payroll runs for June 2026", time: "1 hour ago", color: "text-emerald-500 bg-emerald-50" },
                { text: "SCM generated Vendor request PO-2026-904", time: "2 hours ago", color: "text-slate-500 bg-slate-50" },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs hover:bg-slate-100/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 ${log.color}`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-slate-700 font-semibold">{log.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0 pl-2">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer" onClick={() => navigate('/security/audit')}>
              <span>View full audit log</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Active Session Isolation OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
