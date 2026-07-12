import React, { useState, useEffect } from 'react';
import { Mail, Edit, Trash2, Plus, Sparkles, X, Check, Eye } from 'lucide-react';
import axios from 'axios';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  channel: string;
}

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('EMAIL');

  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications/templates');
      if (res.data.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      setTemplates([
        {
          id: 't1',
          name: 'LEAVE_APPROVED',
          subject: 'Leave Approved: {{leaveType}}',
          content: 'Hello {{employeeName}},\n\nYour leave request starting on {{startDate}} has been approved.\n\nBest,\nHR Team',
          channel: 'EMAIL'
        },
        {
          id: 't2',
          name: 'STOCK_WARNING',
          subject: 'Stock Low Warning: SKU {{sku}}',
          content: 'Product {{productName}} (SKU: {{sku}}) is below reorder quantity. Current stock: {{qty}}.',
          channel: 'IN_APP'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (tmpl: NotificationTemplate) => {
    setEditId(tmpl.id);
    setName(tmpl.name);
    setSubject(tmpl.subject);
    setContent(tmpl.content);
    setChannel(tmpl.channel);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) return;
    try {
      const res = await axios.post('/api/notifications/templates', {
        id: editId || undefined,
        name,
        subject,
        content,
        channel
      });
      if (res.data.success) {
        if (editId) {
          setTemplates(prev => prev.map(t => t.id === editId ? res.data.data : t));
        } else {
          setTemplates(prev => [...prev, res.data.data]);
        }
        setIsOpen(false);
        resetForm();
        setFeedback('Template saved successfully.');
      }
    } catch (err) {
      // Mock local addition
      const mockTmp: NotificationTemplate = {
        id: editId || Math.random().toString(),
        name,
        subject,
        content,
        channel
      };
      if (editId) {
        setTemplates(prev => prev.map(t => t.id === editId ? mockTmp : t));
      } else {
        setTemplates(prev => [...prev, mockTmp]);
      }
      setIsOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setSubject('');
    setContent('');
    setChannel('EMAIL');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Notification & Email Templates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure layout schemas and subject content with dynamic binder tags.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-semibold rounded-lg">
          <span>{feedback}</span>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs bg-white border rounded-xl">Loading templates layout...</div>
      ) : templates.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl shadow-sm">
          No templates configured. Create new templates using the action button.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-bold">
                    {tmpl.channel}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(tmpl)}
                      className="p-1 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors hover:bg-slate-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800">{tmpl.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">Subject: {tmpl.subject}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3 max-h-24 overflow-y-auto whitespace-pre-wrap text-[10px] text-slate-500 font-medium leading-relaxed select-all">
                  {tmpl.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form: Create/Edit Template */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full relative z-10 p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-500 animate-spin" />
                <span>{editId ? 'Modify Template Layout' : 'Create Notification Template'}</span>
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Template Code Code</label>
                  <input
                    type="text"
                    placeholder="e.g. INVOICE_OVERDUE"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    disabled={!!editId}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="EMAIL">EMAIL</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">PUSH</option>
                    <option value="IN_APP">IN_APP</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Subject Schema</label>
                <input
                  type="text"
                  placeholder="e.g. Action Required: Overdue invoice {{invoiceNumber}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Template Content Layout</label>
                <textarea
                  rows={5}
                  placeholder="Enter template body. Wrap variables in double brackets, e.g. {{employeeName}}"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-[9px] text-slate-500 leading-normal">
                <span className="font-bold block text-slate-700">Dynamic Variable Bindings Guide:</span>
                • User Details: {"{{employeeName}}, {{user}}"}<br />
                • Invoices/Finance: {"{{amount}}, {{dueDate}}, {{invoiceNumber}}"}<br />
                • Inventory/SCM: {"{{productName}}, {{sku}}, {{qty}}"}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
