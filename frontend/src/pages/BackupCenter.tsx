import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, ArrowLeft, Loader2, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackupJob {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
}

interface BackupHistory {
  id: string;
  jobName: string;
  status: string;
  sizeMb: number;
  createdAt: string;
}

interface RecoveryPoint {
  id: string;
  name: string;
  status: string;
}

const BackupCenter: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [points, setPoints] = useState<RecoveryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/backups');
      const data = res.data?.data;
      if (data) {
        setJobs(data.jobs || []);
        setHistory(data.history || []);
        setPoints(data.recoveryPoints || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const triggerBackup = async (jobName: string) => {
    setActionLoading(true);
    try {
      await axios.post('/api/security/backups', { name: jobName });
      alert('Manual backup triggered successfully.');
      fetchBackups();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const simulateRestore = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await axios.post(`/api/security/backups/${id}/restore`);
      alert(res.data?.data?.message || 'Restore simulation verified');
      fetchBackups();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/security')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="h-5.5 w-5.5 text-indigo-400" />
              <span>Disaster Recovery & Backup Center</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Automate database replication snapshots, view storage metrics, and verify data recovery dry-runs.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Locating redundant recovery targets...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Main columns (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Backup Jobs */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Active Backup Jobs Schedules</h3>
              
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200">{job.name}</span>
                      <p className="text-[10px] text-slate-550 block">Frequency: {job.frequency} • Next Run: {new Date(job.nextRun).toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => triggerBackup(job.name)}
                      disabled={actionLoading}
                      className="px-2.5 py-1.5 bg-[#0F172A] hover:bg-slate-900 border border-slate-850 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-slate-400"
                    >
                      <Play className="h-3 w-3" />
                      <span>Backup Now</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup History logs */}
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455">Backup Audit logs history</h3>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {history.map((h) => (
                  <div key={h.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between text-slate-350">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-200">{h.jobName}</span>
                      <p className="text-[9px] text-slate-550 block">Executed: {new Date(h.createdAt).toLocaleString()} • Size: {h.sizeMb.toFixed(1)} MB</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[8px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30">
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recovery points & Restores (Col span 1) */}
          <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450">Active Recovery Points</h3>
            
            <div className="space-y-3">
              {points.map((pt) => (
                <div key={pt.id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">{pt.name}</span>
                    <span className="text-[10px] text-slate-500 block">Status: {pt.status}</span>
                  </div>

                  <button
                    onClick={() => simulateRestore(pt.id)}
                    disabled={actionLoading}
                    className="w-full text-center py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Run Simulated Restore</span>
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

export default BackupCenter;
export { BackupCenter };
