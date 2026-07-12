import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Truck, ClipboardList, CreditCard, ShieldAlert, Sparkles, 
  Loader2, Bell, BookOpen, BarChart3, Star, LogOut 
} from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

interface Metrics {
  purchaseOrdersCount: number;
  invoicesCount: number;
  supportTicketsCount: number;
  performanceScore: number;
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieve portal vendor user ID
  const portalUserStr = localStorage.getItem('portal_user');
  const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
  const vendorId = portalUser?.vendorId || 'sample-vendor-id';

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const mRes = await axios.get(`/api/portals/vendor/dashboard?vendorId=${vendorId}`);
      setMetrics(mRes.data?.data || null);

      const pRes = await axios.get(`/api/portals/vendor/performance?vendorId=${vendorId}`);
      setPerformance(pRes.data?.data || null);

      const aRes = await axios.get('/api/portals/announcements?portal=VENDOR');
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
            <Truck className="h-5.5 w-5.5 text-indigo-400" />
            <span>Welcome, {portalUser?.firstName || 'Valued Supplier'}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Vendor Portal Workspace • Vendor ID: {vendorId}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/portals/vendor/quotations"
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            Quotations
          </Link>
          <Link
            to="/portals/vendor/invoices"
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-855 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            Bills / Invoices
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
          <span className="text-xs">Compiling supplier metrics dashboard...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Stats grids */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Supplier Rating</span>
                <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.performanceScore || '4.0'} / 5.0</h3>
              </div>
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Purchase Orders</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.purchaseOrdersCount || 0}</h3>
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Submitted Invoices</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.invoicesCount || 0}</h3>
            </div>
            <div className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Open Tickets</span>
              <h3 className="text-lg font-extrabold text-white mt-1">{metrics?.supportTicketsCount || 0}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Performance charts (Col span 2) */}
            <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                <span>Supplier Compliance Performance History</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 border border-slate-900 bg-slate-950 p-4 rounded-xl">
                <div>
                  <span>On-time Delivery Rate:</span>
                  <strong className="block text-emerald-400 text-sm mt-0.5">{performance?.onTimeDeliveryRate || '94'}%</strong>
                </div>
                <div>
                  <span>Quality Compliance Rate:</span>
                  <strong className="block text-indigo-400 text-sm mt-0.5">{performance?.complianceRate || '98'}%</strong>
                </div>
              </div>

              <div className="h-56 text-xs text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance?.scoreData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[0, 5]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="rating" name="Rating Index" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Announcements Board (Col span 1) */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-indigo-400" />
                <span>Supplier Announcements</span>
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

export default VendorDashboard;
export { VendorDashboard };
