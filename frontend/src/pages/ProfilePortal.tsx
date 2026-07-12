import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';

const ProfilePortal: React.FC = () => {
  const navigate = useNavigate();
  const portalType = localStorage.getItem('portal_type');
  const user = JSON.parse(localStorage.getItem('portal_user') || '{}');

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Portal profile updated.');
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
          className="p-1 hover:bg-slate-900 rounded text-slate-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="h-5.5 w-5.5 text-indigo-400" />
            <span>Profile Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage your account details and contacts references.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-xl bg-[#0F172A] border border-slate-900 rounded-2xl p-6 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-450 font-bold uppercase text-[9px]">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-455 font-bold uppercase text-[9px]">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </form>

    </div>
  );
};

export default ProfilePortal;
export { ProfilePortal };
