import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, Calendar, History, Plus, Search, Star, Trash2, 
  ArrowRight, ShieldCheck, Sparkles, AlertCircle, Loader2 
} from 'lucide-react';

interface ReportConfig {
  id: string;
  title: string;
  module: string;
  description?: string;
  filters: string;
  chartType: string;
  fileType: string;
  isFavorite: boolean;
  createdAt: string;
}

interface ReportTemplate {
  id: string;
  title: string;
  module: string;
  description?: string;
  filters: string;
  chartType: string;
  fileType: string;
}

const ReportsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports');
      setSavedReports(res.data?.data?.saved || []);
      setTemplates(res.data?.data?.templates || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleToggleFavorite = async (id: string) => {
    try {
      await axios.patch(`/api/reports/${id}/favorite`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved report design?')) return;
    try {
      await axios.delete(`/api/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const getModuleColor = (mod: string) => {
    if (mod === 'HR') return 'text-purple-400 border-purple-950 bg-purple-950/20';
    if (mod === 'FINANCE') return 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    if (mod === 'SCM') return 'text-blue-400 border-blue-950 bg-blue-950/20';
    if (mod === 'CRM') return 'text-pink-400 border-pink-950 bg-pink-950/20';
    if (mod === 'PROJECT') return 'text-amber-400 border-amber-950 bg-amber-950/20';
    return 'text-slate-400 border-slate-800 bg-slate-900/60';
  };

  const filteredSaved = savedReports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-primary" />
            <span>Reports & Document Export Center</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Build custom reports, configure dynamic queries, run background schedules, and trace history logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/reports/builder"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Custom Report Builder</span>
          </Link>
          <Link
            to="/reports/scheduled"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule Configuration</span>
          </Link>
          <Link
            to="/reports/exports"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>Export History</span>
          </Link>
        </div>
      </div>

      {/* Audit Banner */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-200 block">Organizational Access Controls Enabled</span>
          <p className="text-slate-500 mt-0.5">
            Finance ledgers and employee compensation logs are locked under role permissions checks. Report downloads require active token audits.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Syncing saved reports config...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Saved Custom Designs (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Saved Report Designs</h2>
              <div className="relative w-48">
                <Search className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search saved designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {filteredSaved.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl">
                No custom report layouts saved. Click "Custom Report Builder" to configure dynamic filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSaved.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3 relative group">
                    <div className="flex items-start justify-between">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getModuleColor(report.module)}`}>
                        {report.module}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFavorite(report.id)}
                          className={`p-1 rounded hover:bg-slate-800 transition-colors ${report.isFavorite ? 'text-amber-400' : 'text-slate-600'}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1 text-slate-600 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{report.title}</h3>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{report.description || 'Custom generated filter metrics outline.'}</p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-slate-850">
                      <span>Format: {report.fileType} • Chart: {report.chartType}</span>
                      <button
                        onClick={() => navigate('/reports/builder', { state: { report } })}
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        <span>Run Now</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preset Templates */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Report Presets</h2>
            <div className="space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 bg-[#0F172A] border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getModuleColor(tpl.module)}`}>
                      {tpl.module}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">{tpl.fileType} Preset</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200">{tpl.title}</h3>
                  <p className="text-[10px] text-slate-500">{tpl.description}</p>

                  <button
                    onClick={() => navigate('/reports/builder', { state: { template: tpl } })}
                    className="w-full text-center py-1.5 mt-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Load Template Filters
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ReportsDashboard;
export { ReportsDashboard };
