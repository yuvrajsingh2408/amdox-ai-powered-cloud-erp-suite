import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Calendar, User, ChevronDown, Sun, Moon, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('Amdox Solutions Inc.');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const companies = [
    'Amdox Solutions Inc.',
    'Amdox Europe Ltd',
    'Amdox Global Corp'
  ];

  // Fetch in-app notifications
  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const res = await axios.get('/api/notifications');
      if (res.data.success || res.data.status === 'success') {
        const items = res.data.data || [];
        setNotifications(items);
        setUnreadCount(items.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      // Gracefully fall back to local mock notifications for visual demo
      const mockNotifications: NotificationItem[] = [
        {
          id: '1',
          title: 'Stock Reorder Warning',
          message: 'Product SKU: AP-102 (Steel Pipes) is below reorder level.',
          type: 'WARNING',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Leave Approved',
          message: 'Your leave request for next Monday has been approved.',
          type: 'INFO',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  // Generate dynamic breadcrumbs based on route path
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];

    return pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = value
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return { label, path };
    });
  };

  // Formatted date
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-all duration-200">
      
      {/* Left: Module title, breadcrumbs, and company switcher */}
      <div className="flex items-center gap-6">
        
        {/* Dynamic Page Breadcrumbs */}
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <span>Enterprise Workspace</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                <span>/</span>
                <span className={idx === breadcrumbs.length - 1 ? 'text-primary font-bold' : ''}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-sm font-bold text-slate-900 leading-none mt-1">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />

        {/* Company Switcher dropdown with glass effect */}
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-all duration-200 active:scale-[0.98]"
          >
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[130px] truncate">{selectedCompany}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showCompanyMenu && (
            <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-fade-in">
              {companies.map((comp) => (
                <button
                  key={comp}
                  onClick={() => {
                    setSelectedCompany(comp);
                    setShowCompanyMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors duration-150 ${
                    selectedCompany === comp 
                      ? 'bg-blue-50/50 text-primary font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 xl:w-80 hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search transactions, accounts, employees..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Dark mode, and Avatar */}
      <div className="flex items-center gap-3">
        
        {/* Calendar Card */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* AI Copilot Button (navigates to /ai) */}
        <button
          onClick={() => navigate('/ai')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-[0.98]"
          title="Open AI Copilot"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-200 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Theme Toggle (Visual placeholder for design) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Moon className="h-4 w-4 text-[#7C3AED]" /> : <Sun className="h-4 w-4 text-amber-500" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl relative transition-all duration-200 border border-transparent hover:border-slate-200"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 transition-colors duration-150 ${!notif.isRead ? 'bg-blue-50/15' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications/center');
                  }}
                  className="text-[10px] text-primary hover:underline font-bold block w-full text-center"
                >
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-200" />

        {/* User Card Avatar */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-none">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </p>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              {user?.role.replace('_', ' ') || 'Guest'}
            </span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-primary flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 active:scale-[0.98] transition-all duration-200"
          >
            {user ? `${user.firstName[0]}${user.lastName[0]}` : <User className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
