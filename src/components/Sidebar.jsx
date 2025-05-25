"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Car,
  UserCircle,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  Leaf,
  Ellipsis,
  LogOut,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar({ className }) {

  const routes = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin/dashboard",
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
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
    {
      title: "Help",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/admin/help",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-[288px] bg-[#121212] ",
        className
      )}
    >
      <div className="px-3 py-4">
        <div className="flex items-center px-3 py-2 mb-6 bg-zinc-800/50 rounded-md border border-white/8">
          <Leaf className="h-6 w-6 text-[#624DE3]/50 mr-2" />
          <h2 className="text-lg font-semibold text-white">Green Guardian</h2>
        </div>
        <ScrollArea className="flex-1 h-[calc(100vh-13rem)]">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              <NavLink
                key={route.href}
                to={route.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors hover:cursor-pointer",
                    isActive
                      ? "bg-[#fff]/12 text-[#FFFFFF]/80 border-1 border-[#EDEDED]/8"
                      : "text-white/80 hover:text-white hover:bg-zinc-800/50"
                  )
                }
              >
                {route.icon}
                {route.title}
              </NavLink>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-auto border-t border-[#121212] p-3">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="/placeholder.svg?height=36&width=36"
                alt="User"
              />
              <AvatarFallback className="bg-zinc-800 text-zinc-400">
                MH
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-[14px] font-medium text-white">
                Muhammad Hassan
              </p>
              <p className="text-[12px ] text-white/80">hassan@gmail.com</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/18 hover:cursor-pointer"
              >
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-zinc-900 border-zinc-800 text-[#fff]/80"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/18" />
              <DropdownMenuItem className="hover:text-white focus:text-white hover:bg-white/18 hover:cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
              className="text-red-500 hover:text-red-400 focus:text-red-400 hover:bg-white/18 hover:cursor-pointer"
                onClick={()=>{
                  window.location.href='signin'
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
