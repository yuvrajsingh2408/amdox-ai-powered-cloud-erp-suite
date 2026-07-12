import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Truck, ArrowLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Shipment {
  id: string;
  shipmentNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

const ShipmentTracking: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const portalType = localStorage.getItem('portal_type');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      if (portalType === 'VENDOR') {
        const res = await axios.get(`/api/portals/vendor/shipments?vendorId=${user.vendorId || 'sample-id'}`);
        setShipments(res.data?.data || []);
      } else {
        // Customer side mockup
        setShipments([
          { id: '1', shipmentNumber: 'SH-4401', carrier: 'DHL', status: 'IN_TRANSIT', estimatedDelivery: new Date(Date.now() + 86400000).toISOString() },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
          className="p-1 hover:bg-slate-900 rounded text-slate-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="h-5.5 w-5.5 text-indigo-400" />
            <span>Active Shipment Tracking</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Track transit pathways, check estimated arrival dates, and calculate delivery delays risks.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Connecting to logistics servers...</span>
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No current shipments flagged in transit.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Timeline Tracking boards (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            {shipments.map((s) => (
              <div key={s.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div>
                    <span className="font-bold text-slate-200">Carrier: {s.carrier} ({s.shipmentNumber})</span>
                    <p className="text-[10px] text-slate-550 block mt-0.5">Est. Arrival: {new Date(s.estimatedDelivery!).toLocaleString()}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase text-indigo-400 bg-indigo-950/20 border border-indigo-900/30">
                    {s.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative pt-4">
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '66%' }} />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-medium">
                    <span>Warehouse Load</span>
                    <span className="text-indigo-400 font-bold">In Transit</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI delay predictions (Col span 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Transit Predictor</h3>
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900 px-2 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Prediction</span>
              </div>

              <div className="space-y-2 pt-6">
                <h4 className="font-bold text-slate-250 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Shipment Delay Prediction: LOW</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  DHL flight routes show normal performance thresholds. Suggested delay offset risk is evaluated under 4%. Expected delivery matches target SLA timeline.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ShipmentTracking;
export { ShipmentTracking };
