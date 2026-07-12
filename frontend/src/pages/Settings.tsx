import React, { useState } from 'react';
import { Settings, ShieldCheck, Mail, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('Amdox Solutions Inc.');
  const [currency, setCurrency] = useState('USD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Manage default values, currencies, security policies, and profile settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: General ERP configurations */}
        <div className="lg:col-span-2 card-premium p-5 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            General System Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Tenant Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Accounting Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="select-premium"
                >
                  <option value="USD">USD ($) - US Dollars</option>
                  <option value="EUR">EUR (€) - Euros</option>
                  <option value="GBP">GBP (£) - British Pounds</option>
                </select>
              </div>
            </div>

            {/* Switch alerts */}
            <div className="space-y-3 pt-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Notification Preferences</label>
              
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-800">Email Notifications</p>
                    <p className="text-[10px] text-slate-500 font-medium">Send copies of leaves approvals & inventory safety reorders to email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 focus:ring-primary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-slate-800">In-App Banner Notifications</p>
                    <p className="text-[10px] text-slate-500 font-medium">Enable sliding popups for critical security logs & daily attendance clock events</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={inAppAlerts}
                  onChange={(e) => setInAppAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 focus:ring-primary rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="btn-primary"
              >
                Save Preferences
              </button>
              {saved && (
                <span className="text-xs text-success font-semibold animate-pulse">Changes committed successfully!</span>
              )}
            </div>
          </form>
        </div>

        {/* Right column: Profile & Security info */}
        <div className="card-premium p-5 h-fit space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Security & Profile
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Registered Account</span>
              <p className="font-semibold text-slate-800">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</p>
              <p className="text-slate-500 font-medium">{user?.email || 'no-email@company.com'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">RBAC Privileges</span>
              <p className="font-bold text-primary">{user?.role || 'No Level Assigned'}</p>
            </div>
            
            <button className="btn-secondary w-full py-2.5">
              Change Security Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
