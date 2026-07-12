import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, FileText, CheckCircle2, ShieldAlert, 
  Trash2, FileDown, Printer, RefreshCw, X 
} from 'lucide-react';
import axios from 'axios';

interface POItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: { name: string; sku: string };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  totalAmount: number;
  orderDate: string;
  status: string;
  vendor: { name: string; code: string };
  items: POItem[];
}

const PurchaseOrders: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Add PO states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [items, setItems] = useState<POItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

  // Print layout state
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPOData = async () => {
    setTableLoading(true);
    try {
      const poRes = await axios.get('/api/scm/pos');
      if (poRes.data.success) {
        setPos(poRes.data.data);
      }

      const vendRes = await axios.get('/api/scm/vendors');
      if (vendRes.data.success) setVendors(vendRes.data.data);

      const prodRes = await axios.get('/api/inventory/products');
      if (prodRes.data.success) setProducts(prodRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setPos([
        { 
          id: 'po1', poNumber: 'PO-2026-0001', totalAmount: 4800, orderDate: '2026-07-09T00:00:00Z', status: 'APPROVED',
          vendor: { name: 'Delta Manufacturing Corp', code: 'VEND-001' },
          items: [{ productId: 'p1', quantity: 10, unitPrice: 480, product: { name: 'Dell server rack', sku: 'SV-RACK' } }]
        },
        {
          id: 'po2', poNumber: 'PO-2026-0002', totalAmount: 3200, orderDate: '2026-07-08T00:00:00Z', status: 'DRAFT',
          vendor: { name: 'Global Logistics Partners', code: 'VEND-002' },
          items: [{ productId: 'p2', quantity: 100, unitPrice: 32, product: { name: 'A4 printing paper package', sku: 'PAP-A4' } }]
        }
      ]);
      setVendors([{ id: 'v1', name: 'Delta Manufacturing Corp' }]);
      setProducts([{ id: 'p1', name: 'Dell server rack', sku: 'SV-RACK', unitPrice: 480 }]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPOData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof POItem, value: any) => {
    const updated = [...items];
    if (field === 'productId') {
      updated[idx].productId = value;
      // Auto fill price
      const target = products.find(p => p.id === value);
      if (target) updated[idx].unitPrice = target.unitPrice;
    } else if (field === 'quantity') {
      updated[idx].quantity = parseInt(value) || 1;
    } else if (field === 'unitPrice') {
      updated[idx].unitPrice = parseFloat(value) || 0;
    }
    setItems(updated);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/scm/pos', {
        poNumber,
        vendorId,
        orderDate,
        items
      });
      if (res.data.success) {
        setSuccess('Purchase order created successfully!');
        setIsModalOpen(false);
        setPoNumber('');
        setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
        fetchPOData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create PO');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`/api/scm/pos/${id}/cancel`);
      if (res.data.success) {
        setSuccess('Purchase order cancelled successfully.');
        fetchPOData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel PO');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Orders (PO)</h2>
          <p className="text-xs text-slate-500 font-medium">Verify outbound orders, track amendments, and print supplier documentation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPOData}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Raise Purchase Order
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl print:hidden">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl print:hidden">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* PO List Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">PO Number</th>
                <th className="py-2.5 px-4">Vendor</th>
                <th className="py-2.5 px-4">Total Amount</th>
                <th className="py-2.5 px-4">Order Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Loading purchase orders...</td></tr>
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    No purchase orders logged.
                  </td>
                </tr>
              ) : (
                pos.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{po.poNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-750">{po.vendor?.name || 'Unknown'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">${po.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(po.orderDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        po.status === 'RECEIVED' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : po.status === 'APPROVED'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : po.status === 'CANCELLED'
                          ? 'bg-red-50 border-red-200 text-red-705'
                          : 'bg-amber-50 border-amber-200 text-amber-707'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPO(po)}
                        className="px-2 py-1 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200 transition-colors"
                      >
                        Inspect / Print
                      </button>
                      {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
                        <button
                          onClick={() => handleCancel(po.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[10px] font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Log Outbound Purchase Order</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">PO Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-2026-9011"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Vendor Supplier</label>
                  <select
                    value={vendorId}
                    required
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Order Date</label>
                <input
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Items to Order</label>
                {items.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={line.productId}
                      required
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">Select Catalog Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                    </select>
                    <div className="w-16">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Price"
                        value={line.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-right font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-bold rounded"
                >
                  + Add Line
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Save and Finalize Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PO Inspect / Print Layout */}
      {selectedPO && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 print:relative print:bg-white print:inset-auto">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden font-sans print:shadow-none print:border-none">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 text-[10px]">Purchase Order Details</h4>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print PO
                </button>
                <button onClick={() => setSelectedPO(null)} className="text-slate-400 hover:text-slate-655">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-xs text-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-none">Amdox ERP Corp</h1>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-1">Outbound Purchase Order Documentation</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPO.poNumber}</span>
                  <span className="text-[10px] text-slate-400 block font-medium mt-1">Date: {new Date(selectedPO.orderDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">To Supplier</span>
                  <span className="font-bold text-slate-850">{selectedPO.vendor?.name}</span>
                  <span className="text-slate-550 block mt-1">Code: {selectedPO.vendor?.code}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Shipping Details</span>
                  <span className="font-semibold text-slate-750">Operating Warehouse A</span>
                  <span className="text-slate-500 block mt-1">Industrial park Terminal 2</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 font-bold text-slate-800 uppercase text-[9px]">
                    <th className="py-2">Item description</th>
                    <th className="py-2 text-right">Quantity</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO.items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold">
                        {line.product?.sku} — {line.product?.name}
                      </td>
                      <td className="py-2.5 text-right font-mono">{line.quantity}</td>
                      <td className="py-2.5 text-right font-mono">${line.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono font-bold">${(line.quantity * line.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-300 font-bold text-slate-850 text-right">
                    <td colSpan={3} className="py-3 text-left uppercase text-[9px]">Grand Total</td>
                    <td className="py-3 border-b-4 border-double border-slate-950 font-mono text-sm">
                      ${selectedPO.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
