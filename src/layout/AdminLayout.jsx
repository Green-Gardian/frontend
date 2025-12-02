import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const AdminLayout = () => {
  const userRole = Cookies.get("user_role");
  const accessToken = Cookies.get("access_token");
  
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  
  // Only allow admin, customer_support, and driver roles
  if (userRole === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }
  
  if (!["admin", "customer_support", "driver"].includes(userRole)) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar role="admin" />
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

export default AdminLayout;
