import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';

// ─── Page Loader Fallback ──────────────────────────────────────────────────
const PageLoader = memo(() => (
  <div className="flex items-center justify-center h-screen bg-gray-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-gray-400 text-sm">Loading…</span>
    </div>
  </div>
));
PageLoader.displayName = 'PageLoader';

// ─── Helper: Lazy + Suspense wrapper ──────────────────────────────────────
function lazyPage(
  importFn: () => Promise<{ default: React.ComponentType }>
): () => React.ReactElement {
  const Lazy = lazy(importFn);
  const Wrapped = () => (
    <Suspense fallback={<PageLoader />}>
      <Lazy />
    </Suspense>
  );
  return Wrapped;
}

// ─── Auth Pages (small — loaded eagerly for speed) ─────────────────────────
const Login       = lazy(() => import('./pages/Login'));
const ForgotPw    = lazy(() => import('./pages/ForgotPassword'));
const ResetPw     = lazy(() => import('./pages/ResetPassword'));

// ─── Core ──────────────────────────────────────────────────────────────────
const Dashboard         = lazyPage(() => import('./pages/Dashboard'));
const Users             = lazyPage(() => import('./pages/Users'));
const Roles             = lazyPage(() => import('./pages/Roles'));
const Permissions       = lazyPage(() => import('./pages/Permissions'));
const Departments       = lazyPage(() => import('./pages/Departments'));
const Tenants           = lazyPage(() => import('./pages/Tenants'));
const Profile           = lazyPage(() => import('./pages/Profile'));

// ─── HR & Payroll ──────────────────────────────────────────────────────────
const HRDashboard        = lazyPage(() => import('./pages/HRDashboard'));
const HR                 = lazyPage(() => import('./pages/HR'));
const Attendance         = lazyPage(() => import('./pages/Attendance'));
const LeaveManagement    = lazyPage(() => import('./pages/LeaveManagement'));
const LeaveApproval      = lazyPage(() => import('./pages/LeaveApproval'));
const PayrollDashboard   = lazyPage(() => import('./pages/PayrollDashboard'));
const PayrollProcessing  = lazyPage(() => import('./pages/PayrollProcessing'));
const PayslipViewer      = lazyPage(() => import('./pages/PayslipViewer'));
const OrganizationChart  = lazyPage(() => import('./pages/OrganizationChart'));

// ─── Finance ───────────────────────────────────────────────────────────────
const FinanceDashboard       = lazyPage(() => import('./pages/FinanceDashboard'));
const ChartOfAccounts        = lazyPage(() => import('./pages/ChartOfAccounts'));
const JournalEntries         = lazyPage(() => import('./pages/JournalEntries'));
const AccountsPayable        = lazyPage(() => import('./pages/AccountsPayable'));
const AccountsReceivable     = lazyPage(() => import('./pages/AccountsReceivable'));
const BankAccounts           = lazyPage(() => import('./pages/BankAccounts'));
const CurrencyRates          = lazyPage(() => import('./pages/CurrencyRates'));
const FinancialReports       = lazyPage(() => import('./pages/FinancialReports'));

// ─── Supply Chain & Inventory ──────────────────────────────────────────────
const SCMDashboard           = lazyPage(() => import('./pages/SCMDashboard'));
const Vendors                = lazyPage(() => import('./pages/Vendors'));
const PurchaseRequisitions   = lazyPage(() => import('./pages/PurchaseRequisitions'));
const PurchaseOrders         = lazyPage(() => import('./pages/PurchaseOrders'));
const GoodsReceipts          = lazyPage(() => import('./pages/GoodsReceipts'));
const WarehouseManagement    = lazyPage(() => import('./pages/WarehouseManagement'));
const AIReorders             = lazyPage(() => import('./pages/AIReorders'));
const SCMReports             = lazyPage(() => import('./pages/SCMReports'));
const Inventory              = lazyPage(() => import('./pages/Inventory'));

// ─── AI & BI ───────────────────────────────────────────────────────────────
const ExecutiveDashboard  = lazyPage(() => import('./pages/ExecutiveDashboard'));
const BIBuilder           = lazyPage(() => import('./pages/BIBuilder'));
const ForecastDashboard   = lazyPage(() => import('./pages/ForecastDashboard'));
const Forecasting         = lazyPage(() => import('./pages/Forecasting'));

// ─── Projects ──────────────────────────────────────────────────────────────
const Projects        = lazyPage(() => import('./pages/Projects'));
const ProjectDashboard = lazyPage(() => import('./pages/ProjectDashboard'));
const ProjectDetails  = lazyPage(() => import('./pages/ProjectDetails'));
const TaskDetails     = lazyPage(() => import('./pages/TaskDetails'));

// ─── CRM ───────────────────────────────────────────────────────────────────
const CRMAnalytics  = lazyPage(() => import('./pages/CRMAnalytics'));
const Leads         = lazyPage(() => import('./pages/Leads'));
const Clients       = lazyPage(() => import('./pages/Clients'));

// ─── Reports & Analytics ───────────────────────────────────────────────────
const Reports                 = lazyPage(() => import('./pages/Reports'));
const ReportsDashboard        = lazyPage(() => import('./pages/ReportsDashboard'));
const ReportBuilder           = lazyPage(() => import('./pages/ReportBuilder'));
const ScheduledReports        = lazyPage(() => import('./pages/ScheduledReports'));
const AnalyticsDashboard      = lazyPage(() => import('./pages/AnalyticsDashboard'));
const ExportCenter            = lazyPage(() => import('./pages/ExportCenter'));
const ExecutiveReports        = lazyPage(() => import('./pages/ExecutiveReports'));
const FinancialReportsAdvanced = lazyPage(() => import('./pages/FinancialReportsAdvanced'));
const HRReports               = lazyPage(() => import('./pages/HRReports'));
const SCMReportsAdvanced      = lazyPage(() => import('./pages/SCMReportsAdvanced'));
const CRMReportsAdvanced      = lazyPage(() => import('./pages/CRMReportsAdvanced'));
const ProjectReports          = lazyPage(() => import('./pages/ProjectReports'));
const AuditReports            = lazyPage(() => import('./pages/AuditReports'));

// ─── Notifications ─────────────────────────────────────────────────────────
const Notifications         = lazyPage(() => import('./pages/Notifications'));
const NotificationCenter    = lazyPage(() => import('./pages/NotificationCenter'));
const Announcements         = lazyPage(() => import('./pages/Announcements'));
const NotificationSettings  = lazyPage(() => import('./pages/NotificationSettings'));
const EmailTemplates        = lazyPage(() => import('./pages/EmailTemplates'));

// ─── Settings ──────────────────────────────────────────────────────────────
const SettingsPage = lazyPage(() => import('./pages/Settings'));

// ─── Document Management ───────────────────────────────────────────────────
const DocumentDashboard = lazyPage(() => import('./pages/DocumentDashboard'));
const Documents         = lazyPage(() => import('./pages/Documents'));
const Folders           = lazyPage(() => import('./pages/Folders'));
const DocumentViewer    = lazyPage(() => import('./pages/DocumentViewer'));
const RecycleBin        = lazyPage(() => import('./pages/RecycleBin'));
const SharedDocuments   = lazyPage(() => import('./pages/SharedDocuments'));

// ─── AI Assistant & Copilot ────────────────────────────────────────────────
const AIAssistant        = lazyPage(() => import('./pages/AIAssistant'));
const AIChat             = lazyPage(() => import('./pages/AIChat'));
const AIInsights         = lazyPage(() => import('./pages/AIInsights'));
const AIRecommendations  = lazyPage(() => import('./pages/AIRecommendations'));
const PromptLibrary      = lazyPage(() => import('./pages/PromptLibrary'));
const ConversationHistory = lazyPage(() => import('./pages/ConversationHistory'));
const ExecutiveSummary   = lazyPage(() => import('./pages/ExecutiveSummary'));

// ─── Workflow Automation ───────────────────────────────────────────────────
const WorkflowDashboard  = lazyPage(() => import('./pages/WorkflowDashboard'));
const WorkflowBuilder    = lazyPage(() => import('./pages/WorkflowBuilder'));
const WorkflowTemplates  = lazyPage(() => import('./pages/WorkflowTemplates'));
const WorkflowInstances  = lazyPage(() => import('./pages/WorkflowInstances'));
const ApprovalInbox      = lazyPage(() => import('./pages/ApprovalInbox'));
const ApprovalHistory    = lazyPage(() => import('./pages/ApprovalHistory'));
const EscalationCenter   = lazyPage(() => import('./pages/EscalationCenter'));
const WorkflowAnalytics  = lazyPage(() => import('./pages/WorkflowAnalytics'));
const WorkflowSettings   = lazyPage(() => import('./pages/WorkflowSettings'));
const ManagerApprovals   = lazyPage(() => import('./pages/ManagerApprovals'));
const FinanceApprovals   = lazyPage(() => import('./pages/FinanceApprovals'));
const HRApprovals        = lazyPage(() => import('./pages/HRApprovals'));
const PurchaseApprovals  = lazyPage(() => import('./pages/PurchaseApprovals'));
const InvoiceApprovals   = lazyPage(() => import('./pages/InvoiceApprovals'));

// ─── Customer & Vendor Portals ─────────────────────────────────────────────
const PortalDashboard        = lazyPage(() => import('./pages/PortalDashboard'));
const CustomerDashboard      = lazyPage(() => import('./pages/CustomerDashboard'));
const VendorDashboard        = lazyPage(() => import('./pages/VendorDashboard'));
const CustomerOrders         = lazyPage(() => import('./pages/CustomerOrders'));
const PurchaseOrdersPortal   = lazyPage(() => import('./pages/PurchaseOrdersPortal'));
const InvoicesPortal         = lazyPage(() => import('./pages/InvoicesPortal'));
const PaymentsPortal         = lazyPage(() => import('./pages/PaymentsPortal'));
const ShipmentTracking       = lazyPage(() => import('./pages/ShipmentTracking'));
const SupportTickets         = lazyPage(() => import('./pages/SupportTickets'));
const TicketDetails          = lazyPage(() => import('./pages/TicketDetails'));
const KnowledgeBase          = lazyPage(() => import('./pages/KnowledgeBase'));
const AnnouncementsPortal    = lazyPage(() => import('./pages/AnnouncementsPortal'));
const PortalNotifications    = lazyPage(() => import('./pages/PortalNotifications'));
const ProfilePortal          = lazyPage(() => import('./pages/ProfilePortal'));
const DocumentsPortal        = lazyPage(() => import('./pages/DocumentsPortal'));
const VendorPerformance      = lazyPage(() => import('./pages/VendorPerformance'));
const ContractsPortal        = lazyPage(() => import('./pages/ContractsPortal'));

// ─── Security & Compliance ─────────────────────────────────────────────────
const SecurityDashboard = lazyPage(() => import('./pages/SecurityDashboard'));
const Sessions          = lazyPage(() => import('./pages/Sessions'));
const LoginHistory      = lazyPage(() => import('./pages/LoginHistory'));
const TrustedDevices    = lazyPage(() => import('./pages/TrustedDevices'));
const APIKeys           = lazyPage(() => import('./pages/APIKeys'));
const PasswordPolicy    = lazyPage(() => import('./pages/PasswordPolicy'));
const SecurityAlerts    = lazyPage(() => import('./pages/SecurityAlerts'));
const BackupCenter      = lazyPage(() => import('./pages/BackupCenter'));
const ComplianceCenter  = lazyPage(() => import('./pages/ComplianceCenter'));
const AuditEvents       = lazyPage(() => import('./pages/AuditEvents'));
const MFASettings       = lazyPage(() => import('./pages/MFASettings'));
const SecuritySettings  = lazyPage(() => import('./pages/SecuritySettings'));

// ─── System Administration ─────────────────────────────────────────────────
const AdminDashboard    = lazyPage(() => import('./pages/AdminDashboard'));
const SystemSettings    = lazyPage(() => import('./pages/SystemSettings'));
const TenantManagement  = lazyPage(() => import('./pages/TenantManagement'));
const TenantDetails     = lazyPage(() => import('./pages/TenantDetails'));
const RoleManagement    = lazyPage(() => import('./pages/RoleManagement'));
const PermissionMatrix  = lazyPage(() => import('./pages/PermissionMatrix'));
const LicenseCenter     = lazyPage(() => import('./pages/LicenseCenter'));
const SubscriptionPlans = lazyPage(() => import('./pages/SubscriptionPlans'));
const Integrations      = lazyPage(() => import('./pages/Integrations'));
const Webhooks          = lazyPage(() => import('./pages/Webhooks'));
const Marketplace       = lazyPage(() => import('./pages/Marketplace'));
const Plugins           = lazyPage(() => import('./pages/Plugins'));
const Branding          = lazyPage(() => import('./pages/Branding'));
const SystemHealth      = lazyPage(() => import('./pages/SystemHealth'));
const ServerLogs        = lazyPage(() => import('./pages/ServerLogs'));
const Scheduler         = lazyPage(() => import('./pages/Scheduler'));
const DatabaseAdmin     = lazyPage(() => import('./pages/DatabaseAdmin'));
const CacheMonitor      = lazyPage(() => import('./pages/CacheMonitor'));
const Deployments       = lazyPage(() => import('./pages/Deployments'));
const EnvVariables      = lazyPage(() => import('./pages/EnvVariables'));
const TelemetryMonitor  = lazyPage(() => import('./pages/TelemetryMonitor'));

// ─────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Pages */}
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPw /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPw /></Suspense>} />

          {/* Secure Layout routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="departments" element={<Departments />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="profile" element={<Profile />} />

            {/* HR Routes */}
            <Route path="hr" element={<HRDashboard />} />
            <Route path="hr/directory" element={<HR />} />
            <Route path="hr/attendance" element={<Attendance />} />
            <Route path="hr/leaves" element={<LeaveManagement />} />
            <Route path="hr/approvals" element={<LeaveApproval />} />

            {/* Payroll Routes */}
            <Route path="payroll" element={<PayrollDashboard />} />
            <Route path="payroll/process" element={<PayrollProcessing />} />
            <Route path="payroll/payslips/:id" element={<PayslipViewer />} />
            <Route path="org-chart" element={<OrganizationChart />} />

            {/* Finance Routes */}
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="finance/coa" element={<ChartOfAccounts />} />
            <Route path="finance/journal" element={<JournalEntries />} />
            <Route path="finance/ap" element={<AccountsPayable />} />
            <Route path="finance/ar" element={<AccountsReceivable />} />
            <Route path="finance/bank" element={<BankAccounts />} />
            <Route path="finance/currencies" element={<CurrencyRates />} />
            <Route path="finance/reports" element={<FinancialReports />} />

            {/* SCM & Inventory Routes */}
            <Route path="scm" element={<SCMDashboard />} />
            <Route path="scm/vendors" element={<Vendors />} />
            <Route path="scm/requisitions" element={<PurchaseRequisitions />} />
            <Route path="scm/pos" element={<PurchaseOrders />} />
            <Route path="scm/grns" element={<GoodsReceipts />} />
            <Route path="scm/warehouses" element={<WarehouseManagement />} />
            <Route path="scm/reorders" element={<AIReorders />} />
            <Route path="scm/reports" element={<SCMReports />} />
            <Route path="inventory" element={<Inventory />} />

            {/* AI & BI Routes */}
            <Route path="bi" element={<ExecutiveDashboard />} />
            <Route path="bi/builder" element={<BIBuilder />} />
            <Route path="bi/forecasting" element={<ForecastDashboard />} />
            <Route path="forecasting" element={<Forecasting />} />

            {/* Project Routes */}
            <Route path="projects" element={<Projects />} />
            <Route path="projects/dashboard" element={<ProjectDashboard />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/tasks/:id" element={<TaskDetails />} />

            {/* CRM Routes */}
            <Route path="crm" element={<CRMAnalytics />} />
            <Route path="crm/leads" element={<Leads />} />
            <Route path="crm/clients" element={<Clients />} />

            {/* Reports & Analytics Routes */}
            <Route path="reports" element={<Reports />} />
            <Route path="reports/dashboard" element={<ReportsDashboard />} />
            <Route path="reports/builder" element={<ReportBuilder />} />
            <Route path="reports/scheduled" element={<ScheduledReports />} />
            <Route path="reports/analytics" element={<AnalyticsDashboard />} />
            <Route path="reports/exports" element={<ExportCenter />} />
            <Route path="reports/executive" element={<ExecutiveReports />} />
            <Route path="reports/finance" element={<FinancialReportsAdvanced />} />
            <Route path="reports/hr" element={<HRReports />} />
            <Route path="reports/scm" element={<SCMReportsAdvanced />} />
            <Route path="reports/crm" element={<CRMReportsAdvanced />} />
            <Route path="reports/projects" element={<ProjectReports />} />
            <Route path="reports/audit" element={<AuditReports />} />

            {/* Notifications Routes */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="notifications/center" element={<NotificationCenter />} />
            <Route path="notifications/announcements" element={<Announcements />} />
            <Route path="notifications/settings" element={<NotificationSettings />} />
            <Route path="notifications/templates" element={<EmailTemplates />} />

            <Route path="settings" element={<SettingsPage />} />

            {/* Document Management Routes */}
            <Route path="dms" element={<DocumentDashboard />} />
            <Route path="dms/files" element={<Documents />} />
            <Route path="dms/folders" element={<Folders />} />
            <Route path="dms/view/:id" element={<DocumentViewer />} />
            <Route path="dms/trash" element={<RecycleBin />} />
            <Route path="dms/shared" element={<SharedDocuments />} />

            {/* AI Assistant Routes */}
            <Route path="ai" element={<AIAssistant />} />
            <Route path="ai/chat" element={<AIChat />} />
            <Route path="ai/insights" element={<AIInsights />} />
            <Route path="ai/recommendations" element={<AIRecommendations />} />
            <Route path="ai/prompts" element={<PromptLibrary />} />
            <Route path="ai/history" element={<ConversationHistory />} />
            <Route path="ai/summary" element={<ExecutiveSummary />} />

            {/* Workflow Automation Routes */}
            <Route path="workflows" element={<WorkflowDashboard />} />
            <Route path="workflows/builder" element={<WorkflowBuilder />} />
            <Route path="workflows/templates" element={<WorkflowTemplates />} />
            <Route path="workflows/instances" element={<WorkflowInstances />} />
            <Route path="workflows/inbox" element={<ApprovalInbox />} />
            <Route path="workflows/history" element={<ApprovalHistory />} />
            <Route path="workflows/escalations" element={<EscalationCenter />} />
            <Route path="workflows/analytics" element={<WorkflowAnalytics />} />
            <Route path="workflows/settings" element={<WorkflowSettings />} />
            <Route path="workflows/approvals/manager" element={<ManagerApprovals />} />
            <Route path="workflows/approvals/finance" element={<FinanceApprovals />} />
            <Route path="workflows/approvals/hr" element={<HRApprovals />} />
            <Route path="workflows/approvals/purchase" element={<PurchaseApprovals />} />
            <Route path="workflows/approvals/invoice" element={<InvoiceApprovals />} />

            {/* Customer & Vendor Portal Routes */}
            <Route path="portals" element={<PortalDashboard />} />
            <Route path="portals/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="portals/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="portals/customer/orders" element={<CustomerOrders />} />
            <Route path="portals/vendor/purchase-orders" element={<PurchaseOrdersPortal />} />
            <Route path="portals/invoices" element={<InvoicesPortal />} />
            <Route path="portals/payments" element={<PaymentsPortal />} />
            <Route path="portals/shipments" element={<ShipmentTracking />} />
            <Route path="portals/customer/tickets" element={<SupportTickets />} />
            <Route path="portals/tickets/details/:id" element={<TicketDetails />} />
            <Route path="portals/kb" element={<KnowledgeBase />} />
            <Route path="portals/announcements" element={<AnnouncementsPortal />} />
            <Route path="portals/notifications" element={<PortalNotifications />} />
            <Route path="portals/profile" element={<ProfilePortal />} />
            <Route path="portals/documents" element={<DocumentsPortal />} />
            <Route path="portals/vendor/performance" element={<VendorPerformance />} />
            <Route path="portals/contracts" element={<ContractsPortal />} />

            {/* Security & Compliance Routes */}
            <Route path="security" element={<SecurityDashboard />} />
            <Route path="security/sessions" element={<Sessions />} />
            <Route path="security/login-history" element={<LoginHistory />} />
            <Route path="security/trusted-devices" element={<TrustedDevices />} />
            <Route path="security/api-keys" element={<APIKeys />} />
            <Route path="security/password-policy" element={<PasswordPolicy />} />
            <Route path="security/alerts" element={<SecurityAlerts />} />
            <Route path="security/backups" element={<BackupCenter />} />
            <Route path="security/compliance" element={<ComplianceCenter />} />
            <Route path="security/audit" element={<AuditEvents />} />
            <Route path="security/mfa" element={<MFASettings />} />
            <Route path="security/settings" element={<SecuritySettings />} />

            {/* System Administration Routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/settings" element={<SystemSettings />} />
            <Route path="admin/tenants" element={<TenantManagement />} />
            <Route path="admin/tenants/:id" element={<TenantDetails />} />
            <Route path="admin/roles" element={<RoleManagement />} />
            <Route path="admin/permissions" element={<PermissionMatrix />} />
            <Route path="admin/license" element={<LicenseCenter />} />
            <Route path="admin/plans" element={<SubscriptionPlans />} />
            <Route path="admin/integrations" element={<Integrations />} />
            <Route path="admin/webhooks" element={<Webhooks />} />
            <Route path="admin/marketplace" element={<Marketplace />} />
            <Route path="admin/plugins" element={<Plugins />} />
            <Route path="admin/branding" element={<Branding />} />
            <Route path="admin/health" element={<SystemHealth />} />
            <Route path="admin/logs" element={<ServerLogs />} />
            <Route path="admin/scheduler" element={<Scheduler />} />
            <Route path="admin/database" element={<DatabaseAdmin />} />
            <Route path="admin/cache" element={<CacheMonitor />} />
            <Route path="admin/deployments" element={<Deployments />} />
            <Route path="admin/env" element={<EnvVariables />} />
            <Route path="admin/telemetry" element={<TelemetryMonitor />} />
          </Route>

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
