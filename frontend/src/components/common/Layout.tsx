import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* outer spinner ring */}
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            {/* inner pulses */}
            <div className="absolute h-6 w-6 rounded-full bg-primary/10 animate-ping"></div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase animate-pulse">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if token is missing
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-primary/15">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 py-8">
          <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
