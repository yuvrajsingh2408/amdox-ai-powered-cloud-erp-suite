import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight, ShieldCheck, ShoppingCart, Archive } from 'lucide-react';

const SCMReportsAdvanced: React.FC = () => {
  const navigate = useNavigate();

  const presets = [
    { title: 'Warehouse Stock Valuation & Levels', filter: {}, desc: 'Total physical catalog units counted, unit prices, and warehouse locations.' },
    { title: 'Low Stock Restock Alerts', filter: { status: 'LOW_STOCK' }, desc: 'Identifies items whose inventory levels have fallen below safety limits.' },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Truck className="h-5.5 w-5.5 text-blue-400" />
          <span>Advanced SCM & Inventory Reports</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Stock levels count, warehouse bins placement layouts, and low stock replenishment planning sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presets.map((p, idx) => (
          <div key={idx} className="p-6 bg-[#0F172A] border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="bg-blue-950/40 p-2.5 w-fit rounded border border-blue-900/30 text-blue-400">
                <Archive className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>

            <button
              onClick={() => navigate('/reports/builder', { state: { template: { title: p.title, module: 'SCM', filters: JSON.stringify(p.filter), chartType: 'BAR', fileType: 'CSV' } } })}
              className="w-full text-center py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <span>Build SCM Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SCMReportsAdvanced;
export { SCMReportsAdvanced };
