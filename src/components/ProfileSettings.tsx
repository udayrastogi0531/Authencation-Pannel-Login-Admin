import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Shield, CheckCircle, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ProfileUpdateForm, ChangePasswordForm, OTPRequest } from '../types/auth';
import OTPVerification from './OTPVerification';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, updateProfile, changePassword, sendOTP, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [showOTP, setShowOTP] = useState(false);
  const [otpConfig, setOtpConfig] = useState<{ type: 'email' | 'phone'; value: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState<ProfileUpdateForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('🚀 Profile update started from UI');
    console.log('📋 Form data:', profileForm);

    // Add timeout mechanism
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile update timed out')), 10000); // 10 second timeout
    });

    try {
      const success = await Promise.race([
        updateProfile(profileForm),
        timeoutPromise
      ]) as boolean;
      
      console.log('📊 Update profile result:', success);
      
      if (success) {
        setSuccess('Profile updated successfully!');
        console.log('✅ Profile update UI success message set');
      } else {
        setError('Failed to update profile. Please try again.');
        console.log('❌ Profile update UI error message set');
      }
    } catch (error) {
      console.error('❌ Profile update UI error:', error);
      if (error instanceof Error && error.message === 'Profile update timed out') {
        setError('Profile update timed out. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    const success = await changePassword(passwordForm);
    if (success) {
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      setError('Current password is incorrect');
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    
    const request: OTPRequest = {
      type: 'email',
      value: user.email,
      purpose: 'verification',
    };

    const success = await sendOTP(request);
    if (success) {
      setOtpConfig({ type: 'email', value: user.email });
      setShowOTP(true);
    } else {
      setError('Failed to send verification email');
    }
  };

  const handleVerifyPhone = async () => {
    if (!user?.phone) return;
    
    const request: OTPRequest = {
      type: 'phone',
      value: user.phone,
      purpose: 'verification',
    };

    const success = await sendOTP(request);
    if (success) {
      setOtpConfig({ type: 'phone', value: user.phone });
      setShowOTP(true);
    } else {
      setError('Failed to send verification SMS');
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setOtpConfig(null);
    setSuccess(`${otpConfig?.type === 'email' ? 'Email' : 'Phone'} verified successfully!`);
  };

  if (showOTP && otpConfig) {
    return (
      <OTPVerification
        type={otpConfig.type}
        value={otpConfig.value}
        purpose="verification"
        onSuccess={handleOTPSuccess}
        onBack={() => {
          setShowOTP(false);
          setOtpConfig(null);
        }}
        title={`Verify ${otpConfig.type === 'email' ? 'Email' : 'Phone'}`}
        subtitle={`Enter the verification code sent to your ${otpConfig.type}`}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
            aria-label="Close profile settings"
            title="Close profile settings"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'password', label: 'Password', icon: Lock },
            { id: 'security', label: 'Security', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'profile' | 'password' | 'security')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-colors ${
                activeTab === id
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400 text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Profile
                  </>
                )}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                
                {/* Email Verification */}
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl mb-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Email Verification</p>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {user?.isEmailVerified ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone Verification */}
                {user?.phone && (
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Phone Verification</p>
                        <p className="text-slate-400 text-sm">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {user?.isPhoneVerified ? (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleVerifyPhone}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Security</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Created:</span>
                    <span className="text-white">{user?.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Login:</span>
                    <span className="text-white">
                      {user?.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Type:</span>
                    <span className={`font-medium ${user?.role === 'admin' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;