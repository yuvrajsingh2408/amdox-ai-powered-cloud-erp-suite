import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, User, ShieldAlert, CheckCircle2, Shield, Lock, ArrowRight, Sparkles, Check } from 'lucide-react';
import axios from 'axios';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const res = await axios.post('/api/auth/login', { email, password });
        const data = res.data;
        if (data.success || data.status === 'success') {
          const authToken = data.data?.accessToken || data.data?.token || data.token;
          const userObj = data.data?.user || data.user;
          if (authToken && userObj) {
            login(authToken, userObj);
            if (userObj.tenantId) {
              axios.defaults.headers.common['x-tenant-id'] = userObj.tenantId;
              localStorage.setItem('amdox_tenant_id', userObj.tenantId);
            }
            navigate('/dashboard');
          } else {
            setError('Invalid session token received from server.');
          }
        } else {
          setError(data.message || 'Login failed.');
        }
      } else {
        // Register Flow
        const res = await axios.post('/api/auth/register', {
          email,
          password,
          firstName,
          lastName
        });
        const data = res.data;
        if (data.success || data.status === 'success') {
          setSuccess('Account created successfully! Please sign in.');
          setIsLogin(true);
          setFirstName('');
          setLastName('');
          setPassword('');
        } else {
          setError(data.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Left Pane: Split Screen Brand & Marketing Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E293B] to-[#0F172A] relative flex-col justify-between p-12 overflow-hidden select-none">
        {/* Glow circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-100 tracking-tight leading-none">Amdox ERP</h1>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mt-0.5">Enterprise Cloud Suite</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="my-auto relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/15 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>Version 1.0 Production Launch</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              An AI-Powered Cloud ERP designed for enterprise speed.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Consolidate double-entry accounting, automated payroll calculations, secure supply chain logistics, and natural language forecasting intelligence.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/60">
            {[
              "Complete compliance controls (GDPR, SOC2 Audit Logging)",
              "Multi-tenant data isolation & custom security whitelists",
              "Real-time AI Copilot answers questions instantly",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300 text-xs font-semibold">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 rounded-md shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
          <span>© 2026 Amdox Technologies</span>
          <span>Security Verified</span>
        </div>
      </div>

      {/* Right Pane: Login Card Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-slate-50">
        
        {/* Glow circles behind form */}
        <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
          
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Sign In' : 'Create Workspace Account'}
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {isLogin 
                ? 'Enter your credentials to access your enterprise dashboard.' 
                : 'Register an account to start configuring your team layout.'
              }
            </p>
          </div>

          {/* Form wrapper card */}
          <div className="bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-6 sm:p-8">
            
            {/* Alerts */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5 text-xs text-green-700">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Registration names */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 pl-0.5">First Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 pl-0.5">Last Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 pl-0.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold pl-0.5">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => navigate('/forgot-password')}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 mt-4 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading && (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2 shrink-0"></span>
                )}
                <span>{isLogin ? 'Sign In' : 'Create Workspace'}</span>
                {!loading && <ArrowRight className="h-4 w-4 shrink-0" />}
              </button>
            </form>

            {/* Toggle form view link */}
            <div className="text-center mt-6 pt-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-primary hover:underline font-bold transition-all duration-150"
              >
                {isLogin ? "New to Amdox? Register an account" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
