<<<<<<< HEAD
"use client"
=======
>>>>>>> origin/main

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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react"
import Cookies from "js-cookie"

<<<<<<< HEAD
// Simplified mock data
=======

>>>>>>> origin/main
const paymentData = [
  { month: "Jan", collected: 125000, outstanding: 15000 },
  { month: "Feb", collected: 132000, outstanding: 18000 },
  { month: "Mar", collected: 141000, outstanding: 9000 },
  { month: "Apr", collected: 138000, outstanding: 12000 },
  { month: "May", collected: 143000, outstanding: 7000 },
  { month: "Jun", collected: 147500, outstanding: 2500 },
]

const customerData = [
  { month: "Jan", customers: 950 },
  { month: "Feb", customers: 1050 },
  { month: "Mar", customers: 1100 },
  { month: "Apr", customers: 1180 },
  { month: "May", customers: 1220 },
  { month: "Jun", customers: 1247 },
]

const staffData = [
  { name: "Drivers", value: 28 },
  { name: "Support", value: 22 },
  { name: "Maintenance", value: 15 },
  { name: "Management", value: 7 },
]

const vehicleData = [
  { day: "Mon", utilization: 85 },
  { day: "Tue", utilization: 78 },
  { day: "Wed", utilization: 92 },
  { day: "Thu", utilization: 88 },
  { day: "Fri", utilization: 76 },
  { day: "Sat", utilization: 65 },
  { day: "Sun", utilization: 45 },
]

const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B"]

const Analytics = () => {
  const [username, setUsername] = useState("")
  const [selectedAnalytic, setSelectedAnalytic] = useState("payments")

  useEffect(() => {
    setUsername(Cookies.get("username"))
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
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
      case "payments":
        return (
          <div className="space-y-6">
            {/* Payment Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">Rs. 2,47,500</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">12.5% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Outstanding</p>
                      <h3 className="text-2xl font-bold mt-1">Rs. 57,900</h3>
                      <div className="flex items-center mt-1 text-[#A30D11]">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">15.2% decrease</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Collection Rate</p>
                      <h3 className="text-2xl font-bold mt-1">76.6%</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">5.1% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Paid This Month</p>
                      <h3 className="text-2xl font-bold mt-1">Rs. 1,89,600</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">8.3% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Chart */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Payment Collection</CardTitle>
                <CardDescription>Revenue collected vs outstanding amounts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paymentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `Rs. ${value / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="collected"
                        name="Collected"
                        stroke="#4F46E5"
                        fillOpacity={1}
                        fill="url(#colorCollected)"
                      />
                      <Area
                        type="monotone"
                        dataKey="outstanding"
                        name="Outstanding"
                        stroke="#EF4444"
                        fillOpacity={1}
                        fill="url(#colorOutstanding)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )

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
                      <h3 className="text-2xl font-bold mt-1">1,247</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">8.2% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Customers</p>
                      <h3 className="text-2xl font-bold mt-1">1,089</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">12.5% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">New This Month</p>
                      <h3 className="text-2xl font-bold mt-1">156</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">15.3% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium Users</p>
                      <h3 className="text-2xl font-bold mt-1">423</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">6.8% increase</span>
                      </div>
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
                    <LineChart data={customerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis domain={[900, (dataMax) => Math.ceil(dataMax * 1.1)]} />
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
                      <h3 className="text-2xl font-bold mt-1">72</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">6.08% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">On Duty</p>
                      <h3 className="text-2xl font-bold mt-1">36</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">6.08% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">On Leave</p>
                      <h3 className="text-2xl font-bold mt-1">1</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">6.08% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Drivers</p>
                      <h3 className="text-2xl font-bold mt-1">28</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">6.08% increase</span>
                      </div>
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
                        data={staffData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {staffData.map((entry, index) => (
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
                      <h3 className="text-2xl font-bold mt-1">25</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">4.5% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Operational</p>
                      <h3 className="text-2xl font-bold mt-1">18</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">2.1% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EDEEFC] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">In Maintenance</p>
                      <h3 className="text-2xl font-bold mt-1">4</h3>
                      <div className="flex items-center mt-1 text-[#A30D11]">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">1.2% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E6F1FD] bg-opacity-30 border-none shadow-sm rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Utilization</p>
                      <h3 className="text-2xl font-bold mt-1">78%</h3>
                      <div className="flex items-center mt-1 text-[#1F9254]">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">3.2% increase</span>
                      </div>
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
                    <BarChart data={vehicleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <SelectItem value="payments">Payment Analytics</SelectItem>
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
