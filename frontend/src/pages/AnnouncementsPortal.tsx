import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnnouncementsPortal: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const portalType = localStorage.getItem('portal_type');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/portals/announcements?portal=${portalType}`);
        setList(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [portalType]);

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
            <Bell className="h-5.5 w-5.5 text-indigo-400" />
            <span>Announcements Portal Board</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Corporate broadcasts, maintenance schedules, and operations notices.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching announcements...</span>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No active announcements.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold text-slate-200 text-sm">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">{item.content}</p>
              <span className="text-[10px] text-slate-550 block pt-2 border-t border-slate-900/60 font-medium">
                Broadcasted: {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AnnouncementsPortal;
export { AnnouncementsPortal };
