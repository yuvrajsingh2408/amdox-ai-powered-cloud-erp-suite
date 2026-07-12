import React, { useState } from 'react';
import { ArrowLeft, Users, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([
    { id: '1', name: 'GLOBAL_ADMIN', desc: 'Full administration capabilities.' },
    { id: '2', name: 'FINANCE_HEAD', desc: 'Read/Write operations on general ledgers accounts.' },
    { id: '3', name: 'HR_CLERK', desc: 'Submit employee attendances and run payroll draft approvals.' }
  ]);

  const handleClone = (name: string) => {
    alert(`Cloned successfully: Copy of ${name}`);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-400" />
              <span>System Role Administration</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Define corporate RBAC roles and clone functional permissions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {roles.map((r) => (
          <div key={r.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">{r.name}</h3>
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-slate-400 leading-relaxed">{r.desc}</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleClone(r.name)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-lg font-bold text-slate-400 hover:text-white"
              >
                Clone Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
export { RoleManagement };
