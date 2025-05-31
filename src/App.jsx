import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AdminLayout, SuperAdminLayout } from "./layout";

import {
  Dashboard,
  Vehicles,
  Staff,
  Settings,
  NotFound,
  Signin,
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
          path: "staff",
          element: <Staff />,
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
