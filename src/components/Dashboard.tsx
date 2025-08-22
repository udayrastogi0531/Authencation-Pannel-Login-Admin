import React from 'react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Shield, Users, Activity, Settings, Crown, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import ProfileSettings from './ProfileSettings';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogout = () => {
    logout();
  };

  if (showProfileSettings) {
    return <ProfileSettings onClose={() => setShowProfileSettings(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-xl transition-colors"
                  aria-label="Open profile settings"
                  title="Open profile settings"
                >
                  <User className="w-4 h-4" />
                </button>
                {user?.role === 'admin' && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-white font-medium">{user?.name}</span>
                <span className="text-emerald-400 text-sm bg-emerald-500/20 px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-slate-400">
                {user?.role === 'admin' 
                  ? 'You have full administrative access to the system.' 
                  : 'Enjoy your personalized dashboard experience.'
                }
              </p>
            </div>
            {user?.role === 'admin' && (
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-2xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">2,847</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Sessions</p>
                <p className="text-2xl font-bold text-white">1,234</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Health</p>
                <p className="text-2xl font-bold text-white">99.9%</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features */}
        {user?.role === 'admin' && (
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-yellow-400" />
              Admin Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center">
                <Users className="w-5 h-5 mr-3" />
                User Management
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center">
                <Settings className="w-5 h-5 mr-3" />
                System Settings
              </button>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center">
                <Activity className="w-5 h-5 mr-3" />
                Analytics
              </button>
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center">
                <Shield className="w-5 h-5 mr-3" />
                Security Logs
              </button>
            </div>
          </div>
        )}

        {/* User Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Email Status
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{user?.email}</span>
              {user?.isEmailVerified ? (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Verified</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-400">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Unverified</span>
                </div>
              )}
            </div>
          </div>

          {user?.phone && (
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-400" />
                Phone Status
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{user.phone}</span>
                {user?.isPhoneVerified ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-400">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Unverified</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Logged in', time: '2 minutes ago', status: 'success' },
              { action: 'Updated profile', time: '1 hour ago', status: 'info' },
              { action: 'Changed password', time: '3 hours ago', status: 'warning' },
              { action: 'Viewed dashboard', time: '1 day ago', status: 'info' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-400' :
                    item.status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-white">{item.action}</span>
                </div>
                <span className="text-slate-400 text-sm">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;