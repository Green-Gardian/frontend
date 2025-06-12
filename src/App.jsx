import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AdminLayout, SuperAdminLayout } from "./layout";

import {
  Dashboard,
  Vehicles,
  Staff,
  Settings,
  NotFound,
  Signin,
  Customer,
  Payments,
  Analytics,
  StaffPerformance,
  Messaging
} from "./Pages";



import "./index.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "",
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
          path:"payment", 
          element:<Payments/>
        },
        {
          path:"messaging", 
          element:<Messaging/>
        },
        {
          path:"analytics",
          element:<Analytics/>
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
          path: "dashboard",
          element: <h1 className="text-white">Main Super Admin Dashboard</h1>,
        },
        {
          path: "societies",
          element: <h1 className="text-white">Societies</h1>,
        },
      ],
    },
    {
      path: "signin",
      element: <Signin />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
