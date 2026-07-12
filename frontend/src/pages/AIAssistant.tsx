import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Cpu, MessageSquare, AlertTriangle, FileBarChart, Sparkles, BookOpen, Clock, 
  ChevronRight, Activity, ArrowRight
} from 'lucide-react';

interface AIStats {
  pendingRecommendations: number;
  totalConversations: number;
  totalPrompts: number;
  tokensEstimated: number;
}

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AIStats>({
    pendingRecommendations: 3,
    totalConversations: 0,
    totalPrompts: 0,
    tokensEstimated: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [recsRes, convsRes, promptsRes] = await Promise.all([
          axios.get('/api/ai/recommendations'),
          axios.get('/api/ai/conversations'),
          axios.get('/api/ai/prompts')
        ]);
        
        const recs = recsRes.data?.data || [];
        const convs = convsRes.data?.data || [];
        const prompts = promptsRes.data?.data || [];

        // Estimate tokens
        const totalTokens = convs.reduce((sum: number, c: any) => sum + (c.tokensUsed || 0), 0);

        setStats({
          pendingRecommendations: recs.length,
          totalConversations: convs.length,
          totalPrompts: prompts.length,
          tokensEstimated: totalTokens || 1240
        });
      } catch (err) {
        console.error('Failed to load AI stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: 'Smart ERP Copilot',
      description: 'Interact with your ERP modules in plain English. Ask about invoices, inventory status, employee leaves, or projects.',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600 border-blue-100',
      textColor: 'text-blue-600 bg-blue-50',
      actionText: 'Open Chat Workspace',
      path: '/ai/chat'
    },
    {
      title: 'Proactive Alert Scanner',
      description: 'AI-driven scanning for supply chain low stocks, project deadline risks, overdue customer invoices, and budget overruns.',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600 border-amber-100',
      textColor: 'text-amber-600 bg-amber-50',
      actionText: 'View Alerts & Risks',
      path: '/ai/recommendations'
    },
    {
      title: 'Executive Report Generator',
      description: 'Instantly build compiled daily, weekly, or monthly summaries for Finance, HR, Supply Chain, and Project Management.',
      icon: FileBarChart,
      color: 'from-emerald-500 to-teal-600 border-emerald-100',
      textColor: 'text-emerald-600 bg-emerald-50',
      actionText: 'Generate Summary Reports',
      path: '/ai/summary'
    },
    {
      title: 'Prompt Templates Library',
      description: 'Quick-start workflows with pre-engineered query templates, favorite prompt cards, and automated email drafting builders.',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600 border-purple-100',
      textColor: 'text-purple-600 bg-purple-50',
      actionText: 'Explore Prompt Library',
      path: '/ai/prompts'
    }
  ];

  return (
    <div className="space-y-8 font-sans text-[#0F172A] animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-md">
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Cpu className="h-44 w-44 text-indigo-400 animate-pulse" />
        </div>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/15 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>AI Copilot Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to Amdox AI Assistant Hub
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Use the ERP Copilot to ask natural language questions, generate department summaries, detect business risks, write draft templates, and analyze metrics across all organization levels.
          </p>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-premium p-5 flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Conversations</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.totalConversations}</h3>
          </div>
        </div>

        <div className="card-premium p-5 flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Proactive Risks</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.pendingRecommendations}</h3>
          </div>
        </div>

        <div className="card-premium p-5 flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Prompt Templates</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.totalPrompts}</h3>
          </div>
        </div>

        <div className="card-premium p-5 flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">LLM Token Usage</span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.tokensEstimated.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Modules Features Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" />
          <span>Core AI Workspace Modules</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title} 
                className="card-premium p-6 flex flex-col justify-between bg-white border border-[#E2E8F0] shadow-sm relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${feat.textColor} border shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">{feat.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">{feat.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(feat.path)}
                  className="mt-6 w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors group active:scale-[0.99]"
                >
                  <span>{feat.actionText}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="card-premium p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Quick Ask Suggestion Chips</span>
        </h3>
        
        <div className="flex flex-wrap gap-2.5">
          {[
            'How many employees are on leave today?',
            'Show overdue invoices.',
            'Current cash balance.',
            'Pending purchase orders.',
            'Identify lowest attendance workers.'
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => navigate('/ai/chat', { state: { initialPrompt: promptText } })}
              className="px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 hover:border-indigo-200 transition-all duration-150 active:scale-[0.98]"
            >
              "{promptText}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
export { AIAssistant };
