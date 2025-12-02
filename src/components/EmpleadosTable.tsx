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

export interface EmpleadosTableProps {
  empleados: Empleado[];
  page: number;                 // 0-based
  totalPages: number;           // backend totalPages
  onPageChange: (page: number) => void; // 0-based
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;

  canEdit?: boolean;    // opcional
  canDelete?: boolean;  // opcional
}

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    // Pagination es 1-based; convertimos a 0-based para el padre
    onPageChange(newPage - 1);
  };

  const columnsCount = 10; // número total de columnas visibles

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>CURP</TableCell>
            <TableCell>RFC</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Fecha ingreso</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {empleados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnsCount}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No hay empleados para mostrar.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            empleados.map((e) => (
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

                <TableCell>{e.curp ?? "-"}</TableCell>
                <TableCell>{e.rfc ?? "-"}</TableCell>

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

                <TableCell>{e.fechaIngreso ?? ""}</TableCell>

                <TableCell>
                  <Chip
                    label={e.activo ? "Activo" : "Inactivo"}
                    color={e.activo ? "success" : "default"}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  {canEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(e)}
                      aria-label="Editar empleado"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}

                  {canDelete && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(e)}
                      aria-label="Eliminar empleado"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
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

export default EmpleadosTable;
