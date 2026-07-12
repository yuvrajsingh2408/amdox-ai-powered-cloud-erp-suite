import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ShieldAlert, CheckCircle2, 
  Trash2, Mail, Phone, MapPin, Award, Filter, X 
} from 'lucide-react';
import axios from 'axios';

interface Vendor {
  id: string;
  name: string;
  code: string;
  contactName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  rating: number | null;
}

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add Vendor states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [rating, setRating] = useState('4.0');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVendors = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get('/api/scm/vendors');
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setVendors([
        { id: '1', name: 'Delta Manufacturing Corp', code: 'VEND-001', contactName: 'Marnie Delta', email: 'billing@deltamfg.com', phone: '555-8833', address: 'Industrial park 4', category: 'MANUFACTURING', rating: 4.5 },
        { id: '2', name: 'Global Logistics Partners', code: 'VEND-002', contactName: 'Larry Logistics', email: 'ap@globallogistics.com', phone: '555-9011', address: 'Cargo Hub, terminal 2', category: 'LOGISTICS', rating: 4.2 },
        { id: '3', name: 'Apex Electronics Imports', code: 'VEND-003', contactName: 'Ed Apex', email: 'sales@apexelectronics.com', phone: '555-4491', address: 'Import wharf lane 9', category: 'ELECTRONICS', rating: 3.8 }
      ]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/scm/vendors', {
        name,
        code,
        contactName: contactName || undefined,
        email,
        phone: phone || undefined,
        address: address || undefined,
        category,
        rating: parseFloat(rating)
      });
      if (res.data.success) {
        setSuccess('Vendor profile created and cataloged successfully!');
        setIsModalOpen(false);
        setName('');
        setCode('');
        setContactName('');
        setEmail('');
        setPhone('');
        setAddress('');
        fetchVendors();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register vendor');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.code.includes(search);
    const matchesCat = categoryFilter === '' || v.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Management</h2>
          <p className="text-xs text-slate-500 font-medium">Verify supplier catalogs, check compliance contact details, and inspect rating evaluations</p>
        </div>
        <button
          onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Register Supplier
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="GENERAL">General Goods</option>
          <option value="MANUFACTURING">Manufacturing</option>
          <option value="LOGISTICS">Logistics & Freights</option>
          <option value="ELECTRONICS">Electronics Imports</option>
        </select>
      </div>

      {/* Vendors List Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Vendor Name</th>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Rating</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tableLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-40"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-32"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-12"></div></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-16"></div></td>
                  </tr>
                ))
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    No supplier profiles registered.
                  </td>
                </tr>
              ) : (
                filteredVendors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{v.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-850">{v.name}</td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-550">
                        <Mail className="h-3 w-3" />
                        <span>{v.email}</span>
                      </div>
                      {v.phone && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Phone className="h-3 w-3" />
                          <span>{v.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border bg-slate-50 border-slate-200 text-slate-600">
                        {v.category || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-bold">
                        <Award className="h-3.5 w-3.5 text-slate-800" />
                        <span>{v.rating || '4.0'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium truncate max-w-xs">{v.address || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register Supplier Details</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Supplier Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VEND-ACME"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Contact Person</label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ap@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="GENERAL">General Goods</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="LOGISTICS">Logistics & Freights</option>
                    <option value="ELECTRONICS">Electronics Imports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Initial Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Supplier Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
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
                Save Vendor Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
