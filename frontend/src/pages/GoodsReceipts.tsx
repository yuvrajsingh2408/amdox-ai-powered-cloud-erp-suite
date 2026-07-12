import React, { useState, useEffect } from 'react';
import { 
  Plus, ClipboardCheck, CheckCircle2, ShieldAlert, 
  Trash2, Play, Users, DollarSign, X, Check, Barcode 
} from 'lucide-react';
import axios from 'axios';

interface GRNItem {
  productId: string;
  quantityReceived: number;
  storageLocationName: string;
}

interface GRNLog {
  id: string;
  grNumber: string;
  receivedDate: string;
  partialReceive: boolean;
  damagedItems: number;
  purchaseOrder: {
    poNumber: string;
    vendor: { name: string };
  };
}

const GoodsReceipts: React.FC = () => {
  const [grns, setGrns] = useState<GRNLog[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Add GRN states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [partialReceive, setPartialReceive] = useState(false);
  const [damagedItems, setDamagedItems] = useState('0');
  const [items, setItems] = useState<GRNItem[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGRNData = async () => {
    setTableLoading(true);
    try {
      const grRes = await axios.get('/api/scm/grns');
      if (grRes.data.success) setGrns(grRes.data.data);

      const poRes = await axios.get('/api/scm/pos');
      if (poRes.data.success) {
        setPos(poRes.data.data.filter((po: any) => po.status !== 'RECEIVED' && po.status !== 'CANCELLED'));
      }

      const prodRes = await axios.get('/api/inventory/products');
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setGrns([
        { 
          id: 'gr1', grNumber: 'GRN-2026-0001', receivedDate: '2026-07-09T00:00:00Z', partialReceive: false, damagedItems: 0,
          purchaseOrder: { poNumber: 'PO-2026-0001', vendor: { name: 'Delta Manufacturing Corp' } }
        }
      ]);
      setPos([{ id: 'po1', poNumber: 'PO-2026-0001', items: [{ productId: 'p1', quantity: 10 }] }]);
      setProducts([{ id: 'p1', name: 'Dell server rack', sku: 'SV-RACK' }]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNData();
  }, []);

  const handlePOSelect = (poId: string) => {
    setPurchaseOrderId(poId);
    const target = pos.find(p => p.id === poId);
    if (target && target.items) {
      setItems(target.items.map((line: any) => ({
        productId: line.productId,
        quantityReceived: line.quantity,
        storageLocationName: 'Shelf A-1'
      })));
    } else {
      setItems([]);
    }
  };

  const handleItemChange = (idx: number, field: keyof GRNItem, value: any) => {
    const updated = [...items];
    if (field === 'quantityReceived') {
      updated[idx].quantityReceived = parseInt(value) || 0;
    } else if (field === 'storageLocationName') {
      updated[idx].storageLocationName = value;
    }
    setItems(updated);
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/scm/grns', {
        purchaseOrderId,
        receivedDate,
        partialReceive,
        damagedItems: parseInt(damagedItems) || 0,
        items
      });
      if (res.data.success) {
        setSuccess('Goods Receipt Note processed and inventory levels incremented successfully!');
        setIsModalOpen(false);
        setPurchaseOrderId('');
        setItems([]);
        fetchGRNData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Processing GRN failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Goods Receipt Notes (GRN)</h2>
          <p className="text-xs text-slate-500 font-medium">Verify inbound shipments, report transit damages, and check off items</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <ClipboardCheck className="h-4 w-4" />
          Log Inbound Shipment
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

      {/* GRN Registry Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">GRN Number</th>
                <th className="py-2.5 px-4">PO Reference</th>
                <th className="py-2.5 px-4">Vendor Supplier</th>
                <th className="py-2.5 px-4">Received Date</th>
                <th className="py-2.5 px-4">Partial Receipt</th>
                <th className="py-2.5 px-4">Damaged Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Loading GRN entries...</td></tr>
              ) : grns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    No goods receipt notes logged.
                  </td>
                </tr>
              ) : (
                grns.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{log.grNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">{log.purchaseOrder?.poNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-750">{log.purchaseOrder?.vendor?.name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(log.receivedDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-655">{log.partialReceive ? 'YES' : 'NO'}</td>
                    <td className={`py-3.5 px-4 font-bold ${log.damagedItems > 0 ? 'text-red-655' : 'text-slate-400'}`}>
                      {log.damagedItems} units
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inbound GRN Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Process Inbound Goods Receipt</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGRN} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Select Purchase Order</label>
                  <select
                    value={purchaseOrderId}
                    required
                    onChange={(e) => handlePOSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Approved PO</option>
                    {pos.map(po => <option key={po.id} value={po.id}>{po.poNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Received Date</label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 items-center">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partialReceive}
                    onChange={(e) => setPartialReceive(e.target.checked)}
                    className="rounded border-slate-300 focus:ring-0"
                  />
                  <span>This is a partial delivery receipt</span>
                </label>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Damaged Items count</label>
                  <input
                    type="number"
                    required
                    value={damagedItems}
                    onChange={(e) => setDamagedItems(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Items Allocation grid */}
              {items.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Allocate Quantities and Bins</label>
                  {items.map((line, idx) => {
                    const itemProduct = products.find(p => p.id === line.productId);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex-1 font-bold text-xs truncate">
                          {itemProduct?.sku} — {itemProduct?.name}
                        </span>
                        
                        <div className="w-20">
                          <input
                            type="number"
                            required
                            placeholder="Qty Received"
                            value={line.quantityReceived}
                            onChange={(e) => handleItemChange(idx, 'quantityReceived', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="text"
                            required
                            placeholder="Bin location (e.g. Shelf A-1)"
                            value={line.storageLocationName}
                            onChange={(e) => handleItemChange(idx, 'storageLocationName', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Register Receipt and Increment Stock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsReceipts;
