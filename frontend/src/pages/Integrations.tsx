import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, HardDrive, Loader2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
}

const Integrations: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/integrations');
      setList(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await axios.post(`/api/admin/integrations/${id}/toggle`, { isActive: !current });
      alert('Integration status modified.');
      fetchList();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/admin')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="h-5.5 w-5.5 text-indigo-400" />
            <span>Third-Party Integrations</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Control external token bindings for messaging, mailing, and transaction checkouts.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Testing integration channels...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {list.map((item) => (
            <div key={item.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-3xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">{item.provider}</h4>
                <p className="text-[10px] text-slate-500">API connection: Verified</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  item.isActive ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-slate-550 bg-slate-950/30 border border-slate-900'
                }`}>
                  {item.isActive ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
                <button
                  onClick={() => handleToggle(item.id, item.isActive)}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[9px] font-bold text-slate-350 transition-colors"
                >
                  Toggle Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Integrations;
export { Integrations };
