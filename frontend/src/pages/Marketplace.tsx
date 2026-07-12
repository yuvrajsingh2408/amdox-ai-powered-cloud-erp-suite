import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, Star, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Package {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await axios.get('/api/admin/plugins');
        setPackages(res.data?.data?.marketplace || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplace();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-5.5 w-5.5 text-indigo-400" />
            <span>Plugin Marketplace</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Install customized functional modules, integrations, and tools developed by our partner network.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Connecting to Marketplace directory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          {packages.map((pkg) => (
            <div key={pkg.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{pkg.category}</span>
                  <span className="text-indigo-400 font-bold">{pkg.price === 0 ? 'FREE' : `$${pkg.price}`}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-200">{pkg.name}</h3>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-900/60 font-medium">
                <span className="flex items-center gap-1 text-[10px] text-yellow-500">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span>{pkg.rating} / 5.0</span>
                </span>
                <button
                  onClick={() => alert(`Installing package ${pkg.name}...`)}
                  className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 rounded-lg text-slate-300 font-bold hover:text-white"
                >
                  Install Addon
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
export { Marketplace };
