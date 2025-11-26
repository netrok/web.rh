// src/components/ConfirmDeleteDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import type { Empleado } from "../api/empleadosApi";

interface ConfirmDeleteDialogProps {
  open: boolean;
  empleado: Empleado | null;
  onCancel: () => void;
  onConfirm: () => void;
}

function formatearNombre(e: Empleado) {
  return `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim();
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  empleado,
  onCancel,
  onConfirm,
}) => {
  const nombreEmpleado = empleado
    ? `${empleado.numEmpleado} - ${formatearNombre(empleado)}`
    : "";

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent dividers>
        <Typography>¿Seguro que quieres eliminar al empleado:</Typography>
        <Typography fontWeight="bold" sx={{ mt: 1 }}>
          {nombreEmpleado}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
