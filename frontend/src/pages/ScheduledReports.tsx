import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, Mail, ShieldCheck, Plus, Trash2, ToggleLeft, ToggleRight, 
  Loader2, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedReport {
  id: string;
  title: string;
  module: string;
}

interface ScheduleRecord {
  id: string;
  schedule: string;
  recipients: string;
  format: string;
  status: string;
  createdAt: string;
  report: {
    title: string;
    module: string;
  };
}

const ScheduledReports: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  // New schedule form state
  const [selectedReportId, setSelectedReportId] = useState('');
  const [cronExpression, setCronExpression] = useState('0 9 * * 1'); // Monday 9am
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState('PDF');
  const [formLoading, setFormLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const [schedRes, repRes] = await Promise.all([
        axios.get('/api/reports/scheduled'),
        axios.get('/api/reports'),
      ]);
      setSchedules(schedRes.data?.data || []);
      setSavedReports(repRes.data?.data?.saved || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !recipients) {
      alert('Please select a report design and fill in the recipients emails list.');
      return;
    }

    setFormLoading(true);
    setNotif(null);
    try {
      await axios.post('/api/reports/scheduled', {
        reportId: selectedReportId,
        schedule: cronExpression,
        recipients,
        format,
      });
      setSelectedReportId('');
      setRecipients('');
      setNotif('Broadcast routine scheduled successfully.');
      fetchSchedules();
    } catch (err: any) {
      console.error(err);
      alert('Failed to schedule report distribution.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axios.patch(`/api/reports/scheduled/${id}/toggle`);
      fetchSchedules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to stop this automated schedule?')) return;
    try {
      await axios.delete(`/api/reports/scheduled/${id}`);
      fetchSchedules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Upper header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/reports')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Automated Scheduled Reports</h1>
          <p className="text-slate-400 text-xs mt-0.5">Automate recurring PDF/Excel exports delivered to email contacts lists.</p>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Creation panel (Col span 1) */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>Create New Schedule</span>
          </h2>

          {savedReports.length === 0 ? (
            <div className="text-[10px] text-slate-500 bg-slate-950 p-4 border border-slate-900 rounded-xl leading-relaxed">
              *Note: You must first configure and **Save** a custom report layout inside the Report Builder page before scheduling it.*
            </div>
          ) : (
            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Select Report Layout</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  required
                >
                  <option value="">-- Choose saved report --</option>
                  {savedReports.map((r) => (
                    <option key={r.id} value={r.id}>[{r.module}] {r.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Frequency Cron Pattern</label>
                <select
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="0 9 * * 1">Every Monday at 9:00 AM</option>
                  <option value="0 0 * * *">Daily at Midnight (00:00)</option>
                  <option value="0 18 * * 5">Weekly on Friday at 6:00 PM</option>
                  <option value="0 9 1 * *">Monthly on the 1st at 9:00 AM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Recipients Emails (Comma separated)</label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="executive@amdox.com, audit@amdox.com"
                  rows={3}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[10px] font-bold uppercase">Output format type</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="PDF">Printable PDF Layout</option>
                  <option value="EXCEL">Spreadsheet Excel Format</option>
                  <option value="CSV">Comma Separated CSV</option>
                  <option value="JSON">Raw JSON Data Nodes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {formLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
                <span>Activate Schedule</span>
              </button>
            </form>
          )}
        </div>

        {/* Existing Schedules list (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Broadcast Schedules</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading active schedules...</span>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl">
              No report schedules configured. Set up filters above to broadcast reports automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((item) => (
                <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.report?.title}</span>
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-800 text-[8px] text-slate-400 border border-slate-700/50 uppercase font-bold">
                        {item.report?.module}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500">
                      <p className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>Frequency: <strong className="text-slate-400 font-semibold">{item.schedule}</strong></span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-sm">To: <strong className="text-slate-400 font-semibold">{item.recipients}</strong></span>
                      </p>
                      <p>Format: <strong className="text-slate-400 font-semibold">{item.format}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors ${item.status === 'ACTIVE' ? 'text-indigo-400' : 'text-slate-600'}`}
                      title={item.status === 'ACTIVE' ? 'Deactivate schedule' : 'Activate schedule'}
                    >
                      {item.status === 'ACTIVE' ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Delete schedule"
                    >
                      <Trash2 className="h-4 w-4" />
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

export default ScheduledReports;
export { ScheduledReports };
