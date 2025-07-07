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
import MajorsPage from "./admin/majors/page";
import CategoriesPage from "./admin/category/page";
import ProductsPage from "./admin/product/page";
import OrdersPage from "./admin/orders/page";
import SellerDashboard from "./seller/dashboard/page";
import SellerProductsPage from "./seller/product/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>

      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/sign-up-seller" element={<SellerPage />} />
          <Route path="/sign-up-buyer" element={<BuyerPage />} />

          
          {/* Seller */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerProductsPage />
              </ProtectedRoute>
            }
          />



          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/majors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MajorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>
);
