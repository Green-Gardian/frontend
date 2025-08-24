import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const SuperAdminLayout = () => {
  const userRole = Cookies.get("user_role");
  const accessToken = Cookies.get("access_token");
  
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  
  // Only allow super_admin role
  if (userRole !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar role="super-admin" />
      <SidebarInset>
        <div className="block md:hidden absolute right-3 top-5 ">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1 flex-col gap-4  bg-[#121212]">
          <Outlet className="rounded-3xl" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
