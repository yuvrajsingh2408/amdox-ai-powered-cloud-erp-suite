import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Zap, Loader2, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CacheMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flushing, setFlushing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/cache');
      setStats(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleFlush = async () => {
    if (!confirm('Flush all Redis cache keys? This will temporarily reduce performance.')) return;
    setFlushing(true);
    try {
      await axios.post('/api/admin/cache/flush');
      alert('Cache flushed successfully.');
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setFlushing(false);
    }
  };

  const hitRate = stats ? ((stats.hitsCount / Math.max(stats.hitsCount + stats.missCount, 1)) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              Redis Cache Monitor
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Monitor cache performance, hit ratios, and key evictions.</p>
          </div>
        </div>
        <button
          onClick={handleFlush}
          disabled={flushing}
          className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 rounded-lg text-xs font-bold text-rose-400 flex items-center gap-1.5 transition-colors"
        >
          <Trash className="h-3.5 w-3.5" />
          Flush All Cache
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : !stats ? (
        <div className="text-center py-20 text-slate-600 text-xs">Cache stats unavailable.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Cache Hit Rate', val: `${hitRate}%`, color: 'text-emerald-400' },
            { label: 'Total Hits', val: stats.hitsCount.toLocaleString(), color: 'text-white' },
            { label: 'Total Misses', val: stats.missCount.toLocaleString(), color: 'text-rose-400' },
            { label: 'Active Keys', val: stats.keysCount.toLocaleString(), color: 'text-indigo-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
              <h3 className={`text-2xl font-extrabold ${color}`}>{val}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CacheMonitor;
export { CacheMonitor };
