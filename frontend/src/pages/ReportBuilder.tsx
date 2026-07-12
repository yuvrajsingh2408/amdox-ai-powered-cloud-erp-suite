import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, Calendar, Filter, Settings, RefreshCw, Download, 
  ArrowLeft, Save, Printer, Eye, BarChart4, Loader2, Sparkles, CheckCircle, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

const ReportBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;

  // Selected config parameters
  const [module, setModule] = useState('HR');
  const [title, setTitle] = useState('New Custom Report');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState<any>({
    startDate: '',
    endDate: '',
    departmentId: '',
    projectId: '',
    vendorId: '',
    customerId: '',
    status: '',
  });

  const [chartType, setChartType] = useState('NONE');
  const [fileType, setFileType] = useState('PDF');
  
  // Data lists
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Execution states
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load selection presets from history/dash
  useEffect(() => {
    if (stateData?.report) {
      const rep = stateData.report;
      setModule(rep.module);
      setTitle(rep.title);
      setDescription(rep.description || '');
      setChartType(rep.chartType);
      setFileType(rep.fileType);
      try {
        setFilters(JSON.parse(rep.filters));
      } catch (e) {
        console.error(e);
      }
    } else if (stateData?.template) {
      const tpl = stateData.template;
      setModule(tpl.module);
      setTitle(tpl.title);
      setDescription(tpl.description || '');
      setChartType(tpl.chartType);
      setFileType(tpl.fileType);
      try {
        setFilters(JSON.parse(tpl.filters));
      } catch (e) {
        console.error(e);
      }
    }
  }, [stateData]);

  // Load master registers data for filter fields
  const fetchFilterMasters = async () => {
    try {
      const [depRes, projRes, vendorRes, custRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/projects'),
        axios.get('/api/scm/vendors').catch(() => ({ data: { data: [] } })),
        axios.get('/api/ar/customers').catch(() => ({ data: { data: [] } })),
      ]);

      setDepartments(depRes.data?.data || []);
      setProjects(projRes.data?.data || []);
      setVendors(vendorRes.data?.data || []);
      setCustomers(custRes.data?.data || []);
    } catch (e) {
      console.error('Failed to load filters master data lists', e);
    }
  };

  useEffect(() => {
    fetchFilterMasters();
  }, []);

  const runPreview = async () => {
    setLoading(true);
    setNotif(null);
    try {
      const queryParams = new URLSearchParams({
        module,
        ...filters
      }).toString();
      
      const res = await axios.get(`/api/reports/preview?${queryParams}`);
      setPreviewRows(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      setNotif({ type: 'error', message: 'Failed to compile report data rows preview.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    setSaving(true);
    setNotif(null);
    try {
      await axios.post('/api/reports', {
        title,
        module,
        description,
        filters,
        chartType,
        fileType,
      });
      setNotif({ type: 'success', message: 'Custom report design saved to your library.' });
    } catch (err: any) {
      console.error(err);
      setNotif({ type: 'error', message: 'Failed to save report configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: string) => {
    setExporting(true);
    setNotif(null);
    try {
      const res = await axios.post('/api/reports/export', {
        title,
        module,
        filters,
        fileType: format,
      });
      const fileUrl = res.data?.data?.fileUrl || '#';
      setNotif({ type: 'success', message: `Export complete. Output saved under history logs.` });
      // Open download in new tab
      window.open(`/api/reports/download/${res.data?.data?.fileName}`, '_blank');
    } catch (err: any) {
      console.error(err);
      setNotif({ type: 'error', message: 'Compilation error. Export compilation aborted.' });
    } finally {
      setExporting(false);
    }
  };

  const updateFilterField = (field: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  // Compile visual stats datasets based on rows
  const getChartData = () => {
    if (module === 'HR') {
      // Group by department or render salaries list
      return previewRows.slice(0, 10).map((r) => ({
        name: r.name,
        salary: r.salary,
      }));
    }
    if (module === 'FINANCE') {
      return previewRows.slice(0, 10).map((r) => ({
        name: r.invoiceNumber,
        amount: r.amount,
      }));
    }
    if (module === 'SCM') {
      return previewRows.slice(0, 10).map((r) => ({
        name: r.name,
        stockValue: r.value,
      }));
    }
    if (module === 'CRM') {
      return previewRows.slice(0, 10).map((r) => ({
        name: r.dealName,
        value: r.amount,
      }));
    }
    if (module === 'PROJECT') {
      return previewRows.slice(0, 10).map((r) => ({
        name: r.projectName,
        budget: r.budget,
        actualCost: r.actualCost,
      }));
    }
    return [];
  };

  const chartData = getChartData();
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/reports')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Dynamic Custom Report Builder</h1>
            <p className="text-slate-400 text-xs mt-0.5">Define multi-variable filters and chart overlays.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDesign}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg hover:text-white transition-colors"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          notif.type === 'success' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-red-950/20 border-red-900/30 text-red-300'
        }`}>
          {notif.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> : <AlertTriangle className="h-4.5 w-4.5 text-red-400" />}
          <span>{notif.message}</span>
        </div>
      )}

      {/* Builder Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Filters Panel */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-5 h-fit">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 text-white font-bold text-xs uppercase tracking-wider">
            <Filter className="h-4 w-4 text-indigo-400" />
            <span>Report Parameters</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Title fields */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>

            {/* Scope module */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Target ERP Module</label>
              <select
                value={module}
                onChange={(e) => {
                  setModule(e.target.value);
                  setPreviewRows([]);
                }}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              >
                <option value="HR">Human Resources (HR)</option>
                <option value="FINANCE">Finance (Ledgers & Invoices)</option>
                <option value="SCM">Supply Chain (Products Catalog)</option>
                <option value="CRM">Client Relations (CRM Pipeline)</option>
                <option value="PROJECT">Project Delivery Boards</option>
                <option value="AUDIT">System Audit Logs</option>
              </select>
            </div>

            {/* Date ranges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilterField('startDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-[11px] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilterField('endDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {/* HR specific */}
            {module === 'HR' && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Department</label>
                <select
                  value={filters.departmentId}
                  onChange={(e) => updateFilterField('departmentId', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Project specific */}
            {module === 'PROJECT' && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Project status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilterField('status', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}

            {/* SCM specific */}
            {module === 'SCM' && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Stock Levels Threshold</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilterField('status', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">All Inventory levels</option>
                  <option value="LOW_STOCK">Low Stock (≤ 15 items)</option>
                </select>
              </div>
            )}

            {/* Graphic configurations */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Visual Representation</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              >
                <option value="NONE">No Chart overlay</option>
                <option value="BAR">Bar Graph Chart</option>
                <option value="LINE">Line Chart</option>
                <option value="PIE">Pie Chart Distribution</option>
                <option value="AREA">Area Chart Overlay</option>
              </select>
            </div>

            <button
              onClick={runPreview}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              <span>Compile Report Data</span>
            </button>
          </div>
        </div>

        {/* Right Output Area (Col span 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Chart Section */}
          {chartType !== 'NONE' && chartData.length > 0 && (
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BarChart4 className="h-4 w-4 text-indigo-400" />
                <span>Analytical Chart Visualization</span>
              </h2>

              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'BAR' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend />
                      <Bar dataKey={module === 'PROJECT' ? 'budget' : module === 'SCM' ? 'stockValue' : module === 'HR' ? 'salary' : 'amount'} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      {module === 'PROJECT' && <Bar dataKey="actualCost" fill="#ef4444" radius={[4, 4, 0, 0]} />}
                    </BarChart>
                  ) : chartType === 'LINE' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend />
                      <Line type="monotone" dataKey={module === 'PROJECT' ? 'budget' : module === 'SCM' ? 'stockValue' : module === 'HR' ? 'salary' : 'amount'} stroke="#3b82f6" strokeWidth={2.5} />
                    </LineChart>
                  ) : chartType === 'AREA' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Legend />
                        <Bar dataKey={module === 'PROJECT' ? 'budget' : module === 'SCM' ? 'stockValue' : module === 'HR' ? 'salary' : 'amount'} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={module === 'PROJECT' ? 'budget' : module === 'SCM' ? 'stockValue' : module === 'HR' ? 'salary' : 'amount'}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table Spreadsheet preview */}
          <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Details Preview</h2>
                <span className="text-[10px] text-slate-500">{previewRows.length} rows aggregated</span>
              </div>

              {previewRows.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExport('CSV')}
                    disabled={exporting}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-300"
                  >
                    <Download className="h-3 w-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('EXCEL')}
                    disabled={exporting}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-300"
                  >
                    <Download className="h-3 w-3" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-300"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>

            {previewRows.length === 0 ? (
              <div className="text-center py-20 text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl">
                No preview data compiled yet. Configure the fields on the left pane and trigger "Compile Report Data".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-850">
                    <tr>
                      {Object.keys(previewRows[0]).map((key) => (
                        <th key={key} className="px-4 py-2.5">{key.replace(/([A-Z])/g, ' $1')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-905">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="px-4 py-2.5 text-slate-300 whitespace-nowrap">
                            {typeof val === 'number' && val > 500 ? `$${val.toLocaleString()}` : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReportBuilder;
export { ReportBuilder };
