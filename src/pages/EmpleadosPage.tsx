// src/pages/EmpleadosPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CircularProgress,
  Alert,
} from "@mui/material";
import { fetchEmpleados, type Empleado, type EmpleadosPage } from "../api/empleadosApi";

export const EmpleadosPage: React.FC = () => {
  const [data, setData] = useState<EmpleadosPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const page = await fetchEmpleados(0, 20);
        setData(page);
      } catch (err) {
        console.error(err);
        setError("Error al cargar empleados.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Empleados
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && data && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Num. Empleado</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Fecha ingreso</TableCell>
                  <TableCell>Activo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((emp: Empleado) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.numEmpleado}</TableCell>
                    <TableCell>
                      {emp.nombres} {emp.apellidoPaterno}{" "}
                      {emp.apellidoMaterno ?? ""}
                    </TableCell>
                    <TableCell>{emp.telefono ?? "-"}</TableCell>
                    <TableCell>{emp.email ?? "-"}</TableCell>
                    <TableCell>{emp.fechaIngreso}</TableCell>
                    <TableCell>{emp.activo ? "Sí" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && !error && data && data.content.length === 0 && (
          <Typography sx={{ mt: 2 }}>No hay empleados registrados.</Typography>
        )}
      </Paper>
    </Box>
  );
};