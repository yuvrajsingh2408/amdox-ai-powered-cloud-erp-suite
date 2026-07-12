import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  seatLimit: number;
  storageGb: number;
  aiCredits: number;
}

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get('/api/admin/license/plans');
        setPlans(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5.5 w-5.5 text-indigo-400" />
            <span>Subscription Billing Plans</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Explore corporate service subscription plans, credit allowances, and scaling features.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Gathering system tiers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          {plans.map((p) => (
            <div key={p.id} className="p-6 bg-[#0F172A] border border-slate-900 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-extrabold text-white">{p.name}</h3>
                  <span className="text-lg font-black text-indigo-400 mt-2 block">${p.price} / month</span>
                </div>
                <div className="space-y-2.5 text-slate-350">
                  <p>✔ Includes Up to {p.seatLimit} users seats</p>
                  <p>✔ Storage limit: {p.storageGb} GB SSD space</p>
                  <p>✔ AI Credits allocated: {p.aiCredits} calls</p>
                </div>
              </div>

              <button className="w-full text-center py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors">
                Select Pricing Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
export { SubscriptionPlans };
