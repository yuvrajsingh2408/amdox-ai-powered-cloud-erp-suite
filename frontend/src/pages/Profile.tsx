import React, { useState, useEffect } from 'react';
import { 
  User, ShieldAlert, CheckCircle2, KeyRound, Lock, EyeOff, CheckCircle 
} from 'lucide-react';
import axios from 'axios';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);

  // Profile Edit fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      if (res.data.success) {
        const u = res.data.data;
        setProfile(u);
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setPhone(u.employee?.phone || '');
        setAvatarUrl(u.avatarUrl || '');
        setTwoFactorEnabled(u.twoFactorEnabled);
      }
    } catch (err) {
      setError('Failed to load profile details.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.patch('/api/auth/profile', {
        firstName,
        lastName,
        phone,
        avatarUrl
      });
      if (res.data.success) {
        setSuccess('Profile details updated successfully');
        fetchProfile();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setError('');
    setSuccess('');
    if (twoFactorEnabled) {
      // Disable
      try {
        const res = await axios.post('/api/auth/2fa/disable');
        if (res.data.success) {
          setTwoFactorEnabled(false);
          setSuccess('Two Factor Authentication disabled.');
        }
      } catch (err) {
        setError('Failed to disable 2FA.');
      }
    } else {
      // Enable (Open setup modal)
      try {
        const res = await axios.post('/api/auth/2fa/setup');
        if (res.data.success) {
          setQrCodeUrl(res.data.data.qrCodeUrl);
          setSecretKey(res.data.data.secret);
          setShow2FAModal(true);
        }
      } catch (err) {
        setError('Failed to initialize 2FA setup.');
      }
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/auth/2fa/verify', {
        secret: secretKey,
        code: verificationCode
      });
      if (res.data.success) {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        setVerificationCode('');
        setSuccess('Two Factor Authentication successfully configured!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Try again.');
    }
  };

  if (!profile) {
    return <div className="text-center py-12 text-slate-400 font-medium">Loading profile details...</div>;
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Profile Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Update password, upload avatar, and configure 2FA authentication settings</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card and Edit Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-4 w-4 text-slate-800" />
            General Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                {firstName[0]}{lastName[0]}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
            >
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Password and 2FA Settings Card */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-slate-800" />
              Two-Factor Authentication
            </h3>

            <p className="text-[10px] text-slate-400 font-medium mb-4 leading-normal">
              Increase account security by enabling two-factor code checks on authorization attempts.
            </p>

            <button
              onClick={handleToggle2FA}
              className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition-all border ${
                twoFactorEnabled 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'bg-slate-900 border-transparent text-white hover:bg-slate-800'
              }`}
            >
              {twoFactorEnabled ? 'Disable Two-Factor Code Checks' : 'Configure Multi-Factor Setup'}
            </button>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-800" />
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all"
              >
                Change Password Credential
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Setup Two-Factor Authenticator</h4>
            </div>
            <form onSubmit={handleConfirm2FA} className="p-5 space-y-4 text-center">
              <div className="flex justify-center mb-3">
                {/* Visual simulator of QR code URL */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono w-40 h-40 flex flex-col justify-center items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-slate-400 animate-pulse" />
                  <span>Scan QR Code</span>
                </div>
              </div>
              
              <div className="text-left text-xs space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secret Key</p>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[10px] font-bold text-center text-slate-700">
                  {secretKey}
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Enter Authenticator Code</label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 text-center font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
