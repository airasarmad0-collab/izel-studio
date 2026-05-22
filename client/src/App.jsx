import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import AdminSignUp from "./admin/pages/AdminSignUp";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import CreateVolume from "./admin/pages/CreateVolume";
import ViewVolumes from "./admin/pages/ViewVolumes";
import UpdateVolume from "./admin/pages/UpdateVolume";
import CreateCloth from "./admin/pages/CreateCloth";
import ViewClothes from "./admin/pages/ViewClothes";
import ViewSingleCloth from "./admin/pages/ViewSingleCloth";
import HomePage from "./client/pages/HomePage";
import ClientViewClothes from "./client/pages/ClientViewClothes";
import ClientViewSingleCloth from "./client/pages/ClientViewSingleCloth";

// ✅ Robust ProtectedRoute – uses navigate + interval to detect token removal
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        if (isAuthenticated) setIsAuthenticated(false);
        navigate("/admin/login", { replace: true });
      } else {
        if (!isAuthenticated) setIsAuthenticated(true);
      }
    };

    // Immediate check
    checkToken();

    // Watch for token changes (e.g. manual deletion)
    const interval = setInterval(checkToken, 500);
    const handleStorage = (e) => {
      if (e.key === "adminToken") checkToken();
    };
    window.addEventListener("storage", handleStorage);

    setChecking(false);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [navigate, isAuthenticated]);

  if (checking) return null; // or a loading spinner

  return isAuthenticated ? children : null;
};

const App = () => (
  <div>
    <Routes>
      {/* Public Admin Auth Routes */}
      <Route path="/admin/signup" element={<AdminSignUp />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/create/volume"
        element={
          <ProtectedRoute>
            <CreateVolume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/view/volumes"
        element={
          <ProtectedRoute>
            <ViewVolumes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/update/volume/:volumeId"
        element={
          <ProtectedRoute>
            <UpdateVolume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/create/cloth/:volumeId"
        element={
          <ProtectedRoute>
            <CreateCloth />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/view/clothes/:volumeId"
        element={
          <ProtectedRoute>
            <ViewClothes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard/view/cloth/:clothId"
        element={
          <ProtectedRoute>
            <ViewSingleCloth />
          </ProtectedRoute>
        }
      />

      {/* Client Routes (public) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/view/volume/:volumeId" element={<ClientViewClothes />} />
      <Route path="/view/cloth/:clothId" element={<ClientViewSingleCloth />} />
    </Routes>

    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />
  </div>
);

export default App;