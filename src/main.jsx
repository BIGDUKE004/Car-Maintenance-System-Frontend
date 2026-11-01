import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Shell } from "./ui";
import { Landing, Login, Register } from "./pages/Public";
import { CHome, Vehicles, Requests, RequestDetail } from "./pages/Customer";
import { VehicleDetail, Payments, PaymentSuccess, Notifications } from "./pages/CustomerMore";
import { Profile, VerifyEmail, ForgotPassword, ResetPassword } from "./pages/Account";
import * as A from "./pages/AdminMore";
import { AHome, ARequests, ARequestDetail } from "./pages/Admin";
import "./styles.css";

const customer = [["/app", "Dashboard", true], ["/app/vehicles", "My Vehicles"], ["/app/requests", "Requests"], ["/app/payments", "Payments"], ["/app/notifications", "Notifications"], ["/app/profile", "Profile"]];
const admin = [["/admin", "Dashboard", true], ["/admin/requests", "Maintenance Requests"], ["/admin/payments", "Payments"], ["/admin/notifications", "Notifications"], ["/admin/customers", "Customers"], ["/admin/vehicles", "Vehicles"], ["/admin/images", "Maintenance Images"], ["/admin/administrators", "Administrators"], ["/admin/reports", "Reports"], ["/admin/settings", "Settings"]];

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/app" element={<Shell role="CUSTOMER" links={customer} />}>
        <Route index element={<CHome />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="payments/success" element={<PaymentSuccess />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="requests" element={<Requests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
      </Route>
      <Route path="/admin" element={<Shell role="WORKSHOP_ADMIN" links={admin} />}>
        <Route index element={<AHome />} />
        <Route path="requests" element={<ARequests />} />
        <Route path="requests/:id" element={<ARequestDetail />} />
        <Route path="payments" element={<A.AdminPayments />} />
        <Route path="notifications" element={<A.NotificationProblems />} />
        <Route path="customers" element={<A.Customers />} />
        <Route path="vehicles" element={<A.Vehicles />} />
        <Route path="images" element={<A.Images />} />
        <Route path="administrators" element={<A.Administrators />} />
        <Route path="reports" element={<A.Reports />} />
        <Route path="settings" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);
