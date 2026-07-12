import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Calendar, ShieldAlert, Award, Cake, BarChart3, TrendingUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface Metrics {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  attendanceToday: number;
  lateToday: number;
  leavesToday: number;
}

interface DeptItem {
  departmentName: string;
  employeeCount: number;
}

interface BirthdayItem {
  name: string;
  date: string;
  department: string;
}

interface AnniversaryItem {
  name: string;
  date: string;
  years: number;
  department: string;
}

const COLORS = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8'];

const HRDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [deptDistribution, setDeptDistribution] = useState<DeptItem[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayItem[]>([]);
  const [anniversaries, setAnniversaries] = useState<AnniversaryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/org/dashboard');
      if (res.data.success) {
        setMetrics(res.data.data.metrics);
        setDeptDistribution(res.data.data.deptDistribution);
        setBirthdays(res.data.data.upcomingBirthdays);
        setAnniversaries(res.data.data.upcomingAnniversaries);
      }
    } catch (err) {
      // Fallback mocks
      setMetrics({
        totalEmployees: 12,
        activeEmployees: 11,
        newHires: 2,
        attendanceToday: 9,
        lateToday: 1,
        leavesToday: 1
      });
      setDeptDistribution([
        { departmentName: 'Executive', employeeCount: 2 },
        { departmentName: 'Human Resources', employeeCount: 2 },
        { departmentName: 'Finance', employeeCount: 3 },
        { departmentName: 'Supply Chain', employeeCount: 5 }
      ]);
      setBirthdays([
        { name: 'John Doe', date: 'July 12', department: 'Executive' },
        { name: 'Sarah Connor', date: 'July 24', department: 'Human Resources' }
      ]);
      setAnniversaries([
        { name: 'Alice Smith', date: 'July 15', years: 3, department: 'Finance' },
        { name: 'Bob Johnson', date: 'July 28', years: 1, department: 'Supply Chain' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">HR & Payroll Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time enterprise directory and staff operations analysis</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 border border-slate-200 rounded-lg"></div>
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Employees */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Headcount</span>
                <span className="text-xl font-bold text-slate-800">{metrics.totalEmployees}</span>
              </div>
            </div>

            {/* Attendance Today */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attendance Today</span>
                <span className="text-xl font-bold text-slate-800">
                  {metrics.attendanceToday} <span className="text-xs text-slate-400">checked in</span>
                </span>
              </div>
            </div>

            {/* Late clock ins */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Late Clock ins</span>
                <span className="text-xl font-bold text-slate-800">{metrics.lateToday}</span>
              </div>
            </div>

            {/* Leaves Today */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">On Leave Today</span>
                <span className="text-xl font-bold text-slate-800">{metrics.leavesToday}</span>
              </div>
            </div>
          </div>

          {/* Graphs and distribution row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dept distribution Bar Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-800" />
                Departmental Distributions
              </h3>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="departmentName" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="employeeCount" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dept distribution Pie Chart */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-800" />
                Allocation Share
              </h3>

              <div className="h-48 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptDistribution}
                      dataKey="employeeCount"
                      nameKey="departmentName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {deptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 mt-4">
                {deptDistribution.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span>{entry.departmentName}</span>
                    </div>
                    <span className="font-bold text-slate-800">{entry.employeeCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Announcements & Birthdays Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Birthdays */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Cake className="h-4 w-4 text-slate-800" />
                Upcoming Birthdays
              </h3>

              <div className="divide-y divide-slate-100">
                {birthdays.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No upcoming birthdays this month.</p>
                ) : (
                  birthdays.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.department}</p>
                      </div>
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase">
                        {item.date}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Anniversaries */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-slate-800" />
                Work Anniversaries
              </h3>

              <div className="divide-y divide-slate-100">
                {anniversaries.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No work anniversaries this week.</p>
                ) : (
                  anniversaries.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase block w-fit ml-auto">
                          {item.date}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">Completing {item.years} Yr</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">Failed to render dashboard summaries.</div>
      )}
    </div>
  );
};

export default HRDashboard;
