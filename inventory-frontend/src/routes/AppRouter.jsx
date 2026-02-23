import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import BusinessPage from "../pages/BusinessPage";
import CreateProduct from "../pages/CreateProduct";

import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

function AppRouter() {
  const [businessExists, setBusinessExists] = useState(null);

  useEffect(() => {
    const checkBusiness = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/business/exists");
        const data = await res.json();
        setBusinessExists(data);
      } catch (error) {
        console.error("Error verificando empresa:", error);
        setBusinessExists(false);
      }
    };

    checkBusiness();
  }, []);

  if (businessExists === null) {
    return <div>Cargando configuración inicial...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta raíz dinámica */}
        <Route
          path="/"
          element={
            businessExists
              ? <Navigate to="/login" />
              : <Navigate to="/business" />
          }
        />

        {/* Públicas */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/business"
          element={
            businessExists
              ? <Navigate to="/login" />
              : <BusinessPage />
          }
        />

        {/* 🔥 TODAS LAS RUTAS PRIVADAS USAN LAYOUT */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateProduct />
              </ProtectedRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;