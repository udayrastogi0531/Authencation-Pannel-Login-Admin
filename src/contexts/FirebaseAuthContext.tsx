import React, { createContext, useState, useEffect } from 'react';
import { User, AuthState, LoginForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm, OTPForm, OTPRequest, ProfileUpdateForm, OTPData } from '../types/auth';
import firebaseService, { FirebaseUser, ActivityLog, SystemStats } from '../services/firebaseService';

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
  verifyOTP: (form: OTPForm, type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset') => Promise<boolean>;
  updateProfile: (form: ProfileUpdateForm) => Promise<boolean>;
  resendOTP: (type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset') => Promise<boolean>;
  
  // Admin-specific functions
  getAllUsers: () => Promise<FirebaseUser[]>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<boolean>;
  getActivityLogs: () => Promise<ActivityLog[]>;
  getUserActivityLogs: (userId: string) => Promise<ActivityLog[]>;
  getSystemStats: () => Promise<SystemStats | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

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

  // Convert Firebase user to app user
  const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.id!,
      email: firebaseUser.email,
      phone: firebaseUser.phone,
      name: firebaseUser.name,
      role: firebaseUser.role,
      isEmailVerified: firebaseUser.isEmailVerified,
      isPhoneVerified: firebaseUser.isPhoneVerified,
      createdAt: firebaseUser.createdAt?.toDate() || new Date(),
      lastLogin: firebaseUser.lastLogin?.toDate(),
      avatar: firebaseUser.avatar,
    };
  };

  // Log activity
  const logActivity = async (action: string, details: string, userId?: string) => {
    if (authState.user || userId) {
      const user = authState.user;
      await firebaseService.logActivity({
        userId: userId || user!.id,
        action,
        details,
        userEmail: user?.email || 'Unknown',
        userRole: user?.role || 'user',
      });
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const firebaseUser = await firebaseService.getUserByEmail(form.email);
      
      if (firebaseUser && firebaseUser.password === form.password) {
        // Update last login
        await firebaseService.updateUser(firebaseUser.id!, {});
        
        const user = convertFirebaseUser(firebaseUser);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Log activity
        await logActivity('User Login', `User logged in successfully`, user.id);
        
        return true;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const loginWithOTP = async (email: string, otp: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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
      const firebaseUser = await firebaseService.getUserByEmail(email);
      if (firebaseUser) {
        await firebaseService.updateUser(firebaseUser.id!, {});
        
        const user = convertFirebaseUser(firebaseUser);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('currentOTP');
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        await logActivity('OTP Login', `User logged in via OTP`, user.id);
        return true;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('OTP Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signup = async (form: SignUpForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = await firebaseService.getUserByEmail(form.email);
      if (existingUser) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      // Create new user in Firebase
      const userId = await firebaseService.createUser({
        email: form.email,
        phone: form.phone,
        name: form.name,
        role: form.email === 'uday@admin.com' ? 'admin' : 'user',
        password: form.password,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
      
      const newUser: User = {
        id: userId,
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

      await logActivity('User Signup', `New user account created`, userId);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const socialLogin = async (provider: 'facebook' | 'google'): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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

      await logActivity('Social Login', `User logged in via ${provider}`, socialUser.id);
      
      return true;
    } catch (error) {
      console.error('Social login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const sendOTP = async (request: OTPRequest): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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
      
      if (authState.user) {
        await logActivity('OTP Sent', `OTP sent to ${request.type}: ${request.value} for ${request.purpose}`);
      }
      
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const verifyOTP = async (form: OTPForm, type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset'): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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

      // Update user verification status in Firebase
      if (authState.user && purpose === 'verification') {
        await firebaseService.updateUser(authState.user.id, {
          isEmailVerified: type === 'email' ? true : undefined,
          isPhoneVerified: type === 'phone' ? true : undefined,
        });

        const updatedUser = {
          ...authState.user,
          isEmailVerified: type === 'email' ? true : authState.user.isEmailVerified,
          isPhoneVerified: type === 'phone' ? true : authState.user.isPhoneVerified,
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        
        await logActivity('OTP Verified', `${type} verification completed`);
      }

      localStorage.removeItem('currentOTP');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const resendOTP = async (type: 'email' | 'phone', purpose: 'verification' | 'login' | 'password_reset'): Promise<boolean> => {
    try {
      const otpData = localStorage.getItem('currentOTP');
      if (!otpData) return false;

      const { value }: OTPData = JSON.parse(otpData);
      return await sendOTP({ type, value, purpose });
    } catch (error) {
      console.error('Resend OTP error:', error);
      return false;
    }
  };

  const forgotPassword = async (form: ForgotPasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user exists in Firebase
      const user = await firebaseService.getUserByEmail(form.email);
      
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
        
        await logActivity('Password Reset Requested', `Password reset requested for ${form.email}`, user.id);
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      // Always return true for security (don't reveal if email exists)
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const verifyResetToken = async (token: string): Promise<boolean> => {
    try {
      const resetData = localStorage.getItem('resetToken');
      if (!resetData) return false;
      
      const { token: storedToken, expires } = JSON.parse(resetData);
      return storedToken === token && Date.now() < expires;
    } catch (error) {
      console.error('Verify reset token error:', error);
      return false;
    }
  };

  const resetPassword = async (form: ResetPasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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
      
      // In a real app, you would update the password in Firebase
      localStorage.removeItem('resetToken');
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const changePassword = async (form: ChangePasswordForm): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!authState.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Verify current password from Firebase
      const firebaseUser = await firebaseService.getUserByEmail(authState.user.email);
      if (!firebaseUser || firebaseUser.password !== form.currentPassword) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Update password in Firebase
      await firebaseService.updateUser(authState.user.id, {
        password: form.newPassword,
      });

      await logActivity('Password Changed', 'User password was changed successfully');
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const updateProfile = async (form: ProfileUpdateForm): Promise<boolean> => {
    console.log('🔄 Starting profile update process...', form);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      console.log('⏳ Simulating API call...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!authState.user) {
        console.error('❌ No authenticated user found');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      console.log('📝 Updating user in Firebase...', authState.user.id);
      
      try {
        // Try to update user in Firebase
        await firebaseService.updateUser(authState.user.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        });
        console.log('✅ Firebase update successful');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase update failed, proceeding with local update only:', firebaseError);
        // Continue with local update even if Firebase fails
      }

      console.log('🔄 Updating local state...');
      const updatedUser = {
        ...authState.user,
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('📦 Local state update...');
      setAuthState(prev => ({ ...prev, user: updatedUser, isLoading: false }));
      
      console.log('📊 Logging activity...');
      try {
        await logActivity('Profile Updated', 'User profile information was updated');
        console.log('✅ Activity logged successfully');
      } catch (logError) {
        console.warn('⚠️ Activity logging failed:', logError);
        // Don't fail the whole operation if logging fails
      }
      
      console.log('✅ Profile update completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Admin Functions
  const getAllUsers = async (): Promise<FirebaseUser[]> => {
    try {
      return await firebaseService.getAllUsers();
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await firebaseService.deleteUser(userId);
      await logActivity('User Deleted', `Admin deleted user with ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<boolean> => {
    try {
      await firebaseService.updateUser(userId, { role });
      await logActivity('User Role Updated', `User role changed to ${role} for user ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('Update user role error:', error);
      return false;
    }
  };

  const getActivityLogs = async (): Promise<ActivityLog[]> => {
    try {
      return await firebaseService.getActivityLogs();
    } catch (error) {
      console.error('Get activity logs error:', error);
      return [];
    }
  };

  const getUserActivityLogs = async (userId: string): Promise<ActivityLog[]> => {
    try {
      return await firebaseService.getUserActivityLogs(userId);
    } catch (error) {
      console.error('Get user activity logs error:', error);
      return [];
    }
  };

  const getSystemStats = async () => {
    try {
      await firebaseService.updateSystemStats();
      return await firebaseService.getSystemStats();
    } catch (error) {
      console.error('Get system stats error:', error);
      return null;
    }
  };

  const logout = () => {
    if (authState.user) {
      logActivity('User Logout', 'User logged out');
    }
    
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
        getAllUsers,
        deleteUser,
        updateUserRole,
        getActivityLogs,
        getUserActivityLogs,
        getSystemStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
