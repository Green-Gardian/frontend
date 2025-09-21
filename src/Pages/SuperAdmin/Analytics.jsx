import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building2, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  UserCheck,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { getSystemStats } from "@/services/auth";

const SuperAdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchSystemStats();
  }, [timeRange]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await getSystemStats();
      
      if (response.error) {
        setError(response.error);
      } else {
        setStats(response);
      }
    } catch (err) {
      
      setError("Failed to fetch system statistics");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'customer_support':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'driver':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'customer_support':
        return <UserCheck className="h-4 w-4" />;
      case 'driver':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchSystemStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.userStats?.reduce((total, stat) => total + parseInt(stat.count), 0) || 0;
  const totalVerified = stats?.userStats?.reduce((total, stat) => total + parseInt(stat.verified_count), 0) || 0;
  const totalBlocked = stats?.userStats?.reduce((total, stat) => total + parseInt(stat.blocked_count), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Analytics</h1>
          <p className="text-zinc-400 mt-2">Comprehensive system insights and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSystemStats} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-green-500">+12% from last month</p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Verified Users
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalVerified}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-green-500">+8% from last month</p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {((totalVerified / totalUsers) * 100).toFixed(1)}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Blocked Users
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalBlocked}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <p className="text-xs text-green-500">-3% from last month</p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {((totalBlocked / totalUsers) * 100).toFixed(1)}% block rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Societies
            </CardTitle>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.societyCount || 0}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-green-500">+5% from last month</p>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Registered societies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">User Distribution by Role</CardTitle>
            <CardDescription className="text-zinc-400">
              Breakdown of users across different roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.userStats?.map((stat) => {
              const percentage = ((parseInt(stat.count) / totalUsers) * 100).toFixed(1);
              return (
                <div key={stat.role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(stat.role)}
                      <div>
                        <p className="text-white font-medium capitalize">
                          {stat.role.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {stat.verified_count} verified • {stat.blocked_count} blocked
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{stat.count}</p>
                      <p className="text-xs text-zinc-400">{percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-400">
              Activity summary for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-white font-medium">New Users</p>
                  <p className="text-xs text-zinc-400">Total registrations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{stats?.recentActivity?.new_users || 0}</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">+15%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-white font-medium">New Admins</p>
                  <p className="text-xs text-zinc-400">Admin registrations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{stats?.recentActivity?.new_admins || 0}</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">+8%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-white font-medium">New Staff</p>
                  <p className="text-xs text-zinc-400">Support staff</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{stats?.recentActivity?.new_staff || 0}</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">+12%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">System Health</CardTitle>
            <CardDescription className="text-zinc-400">
              Overall system status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-white">Database</span>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-white">API Services</span>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-white">Email Service</span>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
            <CardDescription className="text-zinc-400">
              System performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-300">Response Time</span>
                <span className="text-white">~120ms</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-300">Uptime</span>
                <span className="text-white">99.9%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-300">Error Rate</span>
                <span className="text-white">0.1%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-zinc-400">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/super-admin/users'}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/super-admin/societies'}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Manage Societies
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
