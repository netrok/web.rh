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
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import type { Empleado } from "../api/empleadosApi";

export interface EmpleadosTableProps {
  empleados: Empleado[];
  page: number;                 // 0-based
  totalPages: number;           // backend totalPages
  onPageChange: (page: number) => void; // 0-based
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
  onView: (empleado: Empleado) => void; // 👈 nuevo callback para "Ver"

  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
}

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "";
  // Si viene en ISO completa, nos quedamos con los primeros 10 caracteres (yyyy-MM-dd)
  return fecha.substring(0, 10);
}

const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
  canView = true,
}) => {
  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    // Pagination es 1-based; convertimos a 0-based para el padre
    onPageChange(newPage - 1);
  };

  // Columnas visibles: No. empleado, Nombre, Teléfono, Email, Fecha ingreso, Activo, Acciones
  const columnsCount = 7;

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>No. empleado</TableCell>
            <TableCell>Nombre</TableCell>
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
                {/* No. empleado */}
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {e.numEmpleado}
                  </Typography>
                </TableCell>

                {/* Nombre completo */}
                <TableCell>{formatearNombre(e)}</TableCell>

                {/* Teléfono */}
                <TableCell>
                  {e.telefono ? (
                    <Tooltip title={e.telefono}>
                      <span>{e.telefono}</span>
                    </Tooltip>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* Email */}
                <TableCell>
                  {e.email ? (
                    <Tooltip title={e.email}>
                      <span>{e.email}</span>
                    </Tooltip>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* Fecha de ingreso */}
                <TableCell>{formatearFecha(e.fechaIngreso)}</TableCell>

                {/* Activo */}
                <TableCell>
                  <Chip
                    label={e.activo ? "Activo" : "Inactivo"}
                    color={e.activo ? "success" : "default"}
                    size="small"
                  />
                </TableCell>

                {/* Acciones */}
                <TableCell align="right">
                  {canView && (
                    <Tooltip title="Ver detalle">
                      <IconButton
                        size="small"
                        onClick={() => onView(e)}
                        aria-label="Ver empleado"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {canEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(e)}
                        aria-label="Editar empleado"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {canDelete && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(e)}
                        aria-label="Eliminar empleado"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
