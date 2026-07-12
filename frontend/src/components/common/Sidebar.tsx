import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, CreditCard, 
  BookOpen, Truck, Package, Layers, TrendingUp, TrendingDown, Settings, LogOut, 
  Bell, BarChart3, ChevronLeft, ChevronRight, Shield, Building, Key, FolderGit2, User,
  Clock, CalendarDays, ClipboardCheck, Network, Landmark, Coins, FileCheck, Cpu, ClipboardList,
  Activity, Layout, FileText, Megaphone, Trash2, History as HistoryIcon, UserCheck, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('amdox_sidebar_collapsed') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('amdox_sidebar_collapsed', String(newState));
  };

  const navigationItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: [], category: 'General' },
    
    // AI Copilot Suite
    { name: 'AI ERP Copilot', to: '/ai', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Chat Assistant', to: '/ai/chat', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Insights Trends', to: '/ai/insights', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Recommendations', to: '/ai/recommendations', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Prompt Library', to: '/ai/prompts', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Search History', to: '/ai/history', icon: Cpu, roles: [], category: 'AI Suite' },
    { name: 'AI Executive Summary', to: '/ai/summary', icon: Cpu, roles: [], category: 'AI Suite' },

    { name: 'User Management', to: '/users', icon: Users, roles: ['ADMIN'], category: 'Administration' },
    { name: 'Roles Map', to: '/roles', icon: Shield, roles: ['ADMIN'], category: 'Administration' },
    { name: 'Permissions Scope', to: '/permissions', icon: Key, roles: ['ADMIN'], category: 'Administration' },
    { name: 'Departments', to: '/departments', icon: FolderGit2, roles: ['ADMIN', 'HR_MANAGER'], category: 'Administration' },
    { name: 'Workspaces', to: '/tenants', icon: Building, roles: ['ADMIN'], category: 'Administration' },
    { name: 'My Profile', to: '/profile', icon: User, roles: [], category: 'General' },
    
    // Detailed HR Navigation
    { name: 'HR Dashboard', to: '/hr', icon: Briefcase, roles: ['ADMIN', 'HR_MANAGER'], category: 'Human Resources' },
    { name: 'HR Directory', to: '/hr/directory', icon: Users, roles: ['ADMIN', 'HR_MANAGER'], category: 'Human Resources' },
    { name: 'Attendance Console', to: '/hr/attendance', icon: Clock, roles: [], category: 'Human Resources' },
    { name: 'Time Off Requests', to: '/hr/leaves', icon: CalendarDays, roles: [], category: 'Human Resources' },
    { name: 'Time Off Reviews', to: '/hr/approvals', icon: ClipboardCheck, roles: ['ADMIN', 'HR_MANAGER'], category: 'Human Resources' },

    // Payroll and Org Structure
    { name: 'Payroll Engine', to: '/payroll', icon: CreditCard, roles: ['ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER'], category: 'Human Resources' },
    { name: 'Org Hierarchy', to: '/org-chart', icon: Network, roles: [], category: 'Human Resources' },

    // Detailed Finance Navigation
    { name: 'Finance Dashboard', to: '/finance', icon: BookOpen, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Chart of Accounts', to: '/finance/coa', icon: FolderGit2, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Journal Postings', to: '/finance/journal', icon: Layers, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Accounts Payable', to: '/finance/ap', icon: TrendingDown, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Accounts Receivable', to: '/finance/ar', icon: TrendingUp, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Bank Accounts', to: '/finance/bank', icon: Landmark, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Exchange Rates', to: '/finance/currencies', icon: Coins, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },
    { name: 'Financial Reports', to: '/finance/reports', icon: BarChart3, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'Finance' },

    // Detailed Supply Chain Navigation
    { name: 'SCM Dashboard', to: '/scm', icon: Truck, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'Supplier Registry', to: '/scm/vendors', icon: Users, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'Requisitions Queue', to: '/scm/requisitions', icon: ClipboardList, roles: ['ADMIN', 'SCM_MANAGER', 'EMPLOYEE'], category: 'Supply Chain' },
    { name: 'Purchase Orders', to: '/scm/pos', icon: FileCheck, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'Goods Receipts GRN', to: '/scm/grns', icon: ClipboardCheck, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'Warehouse Bins', to: '/scm/warehouses', icon: Landmark, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'AI Reorder Stock', to: '/scm/reorders', icon: Cpu, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },
    { name: 'SCM Valuation Reports', to: '/scm/reports', icon: BarChart3, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Supply Chain' },

    // Detailed BI & AI Forecasting Navigation
    { name: 'BI Executive Dashboard', to: '/bi', icon: Activity, roles: ['ADMIN', 'FINANCE_MANAGER', 'HR_MANAGER', 'SCM_MANAGER'], category: 'Intelligence' },
    { name: 'BI Custom Layouts', to: '/bi/builder', icon: Layout, roles: ['ADMIN'], category: 'Intelligence' },
    { name: 'AI Demand Predictions', to: '/bi/forecasting', icon: Cpu, roles: ['ADMIN', 'SCM_MANAGER'], category: 'Intelligence' },

    // Detailed Project Management Navigation
    { name: 'Project Dashboard', to: '/projects/dashboard', icon: FolderGit2, roles: ['ADMIN', 'PROJECT_MANAGER'], category: 'Projects' },
    { name: 'Project Board', to: '/projects', icon: Layers, roles: ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'], category: 'Projects' },

    // Detailed CRM Navigation
    { name: 'CRM Pipeline', to: '/crm', icon: Activity, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'CRM' },
    { name: 'Leads Directory', to: '/crm/leads', icon: Users, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'CRM' },
    { name: 'Corporate Clients', to: '/crm/clients', icon: Building, roles: ['ADMIN', 'FINANCE_MANAGER'], category: 'CRM' },

    // Detailed DMS Portal
    { name: 'DMS Dashboard', to: '/dms', icon: FolderGit2, roles: [], category: 'DMS' },
    { name: 'DMS Documents', to: '/dms/files', icon: FileText, roles: [], category: 'DMS' },
    { name: 'DMS Folders', to: '/dms/folders', icon: FolderGit2, roles: [], category: 'DMS' },
    { name: 'DMS Shared Links', to: '/dms/shared', icon: Key, roles: [], category: 'DMS' },
    { name: 'DMS Recycle Bin', to: '/dms/trash', icon: Trash2, roles: [], category: 'DMS' },

    // Detailed Notification Hub
    { name: 'Notification Hub', to: '/notifications/center', icon: Bell, roles: [], category: 'Communications' },
    { name: 'Team Broadcasts', to: '/notifications/announcements', icon: Megaphone, roles: [], category: 'Communications' },
    { name: 'Dispatch Toggles', to: '/notifications/settings', icon: Settings, roles: [], category: 'Communications' },
    { name: 'Message Templates', to: '/notifications/templates', icon: FileText, roles: ['ADMIN'], category: 'Communications' },

    // Reports & Analytics Center
    { name: 'Reports Dashboard', to: '/reports', icon: FileText, roles: [], category: 'Reports' },
    { name: 'Custom Report Builder', to: '/reports/builder', icon: FileText, roles: [], category: 'Reports' },
    { name: 'Analytics Console', to: '/reports/analytics', icon: Activity, roles: [], category: 'Reports' },
    { name: 'Report Scheduler', to: '/reports/scheduled', icon: Clock, roles: [], category: 'Reports' },
    { name: 'Download Exports', to: '/reports/exports', icon: HistoryIcon, roles: [], category: 'Reports' },

    // Workflow Automation & Approval Engine
    { name: 'Workflows Dashboard', to: '/workflows', icon: Cpu, roles: [], category: 'Workflows' },
    { name: 'Workflow Templates', to: '/workflows/templates', icon: Cpu, roles: [], category: 'Workflows' },
    { name: 'Approval Inbox Queue', to: '/workflows/inbox', icon: UserCheck, roles: [], category: 'Workflows' },
    { name: 'Escalations Center', to: '/workflows/escalations', icon: Shield, roles: [], category: 'Workflows' },
    { name: 'Workflow Settings', to: '/workflows/settings', icon: Settings, roles: [], category: 'Workflows' },

    // Customer & Vendor Portal
    { name: 'Portal Gateway', to: '/portals', icon: Shield, roles: [], category: 'General' },

    // Security & Compliance Center
    { name: 'Security Dashboard', to: '/security', icon: Shield, roles: [], category: 'Security' },
    { name: 'IP Whitelists', to: '/security/settings', icon: Settings, roles: [], category: 'Security' },
    { name: 'MFA Options', to: '/security/mfa', icon: Key, roles: [], category: 'Security' },
    { name: 'Compliance Center', to: '/security/compliance', icon: FileCheck, roles: [], category: 'Security' },
    { name: 'Audit Trails', to: '/security/audit', icon: Activity, roles: [], category: 'Security' },

    { name: 'Settings', to: '/settings', icon: Settings, roles: [], category: 'General' },

    // Phase 14 — System Admin & DevOps Center
    { name: 'Admin Command Center', to: '/admin', icon: Shield, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'System Settings', to: '/admin/settings', icon: Settings, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Tenant Management', to: '/admin/tenants', icon: Building, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Role Administration', to: '/admin/roles', icon: Users, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Permissions Matrix', to: '/admin/permissions', icon: Key, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'License Center', to: '/admin/license', icon: Key, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Subscription Plans', to: '/admin/plans', icon: CreditCard, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Integrations Hub', to: '/admin/integrations', icon: Network, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Webhooks', to: '/admin/webhooks', icon: Activity, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Plugin Marketplace', to: '/admin/marketplace', icon: Layers, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Installed Plugins', to: '/admin/plugins', icon: Layers, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Branding & Theme', to: '/admin/branding', icon: Layout, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'System Health', to: '/admin/health', icon: Activity, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Server Logs', to: '/admin/logs', icon: ClipboardList, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Job Scheduler', to: '/admin/scheduler', icon: Clock, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Database Admin', to: '/admin/database', icon: BarChart3, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Cache Monitor', to: '/admin/cache', icon: Cpu, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Deployments', to: '/admin/deployments', icon: FolderGit2, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Env Variables', to: '/admin/env', icon: Settings, roles: ['ADMIN'], category: 'System DevOps' },
    { name: 'Telemetry', to: '/admin/telemetry', icon: TrendingUp, roles: ['ADMIN'], category: 'System DevOps' },
  ];

  const visibleItems = useMemo(() => {
    return navigationItems.filter(item => {
      // Role match
      const roleMatches = item.roles.length === 0 || (user && item.roles.includes(user.role));
      if (!roleMatches) return false;
      
      // Search query match
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               item.category.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  }, [user, searchQuery]);

  return (
    <aside 
      className={`bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shadow-2xl z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header Logo */}
      <div className={`p-5 border-b border-slate-800/60 flex items-center justify-between`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 pl-1">
            <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Amdox ERP</h1>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Enterprise Suite</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white p-2 rounded-xl mx-auto shadow-md shadow-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
        )}
        
        {/* Toggle Collapse Button */}
        {!isCollapsed && (
          <button 
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-700/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Filter Search (Only visible when expanded) */}
      {!isCollapsed && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/40 border border-slate-800 rounded-xl text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-sidebar-scroll">
        {visibleItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105" />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
            
            {/* Collapse indicator marker */}
            {isCollapsed && (
              <div className="absolute left-0 w-1 h-0 bg-blue-500 rounded-r-full transition-all group-hover:h-6" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle trigger for collapsed view */}
      {isCollapsed && (
        <div className="p-4 border-t border-slate-800/60 flex justify-center">
          <button 
            onClick={toggleCollapse}
            className="p-2 hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-700/30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sidebar Footer User Section */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/15 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-md">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </p>
                <p className="text-[9px] text-slate-500 font-bold truncate uppercase tracking-widest">
                  {user?.role.replace('_', ' ') || 'No Role'}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all duration-200 border border-slate-800/60 hover:border-red-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-md">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
