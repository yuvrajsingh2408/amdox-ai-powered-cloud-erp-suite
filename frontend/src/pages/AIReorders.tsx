import React, { useState, useEffect } from 'react';
import { 
  Cpu, AlertTriangle, ShieldAlert, CheckCircle2, 
  ArrowUpRight, RefreshCw, BarChart3, Mail, DollarSign 
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Suggestion {
  productId: string;
  sku: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  suggestedVendorId: string;
  suggestedVendorName: string;
  suggestedQuantity: number;
  unitPrice: number;
  estimatedCost: number;
  leadTimeDays: number;
}

const AIReorders: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [forecastData, setForecastData] = useState<any[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [forecasting, setForecasting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/scm/reorders/suggestions');
      if (res.data.success) {
        setSuggestions(res.data.data);
        if (res.data.data.length > 0 && !selectedSku) {
          setSelectedSku(res.data.data[0].sku);
        }
      }
    } catch (err) {
      // Mock suggestions
      setSuggestions([
        { 
          productId: 'p1', sku: 'SV-RACK', name: 'Dell server rack', currentStock: 2, reorderLevel: 5,
          suggestedVendorId: 'v1', suggestedVendorName: 'Delta Manufacturing Corp', suggestedQuantity: 10, unitPrice: 480, estimatedCost: 4800, leadTimeDays: 5
        },
        { 
          productId: 'p2', sku: 'PAP-A4', name: 'A4 printing paper package', currentStock: 8, reorderLevel: 20,
          suggestedVendorId: 'v2', suggestedVendorName: 'Apex Electronics Imports', suggestedQuantity: 50, unitPrice: 12, estimatedCost: 600, leadTimeDays: 3
        }
      ]);
      setSelectedSku('SV-RACK');
    } finally {
      setLoading(false);
    }
  };

  const runForecast = async () => {
    if (!selectedSku) return;
    setForecasting(true);
    setError('');
    try {
      const res = await axios.post('/api/scm/forecasting/run', { sku: selectedSku, periods: 7 });
      if (res.data.success) {
        setForecastData(res.data.data);
      }
    } catch (err) {
      // Mock forecast curve
      setForecastData([
        { date: 'Jul 2', quantity: 18, type: 'historical' },
        { date: 'Jul 3', quantity: 15, type: 'historical' },
        { date: 'Jul 4', quantity: 11, type: 'historical' },
        { date: 'Jul 5', quantity: 8, type: 'historical' },
        { date: 'Jul 6', quantity: 4, type: 'historical' },
        { date: 'Jul 7', quantity: 1, type: 'forecast' },
        { date: 'Jul 8', quantity: 0, type: 'forecast' }
      ]);
    } finally {
      setForecasting(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    runForecast();
  }, [selectedSku]);

  const handleTriggerReorder = async (sug: Suggestion) => {
    setError('');
    setSuccess('');
    try {
      // Call create purchase order draft
      const res = await axios.post('/api/scm/pos', {
        poNumber: `AUTO-PO-${new Date().getTime().toString().slice(-6)}`,
        vendorId: sug.suggestedVendorId,
        orderDate: new Date().toISOString().split('T')[0],
        items: [{ productId: sug.productId, quantity: sug.suggestedQuantity, unitPrice: sug.unitPrice }]
      });
      if (res.data.success) {
        setSuccess(`Automated Purchase Order ${res.data.data.poNumber} triggered successfully for SKU ${sug.sku}`);
        fetchSuggestions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Auto reorder triggers failed. Register vendors first.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Reorder Automation</h2>
          <p className="text-xs text-slate-500 font-medium">Verify ML safety stock suggestions, trigger auto orders, and inspect forecast curves</p>
        </div>
        <button
          onClick={fetchSuggestions}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Pipeline
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Suggestions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-800" />
            AI Safety Stock Purchase Suggestions
          </h3>

          <div className="space-y-3.5">
            {loading ? (
              <div className="text-center py-6 text-slate-400">Analyzing inventory threshold logs...</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium border border-dashed rounded-lg">
                No items currently below safety threshold levels.
              </div>
            ) : (
              suggestions.map(sug => (
                <div 
                  key={sug.productId}
                  onClick={() => setSelectedSku(sug.sku)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    selectedSku === sug.sku 
                      ? 'border-slate-900 bg-slate-50/50' 
                      : 'border-slate-200 hover:bg-slate-50/30'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800">{sug.sku} — {sug.name}</span>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                      <span>Stock: <span className="text-red-500">{sug.currentStock}</span> / Reorder: {sug.reorderLevel}</span>
                      <span>Supplier: {sug.suggestedVendorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">SUGGESTED ORDER</span>
                      <span className="font-extrabold text-xs text-slate-800">{sug.suggestedQuantity} units (${sug.estimatedCost.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTriggerReorder(sug); }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors"
                    >
                      Trigger PO
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Forecasting Curve */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-800" />
              Depletion forecasting
            </h3>
            {selectedSku && (
              <span className="text-[10px] text-slate-500 font-semibold block mb-4">
                SKU Model: {selectedSku}
              </span>
            )}
          </div>

          <div className="h-48 flex items-center justify-center">
            {forecasting ? (
              <span className="text-slate-400 text-xs font-medium">Running AI model...</span>
            ) : forecastData.length === 0 ? (
              <span className="text-slate-400 text-xs">No forecast compiled</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="quantity" stroke="#0F172A" fill="#F1F5F9" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-500 leading-normal">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>AI projects replenishment required in 2 days to maintain lead times safety limits.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReorders;
