import React, { useState, useEffect } from 'react';
import { 
  FileText, Printer, ShieldAlert, CheckCircle2, 
  Layers, RefreshCw, BarChart2, Coins, ArrowUpRight 
} from 'lucide-react';
import axios from 'axios';

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  quantityInStock: number;
  unitPrice: number;
  category: string;
  hsnCode: string | null;
  gstRate: number | null;
}

interface MovementLog {
  id: string;
  date: string;
  type: string;
  quantity: number;
  product?: { sku: string; name: string };
}

const SCMReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'stock' | 'abc' | 'movements'>('stock');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [movements, setMovements] = useState<MovementLog[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const prodRes = await axios.get('/api/inventory/products');
      if (prodRes.data.success) setProducts(prodRes.data.data);

      const mvRes = await axios.get('/api/inventory/movements');
      if (mvRes.data.success) setMovements(mvRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setProducts([
        { id: '1', sku: 'SV-RACK', name: 'Dell server rack', quantityInStock: 10, unitPrice: 480, category: 'Hardware', hsnCode: '84713010', gstRate: 18.0 },
        { id: '2', sku: 'PAP-A4', name: 'A4 printing paper package', quantityInStock: 250, unitPrice: 32, category: 'Supplies', hsnCode: '4802', gstRate: 12.0 },
        { id: '3', sku: 'HD-1TB', name: 'External HD 1TB USB3', quantityInStock: 3, unitPrice: 85, category: 'Hardware', hsnCode: '8471', gstRate: 18.0 }
      ]);
      setMovements([
        { id: 'mv1', date: '2026-07-09T00:00:00Z', type: 'IN', quantity: 10, product: { sku: 'SV-RACK', name: 'Dell server rack' } },
        { id: 'mv2', date: '2026-07-08T00:00:00Z', type: 'ADJUSTMENT', quantity: 2, product: { sku: 'PAP-A4', name: 'A4 printing paper package' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [activeReport]);

  const handlePrint = () => {
    window.print();
  };

  // Compute ABC classes
  const abcClassified = products.map(p => {
    const totalVal = p.quantityInStock * p.unitPrice;
    let abcClass = 'C';
    if (totalVal >= 4000) abcClass = 'A';
    else if (totalVal >= 1000) abcClass = 'B';
    return { ...p, totalVal, abcClass };
  }).sort((a, b) => b.totalVal - a.totalVal);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & ABC Reports</h2>
          <p className="text-xs text-slate-500 font-medium">Generate stock valuation totals, audit movement history, and inspect classifications</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchReportsData}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recalculate
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold w-fit print:hidden">
        <button
          onClick={() => setActiveReport('stock')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeReport === 'stock' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Stock Master Inventory
        </button>
        <button
          onClick={() => setActiveReport('abc')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeReport === 'abc' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          ABC Value Analysis
        </button>
        <button
          onClick={() => setActiveReport('movements')}
          className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeReport === 'movements' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Stock Movement Log
        </button>
      </div>

      {/* Report display page */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
        {/* Company Header */}
        <div className="text-center border-b border-slate-100 pb-5 space-y-1">
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Amdox ERP Corp</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Supply Chain & Inventory Management</p>
          <h2 className="font-bold text-sm text-slate-800 uppercase pt-2">
            {activeReport === 'stock' && 'Stock Valuation Report'}
            {activeReport === 'abc' && 'ABC Stock Classification'}
            {activeReport === 'movements' && 'Stock Movement Audits'}
          </h2>
          <span className="text-[10px] text-slate-450 block font-medium">
            Reporting Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading ledger data...</div>
        ) : (
          <div className="text-xs text-slate-700 font-medium">
            {/* 1. STOCK MASTER TABLE */}
            {activeReport === 'stock' && (
              <div className="space-y-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-350 font-bold text-slate-800 uppercase text-[9px] tracking-wider">
                      <th className="py-2">SKU</th>
                      <th className="py-2">Item Name</th>
                      <th className="py-2 text-right">In-Stock</th>
                      <th className="py-2 text-right">Unit Cost</th>
                      <th className="py-2">HSN Code</th>
                      <th className="py-2 text-right">Tax (GST)</th>
                      <th className="py-2 text-right">Total Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5 font-mono font-bold text-slate-800">{p.sku}</td>
                        <td className="py-2.5 font-semibold text-slate-750">{p.name}</td>
                        <td className="py-2.5 text-right font-mono">{p.quantityInStock}</td>
                        <td className="py-2.5 text-right font-mono">${p.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-400 font-mono">{p.hsnCode || '—'}</td>
                        <td className="py-2.5 text-right font-mono">{p.gstRate || 18.0}%</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-800">
                          ${(p.quantityInStock * p.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-300 font-bold text-slate-850 text-right">
                      <td colSpan={6} className="py-3 text-left uppercase text-[9px]">Grand Total Inventory Assets</td>
                      <td className="py-3 border-b-4 border-double border-slate-950 font-mono text-sm">
                        ${products.reduce((sum, p) => sum + (p.quantityInStock * p.unitPrice), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. ABC ANALYSIS */}
            {activeReport === 'abc' && (
              <div className="space-y-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-350 font-bold text-slate-800 uppercase text-[9px] tracking-wider">
                      <th className="py-2">ABC Class</th>
                      <th className="py-2">SKU</th>
                      <th className="py-2">Item Name</th>
                      <th className="py-2 text-right">Total Valuation</th>
                      <th className="py-2 text-right">% Cumulative Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {abcClassified.map(p => (
                      <tr key={p.id}>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            p.abcClass === 'A' 
                              ? 'bg-slate-900 text-white' 
                              : p.abcClass === 'B' 
                              ? 'bg-slate-200 text-slate-800' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            Class {p.abcClass}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono font-bold text-slate-800">{p.sku}</td>
                        <td className="py-2.5 font-semibold text-slate-750">{p.name}</td>
                        <td className="py-2.5 text-right font-mono font-bold">${p.totalVal.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-mono">
                          {((p.totalVal / abcClassified.reduce((sum, a) => sum + a.totalVal, 0)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. MOVEMENT LOGS */}
            {activeReport === 'movements' && (
              <div className="space-y-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-350 font-bold text-slate-800 uppercase text-[9px] tracking-wider">
                      <th className="py-2">Date</th>
                      <th className="py-2">SKU Reference</th>
                      <th className="py-2">Product Name</th>
                      <th className="py-2">Movement Type</th>
                      <th className="py-2 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((log, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="py-2.5 font-mono font-bold text-slate-800">{log.product?.sku}</td>
                        <td className="py-2.5 font-semibold text-slate-750">{log.product?.name}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                            log.type === 'IN' 
                              ? 'bg-green-50 border-green-200 text-green-700' 
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">{log.quantity} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SCMReports;
