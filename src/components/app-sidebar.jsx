"use client"

import { cn } from "@/lib/utils"

import {
  Settings,
  MoreHorizontal,
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
    title: "Societies",
    icon: <Building2 className="h-5 w-5" />,
    href: "/super-admin/societies",
  },
  {
    title: "Messages",
    icon: <MessageCircleMore className="h-5 w-5" />,
    href: "/super-admin/messages",
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/super-admin/settings",
  },
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
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/admin/settings",
  },
]

function getInitials(name) {
  if (!name) return ""
  const parts = String(name).trim().split(/\s+/)
  const first = parts[0]?.[0] || ""
  const last = parts[1]?.[0] || ""
  return (first + last).toUpperCase()
}

export function AppSidebar({ role }) {
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
    setRoutes(role === "admin" ? adminRoutes : superAdminRoutes)
  }, [role])

  return (
    <Sidebar className="bg-[#121212] border-none">
      <SidebarHeader className="bg-[#121212] border-b border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#121212] data-[state=open]:text-white hover:bg-zinc-800 bg-zinc-800 text-white"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-black">
                <Leaf className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">Green Guardian</span>
                <span className="truncate text-xs text-zinc-400">
                  {role === "super-admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#121212]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {(routes || []).map((route) => (
                <NavLink
                  key={route.href}
                  to={route.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors hover:cursor-pointer",
                      isActive
                        ? "bg-[#fff]/12 text-[#FFFFFF]/80 border-1 border-[#EDEDED]/8"
                        : "text-white/80 hover:text-white hover:bg-zinc-800/50",
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
      <SidebarFooter className="bg-[#121212] border-t border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-zinc-800 data-[state=open]:text-white hover:bg-zinc-800 text-white"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userData.avatarUrl || "/placeholder.svg?height=32&width=32&query=default%20avatar"}
                      alt={userData.name || "User"}
                    />
                    <AvatarFallback className="rounded-full bg-[#121212] text-zinc-300">
                      {getInitials(userData.name) || "UU"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-white">{userData.name || "User"}</span>
                    <span className="truncate text-xs text-zinc-400">{userData.email || "user@example.com"}</span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4 text-zinc-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[#121212] border-[#EDEDED]/8 text-zinc-300"
                side="bottom"
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
                      <AvatarFallback className="rounded-lg bg-[#121212] text-zinc-300">
                        {getInitials(userData.name) || "UU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-white">{userData.name || "User"}</span>
                      <span className="truncate text-xs text-zinc-400">{userData.email || "user@example.com"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/12" />
                <DropdownMenuItem
                  className="text-white/80 hover:text-[#FFFFFF]/80 hover:bg-[#fff]/12 focus:bg-[#fff]/12 focus:text-[#FFFFFF]/80 cursor-pointer transition-colors"
                  onClick={() => {
                    const settingsPath = role === "super-admin" ? "/super-admin/settings" : "/admin/settings"
                    window.location.href = settingsPath
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-[#fff]/12 focus:bg-[#fff]/12 cursor-pointer transition-colors"
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



