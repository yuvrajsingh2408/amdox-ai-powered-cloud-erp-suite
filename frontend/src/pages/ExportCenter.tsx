import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  History, Download, ShieldCheck, RefreshCw, FileSpreadsheet, 
  FileText, Code, CheckCircle, AlertTriangle, Loader2, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExportRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  status: string;
  error?: string;
  createdAt: string;
}

const ExportCenter: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports/history');
      setHistory(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getFormatIcon = (type: string) => {
    if (type === 'EXCEL' || type === 'CSV') return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
    if (type === 'JSON') return <Code className="h-4 w-4 text-amber-400" />;
    return <FileText className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/reports')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">File Export Center</h1>
            <p className="text-slate-400 text-xs mt-0.5">Download history logs of aggregated spreadsheets, ledger books, and prints.</p>
          </div>
        </div>

        <button 
          onClick={fetchHistory}
          className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Security alert */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-200 block">Download Token Session Required</span>
          <p className="text-slate-500 mt-0.5">
            Export links are temporarily signed and expire after 1 hour of session inactivity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Fetching downloads history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl">
          No downloaded reports logged. Run a query in the Report Builder to compile files.
        </div>
      ) : (
        <div className="border border-slate-850 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[9px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">File details</th>
                <th className="px-5 py-3 text-center">Format</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Generated Date</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-900/15 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-200">
                    {record.fileName}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      {getFormatIcon(record.fileType)}
                      <span>{record.fileType}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {record.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-lg">
                        <CheckCircle className="h-3 w-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-semibold bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded-lg">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-[10px] text-slate-500">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <a
                      href={`/api/reports/download/${record.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg border border-slate-750 transition-all font-semibold"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default ExportCenter;
export { ExportCenter };
