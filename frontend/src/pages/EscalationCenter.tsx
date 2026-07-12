import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw, Loader2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EscalatedItem {
  id: string;
  name: string;
  stepOrder: number;
  slaDeadline: string;
  createdAt: string;
  instance: {
    entityType: string;
    entityId: string;
    startedBy: string;
    workflow: {
      name: string;
    };
  };
}

const EscalationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EscalatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchEscalated = async () => {
    setLoading(true);
    try {
      // Fetch instances with status ESCALATED
      const res = await axios.get('/api/workflows/instances?status=ESCALATED');
      // Format mapped approvals
      const mapped: EscalatedItem[] = [];
      (res.data?.data || []).forEach((inst: any) => {
        inst.approvals.forEach((app: any) => {
          if (app.status === 'ESCALATED') {
            mapped.push({
              id: app.id,
              name: app.name,
              stepOrder: app.stepOrder,
              slaDeadline: app.slaDeadline || '',
              createdAt: app.createdAt,
              instance: {
                entityType: inst.entityType,
                entityId: inst.entityId,
                startedBy: inst.startedBy,
                workflow: {
                  name: inst.workflow?.name || 'N/A',
                },
              },
            });
          }
        });
      });
      setItems(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalated();
  }, []);

  const runScanner = async () => {
    setScanning(true);
    try {
      await axios.post('/api/approvals/escalate-overdue');
      alert('SLA limits scan run complete.');
      fetchEscalated();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/workflows')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5.5 w-5.5 text-rose-500" />
              <span>SLA Escalation Control Center</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Overrides workspace rules and alerts managers when approval steps exceed SLA hours limits.</p>
          </div>
        </div>

        <button
          onClick={runScanner}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 border border-rose-900/30 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
        >
          {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>Run SLA Scanner</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading escalated instances...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          Excellent. No approval steps have currently breached target SLA schedules.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{item.instance?.workflow?.name}</span>
                  <span className="px-1.5 py-0.2 bg-red-950/40 border border-red-900/40 rounded text-[8px] font-bold text-red-400">
                    {item.instance?.entityType} OVERDUE
                  </span>
                </div>

                <p className="text-[10px] text-slate-500">
                  Breached Step: {item.name} (SLA Deadline: {new Date(item.slaDeadline).toLocaleString()})
                </p>
              </div>

              <button
                onClick={() => navigate('/workflows/inbox')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300"
              >
                Inspect Queue
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default EscalationCenter;
export { EscalationCenter };
