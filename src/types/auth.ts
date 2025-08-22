export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OTPForm {
  otp: string;
}

export interface OTPRequest {
  type: 'email' | 'phone';
  value: string;
  purpose: 'verification' | 'login' | 'password_reset';
}

export interface ProfileUpdateForm {
  name: string;
  email: string;
  phone?: string;
}

export interface OTPData {
  code: string;
  type: 'email' | 'phone';
  value: string;
  purpose: string;
  expires: number;
  attempts: number;
}