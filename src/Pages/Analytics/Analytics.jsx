"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download } from "lucide-react"
import Cookies from "js-cookie"
import { getCustomerAnalytics, getStaffAnalytics, getVehicleAnalytics } from "@/services/analytics"

// const paymentData = [
//   { month: "Jan", collected: 125000, outstanding: 15000 },
//   { month: "Feb", collected: 132000, outstanding: 18000 },
//   { month: "Mar", collected: 141000, outstanding: 9000 },
//   { month: "Apr", collected: 138000, outstanding: 12000 },
//   { month: "May", collected: 143000, outstanding: 7000 },
//   { month: "Jun", collected: 147500, outstanding: 2500 },
// ]

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B"]

const Analytics = () => {
  const [username, setUsername] = useState("")
  const [selectedAnalytic, setSelectedAnalytic] = useState("customers")
  const [customerAnalytics, setCustomerAnalytics] = useState(null)
  const [staffAnalytics, setStaffAnalytics] = useState(null)
  const [vehicleAnalytics, setVehicleAnalytics] = useState(null)

  useEffect(() => {
    setUsername(Cookies.get("username"))
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  const fetchCustomerAnalytics = async () => {
    const response = await getCustomerAnalytics()
    if (response.error) {
      console.error("Error fetching customer analytics:", response.error)
    } else {
      setCustomerAnalytics(response)
    }
  }

  const fetchStaffAnalytics = async () => {
    const response = await getStaffAnalytics()
    if (response.error) {
      console.error("Error fetching staff analytics:", response.error)
    } else {
      setStaffAnalytics(response)
    }
  }

  const fetchVehicleAnalytics = async () => {
    const response = await getVehicleAnalytics()
    if (response.error) {
      console.error("Error fetching vehicle analytics:", response.error)
    } else {
      setVehicleAnalytics(response)
    }
  }

  useEffect(() => {
    fetchCustomerAnalytics()
    fetchStaffAnalytics()
    fetchVehicleAnalytics()
  }, [])

  const formatCurrency = (value) => {
    return `Rs. ${value.toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderAnalytics = () => {
    switch (selectedAnalytic) {
      case "customers":
        return (
          <div className="space-y-6">
            {/* Customer Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Customers</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {customerAnalytics?.metrics?.totalCustomers?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Customers</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {customerAnalytics?.metrics?.activeCustomers?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">New This Month</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {customerAnalytics?.metrics?.newThisMonth?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium Users</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {customerAnalytics?.metrics?.premiumUsers?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Growth Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Monthly customer acquisition trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={customerAnalytics?.chartData || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="customers"
                        name="Total Customers"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "staff":
        return (
          <div className="space-y-6">
            {/* Staff Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Staff</p>
                      <h3 className="text-2xl font-bold mt-1">{staffAnalytics?.metrics?.totalStaff?.value || 0}</h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">On Duty</p>
                      <h3 className="text-2xl font-bold mt-1">{staffAnalytics?.metrics?.onDuty?.value || 0}</h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">On Leave</p>
                      <h3 className="text-2xl font-bold mt-1">{staffAnalytics?.metrics?.onLeave?.value || 0}</h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Drivers</p>
                      <h3 className="text-2xl font-bold mt-1">{staffAnalytics?.metrics?.drivers?.value || 0}</h3>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Distribution Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Staff Distribution</CardTitle>
                <CardDescription>Staff members by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffAnalytics?.distributionData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {staffAnalytics?.distributionData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "vehicles":
        return (
          <div className="space-y-6">
            {/* Vehicle Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {vehicleAnalytics?.metrics?.totalVehicles?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Operational</p>
                      <h3 className="text-2xl font-bold mt-1">{vehicleAnalytics?.metrics?.operational?.value || 0}</h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">In Maintenance</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {vehicleAnalytics?.metrics?.inMaintenance?.value || 0}
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Utilization</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {vehicleAnalytics?.metrics?.avgUtilization?.value || 0}%
                      </h3>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Utilization Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Vehicle Utilization</CardTitle>
                <CardDescription>Daily vehicle utilization percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={vehicleAnalytics?.chartData || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Utilization"]} />
                      <Legend />
                      <Bar dataKey="utilization" name="Utilization" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-[#121212] text-[24px] leading-[32px]">Analytics Dashboard</h1>

        <div className="flex items-center gap-3">
          <Select value={selectedAnalytic} onValueChange={setSelectedAnalytic}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Analytics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customers">Customer Analytics</SelectItem>
              <SelectItem value="staff">Staff Analytics</SelectItem>
              <SelectItem value="vehicles">Vehicle Analytics</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {renderAnalytics()}
    </div>
  )
}

export default Analytics
