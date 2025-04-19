import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import Dashboard from "../components/dashboard/Dashboard";
import LandingPage from "./LandingPage";
import Register from "./Register";
import UserVerification from "./UserVerification";
import Login from "./Login";
import EmailVerification from "./EmailVerification";
import ResetPassVerification from "./ResetPassVerification";
import ResetPassword from "./ResetPassword";
import Products from "./dashboard/Products";
import FinancialTransactions from "./dashboard/FinancialTransactions";
import Invoices from "./dashboard/Invoices";
import Employees from "./dashboard/Employees";
import Deliveries from "./dashboard/Deliveries";
import Customer from "./dashboard/Customer";
import PurchaseOrders from "./dashboard/PurchaseOrders";
import ChangePassword from "./dashboard/ChangePassword";
import ChangeEmail from "./dashboard/ChangeEmail";
import Profile from "./dashboard/Profile";
import ChangeEmailVerification from "./dashboard/ChangeEmailVerification";
import Sales from "./dashboard/Sales";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import OtherUser from "./dashboard/OtherUser";
import NotFound from "./NotFound";

function Body() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <LandingPage />, // Show LandingPage by default
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "register/user-verification",
      element: <UserVerification />,
    },
    {
      path: "login",
      element: <Login />,
    },
    { path: "email-verification", element: <EmailVerification /> },
    {
      path: "reset-password-verification",
      element: <ResetPassVerification />,
    },
    {
      path: "reset-password-verification/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/dashboard",
      element: <ProtectedRoute />,
      children: [
        {
          path: "", element: <Home />, children: [
            { path: "", element: <Dashboard /> },
            { path: "product-inventory", element: <Products /> },
            { path: "sales", element: <Sales /> },
            { path: "financial-transactions", element: <FinancialTransactions /> },
            { path: "invoice-generator", element: <Invoices /> },
            { path: "employees-management", element: <Employees /> },
            { path: "deliveries", element: <Deliveries /> },
            { path: "customer-management", element: <Customer /> },
            { path: "purchase-orders", element: <PurchaseOrders /> },
            { path: "change-password", element: <ChangePassword /> },
            { path: "change-email", element: <ChangeEmail /> },
            {
              path: "change-email/change-email-verification",
              element: <ChangeEmailVerification />,
            },
            { path: "profile", element: <Profile /> },
            { path: "other-users", element: <OtherUser /> },
            { path: "*", element: <NotFound /> }
          ]
        },

      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  );
}

export default Body;
