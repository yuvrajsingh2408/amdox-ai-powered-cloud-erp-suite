import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, GitBranch, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Deployments: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{ versions: any[]; migrations: any[] }>({ versions: [], migrations: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/deployments');
        setData(res.data?.data || { versions: [], migrations: [] });
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
            <GitBranch className="h-5 w-5 text-indigo-400" />
            Deployments & Migrations
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Track application versions, database schema migrations, and rollback history.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Versions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Release Versions</h3>
            {data.versions.map((v, i) => (
              <div key={i} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-indigo-400">{v.version}</span>
                  {v.isActive && (
                    <span className="px-2 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[8px] font-bold text-emerald-400 uppercase">CURRENT</span>
                  )}
                </div>
                <p className="text-slate-400">{v.description}</p>
                <p className="text-slate-600">{new Date(v.releaseDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {/* Migrations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">DB Migration History</h3>
            {data.migrations.map((m, i) => (
              <div key={i} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl text-xs space-y-1">
                <p className="font-mono text-slate-300">{m.migration}</p>
                <p className="text-slate-600">Applied: {new Date(m.appliedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Deployments;
export { Deployments };
