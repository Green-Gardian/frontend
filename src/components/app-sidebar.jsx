"use client"

import { cn } from "@/lib/utils"

import {
  Settings,
  LogOut,
  Leaf,
  LayoutDashboard,
  Users,
  Car,
  BarChart3,
  CreditCard,
  UserCircle,
  MessageCircleMore,
  Building2,
  FileClock,
  Activity,
  Trash,
  ChevronLeft,
} from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { NavLink } from "react-router-dom"

import { getProfileData } from "../services/auth"

import Cookies from "js-cookie"
import { useEffect, useState } from "react"

const superAdminRoutes = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/super-admin/",
  },
  {

    title: "User Management",
    icon: <Users className="h-5 w-5" />,
    href: "/super-admin/users",
  },
  {
    title: "Vehicle Inventory",
    icon: <Car className="h-5 w-5" />,
    href: "/super-admin/vehicles",
  },
  {
    title: "Societies",
    icon: <Building2 className="h-5 w-5" />,
    href: "/super-admin/societies",
  },

  {
    title: "Dustbins",
    icon: <Trash className="h-5 w-5" />,
    href: "/super-admin/bins",
  },
  {
    title: "Messages",
    icon: <MessageCircleMore className="h-5 w-5" />,
    href: "/super-admin/messages",
  },
  {
    title: "Sentiment Analytics",
    icon: <Activity className="h-5 w-5" />,
    href: "/super-admin/sentiment-analytics",
  },
  // {
  //   title: "Settings",
  //   icon: <Settings className="h-5 w-5" />,
  //   href: "/super-admin/settings",
  // },
]

const adminRoutes = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/admin/",
  },
  {
    title: "Staff",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/staff",
  },
  {
    title: "Vehicles",
    icon: <Car className="h-5 w-5" />,
    href: "/admin/vehicles",
  },
  {
    title: "Customers",
    icon: <UserCircle className="h-5 w-5" />,
    href: "/admin/customers",
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    href: "/admin/analytics",
  },
  {
    title: "Sentiment Analytics",
    icon: <Activity className="h-5 w-5" />,
    href: "/admin/sentiment-analytics",
  },
  {
    title: "Payment",
    icon: <CreditCard className="h-5 w-5" />,
    href: "/admin/payment",
  },
  {
    title: "Messaging",
    icon: <MessageCircleMore className="h-5 w-5" />,
    href: "/admin/messaging",
  },

  {
    title: "Activity Logs",
    icon: <FileClock className="h-5 w-5" />,
    href: "/admin/activity-logs",
  },
  {
    title: "System Logs",
    icon: <Activity className="h-5 w-5" />,   
    href: "/admin/logs",
  },
  // {
  //   title: "Settings",
  //   icon: <Settings className="h-5 w-5" />,
  //   href: "/admin/settings",
  // },
]

function getInitials(name) {
  if (!name) return ""
  const parts = String(name).trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const last = parts[1]?.[0] || ""
  return (first + last).toUpperCase()
}

export function AppSidebar({ role }) {
  const { toggleSidebar } = useSidebar()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    role: role === "admin" ? "Admin" : "Super Admin",
  })

  const [routes, setRoutes] = useState(role === "admin" ? adminRoutes : superAdminRoutes)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfileData()
        if (data && !data.error) {
          const user = data?.user || data?.data || data
          const first = user?.first_name ?? user?.firstName
          const last = user?.last_name ?? user?.lastName
          const computedName =
            [first, last].filter(Boolean).join(" ") || user?.name || user?.full_name || user?.email || ""
          const computedEmail = user?.email || ""
          const computedAvatar = user?.profile_picture || user?.profilePicture || user?.avatar || user?.avatarUrl || ""

          const computedRole = user?.role || (role === "admin" ? "Admin" : "Super Admin")

          setUserData({
            name: computedName,
            email: computedEmail,
            avatarUrl: computedAvatar,
            role: computedRole,
          })
        } else {
          console.error("Error fetching profile data:", data?.error)
        }
      } catch (err) {
        console.error("Profile fetch failed:", err)
      }
    }
    fetchProfile()
  }, [role])

  useEffect(() => {
    let routesToSet = role === "admin" ? adminRoutes : superAdminRoutes

    // Filter out Activity Logs for sub_admin users
    const currentUserRole = Cookies.get("user_role")
    if (currentUserRole === "sub_admin") {
      routesToSet = routesToSet.filter(route => route.title !== "Activity Logs")
    }

    setRoutes(routesToSet)
  }, [role])

  return (
    <Sidebar collapsible="offcanvas" className="bg-white border-r border-primary/20">
      {/* Header */}
      <SidebarHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-slate-900">Green Guardian</span>
            <span className="truncate text-xs text-slate-600">
              {role === "super-admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="bg-white hide-scrollbar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 p-4">
              {(routes || []).map((route) => (
                <NavLink
                  key={route.href}
                  to={route.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors hover:cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-slate-700 hover:text-slate-900 hover:bg-primary/20",
                    )
                  }
                >
                  {route.icon}
                  {route.title}
                </NavLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="bg-white border-t border-primary/20">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* User Profile Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/5 cursor-pointer transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={userData.avatarUrl || "/placeholder.svg?height=32&width=32&query=default%20avatar"}
                      alt={userData.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(userData.name) || "UU"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{userData.name || "User"}</p>
                    <p className="text-xs text-slate-600 truncate">{userData.email || "user@example.com"}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg bg-white border-primary/20 text-slate-700"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage
                        src={userData.avatarUrl || "/placeholder.svg?height=32&width=32&query=default%20avatar"}
                        alt={userData.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {getInitials(userData.name) || "UU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-slate-900">{userData.name || "User"}</span>
                      <span className="truncate text-xs text-slate-600">{userData.email || "user@example.com"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem
                  className="text-slate-700 hover:text-slate-900 hover:bg-primary/5 focus:bg-primary/5 focus:text-slate-900 cursor-pointer transition-colors"
                  onClick={() => {
                    const settingsPath = role === "super-admin" ? "/super-admin/settings" : "/admin/settings"
                    window.location.href = settingsPath
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 hover:text-red-700 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 cursor-pointer transition-colors"
                  onClick={() => {
                    Cookies.remove("access_token")
                    window.location.href = "/signin"
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
