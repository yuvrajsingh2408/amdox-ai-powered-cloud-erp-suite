import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

const WorkflowSettings: React.FC = () => {
  const navigate = useNavigate();

  // Settings inputs
  const [escalationHours, setEscalationHours] = useState(48);
  const [allowSelfApproval, setAllowSelfApproval] = useState(false);
  const [notificationToggles, setNotificationToggles] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Workflow engine parameters updated successfully.');
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/workflows')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5.5 w-5.5 text-indigo-400" />
            <span>Workflow Engine Settings</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Configure global thresholds, triggers behaviors, and auto escalation policies.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl bg-[#0F172A] border border-slate-900 rounded-2xl p-6 space-y-6 text-xs">
        
        {/* Escalations thresholds */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-2">
            Escalation Thresholds
          </h3>
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Breach SLA Limit Hours (Global)</label>
            <input
              type="number"
              value={escalationHours}
              onChange={(e) => setEscalationHours(parseInt(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Active steps crossing this threshold will be escalated to direct supervisor chains automatically.
            </span>
          </div>
        </div>

        {/* Security checks */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-2">
            Audit Security Rules
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block">Allow Self-Approval overrides</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Enable initiators to sign off on their own purchase orders or leaves.</span>
            </div>
            <input
              type="checkbox"
              checked={allowSelfApproval}
              onChange={(e) => setAllowSelfApproval(e.target.checked)}
              className="rounded bg-slate-950 border-slate-850 text-indigo-600 focus:ring-0 h-4 w-4"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-850 pb-2">
            Notification Dispatches
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Email Alerts Queues</span>
              <input
                type="checkbox"
                checked={notificationToggles.email}
                onChange={(e) => setNotificationToggles({ ...notificationToggles, email: e.target.checked })}
                className="rounded bg-slate-950 border-slate-850 text-indigo-600 focus:ring-0 h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">SMS Alerts Queues</span>
              <input
                type="checkbox"
                checked={notificationToggles.sms}
                onChange={(e) => setNotificationToggles({ ...notificationToggles, sms: e.target.checked })}
                className="rounded bg-slate-950 border-slate-850 text-indigo-600 focus:ring-0 h-4 w-4"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>Save Configuration Parameters</span>
        </button>

      </form>

    </div>
  );
};

export default WorkflowSettings;
export { WorkflowSettings };
