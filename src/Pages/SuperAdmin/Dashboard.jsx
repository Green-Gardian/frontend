"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, Activity, TrendingUp, Shield, UserCheck, AlertTriangle, CheckCircle } from "lucide-react"
import { getSystemStats } from "@/services/auth"

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      const response = await getSystemStats()

      if (response.error) {
        setError(response.error)
      } else {
        setStats(response)
      }
    } catch (err) {
      setError("Failed to fetch system statistics")
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "customer_support":
        return "bg-green-100 text-green-700 border-green-200"
      case "driver":
        return "bg-orange-100 text-orange-700 border-orange-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "super_admin":
        return <Shield className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      case "customer_support":
        return <UserCheck className="h-4 w-4" />
      case "driver":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchSystemStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#121212]">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>
        <Button
          onClick={fetchSystemStats}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#EDEEFC] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#121212]">
              {stats?.userStats?.reduce((total, stat) => total + Number.parseInt(stat.count), 0) || 0}
            </div>
            <p className="text-xs text-gray-500">Across all roles</p>
          </CardContent>
        </Card>

        <Card className="bg-[#E6F1FD] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Societies</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#121212]">{stats?.societyCount || 0}</div>
            <p className="text-xs text-gray-500">Registered societies</p>
          </CardContent>
        </Card>

        <Card className="bg-[#EDEEFC] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">New Users (7 days)</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#121212]">{stats?.recentActivity?.new_users || 0}</div>
            <p className="text-xs text-gray-500">Recent registrations</p>
          </CardContent>
        </Card>

        <Card className="bg-[#E6F1FD] border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-500">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#121212]">User Distribution</CardTitle>
            <CardDescription className="text-gray-600">Users by role and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.userStats?.map((stat) => (
              <div
                key={stat.role}
                className="flex items-center justify-between p-3 bg-[#F7F6FE] rounded-lg border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  {getRoleIcon(stat.role)}
                  <div>
                    <p className="text-[#121212] font-medium capitalize">{stat.role.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">
                      {stat.verified_count} verified • {stat.blocked_count} blocked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#121212] font-bold">{stat.count}</p>
                  <Badge className={getRoleColor(stat.role)}>{stat.role.replace("_", " ")}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#121212]">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600">Last 7 days activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F7F6FE] rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-[#121212] font-medium">New Users</p>
                  <p className="text-xs text-gray-500">Total registrations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#121212] font-bold">{stats?.recentActivity?.new_users || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F7F6FE] rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-[#121212] font-medium">New Admins</p>
                  <p className="text-xs text-gray-500">Admin registrations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#121212] font-bold">{stats?.recentActivity?.new_admins || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F7F6FE] rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-[#121212] font-medium">New Staff</p>
                  <p className="text-xs text-gray-500">Support staff</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#121212] font-bold">{stats?.recentActivity?.new_staff || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users by Society Overview */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#121212]">Users by Society</CardTitle>
          <CardDescription className="text-gray-600">Overview of user distribution across societies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.societiesWithUsers?.map((societyData) => (
              <div key={societyData.society.id} className="p-4 bg-[#F7F6FE] rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#121212]">{societyData.society.name}</h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {societyData.society.city}, {societyData.society.state}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {societyData.userCounts.map((roleCount) => (
                    <div key={roleCount.role} className="text-center">
                      <div className="text-2xl font-bold text-[#121212]">{roleCount.count}</div>
                      <div className="text-xs text-gray-500 capitalize">{roleCount.role.replace("_", " ")}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Users:</span>
                    <span className="text-[#121212] font-semibold">
                      {societyData.userCounts.reduce((total, role) => total + role.count, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {stats?.usersWithoutSociety && stats.usersWithoutSociety.length > 0 && (
              <div className="p-4 bg-[#F7F6FE] rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-[#121212] mb-3">Users without Society</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.usersWithoutSociety.map((roleCount) => (
                    <div key={roleCount.role} className="text-center">
                      <div className="text-2xl font-bold text-[#121212]">{roleCount.count}</div>
                      <div className="text-xs text-gray-500 capitalize">{roleCount.role.replace("_", " ")}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Users:</span>
                    <span className="text-[#121212] font-semibold">
                      {stats.usersWithoutSociety.reduce((total, role) => total + role.count, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-[#121212]">Quick Actions</CardTitle>
          <CardDescription className="text-gray-600">Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              onClick={() => (window.location.href = "/super-admin/users")}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              onClick={() => (window.location.href = "/super-admin/societies")}
            >
              <Building2 className="h-6 w-6" />
              <span>Manage Societies</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              onClick={() => (window.location.href = "/super-admin/analytics")}
            >
              <Activity className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
