import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Truck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const PortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [portalType, setPortalType] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration triggers
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [vendorId, setVendorId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = portalType === 'CUSTOMER' ? '/api/portals/customer/login' : '/api/portals/vendor/login';
      const res = await axios.post(endpoint, { email, password });
      
      const { token, user } = res.data?.data || {};
      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_type', portalType);
      localStorage.setItem('portal_user', JSON.stringify(user));
      
      // Save global header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (portalType === 'CUSTOMER') {
        navigate('/portals/customer/dashboard');
      } else {
        navigate('/portals/vendor/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = portalType === 'CUSTOMER' ? '/api/portals/customer/register' : '/api/portals/vendor/register';
      const payload = {
        tenantId: 'default-tenant',
        email,
        password,
        firstName,
        lastName,
        customerId: portalType === 'CUSTOMER' ? customerId || undefined : undefined,
        vendorId: portalType === 'VENDOR' ? vendorId || undefined : undefined,
      };

      await axios.post(endpoint, payload);
      alert('Registration successful! Please login.');
      setIsRegister(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-900 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow styling */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 relative">
          <div className="inline-flex p-3 bg-indigo-950/20 border border-indigo-900 rounded-2xl text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Portal Center</h1>
          <p className="text-slate-500 text-xs">Access secure customer invoicing and vendor quotations panels.</p>
        </div>

        {/* Portal selector tabs */}
        {!isRegister && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-900 rounded-xl">
            <button
              onClick={() => setPortalType('CUSTOMER')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'CUSTOMER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Customer Portal</span>
            </button>
            <button
              onClick={() => setPortalType('VENDOR')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                portalType === 'VENDOR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Vendor Portal</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4 text-xs">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[9px]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[9px]">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[9px]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase text-[9px]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase text-[9px]">
                {portalType === 'CUSTOMER' ? 'ERP Customer ID' : 'ERP Vendor ID'}
              </label>
              <input
                type="text"
                value={portalType === 'CUSTOMER' ? customerId : vendorId}
                onChange={(e) => portalType === 'CUSTOMER' ? setCustomerId(e.target.value) : setVendorId(e.target.value)}
                placeholder="Database ID (optional)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-650 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs mt-2"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : null}
            <span>{isRegister ? 'Register Account' : 'Authenticate Credentials'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
          >
            {isRegister ? 'Back to Login' : 'Create a portal login account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PortalDashboard;
export { PortalDashboard };
