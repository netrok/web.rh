// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter"; // 👈 AQUÍ EL CAMBIO

const theme = createTheme({
  palette: {
    mode: "light", // luego si quieres lo cambiamos a dark
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);