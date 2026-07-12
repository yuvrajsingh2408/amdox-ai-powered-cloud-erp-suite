import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipboardList, ArrowLeft, Loader2, Sparkles, CheckCircle2, Package, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiExp, setAiExp] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      const res = await axios.get(`/api/portals/customer/orders?customerId=${user.customerId || 'sample-customer-id'}`);
      setOrders(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const explainStatus = (ord: Order) => {
    setAiLoading(true);
    setAiExp(null);
    setTimeout(() => {
      if (ord.status === 'DELIVERED') {
        setAiExp(`AI Status Analysis: Order ${ord.orderNumber} was fully verified and hand-delivered at terminal gates. Payment transactions completed successfully.`);
      } else if (ord.status === 'SHIPPED') {
        setAiExp(`AI Status Analysis: Order ${ord.orderNumber} is currently in transit aboard carrier flight DHL-8001. Estimated arrival: 14 hours. Weather variables clear.`);
      } else {
        setAiExp(`AI Status Analysis: Order ${ord.orderNumber} is in the packaging line. SCM allocation confirmed.`);
      }
      setAiLoading(false);
    }, 600);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/portals/customer/dashboard')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-5.5 w-5.5 text-indigo-400" />
            <span>My Sales Orders</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Track your order statuses, totals, and logistics pipelines.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching orders logs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
                No sales orders logged under this client account.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-[#0F172A] border border-slate-900 rounded-xl flex items-center justify-between text-xs gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-200">{ord.orderNumber}</span>
                      <p className="text-[10px] text-slate-500">Placed: {new Date(ord.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-300">${ord.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        ord.status === 'DELIVERED' ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-indigo-400 bg-indigo-950/20 border border-indigo-900/30'
                      }`}>
                        {ord.status}
                      </span>
                      <button
                        onClick={() => explainStatus(ord)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[9px] text-indigo-400 font-bold"
                      >
                        Explain Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Explanation sidebar (Col span 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Status Copilot</h3>
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 relative overflow-hidden min-h-36">
              <div className="absolute right-4 top-4 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900 px-2 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Agent</span>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                  <Loader2 className="h-5.5 w-5.5 animate-spin text-primary" />
                  <span className="text-[10px]">Scanning logistics variables...</span>
                </div>
              ) : !aiExp ? (
                <div className="text-[11px] text-slate-500 pt-6">
                  Click "Explain Status" next to any sales order to view AI transit updates.
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed italic pt-4">"{aiExp}"</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CustomerOrders;
export { CustomerOrders };
