import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  triggerType: string;
  description?: string;
  stepsJson: string;
}

const WorkflowTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/workflows/templates');
      setTemplates(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInstantiate = (tpl: Template) => {
    // Parse steps Json to load
    let steps = [];
    try {
      steps = JSON.parse(tpl.stepsJson);
    } catch (e) {
      console.error(e);
    }
    navigate('/workflows/builder', {
      state: {
        workflow: {
          name: tpl.name,
          triggerType: tpl.triggerType,
          description: tpl.description,
          steps,
        },
      },
    });
  };

  const getModuleColor = (mod: string) => {
    if (mod === 'HR' || mod === 'LEAVE') return 'text-purple-400 border-purple-950 bg-purple-950/20';
    if (mod === 'FINANCE' || mod === 'PURCHASE_ORDER') return 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    return 'text-slate-400 border-slate-800 bg-slate-900/60';
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
            <Sparkles className="h-5.5 w-5.5 text-primary" />
            <span>Preset Workflow Templates</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Quickly bootstrap approvals loops matching standard corporate guidelines.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching template definitions...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-slate-550 text-xs border border-dashed border-slate-850 rounded-2xl">
          No templates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getModuleColor(tpl.triggerType)}`}>
                  {tpl.triggerType} Trigger
                </span>
                <h3 className="text-sm font-bold text-slate-200">{tpl.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tpl.description}</p>
              </div>

              <button
                onClick={() => handleInstantiate(tpl)}
                className="w-full text-center py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center justify-center gap-1"
              >
                <span>Load Template to Canvas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WorkflowTemplates;
export { WorkflowTemplates };
