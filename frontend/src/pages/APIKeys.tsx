import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Key, ArrowLeft, Loader2, Plus, Trash2, ShieldCheck, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

const APIKeys: React.FC = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & key states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/security/api-keys');
      setKeys(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setFormLoading(true);
    try {
      const res = await axios.post('/api/security/api-keys', { name });
      setGeneratedKey(res.data?.data?.rawKey || null);
      setName('');
      fetchKeys();
    } catch (err) {
      console.error(err);
      alert('Failed to generate key');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke access for this API key?')) return;
    try {
      await axios.delete(`/api/security/api-keys/${id}`);
      alert('API key revoked.');
      fetchKeys();
    } catch (e) {
      console.error(e);
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
              <Key className="h-5.5 w-5.5 text-indigo-400" />
              <span>Integrations & API Keys</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Issue authentication access keys for third-party integrations and script engines.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setGeneratedKey(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Connecting to secure vaults...</span>
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No external API keys active.
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {keys.map((k) => (
            <div key={k.id} className="p-4 bg-[#0F172A] border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200">{k.name}</h4>
                <p className="text-[10px] text-slate-550">Created: {new Date(k.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  k.isActive ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' : 'text-slate-500 bg-slate-950/30 border border-slate-900'
                }`}>
                  {k.isActive ? 'ACTIVE' : 'REVOKED'}
                </span>
                {k.isActive && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-850 rounded-lg transition-colors"
                    title="Revoke access"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-55">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white">Generate Integration Token</h3>

            {generatedKey ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Key Generated Successfully</span>
                  <p className="text-slate-300">Copy this raw token value. It will not be shown again for security protocols:</p>
                  
                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] select-all break-all text-indigo-400">
                    <span className="flex-1">{generatedKey}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        alert('Copied to clipboard.');
                      }}
                      className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase text-[9px]">API Key Name / Description</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jenkins SCM Puller"
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
                    Generate API Token
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
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default APIKeys;
export { APIKeys };
