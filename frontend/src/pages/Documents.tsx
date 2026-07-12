import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Star, Trash2, Tag, Upload, ArrowUpDown, Filter, 
  ChevronLeft, ChevronRight, X, Grid, List, Sparkles, AlertCircle, Eye, Download, Info
} from 'lucide-react';
import axios from 'axios';

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  version: string;
  status: string;
  tags: string;
  isFavorite: boolean;
  createdAt: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalDocs, setTotalDocs] = useState(0);

  // Upload Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // AI Prompt results
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents', {
        params: {
          search: searchQuery || undefined,
          tag: tagFilter || undefined,
          isFavorite: favoriteOnly ? 'true' : undefined
        }
      });
      if (res.data.success) {
        setDocuments(res.data.data);
        setTotalDocs(res.data.data.length);
      }
    } catch (err) {
      // Mock data fallback
      const mockDocs: DocumentItem[] = [
        { id: '1', title: 'Enterprise Budget Ledger 2026', description: 'Financial ledger report containing accounting balances.', fileName: 'ledger_2026.pdf', fileUrl: '/uploads/ledger.pdf', mimeType: 'application/pdf', fileSize: 1048576, version: '1.0.0', status: 'ACTIVE', tags: 'Finance, Budget', isFavorite: true, createdAt: new Date().toISOString() },
        { id: '2', title: 'SCM Warehouse Bin Specifications', description: 'Specifications documentation regarding storage layout designs.', fileName: 'bin_locations.docx', fileUrl: '/uploads/bins.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 512000, version: '1.0.1', status: 'ACTIVE', tags: 'SupplyChain', isFavorite: false, createdAt: new Date().toISOString() },
        { id: '3', title: 'HR Employee Leaves Policy Map', description: 'Standard leave parameters rulesheet.', fileName: 'leave_map.png', fileUrl: '/uploads/leaves.png', mimeType: 'image/png', fileSize: 256000, version: '1.0.0', status: 'ACTIVE', tags: 'HR, Policy', isFavorite: true, createdAt: new Date().toISOString() }
      ];
      setDocuments(mockDocs);
      setTotalDocs(mockDocs.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchQuery, tagFilter, favoriteOnly]);

  const toggleFavorite = async (id: string) => {
    try {
      const res = await axios.put(`/api/documents/${id}/favorite`);
      if (res.data.success) {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
      }
    } catch (err) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
    }
  };

  const moveToTrash = async (id: string) => {
    try {
      await axios.delete(`/api/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setFeedback({ type: 'success', msg: 'Document moved to Recycle Bin' });
    } catch (err) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  // --- Upload Mechanics ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!uploadTitle) {
        // Auto fill title
        setUploadTitle(e.dataTransfer.files[0].name.split('.')[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!uploadTitle) {
        setUploadTitle(e.target.files[0].name.split('.')[0]);
      }
    }
  };

  const executeUpload = async () => {
    if (!selectedFile || !uploadTitle) {
      setFeedback({ type: 'error', msg: 'Please select a file and enter a title' });
      return;
    }

    setUploading(true);
    setFeedback(null);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const payload = {
          title: uploadTitle,
          description: uploadDesc || null,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          base64Data: base64String
        };

        const res = await axios.post('/api/documents', payload);
        if (res.data.success) {
          setFeedback({ type: 'success', msg: 'File uploaded and AI categorized successfully!' });
          // Highlight AI Summary
          if (res.data.data.summary) {
            setAiSummary(res.data.data.summary);
          }
          fetchDocuments();
          setIsDrawerOpen(false);
          // reset states
          setUploadTitle('');
          setUploadDesc('');
          setSelectedFile(null);
        }
      };
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'File upload failed' });
    } finally {
      setUploading(false);
    }
  };

  // Pagination bounds
  const paginatedDocs = documents.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search documents by title, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {/* Toggles */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`p-2 border rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
              favoriteOnly 
                ? 'bg-amber-50 border-amber-200 text-amber-600' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Favorites"
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Favorites</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Mode Switcher */}
          <div className="border border-slate-200 rounded-lg p-0.5 flex bg-slate-50">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* AI Summary Notification Box */}
      {aiSummary && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 p-4 rounded-xl relative shadow-sm flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-violet-800">AI File Categorization & Abstract Generated</h4>
            <div className="text-[11px] text-violet-600 mt-1 space-y-1 font-medium whitespace-pre-line">
              {aiSummary}
            </div>
          </div>
          <button 
            onClick={() => setAiSummary(null)} 
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main List/Grid render */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-semibold text-xs">Loading document store...</div>
      ) : paginatedDocs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-400 text-xs">
          No active documents matching parameters found. Try clearing filters or uploading new files.
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Title</th>
                <th className="p-4">Version</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Size</th>
                <th className="p-4">Upload Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <Link to={`/dms/view/${doc.id}`} className="font-bold text-slate-800 hover:text-primary transition-colors block">
                          {doc.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-xs">{doc.fileName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-500">v{doc.version}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags?.split(',').map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-semibold text-slate-500">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="p-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-1 shrink-0">
                    <button 
                      onClick={() => toggleFavorite(doc.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${doc.isFavorite ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <Link 
                      to={`/dms/view/${doc.id}`}
                      className="inline-block p-1.5 bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button 
                      onClick={() => moveToTrash(doc.id)}
                      className="p-1.5 bg-white text-slate-400 border border-slate-200 hover:text-rose-500 hover:border-rose-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedDocs.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <button 
                onClick={() => toggleFavorite(doc.id)}
                className="absolute top-3 right-3 text-slate-300 hover:text-amber-500 transition-colors"
              >
                <Star className={`h-4.5 w-4.5 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
              </button>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl w-fit text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <Link to={`/dms/view/${doc.id}`} className="font-bold text-slate-800 hover:text-primary transition-colors block text-sm truncate pr-6">
                    {doc.title}
                  </Link>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{doc.fileName}</p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.tags?.split(',').map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-semibold text-slate-500">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 font-semibold">
                <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                <div className="flex gap-2">
                  <Link to={`/dms/view/${doc.id}`} className="hover:text-primary transition-colors">Open</Link>
                  <button onClick={() => moveToTrash(doc.id)} className="hover:text-rose-500 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer Upload Sideform */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsDrawerOpen(false)} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">Upload Document</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-left">
              {feedback && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{feedback.msg}</span>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Forecast Q3"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter details regarding this record..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Drag & Drop File Container */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select Document</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-primary bg-indigo-50/20' 
                      : 'border-slate-200 hover:border-primary/50 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-700 font-semibold">Drag & Drop file here, or click to browse</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports PDF, Image, Word up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeUpload}
                disabled={uploading}
                className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                {uploading ? 'Processing AI Audits...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
