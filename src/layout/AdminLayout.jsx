import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import io from "socket.io-client";
import { ChevronRight } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import MFABlockingModal from "@/components/MFABlockingModal";
import { getMFAStatus } from "@/services/auth";
import { SOCKET_URL } from "@/config/api";

const forceLogout = () => {
  const cookies = document.cookie.split(";");
  cookies.forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  window.location.href = "/signin?reason=society_blocked";
};

const CollapsedSidebarTrigger = () => {
  const { open, toggleSidebar } = useSidebar();

  if (open) return null;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
      aria-label="Open sidebar"
      title="Open sidebar"
    >
      <ChevronRight className="h-6 w-6" />
    </button>
  );
};

const AdminLayout = () => {
  const userRole = Cookies.get("user_role");
  const accessToken = Cookies.get("access_token");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!accessToken) return;
    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;
    socket.on("force-logout", (data) => {
      console.warn("Force logout:", data?.reason);
      socket.disconnect();
      forceLogout();
    });
    return () => socket.disconnect();
  }, [accessToken]);
  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMFAModal, setShowMFAModal] = useState(false);

  useEffect(() => {
    const checkMFAStatus = async () => {
      if (accessToken && (userRole === "admin" || userRole === "super_admin" || userRole === "sub_admin")) {
        try {
          const res = await getMFAStatus();
          if (!res.error) {
            setMfaStatus(res);
            // Show modal if MFA is required but not set up
            const requiresSetup = res.isRequired && (!res.hasSecret || !res.mfaVerified);
            setShowMFAModal(requiresSetup);
          }
        } catch (error) {
          console.error("Error checking MFA status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkMFAStatus();
  }, [accessToken, userRole]);

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  // Only allow admin, sub_admin, customer_support, and driver roles
  if (userRole === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }

  if (!["admin", "sub_admin", "customer_support"].includes(userRole)) {
    return <Navigate to="/signin" replace />;
  }

  // Show loading state while checking MFA
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MFABlockingModal 
        isOpen={showMFAModal} 
        onMFAComplete={() => {
          setShowMFAModal(false);
          // Refresh MFA status
          getMFAStatus().then(res => {
            if (!res.error) {
              setMfaStatus(res);
            }
          });
        }} 
      />
      {showMFAModal ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Please complete MFA setup to continue</p>
          </div>
        </div>
      ) : (
        <SidebarProvider className="h-screen overflow-hidden">
          <AppSidebar role="admin" />
          <CollapsedSidebarTrigger />
          <SidebarInset className="flex min-h-0 flex-col overflow-hidden">
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
              <Outlet className="rounded-3xl" />
            </main>
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
};

export default AdminLayout;
