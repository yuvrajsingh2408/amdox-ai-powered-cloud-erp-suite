import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, Plus, RefreshCw, 
  ShieldAlert, CheckCircle2, User, Landmark, Video, Clock, DollarSign, X
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Meeting {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  client?: { company: string } | null;
}

interface KPIGroup {
  totalLeads: number;
  conversionRate: number;
  pipelineValue: number;
  closedWonRevenue: number;
}

interface Distribution {
  new: number;
  discovery: number;
  proposal: number;
  won: number;
  lost: number;
}

const CRMAnalytics: React.FC = () => {
  const [kpis, setKpis] = useState<KPIGroup | null>(null);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for scheduling meetings
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingDuration, setMeetingDuration] = useState('30');

  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const resStats = await axios.get('/api/crm/dashboard');
      if (resStats.data.success) {
        setKpis(resStats.data.data.kpis);
        setDistribution(resStats.data.data.dealsStageDistribution);
      }
      const resMeetings = await axios.get('/api/crm/meetings');
      if (resMeetings.data.success) {
        setMeetings(resMeetings.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setKpis({ totalLeads: 12, conversionRate: 45, pipelineValue: 185000, closedWonRevenue: 120000 });
      setDistribution({ new: 3, discovery: 2, proposal: 4, won: 2, lost: 1 });
      setMeetings([
        { id: 'm1', title: 'Q3 Requirements Alignment', date: '2026-07-10T10:00:00Z', durationMinutes: 45, client: { company: 'Austin Supplies LLC' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      const res = await axios.post('/api/crm/meetings', {
        title: meetingTitle,
        date: meetingDate,
        durationMinutes: parseInt(meetingDuration)
      });
      if (res.data.success) {
        setSuccess('Corporate client meeting scheduled successfully!');
        fetchCRMData();
        setIsMeetingModalOpen(false);
        setMeetingTitle('');
        setMeetingDate('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setFormLoading(false);
    }
  };

  const chartData = distribution ? [
    { stage: 'New', Count: distribution.new },
    { stage: 'Discovery', Count: distribution.discovery },
    { stage: 'Proposal', Count: distribution.proposal },
    { stage: 'Won', Count: distribution.won },
    { stage: 'Lost', Count: distribution.lost }
  ] : [];

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">CRM & Pipeline Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Verify conversion rates, examine deals stage distributions, and schedule corporate alignments</p>
        </div>
        <button
          onClick={fetchCRMData}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recalculate pipeline
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {loading || !kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 border border-slate-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><User className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Leads</span>
                <span className="text-xl font-bold text-slate-800">{kpis.totalLeads} Leads</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><RefreshCw className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Conversion rate</span>
                <span className="text-xl font-bold text-slate-800">{kpis.conversionRate}% Won</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg"><Landmark className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pipeline value</span>
                <span className="text-xl font-bold text-slate-800">${kpis.pipelineValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4.5 flex items-center gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-750 rounded-lg"><DollarSign className="h-5 w-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Won sales revenue</span>
                <span className="text-xl font-bold text-slate-800">${kpis.closedWonRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deals stages distribution chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-slate-850" />
                Opportunities Count by Pipeline Stage
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="stage" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="Count" fill="#0F172A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Corporate alignment meetings */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-slate-850" />
                    Scheduled corporate alignments
                  </h3>
                  <button 
                    onClick={() => { setError(''); setSuccess(''); setIsMeetingModalOpen(true); }}
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {meetings.length === 0 ? (
                    <span className="text-xs text-slate-400 font-medium block text-center py-10">No meetings logged</span>
                  ) : (
                    meetings.map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className="truncate">{m.client?.company || 'Corporate Client'}</span>
                          <span className="font-mono">{m.durationMinutes} min</span>
                        </div>
                        <span className="font-bold text-xs text-slate-800 block">{m.title}</span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold pt-1">
                          <Clock className="h-3 w-3" />
                          <span>{m.date.substring(0, 16).replace('T', ' ')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Schedule Corporate Alignment</h4>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleScheduleMeeting} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Requirements Alignment"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Duration (Minutes)</label>
                  <select
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMAnalytics;
