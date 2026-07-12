import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, Loader2 } from 'lucide-react';

const DocumentsPortal: React.FC = () => {
  const navigate = useNavigate();
  const portalType = localStorage.getItem('portal_type');
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      alert('Document uploaded successfully to corporate DMS folder.');
    }, 800);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button 
          onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
          className="p-1 hover:bg-slate-900 rounded text-slate-400"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-indigo-400" />
            <span>Document Portal upload space</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Submit legal licenses, tax compliance certificates, and contract documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Upload form */}
        <form onSubmit={handleUpload} className="bg-[#0F172A] border border-slate-900 rounded-2xl p-6 space-y-4">
          <div className="border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 gap-2 hover:border-indigo-500/40 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-slate-600" />
            <span>Select file to upload (Max 10MB)</span>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            <span>Upload Document</span>
          </button>
        </form>

        {/* Upload history */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Recently Uploaded Files</h3>
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-350 block">BusinessLicense.pdf</span>
              <span className="text-[10px] text-slate-600">Uploaded: 3 days ago</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[8px] font-bold text-emerald-400">
              VERIFIED
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DocumentsPortal;
export { DocumentsPortal };
