import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import NewPassword from "../pages/NewPassword";

import AppContent from "../content/AppContent"; // add this import

import Home from "../pages/Home";

import Funds from "../pages/Funds";
import ViewFunds from "../pages/ViewFunds";
import EditFunds from "./../pages/EditFunds";
import AddFund from "../pages/AddFund";

import Account from "../pages/Account";

import Layout from "../components/Layout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import SharedFunds from "../pages/SharedFunds";
import SharedSenders from "../pages/SharedSenders";

export const router = createBrowserRouter([
   // Public routes
   {
      element: <PublicRoute />, // wrapper for all public pages
      children: [
         {
            element: <AppContent />, // ✅ wrapper for public routes
            children: [
               { path: "/login", element: <Login /> },
               { path: "/register", element: <Register /> },
               { path: "/reset-password", element: <ResetPassword /> },
            ],
         },
      ],
   },

   // Universal routes
   {
      path: "/new-password", // universal route (no auth wrapper)
      element: <NewPassword />,
   },

   // Protected routes
   {
      element: <ProtectedRoute />, // wrapper for all protected pages
      children: [
         {
            element: <Layout />, // nested layout
            children: [
               {
                  element: <AppContent />, // ✅ wrapper for protected routes
                  children: [
                     { path: "/", element: <Home /> },
                     {
                        path: "/funds",
                        element: <Funds />,
                        children: [
                           { path: "view-funds", element: <ViewFunds /> },
                           { path: "edit-funds", element: <EditFunds /> },
                           { path: "add-fund", element: <AddFund /> },
                           {
                              path: "shared-funds",
                              element: <SharedSenders />,
                           },
                           {
                              path: "shared-funds/:senderId",
                              element: <SharedFunds />,
                           },
                        ],
                     },
                     { path: "/account", element: <Account /> },
                  ],
               },
            ],
         },
      ],
   },
]);

export default router;
