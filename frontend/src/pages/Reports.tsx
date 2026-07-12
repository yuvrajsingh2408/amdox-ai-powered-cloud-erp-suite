import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, BarChart3, TrendingUp, 
  CheckCircle, Clock, FileSpreadsheet, ChevronRight, 
  RefreshCw, PlayCircle, Filter, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface ReportTemplate {
  id: string;
  name: string;
  category: 'Finance' | 'HR & Payroll' | 'Inventory & SCM' | 'System Logs';
  description: string;
  lastGenerated: string;
  status: 'Ready' | 'Generating' | 'Failed';
}

const Reports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Finance' | 'HR & Payroll' | 'Inventory & SCM' | 'System Logs'>('All');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'XLSX'>('PDF');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock data for query trends
  const analyticsData = [
    { name: 'Mon', finance: 24, hr: 18, scm: 12 },
    { name: 'Tue', finance: 30, hr: 22, scm: 15 },
    { name: 'Wed', finance: 45, hr: 28, scm: 20 },
    { name: 'Thu', finance: 32, hr: 24, scm: 18 },
    { name: 'Fri', finance: 50, hr: 35, scm: 25 },
    { name: 'Sat', finance: 12, hr: 8, scm: 6 },
    { name: 'Sun', finance: 15, hr: 10, scm: 8 },
  ];

  const reportTemplates: ReportTemplate[] = [
    { id: 'fin-01', name: 'Income Statement (P&L)', category: 'Finance', description: 'Monthly revenue, cost of goods sold, and operating expenses breakdown.', lastGenerated: '2026-06-25 18:30', status: 'Ready' },
    { id: 'fin-02', name: 'Accounts Receivable Aging', category: 'Finance', description: 'Outstanding customer invoices classified by days outstanding.', lastGenerated: '2026-06-26 12:00', status: 'Ready' },
    { id: 'fin-03', name: 'General Ledger Audit Trail', category: 'Finance', description: 'Double-entry transaction records for active ledger accounts.', lastGenerated: '2026-06-20 10:15', status: 'Ready' },
    
    { id: 'hr-01', name: 'FTE Cost & Compensation Distribution', category: 'HR & Payroll', description: 'Overall payroll burden grouped by engineering, sales, and operations.', lastGenerated: '2026-06-26 09:00', status: 'Ready' },
    { id: 'hr-02', name: 'Attendance & Clock-In Audits', category: 'HR & Payroll', description: 'Daily biometric register summary with overtime delta tracking.', lastGenerated: '2026-06-24 17:00', status: 'Ready' },
    { id: 'hr-03', name: 'Leave Liability Balance', category: 'HR & Payroll', description: 'Accrued vs. taken paid leave allowances per business unit.', lastGenerated: '2026-06-18 14:22', status: 'Ready' },
    
    { id: 'inv-01', name: 'Safety Stock Reorder Recommendations', category: 'Inventory & SCM', description: 'Replenishment suggestions for products below safety limits.', lastGenerated: '2026-06-26 14:10', status: 'Ready' },
    { id: 'inv-02', name: 'Supplier Fulfillment & Lead Times', category: 'Inventory & SCM', description: 'Vendor metrics detailing promised vs. actual arrival days.', lastGenerated: '2026-06-22 11:30', status: 'Ready' },
    
    { id: 'sys-01', name: 'Secured Audit & Login Logs', category: 'System Logs', description: 'User login records, failed tokens, and administrative overrides.', lastGenerated: '2026-06-26 15:00', status: 'Ready' }
  ];

  const filteredTemplates = selectedCategory === 'All' 
    ? reportTemplates 
    : reportTemplates.filter(t => t.category === selectedCategory);

  const triggerExport = (reportId: string, name: string) => {
    setIsGenerating(reportId);
    setTimeout(() => {
      setIsGenerating(null);
      setToastMessage(`Exported "${name}" successfully as ${exportFormat}!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Export raw data worksheets, audit trails, and graphical metrics</p>
        </div>
        
        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['PDF', 'CSV', 'XLSX'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  exportFormat === fmt 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3.5 text-xs flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reports Active</span>
            <div className="p-2 rounded-lg border border-blue-100 bg-blue-50 text-primary">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-slate-800">9 Active Templates</span>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Spans 4 module categories</p>
          </div>
        </div>

        <div className="card-premium p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Query Requests</span>
            <div className="p-2 rounded-lg border border-green-100 bg-green-50 text-success">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-slate-800">142 Requests Today</span>
            <p className="text-[10px] text-slate-500 font-medium mt-1">+12.4% query load increase</p>
          </div>
        </div>

        <div className="card-premium p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Schedules</span>
            <div className="p-2 rounded-lg border border-amber-100 bg-amber-50 text-warning">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-slate-800">4 Active Cron Jobs</span>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Emailed directly to system C-levels</p>
          </div>
        </div>
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Report list & filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-premium p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" />
                Report Templates
              </h3>
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Finance', 'HR & Payroll', 'Inventory & SCM', 'System Logs'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border tracking-wide transition-all ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Rows */}
            <div className="divide-y divide-slate-100">
              {filteredTemplates.map(report => (
                <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{report.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                        {report.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{report.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last run: {report.lastGenerated}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isGenerating !== null}
                    onClick={() => triggerExport(report.id, report.name)}
                    className="btn-secondary self-start sm:self-center py-2 px-3.5 flex items-center gap-2 text-xs font-bold w-full sm:w-auto justify-center"
                  >
                    {isGenerating === report.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Export {exportFormat}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Reports Activity Graph & Automation settings */}
        <div className="space-y-6">
          {/* Query Trends Charts */}
          <div className="card-premium p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Query Request Load
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="finance" name="Finance" stroke="#2563EB" strokeWidth={1.5} fillOpacity={0.05} fill="#2563EB" />
                  <Area type="monotone" dataKey="hr" name="HR & Payroll" stroke="#10B981" strokeWidth={1.5} fillOpacity={0.03} fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Automated Scheduler Panel */}
          <div className="card-premium p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              Cron Job Automations
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:bg-slate-100/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">Weekly Profit/Loss Audit</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-green-50 text-success border border-green-200">Active</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Runs every Sunday 23:59. Dispatched to `finance-team@company.com`</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:bg-slate-100/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800">Daily Safety Stock Warning</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-green-50 text-success border border-green-200">Active</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Runs Daily 08:00. Dispatched to `scm-officer@company.com`</p>
              </div>
            </div>

            <button className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold">
              <PlayCircle className="h-4 w-4 text-primary" />
              Configure Custom Recurrence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
