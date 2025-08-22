import React, { useState } from 'react';

// Animated background component
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-emerald-900 animate-gradient-shift"></div>
    {[...Array(18)].map((_, i) => (
      <div
        key={i}
        className={`absolute w-3 h-3 bg-emerald-400 rounded-full opacity-20 animate-float particle-${(i % 4) + 1}`}
      />
    ))}
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-purple-500/10 to-transparent backdrop-blur-2xl"></div>
  </div>
);
import { Eye, EyeOff, Mail, Lock, User, Facebook, Loader2, Phone, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm, SignUpForm, OTPRequest } from '../types/auth';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import OTPVerification from './OTPVerification'; 

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpConfig, setOtpConfig] = useState<{ type: 'email' | 'phone'; value: string; purpose: 'verification' | 'login' | 'password_reset' } | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, socialLogin, sendOTP, isLoading } = useAuth();

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Check for reset token in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (signUpForm.password !== signUpForm.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const success = await signup(signUpForm);
      if (!success) {
        setError('User already exists');
      }
    } else {
      const success = await login(loginForm);
      if (!success) {
        setError('Invalid credentials');
      }
    }
  };

  const handleOTPLogin = async (email: string) => {
    setError('');
    
    const request: OTPRequest = {
      type: 'email',
      value: email,
      purpose: 'login',
    };

    const success = await sendOTP(request);
    if (success) {
      setOtpConfig({ type: 'email', value: email, purpose: 'login' });
      setShowOTP(true);
    } else {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setOtpConfig(null);
    // User will be automatically logged in by the OTP verification
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    setError('');
    await socialLogin(provider);
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setResetToken('');
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    // Show success message or redirect to login
    alert('Password reset successful! You can now sign in with your new password.');
  };

  const handleInvalidToken = () => {
    setShowResetPassword(false);
    setResetToken('');
    window.history.replaceState({}, document.title, window.location.pathname);
    setShowForgotPassword(true);
  };

  if (showOTP && otpConfig) {
    return (
      <OTPVerification
        type={otpConfig.type}
        value={otpConfig.value}
        purpose={otpConfig.purpose}
        onSuccess={handleOTPSuccess}
        onBack={() => {
          setShowOTP(false);
          setOtpConfig(null);
        }}
        title="Login with OTP"
        subtitle="Enter the verification code sent to your email"
      />
    );
  }

  if (showResetPassword && resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onSuccess={handleResetSuccess}
        onInvalidToken={handleInvalidToken}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <div className="glassmorphism-card neon-glow p-8 shadow-2xl border border-slate-700/50 animate-slide-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-slate-400">Join our amazing community</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-700/50 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                !isSignUp
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                isSignUp
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={signUpForm.phone}
                  onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={isSignUp ? signUpForm.email : loginForm.email}
                onChange={(e) => {
                  if (isSignUp) {
                    setSignUpForm({ ...signUpForm, email: e.target.value });
                  } else {
                    setLoginForm({ ...loginForm, email: e.target.value });
                  }
                }}
                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={isSignUp ? signUpForm.password : loginForm.password}
                onChange={(e) => {
                  if (isSignUp) {
                    setSignUpForm({ ...signUpForm, password: e.target.value });
                  } else {
                    setLoginForm({ ...loginForm, password: e.target.value });
                  }
                }}
                className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
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

            {isSignUp && (
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
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
            )}

            {!isSignUp && (
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleOTPLogin(loginForm.email)}
                  disabled={!loginForm.email || isLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Login with OTP
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 border border-slate-600 rounded-xl bg-slate-700/50 text-white hover:bg-slate-600/50 transition-all duration-300 disabled:opacity-50"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </button>
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 border border-slate-600 rounded-xl bg-slate-700/50 text-white hover:bg-slate-600/50 transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;