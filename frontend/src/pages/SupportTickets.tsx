import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HelpCircle, ArrowLeft, Loader2, Plus, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Ticket {
  id: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  createdAt: string;
}

const SupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const portalType = localStorage.getItem('portal_type');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [formLoading, setFormLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      const res = await axios.get(
        `/api/portals/tickets?portalType=${portalType}&portalUserId=${user.id || 'sample-user-id'}`
      );
      setTickets(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
      await axios.post('/api/portals/tickets', {
        portalType,
        portalUserId: user.id,
        category,
        priority,
        subject,
        description,
      });
      alert('Support ticket created successfully.');
      setShowModal(false);
      setSubject('');
      setDescription('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to submit support ticket.');
    } finally {
      setFormLoading(false);
    }
  };

  const getPriorityColor = (prio: string) => {
    if (prio === 'HIGH') return 'text-red-400 border-red-950 bg-red-950/20';
    if (prio === 'MEDIUM') return 'text-yellow-400 border-yellow-950 bg-yellow-950/20';
    return 'text-slate-400 border-slate-800 bg-slate-900/60';
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
            className="p-1 hover:bg-slate-900 rounded text-slate-400"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5.5 w-5.5 text-indigo-400" />
              <span>Technical Help & Support desk</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Submit technical tickets, review resolutions, and check SLA times updates.</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Ticket</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching active tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          Inbox clear. No support tickets logged. Click "New Ticket" to register.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => (
            <div 
              key={t.id} 
              onClick={() => navigate(`/portals/tickets/details/${t.id}`)}
              className="p-5 bg-[#0F172A] border border-slate-900 hover:border-slate-800 rounded-2xl cursor-pointer transition-colors space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.category}</span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold border ${getPriorityColor(t.priority)}`}>
                  {t.priority}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-200 hover:text-white transition-colors">{t.subject}</h3>
                <span className="text-[10px] text-slate-500 mt-2 block">Ticket ID: {t.id}</span>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-3 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Placed: {new Date(t.createdAt).toLocaleDateString()}</span>
                </span>
                <span className={`font-bold ${t.status === 'CLOSED' ? 'text-slate-500' : 'text-indigo-400'}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-55">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white">Create Support Ticket</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase text-[9px]">Subject / Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. SCM delivery missing items"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="TECHNICAL">TECHNICAL / SYSTEM</option>
                    <option value="BILLING">BILLING & INVOICING</option>
                    <option value="SCM">SCM LOGISTICS</option>
                    <option value="OTHER">OTHER SERVICE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase text-[9px]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please state details of the problem..."
                  rows={4}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportTickets;
export { SupportTickets };
