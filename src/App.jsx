import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect } from "react";

import { AdminLayout, SuperAdminLayout } from "./layout";

import {
  Dashboard,
  Vehicles,
  Staff,
  Settings,
  NotFound,
  Signin,
  ForgotPassword,
  ResetPassword,
  Customer,
  Payments,
  Analytics,
  StaffPerformance,
  Messaging,
  VerifyAndSetToken,
  Alerts,
  SuperAdminDashboard,
  UserManagement,
  VehicleInventory,
  SocietyManagement,
  SuperAdminAnalytics,
  ActivityLogs,
  SentimentAnalytics,
  BinsManagement,
  Logs,
} from "./Pages";

import { Provider } from "react-redux";
import store from "./redux/store";
import socketService from "./services/socketService";
import { useSocketNotifications } from "./hooks/useSocketNotifications";

import "./index.css";

// Component to redirect based on user role
const RootRedirect = () => {
  const userRole = Cookies.get("user_role");
  const accessToken = Cookies.get("access_token");


  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  if (userRole === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  } else {
    return <Navigate to="/admin" replace />;
  } 
};

/**
 * Socket initialization component
 * Initializes socket connection on auth and sets up listeners
 */
function SocketInitializer() {
  const accessToken = Cookies.get("access_token");
  
  useEffect(() => {
    if (accessToken && !socketService.isSocketConnected()) {
      // Parse user info from cookies or Redux store
      const userId = Cookies.get("user_id") || localStorage.getItem("userId");
      const societyId = Cookies.get("user_society_id") || localStorage.getItem("societyId");
      const userRole = Cookies.get("user_role") || localStorage.getItem("userRole");

      if (userId) {
        console.log("🚀 Initializing socket from App...");
        socketService.connect(accessToken, userId, societyId, userRole);
      }
    } else if (!accessToken && socketService.isSocketConnected()) {
      console.log("🔴 Disconnecting socket due to logout");
      socketService.disconnect();
    }

    return () => {
      // Cleanup on unmount
      // Note: We keep socket connected even on component unmount
      // Only disconnect on explicit logout
    };
  }, [accessToken]);

  // Setup notification listeners
  useSocketNotifications();

  return null; // This component doesn't render anything
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootRedirect />,
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "",
          element: <Dashboard />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "vehicles",
          element: <Vehicles />,
        },
        {
          path: "customers",
          element: <Customer />,
        },
        {
          path: "staff",
          element: <Staff />,
        },
        {
          path: "staff-performance/:employeeId",
          element: <StaffPerformance />,
        },
        {
          path: "payment",
          element: <Payments />,
        },
        {
          path: "messaging",
          element: <Messaging />,
        },
        {
          path: "alerts",
          element: <Alerts />,
        },
        {
          path: "activity-logs",
          element: <ActivityLogs />,
        },
        {
          path: "analytics",
          element: <Analytics />,
        },
        {
          path: "sentiment-analytics",
          element: <SentimentAnalytics />,
        },
        {
          path: "logs",
          element: <Logs />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
    {
      path: "/super-admin",
      element: <SuperAdminLayout />,
      children: [
        {
          path: "",
          element: <SuperAdminDashboard />,
        },
        {
          path: "dashboard",
          element: <SuperAdminDashboard />,
        },
        {
          path: "users",
          element: <UserManagement />,
        },
        {
          path: "vehicles",
          element: <VehicleInventory />,
        },
        {
          path: "societies",
          element: <SocietyManagement />,
        },
        {
          path: "bins",
          element: <BinsManagement />,
        },
        {
          path: "messages",
          element: <Messaging />,
        },
        {
          path: "sentiment-analytics",
          element: <SentimentAnalytics />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
    {
      path: "signin",
      element: <Signin />,
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "reset-password",
      element: <ResetPassword />,
    },
    {
      path: "verify-email",
      element: <VerifyAndSetToken />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <Provider store={store}>
      <SocketInitializer />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
