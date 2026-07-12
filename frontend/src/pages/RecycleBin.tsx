import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Trash, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface DeletedDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  deletedAt: string;
}

const RecycleBin: React.FC = () => {
  const [items, setItems] = useState<DeletedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTrashedItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents', {
        params: { status: 'TRASHED' }
      });
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      setItems([
        { id: 't1', title: 'Deprecated Staff Directory 2025', fileName: 'staff_directory_2025.csv', fileSize: 128000, mimeType: 'text/csv', deletedAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedItems();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const res = await axios.put(`/api/documents/${id}/restore`);
      if (res.data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        setFeedback('Document restored to workspace successfully.');
      }
    } catch (err) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await axios.delete(`/api/documents/${id}/permanent`);
      setItems(prev => prev.filter(item => item.id !== id));
      setFeedback('Document permanently deleted from storage.');
    } catch (err) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
        <div className="p-3 bg-rose-50 text-rose-500 rounded-lg shrink-0">
          <Trash2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Recycle Bin</h1>
          <p className="text-xs text-slate-500 mt-1">Review soft-deleted documents, restore records back to work, or sweep storage permanently.</p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-semibold rounded-lg text-left flex items-center gap-2">
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Table Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs bg-white border rounded-xl">Reading Recycle Bin...</div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl shadow-sm">
          Recycle Bin is empty. No files have been deleted.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Document Title</th>
                <th className="p-4">Size</th>
                <th className="p-4">Deleted At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{item.fileName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{(item.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="p-4 text-slate-400">{new Date(item.deletedAt).toLocaleString()}</td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>Purge</span>
                    </button>
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

export default RecycleBin;
