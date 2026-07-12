import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, Landmark, Briefcase, Truck, Sparkles, FolderGit2, Activity,
  Download, Copy, Check, Printer, Loader2, ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react';

interface SummaryData {
  id: string;
  title: string;
  content: string;
  module: string;
  createdAt: string;
}

const ExecutiveSummary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('EXECUTIVE');
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchSummary = async (moduleName: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/ai/summary/${moduleName}`);
      setData(res.data?.data || null);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(activeTab);
  }, [activeTab]);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const parseMarkdown = (markdown: string) => {
    let html = markdown
      // Escape HTML tags to prevent XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-5 mb-2.5 flex items-center gap-2 pb-1 border-b border-slate-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-6 mb-3">$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-indigo-400 font-bold">$1</strong>');

    // Bullet items
    let lines = html.split('\n');
    lines = lines.map(line => {
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return `<li class="ml-5 list-disc text-slate-300 text-xs mb-2 leading-relaxed">${line.slice(2)}</li>`;
      }
      return line;
    });

    return lines.join('\n');
  };

  const tabs = [
    { name: 'Executive Suite', value: 'EXECUTIVE', icon: Activity },
    { name: 'Financial Audit', value: 'FINANCE', icon: Landmark },
    { name: 'HR workforce', value: 'HR', icon: Briefcase },
    { name: 'SCM Operations', value: 'SCM', icon: Truck },
    { name: 'CRM Pipeline', value: 'CRM', icon: Sparkles },
    { name: 'Projects board', value: 'PROJECT', icon: FolderGit2 },
  ];

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 print:bg-white print:text-black">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-primary" />
            <span>AI Executive Reports & Summary Builder</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Generate compiled organizational dashboards summaries based on current database ledger statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!data}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-lg hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Text</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={!data}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-lg hover:text-white transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                activeTab === t.value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Compiled Report Canvas */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-lg relative overflow-hidden print:border-none print:p-0 print:bg-white print:text-black">
        
        {/* Security watermarks */}
        <div className="absolute right-6 top-6 flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950 border border-slate-950/60 px-2 py-0.5 rounded print:hidden">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span>Tenant Isolated Audit</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            <span className="text-xs">Compiling financial metrics and department registers...</span>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
            <AlertCircle className="h-7 w-7 text-slate-600" />
            <span className="text-xs">No active ledger summary could be generated.</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Document Branding */}
            <div className="border-b border-slate-800 pb-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white p-1 rounded">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-bold text-xs text-slate-400 tracking-wide">Amdox AI Report Engine</span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {data.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-medium">
                <span>Run ID: {data.id}</span>
                <span>•</span>
                <span>Compiled: {new Date(data.createdAt).toLocaleString()}</span>
                <span>•</span>
                <span>Scope: Tenant Workspace</span>
              </div>
            </div>

            {/* Markdown Text */}
            <div 
              className="space-y-3 leading-relaxed text-slate-300 text-xs select-text" 
              dangerouslySetInnerHTML={{ __html: parseMarkdown(data.content) }} 
            />

            {/* Footer Document Signature */}
            <div className="border-t border-slate-850 pt-6 mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
              <span>© 2026 Amdox Corp. Confidentially secured for internal review.</span>
              <span className="font-bold uppercase tracking-wider text-[9px] text-indigo-400 print:hidden">Verified pass AI parameters checks</span>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default ExecutiveSummary;
export { ExecutiveSummary };
