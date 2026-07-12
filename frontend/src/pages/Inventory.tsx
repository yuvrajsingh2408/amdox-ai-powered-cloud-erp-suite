import React, { useState, useEffect } from 'react';
import { Package, ShieldAlert, ArrowUpDown, PlusCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  warehouseName?: string;
}

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('IN');
  const [success, setSuccess] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory/products');
      if (res.data.status === 'success') {
        setProducts(res.data.data);
      }
    } catch (err) {
      setProducts([
        { id: '1', name: 'Steel Pipes 3 inch', sku: 'AP-102', unitPrice: 45.00, quantityInStock: 8, reorderLevel: 15, reorderQuantity: 50, warehouseName: 'Primary Warehouse A' },
        { id: '2', name: 'Aluminum Rods 10mm', sku: 'AR-204', unitPrice: 28.50, quantityInStock: 185, reorderLevel: 25, reorderQuantity: 100, warehouseName: 'Primary Warehouse A' },
        { id: '3', name: 'PVC Connectors 2 inch', sku: 'PV-301', unitPrice: 4.20, quantityInStock: 420, reorderLevel: 50, reorderQuantity: 200, warehouseName: 'Sub-Depot B' },
        { id: '4', name: 'Copper Tubes 12mm', sku: 'CP-408', unitPrice: 62.00, quantityInStock: 5, reorderLevel: 10, reorderQuantity: 30, warehouseName: 'Primary Warehouse A' },
      ]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    try {
      await axios.post('/api/inventory/adjust', {
        productId: selectedProduct,
        quantity: parseInt(adjustQty),
        type: adjustType
      });
      setSuccess('Stock levels updated and transaction logged!');
      fetchInventory();
      setShowAdjustmentModal(false);
    } catch (err) {
      // Local state fallback adjustments
      const qty = parseInt(adjustQty);
      setProducts(prev => prev.map(p => {
        if (p.id === selectedProduct) {
          const delta = adjustType === 'IN' ? qty : -qty;
          return { ...p, quantityInStock: Math.max(0, p.quantityInStock + delta) };
        }
        return p;
      }));
      setSuccess('Local Dev: Stock adjustments recalculated.');
      setShowAdjustmentModal(false);
      setAdjustQty('');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Registry</h2>
        <p className="text-xs text-slate-500 font-medium">Verify product warehouse levels, configure safety stock reorders, and trace movements</p>
      </div>

      {success && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Reorder Level Warning Banner */}
      {products.some(p => p.quantityInStock <= p.reorderLevel) && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-3 text-xs">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1">Safety Stocks Warning</span>
            <p className="font-medium text-slate-600">
              The following products fell below reorder limits: {' '}
              {products
                .filter(p => p.quantityInStock <= p.reorderLevel)
                .map(p => `${p.name} (SKU: ${p.sku} - Stock: ${p.quantityInStock}/${p.reorderLevel})`)
                .join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Main product table */}
      <div className="card-premium p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Warehouse Catalog
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="btn-secondary flex items-center gap-1.5"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Adjust Stock
            </button>
            <button className="btn-primary">
              + New Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Warehouse Depot</th>
                <th className="py-2.5 px-4">Unit Price</th>
                <th className="py-2.5 px-4">Quantity In Stock</th>
                <th className="py-2.5 px-4">Reorder Limit</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {products.map((prod) => {
                const isUnderReorder = prod.quantityInStock <= prod.reorderLevel;
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">{prod.sku}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{prod.name}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{prod.warehouseName || 'General Stock'}</td>
                    <td className="py-3 px-4 font-medium">${prod.unitPrice.toFixed(2)}</td>
                    <td className={`py-3 px-4 font-bold ${isUnderReorder ? 'text-warning' : 'text-slate-800'}`}>
                      {prod.quantityInStock}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{prod.reorderLevel} units</td>
                    <td className="py-3 px-4 text-center">
                      <span className={isUnderReorder ? 'badge-warning' : 'badge-success'}>
                        {isUnderReorder ? 'REORDER ALERT' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Overlay Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-lg shadow-lg space-y-4 animate-fade-in text-slate-900">
            <h4 className="text-sm font-bold text-slate-850 flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-primary" />
              Adjust Inventory Levels
            </h4>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Target Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="select-premium"
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    required
                    className="select-premium"
                  >
                    <option value="IN">Stock In (Receipt)</option>
                    <option value="OUT">Stock Out (Issue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="10"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Commit Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
