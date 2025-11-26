// src/pages/dashboard/DashboardPage.tsx
import React from "react";
import { Typography, Paper, Box } from "@mui/material";

const DashboardPage: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard GV-RH
      </Typography>
      <Box>
        <Typography>
          Bienvenido al sistema de Recursos Humanos. Aquí después pondremos tarjetas, métricas, etc.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DashboardPage;
