import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('If the email is registered, a reset link has been compiled. Please check your developer console/logs.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Forgot password request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex bg-slate-100 text-slate-700 p-3 rounded-xl mb-4 border border-slate-200">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password</h2>
        <p className="mt-1.5 text-xs text-slate-500 font-medium">Enter your email and we'll generate a recovery token</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm rounded-lg sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm focus:outline-none disabled:opacity-50 mt-2 flex items-center justify-center"
            >
              {loading && (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 mr-2"></span>
              )}
              Send Reset Token
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <Link to="/login" className="text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
