import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import MFABlockingModal from "@/components/MFABlockingModal";
import { getMFAStatus } from "@/services/auth";

const SuperAdminLayout = () => {
  const userRole = Cookies.get("user_role");
  const accessToken = Cookies.get("access_token");
  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMFAModal, setShowMFAModal] = useState(false);

  useEffect(() => {
    const checkMFAStatus = async () => {
      if (accessToken && userRole === "super_admin") {
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
  
  // Only allow super_admin role
  if (userRole !== "super_admin") {
    return <Navigate to="/admin" replace />;
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
        <SidebarProvider>
          <AppSidebar role="super-admin" />
          <SidebarInset>
            <div className="block md:hidden absolute right-3 top-5 ">
              <SidebarTrigger />
            </div>
            <div className="flex flex-1 flex-col gap-4  bg-white">
              <Outlet className="rounded-3xl" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
};

export default SuperAdminLayout;
