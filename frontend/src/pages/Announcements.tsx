import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Trash2, Shield, Calendar, Users, X, Send, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  targetRole: string | null;
  createdBy: string;
  createdAt: string;
}

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<string>('ALL');

  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      setAnnouncements([
        {
          id: 'a1',
          title: 'Quarterly Townhall Meeting',
          message: 'The quarterly townhall session will occur this Friday at 15:00 UTC. Join using meet link.',
          targetRole: null,
          createdBy: 'admin@amdox.com',
          createdAt: new Date().toISOString()
        },
        {
          id: 'a2',
          title: 'SCM Audit Warning Reminder',
          message: 'Compliance check audit is due by end of month. Secure inventory logs immediately.',
          targetRole: 'SCM_MANAGER',
          createdBy: 'admin@amdox.com',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      const res = await axios.post('/api/notifications/announcements', {
        title,
        message,
        targetRole: targetRole === 'ALL' ? null : targetRole
      });
      if (res.data.success) {
        setAnnouncements(prev => [res.data.data, ...prev]);
        setIsOpen(false);
        setTitle('');
        setMessage('');
        setTargetRole('ALL');
        setFeedback('Announcement broadcasted successfully!');
      }
    } catch (err) {
      // Mock addition
      const mockAnn: AnnouncementItem = {
        id: Math.random().toString(),
        title,
        message,
        targetRole: targetRole === 'ALL' ? null : targetRole,
        createdBy: user?.email || 'admin@amdox.com',
        createdAt: new Date().toISOString()
      };
      setAnnouncements(prev => [mockAnn, ...prev]);
      setIsOpen(false);
      setTitle('');
      setMessage('');
      setTargetRole('ALL');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <span>Enterprise Broadcasts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Publish team broadcasts, pin company news logs, and audit announcements.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Broadcast</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-semibold rounded-lg text-left">
          <span>{feedback}</span>
        </div>
      )}

      {/* Announcements List Layout */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs bg-white border rounded-xl">Reading broadcasts timeline...</div>
      ) : announcements.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl shadow-sm">
          No corporate announcements posted.
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative group">
              {isAdmin && (
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded transition-colors"
                  title="Remove announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-primary rounded-lg">
                  <Megaphone className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">{ann.title}</h3>
                {ann.targetRole ? (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[9px] font-bold">
                    ROLE: {ann.targetRole}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[9px] font-bold">
                    ALL WORKSPACE
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-8">{ann.message}</p>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pl-8 font-semibold">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>Posted by: {ann.createdBy}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(ann.createdAt).toLocaleString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Announcement */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full relative z-10 p-6 text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-primary" />
                <span>Publish Broadcast Announcement</span>
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Server Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target Scope</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="ALL">All Workspace Users</option>
                  <option value="EMPLOYEE">EMPLOYEE Only</option>
                  <option value="PROJECT_MANAGER">PROJECT_MANAGER Only</option>
                  <option value="SCM_MANAGER">SCM_MANAGER Only</option>
                  <option value="FINANCE_MANAGER">FINANCE_MANAGER Only</option>
                  <option value="HR_MANAGER">HR_MANAGER Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Type broadcast text details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
