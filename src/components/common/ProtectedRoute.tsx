// src/components/common/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactElement;
  roles?: string[]; // opcional: restringir por rol
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // 1) No autenticado → a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) Autenticado pero sin roles requeridos (si se especifican)
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3) Pasa todos los filtros → renderiza el hijo (MainLayout, etc.)
  return children;
};
