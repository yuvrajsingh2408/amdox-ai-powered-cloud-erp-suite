import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HelpCircle, ArrowLeft, Loader2, Sparkles, Send } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface Reply {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  replies: Reply[];
}

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // AI states
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/portals/tickets/${id}`);
      setTicket(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await axios.get(`/api/portals/tickets/${id}/ai-suggested-reply`);
      setAiReply(res.data?.data?.suggestedReply || null);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchAISuggestion();
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim() || !ticket) return;
    setReplyLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      await axios.post(`/api/portals/tickets/${ticket.id}/reply`, {
        senderType: 'PORTAL_USER',
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        message: replyMsg,
      });
      setReplyMsg('');
      fetchDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleApplyAISuggestion = () => {
    if (aiReply) {
      setReplyMsg(aiReply);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button onClick={() => navigate('/portals/customer/tickets')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Support Ticket details</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ticket ID: {id} • Category: {ticket?.category}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading replies thread...</span>
        </div>
      ) : !ticket ? (
        <div className="text-center py-20 text-slate-655 text-xs">Ticket details unavailable.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Chat Stream (Col span 2) */}
          <div className="lg:col-span-2 bg-[#0F172A] border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[450px]">
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              
              {/* Ticket description card */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-200">{ticket.subject}</h3>
                <p className="text-slate-400 leading-relaxed">{ticket.description}</p>
              </div>

              {/* Replies */}
              {(ticket.replies || []).map((r) => (
                <div 
                  key={r.id}
                  className={`p-3.5 rounded-xl space-y-1 ${
                    r.senderType === 'PORTAL_USER' 
                      ? 'bg-indigo-950/20 border border-indigo-900/30 ml-8 text-right'
                      : 'bg-slate-900/60 border border-slate-800 mr-8'
                  }`}
                >
                  <span className="text-[10px] text-slate-550 block font-bold">{r.senderName} ({r.senderType})</span>
                  <p className="text-slate-350">{r.message}</p>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="flex items-center gap-2 pt-4 border-t border-slate-900">
              <input
                type="text"
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                placeholder="Write support reply..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={replyLoading}
                className="p-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* AI Helper Sidebar (Col span 1) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Ticket Solver</h3>
            <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900 px-2 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                <span>AI Suggested Answer</span>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
                  <Loader2 className="h-5.5 w-5.5 animate-spin text-primary" />
                  <span className="text-[10px]">Analyzing ticket criteria...</span>
                </div>
              ) : aiReply ? (
                <div className="space-y-3 pt-6">
                  <p className="text-slate-400 leading-relaxed italic">"{aiReply}"</p>
                  <button
                    onClick={handleApplyAISuggestion}
                    className="w-full text-center py-1.5 bg-slate-950 border border-slate-850 rounded-lg hover:text-white text-[10px] font-semibold text-indigo-400 hover:bg-slate-900 transition-colors"
                  >
                    Apply Suggestion to Message
                  </button>
                </div>
              ) : (
                <div className="text-slate-655 pt-6">AI diagnostics unavailable.</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default TicketDetails;
export { TicketDetails };
