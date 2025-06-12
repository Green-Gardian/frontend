import React from "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const SuperAdminLayout = () => {
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
