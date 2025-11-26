// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EmpleadosPage } from "./pages/EmpleadosPage";
import { NotificationProvider } from "./context/NotificationContext";

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta principal: empleados */}
          <Route path="/empleados" element={<EmpleadosPage />} />

          {/* Redirigir raíz a /empleados */}
          <Route path="/" element={<Navigate to="/empleados" replace />} />

          {/* 404 genérico */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;
