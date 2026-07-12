import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Mail, Smartphone, MessageSquare, Bell, AlertCircle } from 'lucide-react';
import axios from 'axios';

const NotificationSettings: React.FC = () => {
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchPreferences = async () => {
    try {
      const res = await axios.get('/api/notifications/preferences');
      if (res.data.success) {
        const { inAppEnabled, emailEnabled, smsEnabled, pushEnabled } = res.data.data;
        setInAppEnabled(inAppEnabled);
        setEmailEnabled(emailEnabled);
        setSmsEnabled(smsEnabled);
        setPushEnabled(pushEnabled);
      }
    } catch (err) {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);
      const res = await axios.put('/api/notifications/preferences', {
        inAppEnabled,
        emailEnabled,
        smsEnabled,
        pushEnabled
      });
      if (res.data.success) {
        setFeedback('Notification preferences updated successfully.');
      }
    } catch (err) {
      setFeedback('Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl text-left">
      {/* Header */}
      <div className="flex items-center gap-3.5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-3 bg-slate-50 text-slate-500 rounded-lg shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notification Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure preferred communication channels for transactional events and system updates.</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Switches Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2">
          Channel Dispatch Permissions
        </h3>

        <div className="space-y-5">
          {/* Switch 1: In-app */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg mt-0.5">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">In-App Notifications (Bell Hub)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Display toast alerts and count unread logs inside the workspace top bar.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={inAppEnabled} 
                onChange={(e) => setInAppEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Switch 2: Email */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg mt-0.5">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Email Notifications</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Queue and dispatch summary letters for invoice generation, leave approvals, and stock reorders.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailEnabled} 
                onChange={(e) => setEmailEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Switch 3: SMS */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg mt-0.5">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">SMS / Text Alerts</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Transmit critical urgency warnings directly as mobile text messages to verified numbers.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={smsEnabled} 
                onChange={(e) => setSmsEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Switch 4: Push */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <span className="p-2 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg mt-0.5">
                <Smartphone className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Browser Push Notifications</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Enable immediate background browser push notifications for real-time task allocations.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pushEnabled} 
                onChange={(e) => setPushEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
