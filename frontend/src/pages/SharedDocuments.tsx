import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, FileText, ArrowRight, UserCheck, Key, Eye, Clock } from 'lucide-react';
import axios from 'axios';

interface SharedDoc {
  id: string;
  accessType: string;
  token: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  document: {
    id: string;
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

const SharedDocuments: React.FC = () => {
  const [shares, setShares] = useState<SharedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents/shared');
      if (res.data.success) {
        setShares(res.data.data);
      }
    } catch (err) {
      // Mock shares
      setShares([
        {
          id: 's1',
          accessType: 'READ',
          token: 'token_abc123',
          expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
          createdBy: 'manager@amdox.com',
          createdAt: new Date().toISOString(),
          document: {
            id: 'doc_shared_1',
            title: 'Supplier Supply Order Template',
            fileName: 'supplier_order.pdf',
            fileSize: 524288,
            mimeType: 'application/pdf'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
          <Share2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Shared Documents</h1>
          <p className="text-xs text-slate-500 mt-1">Review documents shared with you, public active link tokens, and file access lists.</p>
        </div>
      </div>

      {/* Sharing Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs bg-white border rounded-xl">Reading sharing records...</div>
      ) : shares.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl shadow-sm">
          No documents have been shared with you or made public yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Shared File</th>
                <th className="p-4">Owner/Sender</th>
                <th className="p-4">Permission</th>
                <th className="p-4">Expires At</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {shares.map((share) => (
                <tr key={share.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{share.document.title}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{share.document.fileName} ({(share.document.fileSize / 1024).toFixed(0)} KB)</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      <span>{share.createdBy}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500">
                      {share.accessType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-medium">
                    {share.expiresAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(share.expiresAt).toLocaleDateString()}</span>
                      </span>
                    ) : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/dms/view/${share.document.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Preview</span>
                    </Link>
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

export default SharedDocuments;
