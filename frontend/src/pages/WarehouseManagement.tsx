import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Landmark, ShieldAlert, CheckCircle2, 
  Trash2, Layers, MapPin, Warehouse, Barcode, X 
} from 'lucide-react';
import axios from 'axios';

interface StorageLocation {
  id: string;
  name: string;
}

interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  location: string | null;
  storageLocations: StorageLocation[];
  products: { sku: string; quantityInStock: number }[];
}

const WarehouseManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Add Warehouse form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchWarehouses = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get('/api/scm/warehouses');
      if (res.data.success) {
        setWarehouses(res.data.data);
        if (res.data.data.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(res.data.data[0].id);
        }
      }
    } catch (err) {
      // Mock fallbacks
      setWarehouses([
        { 
          id: 'wh1', name: 'Chicago Distribution Terminal', code: 'WH-CHI-01', location: 'O Hare Cargo zone',
          storageLocations: [{ id: 'loc1', name: 'Shelf A-1' }, { id: 'loc2', name: 'Bin 5' }],
          products: [{ sku: 'SV-RACK', quantityInStock: 10 }]
        },
        { 
          id: 'wh2', name: 'Austin Assembly Warehouse', code: 'WH-AUS-02', location: 'Tech Ridge park',
          storageLocations: [{ id: 'loc3', name: 'Zone B Row 2' }],
          products: [{ sku: 'PAP-A4', quantityInStock: 250 }]
        }
      ]);
      setSelectedWarehouseId('wh1');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/scm/warehouses', {
        name,
        code,
        location: location || undefined
      });
      if (res.data.success) {
        setSuccess('Warehouse facility registered successfully!');
        setIsModalOpen(false);
        setName('');
        setCode('');
        setLocation('');
        fetchWarehouses();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create warehouse');
    } finally {
      setLoading(false);
    }
  };

  const activeWH = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Warehouse & Bins Management</h2>
          <p className="text-xs text-slate-500 font-medium">Verify physical inventory storage zones, assign shelf locations, and map inventory counts</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Warehouse className="h-4 w-4" />
          Add Warehouse
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
        {/* Left: Facilities list */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-slate-800" />
            Registered Facilities
          </h3>

          <div className="space-y-2">
            {warehouses.map(w => (
              <div
                key={w.id}
                onClick={() => setSelectedWarehouseId(w.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedWarehouseId === w.id
                    ? 'border-slate-900 bg-slate-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-800 block truncate w-36">{w.name}</span>
                  <span className="text-[9px] bg-slate-950 text-white px-1.5 py-0.5 rounded font-bold uppercase">{w.code}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                  <MapPin className="h-3 w-3" />
                  <span>{w.location || 'No address logged'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Storage mapping grid / bins */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-6">
          {activeWH ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Warehouse className="h-4.5 w-4.5 text-slate-900" />
                  {activeWH.name} — Bins Inventory Allocation
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  Manage shelves, barcode coordinates, and item balances inside terminal zone
                </p>
              </div>

              {/* Bins list */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 pl-0.5">Active Bin Storage Locations</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeWH.storageLocations.length === 0 ? (
                    <span className="text-slate-400 font-medium col-span-3 py-4 text-center">No storage locations allocated inside this warehouse.</span>
                  ) : (
                    activeWH.storageLocations.map(loc => (
                      <div key={loc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between h-20">
                        <span className="font-bold text-[11px] text-slate-800">{loc.name}</span>
                        <div className="flex justify-between items-center mt-2 border-t border-slate-200/60 pt-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Bin Coordinate</span>
                          <Barcode className="h-3.5 w-3.5 text-slate-900" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Products items inside this warehouse */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 pl-0.5">Live Stock Holdings Summary</h4>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-450 uppercase text-[9px]">
                        <th className="py-2.5 px-4">Item SKU</th>
                        <th className="py-2.5 px-4 text-right">In-Stock Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeWH.products.length === 0 ? (
                        <tr><td colSpan={2} className="py-4 text-center text-slate-400">No stock allocations in this facility</td></tr>
                      ) : (
                        activeWH.products.map(p => (
                          <tr key={p.sku}>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{p.sku}</td>
                            <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">{p.quantityInStock} units</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">Select a warehouse facility to view details</div>
          )}
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add Warehouse Facility</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWarehouse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Hub"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Facility Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-AUS"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Location Address</label>
                <input
                  type="text"
                  placeholder="Austin Airport terminal zone 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center shadow-sm"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
                )}
                Save Warehouse Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
