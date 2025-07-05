import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import LoginPage from "@/Authentication/login-page";
import SellerPage from "./Authentication/sign-up-seller";
import BuyerPage from "./Authentication/sign-up-buyer";
import Dashboard from "./admin/dashboard/page";
import { AuthProvider } from "./Authentication/AuthContext";
import ProtectedRoute from "./Routes/protected-routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>

      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up-seller" element={<SellerPage />} />
          <Route path="/sign-up-buyer" element={<BuyerPage />} />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
