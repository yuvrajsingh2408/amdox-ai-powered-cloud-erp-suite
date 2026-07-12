import React, { useState, useEffect } from 'react';
import { 
  Plus, FileText, CheckCircle2, ShieldAlert, 
  Trash2, ArrowUpRight, Scale, Clock, RefreshCw, X 
} from 'lucide-react';
import axios from 'axios';

interface PRItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: { name: string; sku: string };
}

interface Requisition {
  id: string;
  prNumber: string;
  reason: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  requester?: { firstName: string; lastName: string };
  department?: { name: string };
  vendor?: { name: string };
  items: PRItem[];
}

const PurchaseRequisitions: React.FC = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // Add PR states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [reason, setReason] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [items, setItems] = useState<PRItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPRData = async () => {
    setTableLoading(true);
    try {
      const prRes = await axios.get('/api/scm/requisitions');
      if (prRes.data.success) setRequisitions(prRes.data.data);

      const deptRes = await axios.get('/api/departments');
      if (deptRes.data.success) setDepartments(deptRes.data.data);

      const prodRes = await axios.get('/api/inventory/products');
      if (prodRes.data.success) setProducts(prodRes.data.data);

      const vendRes = await axios.get('/api/scm/vendors');
      if (vendRes.data.success) setVendors(vendRes.data.data);
    } catch (err) {
      // Mock fallbacks
      setRequisitions([
        { 
          id: 'pr1', prNumber: 'PR-2026-0001', reason: 'Replacement server equipment', status: 'PENDING_DEPT', totalAmount: 4800, createdAt: '2026-07-09T00:00:00Z',
          requester: { firstName: 'Alice', lastName: 'HR' }, department: { name: 'IT Infrastructure' }, items: []
        },
        { 
          id: 'pr2', prNumber: 'PR-2026-0002', reason: 'Office supplies restock', status: 'PENDING_FINANCE', totalAmount: 350, createdAt: '2026-07-08T00:00:00Z',
          requester: { firstName: 'Bob', lastName: 'Finance' }, department: { name: 'Corporate Operations' }, items: []
        }
      ]);
      setDepartments([{ id: 'd1', name: 'IT Infrastructure' }, { id: 'd2', name: 'Corporate Operations' }]);
      setProducts([{ id: 'p1', name: 'Dell server rack', sku: 'SV-RACK' }, { id: 'p2', name: 'A4 printing paper package', sku: 'PAP-A4' }]);
      setVendors([{ id: 'v1', name: 'Apex Imports' }]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPRData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof PRItem, value: any) => {
    const updated = [...items];
    if (field === 'productId') {
      updated[idx].productId = value;
      // Auto fill price from catalog
      const target = products.find(p => p.id === value);
      if (target) {
        updated[idx].unitPrice = target.unitPrice;
      }
    } else if (field === 'quantity') {
      updated[idx].quantity = parseInt(value) || 1;
    } else if (field === 'unitPrice') {
      updated[idx].unitPrice = parseFloat(value) || 0;
    }
    setItems(updated);
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/scm/requisitions', {
        departmentId,
        reason,
        vendorId: vendorId || undefined,
        items
      });
      if (res.data.success) {
        setSuccess('Purchase requisition submitted to department manager approval queue!');
        setIsModalOpen(false);
        setReason('');
        setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
        fetchPRData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'PR submit failed. Ensure your user profile is mapped to an Employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`/api/scm/requisitions/${id}/approve`);
      if (res.data.success) {
        setSuccess(res.data.message);
        fetchPRData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Approve requisition level checkoff failed');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Requisitions (PR)</h2>
          <p className="text-xs text-slate-500 font-medium">Create departmental purchase requests, map cost codes, and complete validations</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Raise Purchase Request
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

      {/* PR List Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">PR Number</th>
                <th className="py-2.5 px-4">Requester</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Reason / Details</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                <tr><td colSpan={7} className="py-6 text-center text-slate-400">Loading PR items...</td></tr>
              ) : requisitions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                    No purchase requisitions logged.
                  </td>
                </tr>
              ) : (
                requisitions.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{pr.prNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {pr.requester ? `${pr.requester.firstName} ${pr.requester.lastName}` : 'System'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{pr.department?.name || 'Operations'}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{pr.reason}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">${pr.totalAmount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                        pr.status === 'APPROVED' 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : pr.status === 'PENDING_FINANCE'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {pr.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(pr.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Approve
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

      {/* Raise PR Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-xl overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Submit Purchase Request</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePR} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Requester Department</label>
                  <select
                    value={departmentId}
                    required
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Preferred Vendor</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Preferred Vendor (Optional)</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Business justification</label>
                <input
                  type="text"
                  required
                  placeholder="Justification logic (e.g. IT lab printer toner replenishment)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Request Items</label>
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
                  + Add Item
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Submit to Approval pipeline
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequisitions;
