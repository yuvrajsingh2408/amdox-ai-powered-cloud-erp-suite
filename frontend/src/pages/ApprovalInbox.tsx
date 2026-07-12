import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle, XCircle, AlertTriangle, Sparkles, MessageSquare, 
  Printer, ArrowRight, Loader2, RefreshCw, Clock, User 
} from 'lucide-react';

interface InboxItem {
  id: string;
  name: string;
  stepOrder: number;
  status: string;
  slaDeadline: string;
  createdAt: string;
  instance: {
    id: string;
    entityType: string;
    entityId: string;
    startedBy: string;
    workflow: {
      name: string;
    };
  };
}

interface AIRecommend {
  riskScore: number;
  delayHours: number;
  escalationProbability: string;
  recommendation: string;
  suggestions: string[];
}

const ApprovalInbox: React.FC = () => {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Decision inputs
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // AI states
  const [aiRec, setAiRec] = useState<AIRecommend | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/approvals/inbox');
      setItems(res.data?.data || []);
      setSelectedItem(null);
      setAiRec(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIRecommendation = async (id: string) => {
    setAiLoading(true);
    try {
      const res = await axios.get(`/api/approvals/${id}/ai-recommendation`);
      setAiRec(res.data?.data || null);
    } catch (e) {
      console.error(e);
      setAiRec(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleSelect = (item: InboxItem) => {
    setSelectedItem(item);
    setComments('');
    fetchAIRecommendation(item.id);
  };

  const handleDecision = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await axios.post(`/api/approvals/${selectedItem.id}/decision`, {
        action,
        comments,
      });
      alert(`Approval step successfully updated to ${action}`);
      fetchInbox();
    } catch (e) {
      console.error(e);
      alert('Failed to log approval decision.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-5.5 w-5.5 text-primary" />
            <span>My Approval Inbox Queue</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Validate pending requisition forms, check AI risk scores, and record decisions.
          </p>
        </div>

        <button 
          onClick={fetchInbox}
          className="p-1.5 bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Checking inbox items...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Inbox Queue list (Col span 1) */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Actions</h2>
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl">
                Inbox clear. No pending approval requests mapped to your profile.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                      selectedItem?.id === item.id
                        ? 'bg-indigo-950/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{item.instance?.workflow?.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 text-[8px] font-bold text-slate-400 uppercase">
                        {item.instance?.entityType}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Stage: {item.name}</p>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        <span>SLA: {new Date(item.slaDeadline).toLocaleDateString()}</span>
                      </span>
                      <span>Run #{item.stepOrder}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action canvas (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedItem ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl bg-[#0F172A]/10">
                <MessageSquare className="h-7 w-7 text-slate-700" />
                <span className="mt-2">Select a pending inbox item from the queue list to record your decision.</span>
              </div>
            ) : (
              <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-6 space-y-6">
                
                {/* Header branding info */}
                <div className="border-b border-slate-900 pb-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Approval Stage Review</span>
                    <h2 className="text-sm font-extrabold text-white">{selectedItem.instance?.workflow?.name}</h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Trigger Entity ID: {selectedItem.instance?.entityId} • Started by: {selectedItem.instance?.startedBy}
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs text-slate-400 hover:text-white rounded-lg transition-colors font-semibold"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Log</span>
                  </button>
                </div>

                {/* AI recommendation overlay card */}
                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute right-4 top-4 flex items-center gap-1 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-900">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    <span>AI Copilot Auditor</span>
                  </div>

                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                      <Loader2 className="h-5.5 w-5.5 animate-spin text-primary" />
                      <span className="text-[10px]">Analyzing budget vectors and risk variables...</span>
                    </div>
                  ) : !aiRec ? (
                    <div className="text-[10px] text-slate-600">AI auditor diagnostics unavailable.</div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Approval Analysis</h4>
                      <p className="text-xs text-slate-300 italic">"{aiRec.recommendation}"</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-slate-900/60 text-[10px] text-slate-500">
                        <div>
                          <span>AI Risk Score:</span>
                          <strong className="block text-emerald-400 font-extrabold mt-0.5">{aiRec.riskScore}% Risk</strong>
                        </div>
                        <div>
                          <span>Estimated Bottleneck Delay:</span>
                          <strong className="block text-indigo-400 font-extrabold mt-0.5">{aiRec.delayHours} Hours</strong>
                        </div>
                        <div>
                          <span>Escalation Risk:</span>
                          <strong className="block text-slate-300 font-extrabold mt-0.5">{aiRec.escalationProbability} Probability</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decison Action Form */}
                <div className="space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-400 text-[10px] font-bold uppercase">Decision Comments (Optional)</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Input approval sign-off details or reasons for rejection..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision('APPROVED')}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve Request</span>
                    </button>
                    <button
                      onClick={() => handleDecision('REJECTED')}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject & Deny</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default ApprovalInbox;
export { ApprovalInbox };
