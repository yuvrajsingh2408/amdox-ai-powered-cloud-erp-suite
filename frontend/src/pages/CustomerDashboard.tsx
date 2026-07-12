import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  User, ClipboardList, CreditCard, ShieldAlert, Sparkles, 
  Loader2, Bell, BookOpen, ArrowUpRight, HelpCircle 
} from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

interface Metrics {
  totalOrdersCount: number;
  totalOrderedAmount: number;
  totalInvoicesCount: number;
  outstandingAmount: number;
  supportTicketsCount: number;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [spending, setSpending] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieve portal customer user ID
  const portalUserStr = localStorage.getItem('portal_user');
  const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
  const customerId = portalUser?.customerId || 'sample-customer-id';

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const mRes = await axios.get(`/api/portals/customer/dashboard?customerId=${customerId}`);
      setMetrics(mRes.data?.data || null);

      const sRes = await axios.get(`/api/portals/customer/spending?customerId=${customerId}`);
      setSpending(sRes.data?.data || null);

      const aRes = await axios.get('/api/portals/announcements?portal=CUSTOMER');
      setAnnouncements(aRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_type');
    localStorage.removeItem('portal_user');
    navigate('/portals');
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="h-5.5 w-5.5 text-indigo-400" />
            <span>Welcome, {portalUser?.firstName || 'Valued Customer'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Customer Portal Workspace • Account ID: {customerId}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/portals/customer/orders"
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            My Orders
          </Link>
          <Link
            to="/portals/customer/tickets"
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            Support Tickets
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-950/20 border border-rose-900/30 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Compiling client metrics dashboard...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Metrics grids */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Outstanding Balance</span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                ${metrics?.outstandingAmount?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Sales Orders</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.totalOrdersCount || 0}</h3>
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Invoices logged</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.totalInvoicesCount || 0}</h3>
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Open Tickets</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.supportTicketsCount || 0}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Spending Chart (Col span 2) */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">AI Customer Spending Analysis</h3>
                <span className="text-[9px] text-slate-500">Last 6 Months</span>
              </div>

              {spending?.recommendation && (
                <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center gap-2 relative">
                  <div className="absolute right-3 top-3 text-[8px] font-bold text-indigo-400 flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Copilot suggestions</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{spending.recommendation}"</p>
                </div>
              )}

              <div className="h-56 text-xs text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spending?.spendingData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Line type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Announcements Board (Col span 1) */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-indigo-400" />
                <span>Client Announcements</span>
              </h3>

              {announcements.length === 0 ? (
                <div className="text-center py-12 text-slate-655 text-xs">No announcements broadcasted.</div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a: any) => (
                    <div key={a.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-200">{a.title}</h4>
                      <p className="text-[10px] text-slate-550 leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;
export { CustomerDashboard };
