import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ForgotPasswordForm } from '../types/auth';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email) {
      setError('Please enter your email address');
      return;
    }

    const success = await forgotPassword(form);
    if (success) {
      setIsSubmitted(true);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 text-center">
            <div className="bg-green-500/20 p-4 rounded-2xl mb-6 inline-block">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              We've sent a password reset link to <strong className="text-white">{form.email}</strong>
            </p>
            
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-300 mb-2">
                <strong>Demo Mode:</strong> Check the browser console for the reset link
              </p>
              <p className="text-xs text-slate-400">
                In production, this would be sent via email
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
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
            <div className="bg-blue-500/20 p-4 rounded-2xl mb-4 inline-block">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-slate-400">
              No worries! Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center text-slate-400 hover:text-white transition-colors py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;