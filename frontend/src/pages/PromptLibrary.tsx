import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, BookOpen, Star, Plus, FolderGit2, Trash2, ArrowRight, Loader2,
  Calendar, Check, User, Info, Landmark, Briefcase, Truck, Activity
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  module: string;
  isSystem: boolean;
  isFavorite: boolean;
}

const PromptLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterModule, setFilterModule] = useState<string>('ALL');

  // Form Fields
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('GENERAL');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ai/prompts');
      setTemplates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load prompts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFavoriteToggle = async (id: string) => {
    try {
      await axios.post(`/api/ai/prompts/${id}/favorite`);
      setTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
      );
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) return;

    setCreating(true);
    try {
      const res = await axios.post('/api/ai/prompts', {
        title,
        prompt: promptText,
        description,
        module,
      });

      const newTemplate = res.data?.data;
      if (newTemplate) {
        setTemplates(prev => [newTemplate, ...prev]);
        setShowAddForm(false);
        setTitle('');
        setPromptText('');
        setDescription('');
        setModule('GENERAL');
      }
    } catch (err) {
      console.error('Failed to create template', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRunTemplate = (p: string) => {
    navigate('/ai/chat', { state: { initialPrompt: p } });
  };

  const getModuleIcon = (mod: string) => {
    switch (mod) {
      case 'FINANCE':
        return <Landmark className="h-4 w-4 text-emerald-400" />;
      case 'HR':
        return <Briefcase className="h-4 w-4 text-purple-400" />;
      case 'SCM':
        return <Truck className="h-4 w-4 text-blue-400" />;
      case 'CRM':
        return <Sparkles className="h-4 w-4 text-pink-400" />;
      case 'PROJECT':
        return <FolderGit2 className="h-4 w-4 text-amber-400" />;
      case 'GENERAL':
      default:
        return <Activity className="h-4 w-4 text-indigo-400" />;
    }
  };

  const filteredTemplates = filterModule === 'ALL'
    ? templates
    : templates.filter(t => t.module === filterModule);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5.5 w-5.5 text-primary" />
            <span>Prompt Templates & Workflows Library</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Re-usable structured queries to trigger modular database analyses, email drafts, or dashboards summary builders.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? 'Close Custom Builder' : 'Create Custom Template'}</span>
        </button>
      </div>

      {/* Add Custom Template Form */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateTemplate} 
          className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 max-w-xl space-y-4 shadow-xl"
        >
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Custom Prompt Builder</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Template Title</label>
              <input
                type="text"
                placeholder="e.g. RESTOCK SCM Request Draft"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ERP Target Module</label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
              >
                <option value="GENERAL">General Assistant</option>
                <option value="FINANCE">Finance & Ledger</option>
                <option value="HR">Human Resources</option>
                <option value="SCM">Supply Chain (SCM)</option>
                <option value="CRM">CRM Sales</option>
                <option value="PROJECT">Project Management</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Brief Description</label>
            <input
              type="text"
              placeholder="Provide context on when to trigger this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Prompt Text Command</label>
            <textarea
              rows={3}
              placeholder="Write the full AI command prompt query..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 font-mono leading-normal"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Template</span>
            </button>
          </div>
        </form>
      )}

      {/* Module Filters Bar */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'GENERAL', 'FINANCE', 'HR', 'SCM', 'CRM', 'PROJECT'].map((m) => (
          <button
            key={m}
            onClick={() => setFilterModule(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              filterModule === m
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700/50'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Roster Templates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading structured workflows...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No templates matched this category filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
            >
              <div className="space-y-3.5">
                {/* Badge Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getModuleIcon(template.module)}
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      {template.module}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {template.isSystem && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 text-[8px] font-bold uppercase tracking-wider">
                        System
                      </span>
                    )}
                    <button
                      onClick={() => handleFavoriteToggle(template.id)}
                      className={`p-1 hover:bg-slate-800 rounded transition-colors ${
                        template.isFavorite ? 'text-amber-500 hover:text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    {template.title}
                  </h3>
                  {template.description && (
                    <p className="text-slate-500 text-[10px] mt-1.5 leading-snug">
                      {template.description}
                    </p>
                  )}
                </div>

                {/* Prompt block view */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[10px] text-indigo-300/80 leading-normal line-clamp-3">
                  "{template.prompt}"
                </div>
              </div>

              {/* Action trigger button */}
              <button
                onClick={() => handleRunTemplate(template.prompt)}
                className="mt-6 flex items-center justify-between px-3.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors group"
              >
                <span>Run Template Workflows</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PromptLibrary;
export { PromptLibrary };
