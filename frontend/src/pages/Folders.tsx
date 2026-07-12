import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, FolderPlus, Trash2, ArrowRight, ArrowDown, ChevronRight, FileText, 
  Plus, Settings, Key, X, Check, Lock, ShieldAlert
} from 'lucide-react';
import axios from 'axios';

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
  children?: FolderItem[];
  _count?: {
    documents: number;
  };
}

const Folders: React.FC = () => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [folderContents, setFolderContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedFolderPerms, setSelectedFolderPerms] = useState<FolderItem | null>(null);

  // Folder permissions form
  const [permissionRole, setPermissionRole] = useState('EMPLOYEE');
  const [permissionAccess, setPermissionAccess] = useState('READ');

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents/folders');
      if (res.data.success) {
        setFolders(res.data.data);
      }
    } catch (err) {
      // Mock data fallback
      const mockFolders: FolderItem[] = [
        { id: 'f1', name: 'Finance Archives', parentId: null, createdBy: 'finance@amdox.com', createdAt: new Date().toISOString(), _count: { documents: 3 } },
        { id: 'f2', name: 'HR Confidential Resumes', parentId: null, createdBy: 'hr@amdox.com', createdAt: new Date().toISOString(), _count: { documents: 1 } },
        { id: 'f3', name: 'SCM Purchase Invoices', parentId: null, createdBy: 'scm@amdox.com', createdAt: new Date().toISOString(), _count: { documents: 5 } }
      ];
      setFolders(mockFolders);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId: string) => {
    try {
      const res = await axios.get(`/api/documents?folderId=${folderId}`);
      if (res.data.success) {
        setFolderContents(res.data.data);
      }
    } catch (err) {
      setFolderContents([
        { id: 'doc101', title: 'Q2 Audit Balance Sheets', fileName: 'audit_sheet.xlsx', fileSize: 1048576, createdAt: new Date().toISOString(), version: '1.0.0' }
      ]);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleSelectFolder = (folder: FolderItem) => {
    setCurrentFolder(folder);
    fetchFolderContents(folder.id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await axios.post('/api/documents/folders', {
        name: newFolderName,
        parentId: currentFolder?.id || undefined
      });
      if (res.data.success) {
        fetchFolders();
        if (currentFolder) {
          fetchFolderContents(currentFolder.id);
        }
        setNewFolderName('');
        setIsCreateOpen(false);
      }
    } catch (err) {
      // Offline fallback
      const newMock: FolderItem = {
        id: Math.random().toString(),
        name: newFolderName,
        parentId: currentFolder?.id || null,
        createdBy: 'admin@amdox.com',
        createdAt: new Date().toISOString(),
        _count: { documents: 0 }
      };
      setFolders(prev => [...prev, newMock]);
      setIsCreateOpen(false);
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await axios.delete(`/api/documents/folders/${id}`);
      setFolders(prev => prev.filter(f => f.id !== id));
      if (currentFolder?.id === id) {
        setCurrentFolder(null);
        setFolderContents([]);
      }
    } catch (err) {
      setFolders(prev => prev.filter(f => f.id !== id));
      if (currentFolder?.id === id) {
        setCurrentFolder(null);
        setFolderContents([]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>Folder Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Structure knowledge directories, secure path structures, and manage RBAC node permissions.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Folder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left Side: Folder List Tree */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
            <span>Workspace Folders</span>
            {currentFolder && (
              <button 
                onClick={() => { setCurrentFolder(null); setFolderContents([]); }}
                className="text-[10px] text-primary hover:underline"
              >
                Clear selection
              </button>
            )}
          </h3>

          {loading ? (
            <div className="text-slate-500 text-xs text-center py-6 font-semibold">Loading directories...</div>
          ) : folders.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-6">No folders configured.</div>
          ) : (
            <div className="space-y-2">
              {folders.map((f) => (
                <div 
                  key={f.id}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                    currentFolder?.id === f.id
                      ? 'bg-indigo-50/50 border-indigo-200 text-primary font-bold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/50'
                  }`}
                  onClick={() => handleSelectFolder(f)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder className={`h-4.5 w-4.5 shrink-0 ${currentFolder?.id === f.id ? 'text-primary fill-primary/10' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <p className="text-xs leading-none">{f.name}</p>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-1">{f._count?.documents || 0} file(s)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedFolderPerms(f); setIsPermissionsOpen(true); }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded border border-transparent hover:border-slate-200/60"
                      title="Folder settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded border border-transparent hover:border-slate-200/60"
                      title="Move to Trash"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Folder Files Viewer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          {currentFolder ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <Folder className="h-4.5 w-4.5 text-primary" />
                    <span>Contents of: {currentFolder.name}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Creator: {currentFolder.createdBy} • Date: {new Date(currentFolder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {folderContents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  This folder is empty. Upload files into this folder from the Files portal.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {folderContents.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-slate-50/40 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <Link to={`/dms/view/${doc.id}`} className="text-xs font-bold text-slate-800 hover:text-primary block truncate">
                            {doc.title}
                          </Link>
                          <span className="text-[9px] text-slate-400 mt-0.5 block truncate max-w-md">
                            {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB • v{doc.version}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/dms/view/${doc.id}`} 
                        className="text-[10px] text-primary hover:text-primary-hover font-bold flex items-center gap-1 border border-slate-200 px-2.5 py-1 bg-white hover:bg-slate-50 rounded-lg shrink-0"
                      >
                        <span>Open Viewer</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <Folder className="h-10 w-10 text-slate-300" />
              <span>Select a folder directory from the left ledger to view stored items.</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Folder */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCreateOpen(false)} />
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full relative z-10 p-6 text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800">Create Folder Directory</h4>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Folder Name</label>
              <input
                type="text"
                placeholder="e.g. Invoices 2026"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
              />
              {currentFolder && (
                <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Creating inside: <span className="text-slate-600">{currentFolder.name}</span></span>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Folder Permission Overlays */}
      {isPermissionsOpen && selectedFolderPerms && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsPermissionsOpen(false)} />
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full relative z-10 p-6 text-left space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-500" />
                <span>Node Permission Settings: {selectedFolderPerms.name}</span>
              </h4>
              <button onClick={() => setIsPermissionsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex gap-2.5 items-start">
              <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 mt-0.5" />
              <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                Folder permissions propagate to all contained subfolders and documents automatically unless overridden at the individual document level.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Access Scope Role</label>
                <select
                  value={permissionRole}
                  onChange={(e) => setPermissionRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                  <option value="SCM_MANAGER">SCM_MANAGER</option>
                  <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
                  <option value="HR_MANAGER">HR_MANAGER</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Permission Level</label>
                <select
                  value={permissionAccess}
                  onChange={(e) => setPermissionAccess(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                >
                  <option value="READ">READ ONLY</option>
                  <option value="WRITE">READ & WRITE</option>
                  <option value="ADMIN">ADMIN / OWNER</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
              <button
                onClick={() => setIsPermissionsOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setIsPermissionsOpen(false)}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folders;
