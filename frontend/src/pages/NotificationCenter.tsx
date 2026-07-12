import React, { useState, useEffect } from 'react';
import { 
  Bell, Mail, MessageSquare, Smartphone, Trash2, CheckCheck, Eye, 
  AlertCircle, ShieldAlert, CheckCircle, Info, Filter, RefreshCw 
} from 'lucide-react';
import axios from 'axios';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  readStatus: string;
  channel: string;
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, UNREAD, READ
  const [filterPriority, setFilterPriority] = useState<string>('ALL'); // ALL, CRITICAL, HIGH, MEDIUM, LOW

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      // Mock data fallback
      setNotifications([
        {
          id: 'n1',
          title: 'Stock Critical Reorder Triggered',
          message: 'Steel Pipes inventory count fell below threshold limit. Reorder queue spawned.',
          type: 'WARNING',
          priority: 'CRITICAL',
          readStatus: 'UNREAD',
          channel: 'IN_APP',
          createdAt: new Date().toISOString()
        },
        {
          id: 'n2',
          title: 'Leave Review Approved',
          message: 'Your Casial time off request for upcoming week has been approved by HR.',
          type: 'INFO',
          priority: 'LOW',
          readStatus: 'UNREAD',
          channel: 'EMAIL',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'n3',
          title: 'Overdue Vendor Ledger Payments Alert',
          message: 'Invoice ID: AP-INV-2026-90 remains unpaid past due date limits.',
          type: 'ALERT',
          priority: 'HIGH',
          readStatus: 'READ',
          channel: 'SMS',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: 'READ' } : n));
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: 'READ' } : n));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: 'READ' })));
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: 'READ' })));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[9px] font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[9px] font-bold">HIGH</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded text-[9px] font-bold">LOW</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[9px] font-bold">MEDIUM</span>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5 text-slate-400" />;
      case 'SMS':
        return <MessageSquare className="h-3.5 w-3.5 text-slate-400" />;
      case 'PUSH':
        return <Smartphone className="h-3.5 w-3.5 text-slate-400" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  // Filtering logs
  const filteredList = notifications.filter(n => {
    const matchesRead = 
      filterType === 'ALL' ||
      (filterType === 'UNREAD' && n.readStatus === 'UNREAD') ||
      (filterType === 'READ' && n.readStatus === 'READ');

    const matchesPriority = 
      filterPriority === 'ALL' ||
      n.priority === filterPriority;

    return matchesRead && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit log alerts, message queues, and smart classified notifications feed.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
        {/* Left Side: Filter Options Sidebar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <span>Refine Feed</span>
          </h3>

          {/* Read status filter */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Read Status</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
            >
              <option value="ALL">Show All</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Priority Tier</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
            >
              <option value="ALL">Show All</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>
        </div>

        {/* Right Side: Notifications list */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {loading ? (
            <div className="text-slate-500 text-xs text-center py-8 font-semibold">Retrieving workspace notifications...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No matching alerts in your inbox folder feed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredList.map((n) => (
                <div 
                  key={n.id} 
                  className={`py-4 flex gap-4 items-start hover:bg-slate-50/45 rounded-lg px-3 transition-colors ${
                    n.readStatus === 'UNREAD' ? 'bg-indigo-50/10' : ''
                  }`}
                >
                  {/* Channel icon Indicator */}
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg mt-0.5 shrink-0">
                    {getChannelIcon(n.channel)}
                  </div>

                  {/* Body description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-xs ${n.readStatus === 'UNREAD' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {n.title}
                      </h4>
                      {getPriorityBadge(n.priority)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Single Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {n.readStatus === 'UNREAD' && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 text-slate-400 hover:text-primary hover:bg-white rounded border border-transparent hover:border-slate-200"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded border border-transparent hover:border-slate-200"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
