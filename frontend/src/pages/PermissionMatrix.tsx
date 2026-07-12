import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PermissionMatrix: React.FC = () => {
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState([
    { module: 'HR & Payroll', read: true, write: true, delete: false },
    { module: 'Finance & Accounts', read: true, write: false, delete: false },
    { module: 'SCM & Inventory', read: true, write: true, delete: true },
    { module: 'CRM & Pipelines', read: true, write: true, delete: false }
  ]);

  const toggleCheck = (index: number, key: 'read' | 'write' | 'delete') => {
    const updated = [...matrix];
    updated[index][key] = !updated[index][key];
    setMatrix(updated);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-5.5 w-5.5 text-indigo-400" />
            <span>Functional Permission Matrix</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Toggle CRUD access limits across ERP subsystems for selected roles.</p>
        </div>
      </div>

      <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#0F172A] text-slate-450 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
            <tr>
              <th className="px-5 py-3">Module Subsystem</th>
              <th className="px-5 py-3 text-center">Read</th>
              <th className="px-5 py-3 text-center">Write</th>
              <th className="px-5 py-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-855 text-slate-300">
            {matrix.map((row, i) => (
              <tr key={i} className="hover:bg-slate-900/20 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-200">{row.module}</td>
                <td className="px-5 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={row.read}
                    onChange={() => toggleCheck(i, 'read')}
                    className="rounded border-slate-800 text-indigo-650 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                  />
                </td>
                <td className="px-5 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={row.write}
                    onChange={() => toggleCheck(i, 'write')}
                    className="rounded border-slate-800 text-indigo-650 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                  />
                </td>
                <td className="px-5 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={row.delete}
                    onChange={() => toggleCheck(i, 'delete')}
                    className="rounded border-slate-800 text-indigo-650 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
export { PermissionMatrix };
