import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { OTPForm } from '../types/auth';

interface OTPVerificationProps {
  type: 'email' | 'phone';
  value: string;
  purpose: 'verification' | 'login' | 'password_reset';
  onSuccess: () => void;
  onBack: () => void;
  title?: string;
  subtitle?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  type,
  value,
  purpose,
  onSuccess,
  onBack,
  title,
  subtitle
}) => {
  const [form, setForm] = useState<OTPForm>({ otp: '' });
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, resendOTP, isLoading } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const success = await verifyOTP(form, type, purpose);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid or expired OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    setError('');
    const success = await resendOTP(type, purpose);
    if (success) {
      setTimeLeft(300);
      setCanResend(false);
      setForm({ otp: '' });
    } else {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleOTPChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setForm({ otp: numericValue });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-500/20 p-4 rounded-2xl mb-4 inline-block">
              {type === 'email' ? (
                <Mail className="w-8 h-8 text-emerald-400" />
              ) : (
                <Phone className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {title || 'Verify OTP'}
            </h1>
            <p className="text-slate-400">
              {subtitle || `We've sent a 6-digit code to your ${type}`}
            </p>
            <p className="text-emerald-400 font-medium mt-2">
              {type === 'email' ? value : value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
            </p>
          </div>

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={(e) => handleOTPChange(e.target.value)}
                className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                maxLength={6}
                required
              />
              <div className="flex justify-center mt-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 mx-1 rounded-full transition-colors ${
                      i < form.otp.length ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-slate-400">
                  Code expires in <span className="text-emerald-400 font-mono">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-red-400">Code has expired</p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || form.otp.length !== 6}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend OTP
              </button>
            ) : (
              <p className="text-slate-500">
                Didn't receive the code? You can resend in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center text-slate-400 hover:text-white transition-colors py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;