// src/components/layout/MainLayout.tsx
import React from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const MainLayout: React.FC = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            GV-RH
          </Typography>

          {isAuthenticated && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Salir
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};