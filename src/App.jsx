import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";

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
<<<<<<< HEAD
  Analytics
=======
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
} from "./Pages";

import { Provider } from "react-redux";
import store from "./redux/store";

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
<<<<<<< HEAD
          path:"payment", 
          element:<Payments/>
        },
        {
          path:"analytics",
          element:<Analytics/>
=======
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
>>>>>>> origin/main
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
      <RouterProvider router={router} />;
    </Provider>
  );
}

export default App;
