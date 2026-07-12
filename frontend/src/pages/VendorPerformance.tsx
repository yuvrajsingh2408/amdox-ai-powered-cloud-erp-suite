import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, Star } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const VendorPerformance: React.FC = () => {
  const navigate = useNavigate();

  const chartData = [
    { month: 'Jan', compliance: 95, delivery: 90 },
    { month: 'Feb', compliance: 98, delivery: 94 },
    { month: 'Mar', compliance: 97, delivery: 93 },
    { month: 'Apr', compliance: 99, delivery: 95 },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/portals/vendor/dashboard')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="h-5.5 w-5.5 text-indigo-400" />
            <span>Supplier Performance Review Scorecard</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Check fulfillment rates, cost variance metrics, and quality ratings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Scorecard metrics */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Fulfillment Compliance Rate</h3>
          
          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 border border-slate-950 p-4 rounded-xl">
            <div>
              <span>On-time Delivery:</span>
              <strong className="block text-emerald-400 text-sm mt-0.5">94.5%</strong>
            </div>
            <div>
              <span>Defect Rate Compliance:</span>
              <strong className="block text-indigo-400 text-sm mt-0.5">99.1%</strong>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Metrics trends</h3>
          
          <div className="h-48 text-xs text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="compliance" name="Quality Score" fill="#10b981" />
                <Bar dataKey="delivery" name="On-Time Rate" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VendorPerformance;
export { VendorPerformance };
