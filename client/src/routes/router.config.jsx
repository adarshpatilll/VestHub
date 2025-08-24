import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import NewPassword from "../pages/NewPassword";

import AppContent from "../content/AppContent"; // add this import
import Seo from "../components/Seo"; // ✅ import Seo component

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
               {
                  path: "/login",
                  element: (
                     <>
                        <Seo
                           title="VestHub - Login"
                           description="Access your VestHub account to manage your mutual fund investments securely."
                        />
                        <Login />
                     </>
                  ),
               },
               {
                  path: "/register",
                  element: (
                     <>
                        <Seo
                           title="VestHub - Register"
                           description="Create a new VestHub account and start tracking your mutual fund portfolio."
                        />
                        <Register />
                     </>
                  ),
               },
               {
                  path: "/reset-password",
                  element: <ResetPassword />,
               },
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
                     {
                        path: "/",
                        element: (
                           <>
                              <Seo
                                 title="VestHub - Portfolio Overview"
                                 description="View your mutual fund portfolio overview, total investments, current value, PnL, and overall returns."
                              />
                              <Home />
                           </>
                        ),
                     },
                     {
                        path: "/funds",
                        element: (
                           <>
                              <Seo
                                 title="VestHub - My Funds"
                                 description="View all your mutual fund investments with performance details and analytics."
                              />
                              <Funds />
                           </>
                        ),
                        children: [
                           {
                              path: "view-funds",
                              element: (
                                 <>
                                    <Seo
                                       title="VestHub - View Funds"
                                       description="Explore detailed information for each of your mutual fund investments."
                                    />
                                    <ViewFunds />
                                 </>
                              ),
                           },
                           {
                              path: "edit-funds",
                              element: (
                                 <>
                                    <Seo
                                       title="VestHub - Edit Funds"
                                       description="Edit your existing mutual fund entries to keep your portfolio up-to-date."
                                    />
                                    <EditFunds />
                                 </>
                              ),
                           },
                           {
                              path: "add-fund",
                              element: (
                                 <>
                                    <Seo
                                       title="VestHub - Add New Fund"
                                       description="Add a new mutual fund to your portfolio and track your investments."
                                    />
                                    <AddFund />
                                 </>
                              ),
                           },
                           {
                              path: "shared-funds",
                              element: (
                                 <>
                                    <Seo
                                       title="VestHub - Shared Funds"
                                       description="View funds shared with you or by you for collaborative investment tracking."
                                    />
                                    <SharedSenders />
                                 </>
                              ),
                           },
                           {
                              path: "shared-funds/:senderId",
                              element: (
                                 <>
                                    <Seo
                                       title="VestHub - Shared Fund Details"
                                       description="Explore details of shared mutual fund investments from a specific sender."
                                    />
                                    <SharedFunds />
                                 </>
                              ),
                           },
                        ],
                     },
                     {
                        path: "/account",
                        element: (
                           <>
                              <Seo
                                 title="VestHub - Account Settings"
                                 description="Manage your profile, update personal information, and control account preferences."
                              />
                              <Account />
                           </>
                        ),
                     },
                  ],
               },
            ],
         },
      ],
   },
]);

export default router;
