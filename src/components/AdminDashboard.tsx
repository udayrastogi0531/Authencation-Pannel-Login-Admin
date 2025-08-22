import React, { useState, useEffect, useCallback } from 'react';
import { Users, Activity, Shield, Crown, Trash2, UserCheck, TrendingUp, Database, RefreshCw, Sparkles, Zap, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { FirebaseUser, ActivityLog, SystemStats } from '../services/firebaseService';

const AdminDashboard: React.FC = () => {
  const { user, getAllUsers, deleteUser, updateUserRole, getActivityLogs, getSystemStats } = useAuth();
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'activity' | 'stats'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [usersData, logsData, statsData] = await Promise.all([
        getAllUsers(),
        getActivityLogs(),
        getSystemStats(),
      ]);
      
      setUsers(usersData);
      setActivityLogs(logsData.slice(0, 20)); // Show latest 20 activities
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAllUsers, getActivityLogs, getSystemStats]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user?.role, loadData]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return 'Never';
    try {
      // Handle Firebase Timestamp objects
      const timestampObj = timestamp as { toDate?: () => Date };
      const date = timestampObj?.toDate ? timestampObj.toDate() : new Date(timestamp as string | number);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Animated particles component
  const AnimatedParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 bg-emerald-400 rounded-full opacity-20 animate-float particle-${i % 4 + 1}`}
        />
      ))}
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <AnimatedParticles />
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center animate-scale-in relative z-10">
          <div className="animate-pulse-glow mb-4">
            <Shield className="w-16 h-16 text-red-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 neon-text">Access Denied</h2>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <AnimatedParticles />
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center animate-scale-in relative z-10">
          <div className="animate-pulse-glow mb-4">
            <RefreshCw className="w-16 h-16 text-emerald-400 mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 neon-text">Loading Admin Dashboard</h2>
          <p className="text-slate-400">Fetching data from Firebase...</p>
          <div className="flex justify-center mt-4">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <AnimatedParticles />
      
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 animate-slide-in-left">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-xl animate-pulse-glow">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white neon-text">Firebase Admin Dashboard</h1>
              <Sparkles className="w-5 h-5 text-yellow-400 animate-float" />
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 enhanced-button hover-lift animate-slide-in-right"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl mb-8 animate-slide-in-up backdrop-blur-xl">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp, color: 'emerald' },
            { id: 'users', label: 'Users', icon: Users, color: 'blue' },
            { id: 'activity', label: 'Activity', icon: Activity, color: 'purple' },
            { id: 'stats', label: 'Statistics', icon: Database, color: 'orange' },
          ].map(({ id, label, icon: Icon }, index) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as 'overview' | 'users' | 'activity' | 'stats')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 enhanced-button animate-delay-${index}00 ${
                selectedTab === id
                  ? `bg-emerald-500 text-white shadow-lg neon-glow transform scale-105`
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50 hover-lift'
              }`}
            >
              <Icon className={`w-5 h-5 ${selectedTab === id ? 'animate-float' : ''}`} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Total Users',
                  value: stats?.totalUsers || users.length,
                  icon: Users,
                  color: 'blue',
                  bgGradient: 'from-blue-500/20 to-blue-600/20',
                },
                {
                  title: 'Active Users',
                  value: stats?.activeUsers || 0,
                  icon: UserCheck,
                  color: 'green',
                  bgGradient: 'from-green-500/20 to-green-600/20',
                },
                {
                  title: 'Admin Users',
                  value: stats?.adminUsers || users.filter(u => u.role === 'admin').length,
                  icon: Crown,
                  color: 'yellow',
                  bgGradient: 'from-yellow-500/20 to-yellow-600/20',
                },
              ].map((stat, index) => (
                <div
                  key={stat.title}
                  className={`enhanced-card rounded-2xl p-6 border border-slate-700/50 hover-lift animate-slide-in-up bg-gradient-to-br animate-delay-${index * 2}00 ${stat.bgGradient}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-white neon-text">{stat.value}</p>
                    </div>
                    <div className={`bg-${stat.color}-500/20 p-3 rounded-xl animate-pulse-glow`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">Live Data</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="enhanced-card rounded-3xl p-8 border border-slate-700/50 animate-slide-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-emerald-400" />
                  <span>Recent Activity</span>
                  <Star className="w-5 h-5 text-yellow-400 animate-float" />
                </h3>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityLogs.slice(0, 10).map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover-lift transition-all duration-300 animate-slide-in-left animate-delay-${index}00`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-slate-400 text-sm">{log.details}</p>
                        <p className="text-slate-500 text-xs">{log.userEmail} ({log.userRole})</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">{formatDate(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="enhanced-card rounded-3xl p-8 border border-slate-700/50 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-400" />
                <span>User Management</span>
                <Sparkles className="w-5 h-5 text-blue-400 animate-float" />
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['User', 'Role', 'Status', 'Created', 'Last Login', 'Actions'].map((header, index) => (
                      <th
                        key={header}
                        className={`text-left py-3 px-4 text-slate-400 font-medium animate-slide-in-up animate-delay-${index}00`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((firebaseUser, index) => (
                    <tr
                      key={firebaseUser.id}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300 animate-slide-in-up animate-delay-${index < 10 ? index * 50 : 500}`}
                    >
                      <td className="py-4 px-4">
                        <div className="animate-slide-in-left">
                          <p className="text-white font-medium">{firebaseUser.name}</p>
                          <p className="text-slate-400 text-sm">{firebaseUser.email}</p>
                          {firebaseUser.phone && <p className="text-slate-500 text-xs">{firebaseUser.phone}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={firebaseUser.role}
                          onChange={(e) => handleRoleChange(firebaseUser.id!, e.target.value as 'user' | 'admin')}
                          className="bg-slate-700 text-white px-3 py-1 rounded-lg border border-slate-600 text-sm enhanced-input"
                          title="Change user role"
                          aria-label="Change user role"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                            firebaseUser.isEmailVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {firebaseUser.isEmailVerified ? '✓ Email' : '✗ Email'}
                          </div>
                          {firebaseUser.phone && (
                            <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full ml-2 transition-all duration-300 ${
                              firebaseUser.isPhoneVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {firebaseUser.isPhoneVerified ? '✓ Phone' : '✗ Phone'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        {formatDate(firebaseUser.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        {formatDate(firebaseUser.lastLogin)}
                      </td>
                      <td className="py-4 px-4">
                        {firebaseUser.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(firebaseUser.id!)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300 enhanced-button hover-lift"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="enhanced-card rounded-3xl p-8 border border-slate-700/50 animate-slide-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Activity className="w-6 h-6 text-purple-400" />
                <span>Activity Logs</span>
                <Zap className="w-5 h-5 text-purple-400 animate-float" />
              </h3>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activityLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start justify-between p-4 bg-slate-700/50 rounded-xl hover-lift transition-all duration-300 animate-slide-in-up animate-delay-${index < 10 ? index * 50 : 500}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 animate-pulse" />
                    <div>
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-slate-400 text-sm mb-1">{log.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>User: {log.userEmail}</span>
                        <span>Role: {log.userRole}</span>
                        <span>ID: {log.userId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-sm">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'stats' && (
          <div className="space-y-6">
            <div className="enhanced-card rounded-3xl p-8 border border-slate-700/50 animate-slide-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Database className="w-6 h-6 text-orange-400" />
                  <span>System Statistics</span>
                  <Star className="w-5 h-5 text-orange-400 animate-float" />
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 animate-slide-in-left">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>User Statistics</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Users', value: users.length },
                      { label: 'Verified Email', value: users.filter(u => u.isEmailVerified).length },
                      { label: 'Verified Phone', value: users.filter(u => u.isPhoneVerified).length },
                      { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length },
                    ].map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`flex justify-between items-center p-3 bg-slate-700/30 rounded-lg hover-lift transition-all duration-300 animate-delay-${index}00`}
                      >
                        <span className="text-slate-400">{stat.label}:</span>
                        <span className="text-white font-medium neon-text">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4 animate-slide-in-right">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Activity Statistics</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Activities', value: activityLogs.length },
                      { label: 'Last Updated', value: formatDate(stats?.lastUpdated) },
                    ].map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`flex justify-between items-center p-3 bg-slate-700/30 rounded-lg hover-lift transition-all duration-300 animate-delay-${index}00`}
                      >
                        <span className="text-slate-400">{stat.label}:</span>
                        <span className="text-white font-medium neon-text">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
