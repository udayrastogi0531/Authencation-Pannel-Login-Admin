import React, { createContext, useState, useEffect } from 'react';
import { User, AuthState, LoginForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm, OTPForm, OTPRequest, ProfileUpdateForm, OTPData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (form: LoginForm) => Promise<boolean>;
  loginWithOTP: (email: string, otp: string) => Promise<boolean>;
  signup: (form: SignUpForm) => Promise<boolean>;
  logout: () => void;
  socialLogin: (provider: 'facebook' | 'google') => Promise<boolean>;
  forgotPassword: (form: ForgotPasswordForm) => Promise<boolean>;
  resetPassword: (form: ResetPasswordForm) => Promise<boolean>;
  changePassword: (form: ChangePasswordForm) => Promise<boolean>;
  verifyResetToken: (token: string) => Promise<boolean>;
  sendOTP: (request: OTPRequest) => Promise<boolean>;
  verifyOTP: (form: OTPForm, type: 'email' | 'phone', purpose: string) => Promise<boolean>;
  updateProfile: (form: ProfileUpdateForm) => Promise<boolean>;
  resendOTP: (type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Mock user database
  const mockUsers = [
    {
      id: '1',
      email: 'uday@admin.com',
      phone: '+1234567890',
      name: 'Uday',
      role: 'admin' as const,
      password: 'admin123',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      phone: '+0987654321',
      name: 'John Doe',
      role: 'user' as const,
      password: 'user123',
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date(),
    },
  ];

  // Simulate OTP generation
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Simulate sending OTP
  const simulateOTPSend = (type: 'email' | 'phone', value: string, code: string, purpose: string) => {
    if (type === 'email') {
      console.log(`📧 EMAIL OTP SENT TO: ${value}`);
      console.log(`🔐 OTP CODE: ${code}`);
      console.log(`📝 PURPOSE: ${purpose}`);
      console.log(`⏰ EXPIRES IN: 5 minutes`);
    } else {
      console.log(`📱 SMS OTP SENT TO: ${value}`);
      console.log(`🔐 OTP CODE: ${code}`);
      console.log(`📝 PURPOSE: ${purpose}`);
      console.log(`⏰ EXPIRES IN: 5 minutes`);
    }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (form: LoginForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === form.email && u.password === form.password);
    
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      const updatedUser = { ...userWithoutPassword, lastLogin: new Date() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return false;
  };

  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify OTP
    const otpData = localStorage.getItem('currentOTP');
    if (!otpData) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    const { code, value, expires, purpose }: OTPData = JSON.parse(otpData);
    
    if (code !== otp || value !== email || Date.now() > expires || purpose !== 'login') {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    // Find user and login
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      const updatedUser = { ...userWithoutPassword, lastLogin: new Date() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.removeItem('currentOTP');
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return false;
  };

  const signup = async (form: SignUpForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === form.email);
    if (existingUser) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: form.email,
      phone: form.phone,
      name: form.name,
      role: form.email === 'uday@admin.com' ? 'admin' : 'user',
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date(),
    };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return true;
  };

  const socialLogin = async (provider: 'facebook' | 'google'): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const socialUser: User = {
      id: Date.now().toString(),
      email: `${provider}@example.com`,
      name: `${provider} User`,
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: new Date(),
    };
    
    localStorage.setItem('user', JSON.stringify(socialUser));
    setAuthState({
      user: socialUser,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return true;
  };

  const sendOTP = async (request: OTPRequest): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const otpCode = generateOTP();
    const otpData: OTPData = {
      code: otpCode,
      type: request.type,
      value: request.value,
      purpose: request.purpose,
      expires: Date.now() + 300000, // 5 minutes
      attempts: 0,
    };
    
    localStorage.setItem('currentOTP', JSON.stringify(otpData));
    simulateOTPSend(request.type, request.value, otpCode, request.purpose);
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return true;
  };

  const verifyOTP = async (form: OTPForm, type: 'email' | 'phone', purpose: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const otpData = localStorage.getItem('currentOTP');
    if (!otpData) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    const storedOTP: OTPData = JSON.parse(otpData);
    
    if (storedOTP.code !== form.otp || storedOTP.type !== type || storedOTP.purpose !== purpose || Date.now() > storedOTP.expires) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    // Update user verification status
    if (authState.user && purpose === 'verification') {
      const updatedUser = {
        ...authState.user,
        isEmailVerified: type === 'email' ? true : authState.user.isEmailVerified,
        isPhoneVerified: type === 'phone' ? true : authState.user.isPhoneVerified,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }

    localStorage.removeItem('currentOTP');
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return true;
  };

  const resendOTP = async (type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset'): Promise<boolean> => {
    const otpData = localStorage.getItem('currentOTP');
    if (!otpData) return false;

    const { value }: OTPData = JSON.parse(otpData);
    return await sendOTP({ type, value, purpose });
  };

  const forgotPassword = async (form: ForgotPasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if user exists
    const user = mockUsers.find(u => u.email === form.email);
    
    if (user) {
      // Generate reset token and store it
      const resetToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('resetToken', JSON.stringify({
        token: resetToken,
        email: form.email,
        expires: Date.now() + 3600000 // 1 hour
      }));
      
      // In a real app, you would send an email here
      console.log(`🔐 Password reset link: ${window.location.origin}?token=${resetToken}`);
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    // Always return true for security (don't reveal if email exists)
    return true;
  };

  const verifyResetToken = async (token: string): Promise<boolean> => {
    const resetData = localStorage.getItem('resetToken');
    if (!resetData) return false;
    
    const { token: storedToken, expires } = JSON.parse(resetData);
    return storedToken === token && Date.now() < expires;
  };

  const resetPassword = async (form: ResetPasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const resetData = localStorage.getItem('resetToken');
    if (!resetData) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    const { token, expires } = JSON.parse(resetData);
    
    if (token !== form.token || Date.now() >= expires) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    // In a real app, you would update the password in the database
    localStorage.removeItem('resetToken');
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return true;
  };

  const changePassword = async (form: ChangePasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!authState.user) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    // Verify current password
    const user = mockUsers.find(u => u.email === authState.user!.email);
    if (!user || user.password !== form.currentPassword) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    // In a real app, you would update the password in the database
    console.log(`✅ Password changed successfully for ${authState.user.email}`);
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return true;
  };

  const updateProfile = async (form: ProfileUpdateForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!authState.user) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }

    const updatedUser = {
      ...authState.user,
      name: form.name,
      email: form.email,
      phone: form.phone,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState(prev => ({ ...prev, user: updatedUser, isLoading: false }));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentOTP');
    localStorage.removeItem('resetToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithOTP,
        signup,
        logout,
        socialLogin,
        forgotPassword,
        resetPassword,
        changePassword,
        verifyResetToken,
        sendOTP,
        verifyOTP,
        updateProfile,
        resendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};