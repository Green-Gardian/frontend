
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";
import InfoCards from "@/components/info-cards";
import { useParams } from "react-router-dom";
import { fetchStaff } from "@/redux/slices/staffSlice";

// Helper function to format role names
const formatRoleName = (role) => {
  const roleMap = {
    'admin': 'Admin',
    'customer_support': 'Customer Support',
    'driver': 'Driver',
    'super_admin': 'Super Admin'
  };
  return roleMap[role] || role;
};

// Helper function to get status text
const getStatusText = (isBlocked, isVerified) => {
  if (isBlocked) return "Blocked";
  if (!isVerified) return "Pending";
  return "Active";
};

const getPerformanceData = (employeeId) => {
  const baseData = {
    totalTasks: 1247,
    completedTasks: 1156,
    pendingTasks: 91,
    efficiency: 92.7,
    monthlyPerformance: [
      { month: "Jan", completed: 95, target: 100, efficiency: 95 },
      { month: "Feb", completed: 88, target: 100, efficiency: 88 },
      { month: "Mar", completed: 102, target: 100, efficiency: 102 },
      { month: "Apr", completed: 97, target: 100, efficiency: 97 },
      { month: "May", completed: 110, target: 100, efficiency: 110 },
      { month: "Jun", completed: 105, target: 100, efficiency: 105 },
      { month: "Jul", completed: 98, target: 100, efficiency: 98 },
      { month: "Aug", completed: 115, target: 100, efficiency: 115 },
      { month: "Sep", completed: 108, target: 100, efficiency: 108 },
      { month: "Oct", completed: 92, target: 100, efficiency: 92 },
    ],
    weeklyHours: [
      { week: "Week 1", hours: 42, overtime: 2 },
      { week: "Week 2", hours: 40, overtime: 0 },
      { week: "Week 3", hours: 45, overtime: 5 },
      { week: "Week 4", hours: 38, overtime: 0 },
    ],
    taskDistribution: [
      { name: "Completed", value: 1156, color: "#10B981" },
      { name: "Pending", value: 91, color: "#F59E0B" },
    ],
    dailyActivity: [
      { day: "Mon", tasks: 12, hours: 8.5 },
      { day: "Tue", tasks: 15, hours: 9.0 },
      { day: "Wed", tasks: 10, hours: 8.0 },
      { day: "Thu", tasks: 14, hours: 8.5 },
      { day: "Fri", tasks: 13, hours: 8.0 },
      { day: "Sat", tasks: 8, hours: 6.0 },
      { day: "Sun", tasks: 0, hours: 0 },
    ],
  };

  if (employeeId === "2") {
    return {
      ...baseData,
      totalTasks: 892,
      completedTasks: 845,
      pendingTasks: 47,
      efficiency: 94.7,
    };
  }

  return baseData;
};

const StaffPerformance = () => {
  const [username, setUsername] = useState("");
  const [staffMember, setStaffMember] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { employeeId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    setUsername(Cookies.get("username"));
  }, []);

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin";
    }
  }, []);

  useEffect(() => {
    const fetchStaffMember = async () => {
      if (!employeeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all staff data
        const response = await dispatch(fetchStaff()).unwrap();
        const allStaff =
          response?.users ||
          response?.data?.users ||
          (Array.isArray(response) ? response : []);
        
        // Find the specific staff member
        const member = allStaff.find(staff => staff.id === parseInt(employeeId));
        
        if (member) {
          setStaffMember(member);
          setPerformanceData(getPerformanceData(employeeId));
        } else {
          setError("Staff member not found");
        }
      } catch (err) {
        console.error("Error fetching staff member:", err);
        setError("Failed to load staff member data");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMember();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-[#121212] text-[24px] leading-[32px]">
            Loading staff performance...
          </h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !staffMember || !performanceData) {
    return (
      <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-[#121212] text-[24px] leading-[32px]">
            {error || "Staff member not found"}
          </h1>
        </div>
      </div>
    );
  }

  const cardsData = [
    {
      title: "Total Tasks",
      number: performanceData.totalTasks.toString(),
      percentage: 8.2,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Completed Tasks",
      number: performanceData.completedTasks.toString(),
      percentage: 12.5,
      backgroundColor: "bg-[#E6F1FD]",
    },
    {
      title: "Pending Tasks",
      number: performanceData.pendingTasks.toString(),
      percentage: -5.2,
      backgroundColor: "bg-[#EDEEFC]",
    },
    {
      title: "Efficiency Rate",
      number: `${performanceData.efficiency}%`,
      percentage: 6.8,
      backgroundColor: "bg-[#E6F1FD]",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white min-h-screen py-6 px-4 gap-y-6 flex flex-col w-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-[#121212] text-[24px] leading-[32px]">
          Hello, <span className="font-semibold">{Cookies.get('society')} - {username}</span>
        </h1>
      </div>

      {/* Staff Member Info */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=100&width=100" alt={`${staffMember.first_name} ${staffMember.last_name}`} />
              <AvatarFallback className="text-lg">
                {staffMember.first_name[0]}{staffMember.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{staffMember.first_name} {staffMember.last_name}</CardTitle>
              <CardDescription className="text-lg">
                {formatRoleName(staffMember.role)} • Employee ID: #{staffMember.id}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={getStatusText(staffMember.is_blocked, staffMember.is_verified) === 'Active' ? 'default' : 'secondary'}>
                  {getStatusText(staffMember.is_blocked, staffMember.is_verified)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Joined: {new Date(staffMember.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{staffMember.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{staffMember.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Username: {staffMember.username}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Role: {formatRoleName(staffMember.role)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Verified: {staffMember.is_verified ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Cards */}
      <div className="flex flex-wrap md:gap-4 gap-2 justify-center w-full">
        {cardsData.map((card, index) => (
          <InfoCards
            key={index}
            title={card.title}
            number={card.number}
            percentage={card.percentage}
            backgroundColor={card.backgroundColor}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>
              Task completion vs targets over the last 10 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.monthlyPerformance}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="target"
                    name="Target"
                    fill="#E5E7EB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Overall task completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData.taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {performanceData.taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {performanceData.totalTasks}
                    </div>
                    <div className="text-sm text-gray-500">Total Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Hours */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Working Hours</CardTitle>
            <CardDescription>
              Regular hours vs overtime for the current month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.weeklyHours}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="hours"
                    name="Regular Hours"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="overtime"
                    name="Overtime"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Daily Activity
            </CardTitle>
            <CardDescription>
              Tasks completed and hours worked per day this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData.dailyActivity}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    name="Tasks Completed"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Hours Worked"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

  
    </div>
  );
};

export default StaffPerformance;