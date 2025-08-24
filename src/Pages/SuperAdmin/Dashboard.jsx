import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Activity, 
  TrendingUp, 
  Shield, 
  UserCheck,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { getSystemStats } from "@/services/auth";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemStats();
  }, []);

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-zinc-400 mt-2">System overview and management</p>
        </div>
        <Button onClick={fetchSystemStats} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.userStats?.reduce((total, stat) => total + parseInt(stat.count), 0) || 0}
            </div>
            <p className="text-xs text-zinc-400">
              Across all roles
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
            <div className="text-2xl font-bold text-white">
              {stats?.societyCount || 0}
            </div>
            <p className="text-xs text-zinc-400">
              Registered societies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              New Users (7 days)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.recentActivity?.new_users || 0}
            </div>
            <p className="text-xs text-zinc-400">
              Recent registrations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              System Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              Active
            </div>
            <p className="text-xs text-zinc-400">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">User Distribution</CardTitle>
            <CardDescription className="text-zinc-400">
              Users by role and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.userStats?.map((stat) => (
              <div key={stat.role} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
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
                  <Badge className={getRoleColor(stat.role)}>
                    {stat.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-400">
              Last 7 days activity summary
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#1a1a1a] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/super-admin/users'}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/super-admin/societies'}
            >
              <Building2 className="h-6 w-6" />
              <span>Manage Societies</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/super-admin/analytics'}
            >
              <Activity className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
