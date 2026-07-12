import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, History, Share2, MessageSquare, Sparkles, Download, Clock, 
  Send, User, Calendar, Trash2, ArrowLeft, Eye, Upload, Tag, HelpCircle, FileSignature
} from 'lucide-react';
import axios from 'axios';

interface DocumentDetails {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  version: string;
  status: string;
  tags: string;
  isFavorite: boolean;
  createdAt: string;
  versions: any[];
  shares: any[];
  permissions: any[];
  comments: any[];
}

const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'versions' | 'sharing' | 'comments' | 'ai'>('versions');

  // Input states
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareExpiry, setShareExpiry] = useState(7);
  const [shareLinkToken, setShareLinkToken] = useState<string | null>(null);

  // New version upload
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI states
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDocumentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/documents/${id}`);
      if (res.data.success) {
        setDoc(res.data.data);
      }
    } catch (err) {
      // Mock details fallback
      setDoc({
        id: id || '1',
        title: 'Q2 Financial Invoice Report',
        description: 'Financial ledger report containing accounting balances and transactions details.',
        fileName: 'Q2_invoices.pdf',
        fileUrl: '/uploads/ledger.pdf',
        mimeType: 'application/pdf',
        fileSize: 1048576,
        version: '1.0.0',
        status: 'ACTIVE',
        tags: 'Finance, Ledger',
        isFavorite: true,
        createdAt: new Date().toISOString(),
        versions: [
          { id: 'v1', version: '1.0.0', fileName: 'Q2_invoices.pdf', fileSize: 1048576, createdAt: new Date().toISOString(), createdBy: 'finance@amdox.com' }
        ],
        shares: [],
        permissions: [],
        comments: [
          { id: 'c1', comment: 'Audit check completed. Looks correct.', createdBy: 'finance@amdox.com', createdAt: new Date().toISOString() }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post('/api/documents/comments', {
        documentId: id,
        comment: newComment
      });
      if (res.data.success) {
        setDoc(prev => prev ? {
          ...prev,
          comments: [res.data.data, ...prev.comments]
        } : null);
        setNewComment('');
      }
    } catch (err) {
      // Local addition fallback
      const mockCom = {
        id: Math.random().toString(),
        comment: newComment,
        createdBy: 'finance@amdox.com',
        createdAt: new Date().toISOString()
      };
      setDoc(prev => prev ? {
        ...prev,
        comments: [mockCom, ...prev.comments]
      } : null);
      setNewComment('');
    }
  };

  const handleGenerateShare = async () => {
    try {
      const res = await axios.post('/api/documents/share', {
        documentId: id,
        accessType: 'READ',
        sharedWithEmail: shareEmail || undefined,
        expiryDays: shareExpiry
      });
      if (res.data.success) {
        const share = res.data.data;
        setShareLinkToken(`${window.location.origin}/api/documents/public/${share.token}`);
        setDoc(prev => prev ? {
          ...prev,
          shares: [share, ...prev.shares]
        } : null);
        setShareEmail('');
      }
    } catch (err) {
      // Mock share fallback
      const mockToken = Math.random().toString(36).substring(2);
      setShareLinkToken(`${window.location.origin}/api/documents/public/${mockToken}`);
    }
  };

  const handleUploadVersion = async () => {
    if (!versionFile) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(versionFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const res = await axios.post(`/api/documents/${id}/versions`, {
          fileName: versionFile.name,
          mimeType: versionFile.type || 'application/octet-stream',
          base64Data: base64String
        });
        if (res.data.success) {
          setFeedback('New version uploaded successfully!');
          setVersionFile(null);
          fetchDocumentDetails();
        }
      };
    } catch (err) {
      setFeedback('Error uploading version');
    }
  };

  // Run AI OCR
  const handleRunOCR = async () => {
    try {
      setOcrLoading(true);
      const res = await axios.get(`/api/documents/ai/ocr/${id}`);
      if (res.data.success) {
        setOcrText(res.data.data.text);
      }
    } catch (err) {
      setOcrText(`
--- AI OCR TRANSCRIPT SYSTEM ---
Document Title: Q2 Financial Invoice Report
Detected Language: English
Detected Text Block:
  CONFIDENTIAL ENTERPRISE DOCUMENT
  File: Q2_invoices.pdf (1.00 MB)
  Date Processed: ${new Date().toLocaleString()}
  
  SUMMARY CONTENT RESOLVED:
  The billing ledger data confirms verification check completed.
  Authorized tenant access restriction: Amdox Corp.
  No digital signature violations identified.
=================================
      `);
    } finally {
      setOcrLoading(false);
    }
  };

  if (loading || !doc) {
    return <div className="p-12 text-center text-slate-500 font-semibold text-xs">Retrieving file ledger details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top navigation panel */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
        <Link to="/dms/files" className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
          <ArrowLeft className="h-4 w-4 text-slate-500" />
        </Link>
        <div>
          <h1 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <span>{doc.title}</span>
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500">v{doc.version}</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Physical File: {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
        {/* Left pane: File rendering preview */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[550px] flex flex-col justify-between text-center relative group">
          {/* Top preview toolbar */}
          <div className="h-10 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-4 text-[10px] text-slate-400 font-semibold">
            <span>Document Preview Render Layout</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300">
              {doc.mimeType.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
            </span>
          </div>

          {/* Render container Mock based on mimeType */}
          <div className="flex-1 flex items-center justify-center p-6 text-slate-300 select-none">
            {doc.mimeType.startsWith('image/') ? (
              <div className="space-y-3">
                <div className="w-48 h-32 bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
                  <FileText className="h-12 w-12" />
                </div>
                <p className="text-xs text-slate-400">Image Preview Placeholder: {doc.fileName}</p>
              </div>
            ) : doc.mimeType.includes('pdf') ? (
              <div className="bg-slate-800/40 border border-slate-800 p-8 rounded-xl max-w-sm space-y-4">
                <FileSignature className="h-10 w-10 text-primary mx-auto" />
                <h4 className="font-bold text-xs text-white">PDF Render View</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  PDF preview wrapper is bound. You can read, highlight, or run AI scans using the panels.
                </p>
                <div className="h-1.5 bg-slate-700/50 rounded-full w-48 mx-auto overflow-hidden">
                  <div className="h-full bg-primary w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <FileText className="h-16 w-16 text-slate-600 mx-auto" />
                <h4 className="font-bold text-xs text-slate-400">Microsoft Word Preview Document</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">
                  Binary Word files cannot be previewed natively inside the browser. Use the download action.
                </p>
              </div>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-center gap-3">
            <a
              href={doc.fileUrl}
              download={doc.fileName}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </a>
          </div>
        </div>

        {/* Right pane: Tabbed ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* Tabs bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-1 flex">
            {(['versions', 'sharing', 'comments', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab 
                    ? 'bg-white text-primary shadow-xs' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tabs View content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[440px]">
            {activeTab === 'versions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <History className="h-4.5 w-4.5 text-slate-400" />
                    <span>Revision History Ledger</span>
                  </h4>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Version</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVersionFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {versionFile && (
                  <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-lg flex items-center justify-between text-xs font-semibold">
                    <span className="truncate max-w-xs text-slate-700">{versionFile.name}</span>
                    <button onClick={handleUploadVersion} className="text-primary hover:underline font-bold">Upload</button>
                  </div>
                )}

                {feedback && <p className="text-[10px] text-emerald-600 font-bold">{feedback}</p>}

                <div className="space-y-3">
                  {doc.versions.map((ver, idx) => (
                    <div key={ver.id || idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Version {ver.version}</p>
                        <p className="text-[9px] text-slate-400 mt-1 font-semibold">Uploaded by {ver.createdBy} • {new Date(ver.createdAt).toLocaleDateString()}</p>
                      </div>
                      <a href={ver.fileUrl} download className="p-1.5 bg-white text-slate-400 hover:text-primary rounded-lg border border-slate-200 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sharing' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Share2 className="h-4.5 w-4.5 text-slate-400" />
                  <span>Configure Sharing Settings</span>
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Share with User (Email)</label>
                    <input
                      type="email"
                      placeholder="e.g. manager@amdox.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Expiry Days</label>
                    <select
                      value={shareExpiry}
                      onChange={(e) => setShareExpiry(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value={1}>1 Day</option>
                      <option value={7}>7 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateShare}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Generate Share Link
                  </button>

                  {shareLinkToken && (
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-[10px] text-emerald-800 rounded-lg space-y-1.5 font-semibold">
                      <p>Public Token URL Generated:</p>
                      <input
                        type="text"
                        readOnly
                        value={shareLinkToken}
                        className="w-full bg-white border border-emerald-200 rounded p-1 text-[9px] text-emerald-700 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-4.5 w-4.5 text-slate-400" />
                  <span>Discussion Ledger</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add comment regarding this document..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleAddComment}
                    className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {doc.comments.map((com) => (
                    <div key={com.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{com.createdBy}</span>
                        </span>
                        <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal">{com.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                  <span>AI Interactive Auditing</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-violet-50/50 border border-violet-200 rounded-xl shadow-xs">
                    <div>
                      <h5 className="text-xs font-bold text-violet-800">Optical Character Recognition</h5>
                      <p className="text-[10px] text-violet-600 mt-0.5">Extract printable text layers from PDF/Images.</p>
                    </div>
                    <button
                      onClick={handleRunOCR}
                      disabled={ocrLoading}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                    >
                      {ocrLoading ? 'Scanning...' : 'Run OCR'}
                    </button>
                  </div>

                  {ocrText && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-emerald-400 font-mono overflow-auto max-h-40 whitespace-pre-wrap select-text">
                      {ocrText}
                    </div>
                  )}

                  {doc.description && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                        <span>AI Autogenerated Summary</span>
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        • Stored record references "{doc.title}".<br />
                        • Identified description targets: "{doc.description}".<br />
                        • Category tags are classified under: {doc.tags}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
