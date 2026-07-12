import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Database, Loader2, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DatabaseAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{ dbStats: any; backups: any[] }>({ dbStats: null, backups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/db');
        setData(res.data?.data || { dbStats: null, backups: [] });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-400" />
            Database Administration
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage storage statistics, migration history, and backup snapshots.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Reading database internals...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* DB Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Tables', val: data.dbStats?.tablesCount ?? '—', icon: Database },
              { label: 'Total Rows', val: (data.dbStats?.rowsCount ?? 0).toLocaleString(), icon: HardDrive },
              { label: 'Storage Size', val: `${data.dbStats?.sizeGb ?? 0} GB`, icon: HardDrive },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
                <div className="flex justify-between items-end mt-2">
                  <h3 className="text-2xl font-extrabold text-white">{val}</h3>
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Backups */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Backup Snapshots</h3>
            {data.backups.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850 rounded-xl">No backups recorded.</div>
            ) : (
              <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0F172A] text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-900">
                    <tr>
                      <th className="px-5 py-3">Backup File</th>
                      <th className="px-5 py-3">Size (MB)</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {data.backups.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">{b.fileName}</td>
                        <td className="px-5 py-3.5">{b.sizeMb}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                            b.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' : 'text-rose-400 bg-rose-950/20 border-rose-900/30'
                          }`}>{b.status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseAdmin;
export { DatabaseAdmin };
