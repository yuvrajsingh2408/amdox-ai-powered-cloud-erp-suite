import React, { useState } from 'react';
import { 
  Bell, BellOff, Check, CheckSquare, Trash2, 
  AlertCircle, AlertTriangle, Info, ShieldAlert,
  Clock, CheckCircle2
} from 'lucide-react';

interface ERPNotification {
  id: string;
  type: 'Alert' | 'Warning' | 'Info' | 'Security';
  module: 'SCM' | 'HR' | 'Finance' | 'System' | 'Projects';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ERPNotification[]>([
    {
      id: 'notif-1',
      type: 'Security',
      module: 'System',
      title: 'Administrator Password Changed',
      message: 'The security credentials for role HR_MANAGER were updated from user terminal IP 184.22.10.99.',
      timestamp: '12 minutes ago',
      read: false
    },
    {
      id: 'notif-2',
      type: 'Warning',
      module: 'SCM',
      title: 'Safety Stock Limit Exceeded',
      message: 'Warehouse item "PVC Connect" has dropped to 360 units, falling below safety threshold (400). Auto-replenishment draft generated.',
      timestamp: '45 minutes ago',
      read: false
    },
    {
      id: 'notif-3',
      type: 'Alert',
      module: 'Finance',
      title: 'AP Invoice Overdue Notice',
      message: 'Invoice #INV-2026-8924 for supplier Apex Steel Corp ($12,400.00) is past due limit by 5 days.',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 'notif-4',
      type: 'Info',
      module: 'HR',
      title: 'New Leave Application Pending',
      message: 'Employee Jane Smith requested 3 days of Personal Leave starting 2026-07-02. Needs review.',
      timestamp: '4 hours ago',
      read: true
    },
    {
      id: 'notif-5',
      type: 'Info',
      module: 'Projects',
      title: 'Project Deliverable Completed',
      message: 'Task "Database Schema Sync" under project Cloud ERP Migration marked complete by developer team.',
      timestamp: 'Yesterday',
      read: true
    },
    {
      id: 'notif-6',
      type: 'Alert',
      module: 'System',
      title: 'API Integration Failure',
      message: 'Webhook sync to external logistics carrier DHL returned 504 Gateway Timeout during safety inventory updates.',
      timestamp: '2 days ago',
      read: true
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Alert' | 'Warning' | 'Info'>('All');

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: ERPNotification['type']) => {
    switch (type) {
      case 'Alert':
        return <AlertCircle className="h-4.5 w-4.5 text-danger" />;
      case 'Warning':
        return <AlertTriangle className="h-4.5 w-4.5 text-warning" />;
      case 'Security':
        return <ShieldAlert className="h-4.5 w-4.5 text-slate-800" />;
      case 'Info':
      default:
        return <Info className="h-4.5 w-4.5 text-primary" />;
    }
  };

  const getBadgeStyle = (type: ERPNotification['type']) => {
    switch (type) {
      case 'Alert':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Warning':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Security':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alerts</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">Real-time status updates, security notifications, and approval triggers</p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllRead} 
            disabled={unreadCount === 0}
            className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button 
            onClick={clearAll} 
            disabled={notifications.length === 0}
            className="btn-secondary py-2 px-3 text-xs font-bold text-danger hover:bg-red-50 border-red-100 hover:border-red-200 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-premium p-0 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(['All', 'Unread', 'Alert', 'Warning', 'Info'] as const).map(filter => {
              const count = filter === 'All' 
                ? notifications.length 
                : filter === 'Unread' 
                  ? unreadCount 
                  : notifications.filter(n => n.type === filter).length;

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md tracking-wider transition-all border ${
                    activeFilter === filter
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex gap-4 transition-all duration-150 relative ${
                  !notif.read ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Left blue line for unread state */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
                )}

                {/* Icon wrapper */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-2 rounded-lg border flex items-center justify-center ${getBadgeStyle(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-slate-100 text-slate-500 border border-slate-200">
                      {notif.module}
                    </span>
                    {!notif.read && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500 font-medium max-w-2xl">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                {/* Item Actions */}
                <div className="flex-shrink-0 flex items-center">
                  <button
                    onClick={() => toggleReadStatus(notif.id)}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                    className={`p-2 rounded-lg border transition-all ${
                      notif.read 
                        ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50' 
                        : 'border-blue-100 bg-blue-50 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {notif.read ? <BellOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Clear Slate</p>
              <p className="text-[10px] text-slate-400 font-medium">No alerts matching active filter rules found.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
