// src/components/EmpleadosTable.tsx
import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Typography,
  Stack,
  Pagination,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { Empleado } from "../api/empleadosApi";

interface EmpleadosTableProps {
  empleados: Empleado[];
  page: number;           // 0-based
  totalPages: number;     // backend totalPages
  onPageChange: (page: number) => void; // 0-based
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
}

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

export const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    // Pagination es 1-based; convertimos a 0-based para el padre
    onPageChange(newPage - 1);
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Fecha ingreso</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {empleados.map((e) => (
            <TableRow
              key={e.id}
              hover
              sx={{
                opacity: e.activo ? 1 : 0.7,
                backgroundColor: e.activo ? "inherit" : "action.hover",
              }}
            >
              <TableCell>{e.id}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {e.numEmpleado}
                </Typography>
              </TableCell>
              <TableCell>{formatearNombre(e)}</TableCell>
              <TableCell>
                {e.telefono ? (
                  <Tooltip title={e.telefono}>
                    <span>{e.telefono}</span>
                  </Tooltip>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {e.email ? (
                  <Tooltip title={e.email}>
                    <span>{e.email}</span>
                  </Tooltip>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{e.fechaIngreso}</TableCell>
              <TableCell>
                <Chip
                  label={e.activo ? "Activo" : "Inactivo"}
                  color={e.activo ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(e)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(e)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Stack>
      )}
    </>
  );
};
