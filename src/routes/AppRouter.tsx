// src/routes/AppRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import EmpleadosPage from "../pages/EmpleadosPage"; // 👈 default import

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div>No autorizado</div>} />

      {/* Rutas protegidas con layout principal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* ruta raíz -> dashboard */}
        <Route index element={<DashboardPage />} />

        {/* módulo de empleados */}
        <Route path="empleados" element={<EmpleadosPage />} />
      </Route>

      {/* Fallback: cualquier otra ruta -> redirección al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
