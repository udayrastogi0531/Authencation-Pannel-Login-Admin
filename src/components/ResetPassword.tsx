import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ResetPasswordForm } from '../types/auth';

interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
  onInvalidToken: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess, onInvalidToken }) => {
  const [form, setForm] = useState<ResetPasswordForm>({
    token,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const { resetPassword, verifyResetToken, isLoading } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      const valid = await verifyResetToken(token);
      setIsValidToken(valid);
      if (!valid) {
        setTimeout(onInvalidToken, 2000);
      }
    };
    checkToken();
  }, [token, verifyResetToken, onInvalidToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = await resetPassword(form);
    if (success) {
      onSuccess();
    } else {
      setError('Reset token has expired. Please request a new one.');
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-white mt-4 text-center">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 text-center">
            <div className="bg-red-500/20 p-4 rounded-2xl mb-6 inline-block">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Invalid or Expired Link</h2>
            <p className="text-slate-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-500/20 p-4 rounded-2xl mb-4 inline-block">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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

            {/* Password Requirements */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-slate-300 text-sm mb-2">Password requirements:</p>
              <ul className="text-slate-400 text-xs space-y-1">
                <li className={`flex items-center ${form.password.length >= 6 ? 'text-green-400' : ''}`}>
                  <CheckCircle className={`w-3 h-3 mr-2 ${form.password.length >= 6 ? 'text-green-400' : 'text-slate-500'}`} />
                  At least 6 characters
                </li>
                <li className={`flex items-center ${form.password === form.confirmPassword && form.password ? 'text-green-400' : ''}`}>
                  <CheckCircle className={`w-3 h-3 mr-2 ${form.password === form.confirmPassword && form.password ? 'text-green-400' : 'text-slate-500'}`} />
                  Passwords match
                </li>
              </ul>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;