import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Applayout from "./layout/Applayout";

import { Dashboard } from "./Pages/Dashboard";
import { Vehicles } from "./Pages/Vehicles";
import { Staff } from "./Pages/Staff";
import { Settings } from "./Pages/Settings";
import { Signin } from "./Pages/Auth";
import { NotFound } from "./Pages/Not-Found";

import "./index.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/admin",
      element: <Applayout />,
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
