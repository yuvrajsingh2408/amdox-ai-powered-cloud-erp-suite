import React, { useState, useEffect } from 'react';
import { Truck, ShoppingCart } from 'lucide-react';
import axios from 'axios';

interface Vendor {
  id: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: { name: string };
  totalAmount: number;
  status: string;
  orderDate: string;
}

const SCM: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'vendors' | 'pos'>('vendors');

  const fetchSCM = async () => {
    try {
      const vRes = await axios.get('/api/scm/vendors');
      if (vRes.data.status === 'success') setVendors(vRes.data.data);
      
      const poRes = await axios.get('/api/scm/pos');
      if (poRes.data.status === 'success') setPos(poRes.data.data);
    } catch (err) {
      setVendors([
        { id: '1', name: 'Alum Smelters Corp.', code: 'VND-001', contactName: 'Frank Gable', email: 'sales@alumsmelters.com', phone: '555-9081' },
        { id: '2', name: 'Nippon Steel Piping', code: 'VND-002', contactName: 'Kenji Sato', email: 'pipes@nipponsteel.jp', phone: '555-4029' },
        { id: '3', name: 'Poly Plastics Supply', code: 'VND-003', contactName: 'Lisa Miller', email: 'lisa@polyplastics.com', phone: '555-1212' },
      ]);

      setPos([
        { id: '1', poNumber: 'PO-2026-904', vendor: { name: 'Nippon Steel Piping' }, totalAmount: 4500.00, status: 'APPROVED', orderDate: '2026-06-20' },
        { id: '2', poNumber: 'PO-2026-905', vendor: { name: 'Alum Smelters Corp.' }, totalAmount: 7800.00, status: 'DRAFT', orderDate: '2026-06-25' },
      ]);
    }
  };

  useEffect(() => {
    fetchSCM();
  }, []);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Supply Chain Management (SCM)</h2>
          <p className="text-xs text-slate-500 font-medium">Verify vendors, submit purchase orders, and validate goods receipt notes</p>
        </div>

        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs font-semibold self-start md:self-center">
          <button
            onClick={() => setActiveSubTab('vendors')}
            className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeSubTab === 'vendors' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Vendor Directory
          </button>
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`px-3 py-1.5 rounded-md transition-all duration-150 ${activeSubTab === 'pos' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {/* Vendors Sub-tab */}
      {activeSubTab === 'vendors' && (
        <div className="card-premium p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Supplier Registry
            </h3>
            <button className="btn-primary">
              + Register Vendor
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Supplier Name</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">{vendor.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{vendor.name}</td>
                    <td className="py-3 px-4 text-slate-500">{vendor.contactName}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{vendor.email}</td>
                    <td className="py-3 px-4 text-slate-400">{vendor.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POs Sub-tab */}
      {activeSubTab === 'pos' && (
        <div className="card-premium p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Purchase Orders Ledger
            </h3>
            <button className="btn-primary">
              + Generate PO
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">PO Number</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Date Raised</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">{po.poNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{po.vendor.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{po.orderDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">${po.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={po.status === 'APPROVED' ? 'badge-success' : 'badge-neutral'}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SCM;
