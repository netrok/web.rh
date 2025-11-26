// src/components/EmpleadoFormModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import type {
  EmpleadoCreateRequest,
  EmpleadoUpdateRequest,
  Empleado,
} from "../api/empleadosApi";
import { crearEmpleado, updateEmpleado } from "../api/empleadosApi";
import { useNotification } from "../context/NotificationContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void; // crear o editar
  empleado?: Empleado | null;
};

// Forzamos todo a string + activo
type FormState = {
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  activo: boolean;
};

const emptyForm: FormState = {
  numEmpleado: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  email: "",
  fechaIngreso: "",
  activo: true,
};

export const EmpleadoFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSaved,
  empleado,
}) => {
  const { showError } = useNotification();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(empleado);

  useEffect(() => {
    if (empleado && open) {
      setForm({
        numEmpleado: empleado.numEmpleado,
        nombres: empleado.nombres,
        apellidoPaterno: empleado.apellidoPaterno,
        apellidoMaterno: empleado.apellidoMaterno ?? "",
        telefono: empleado.telefono ?? "",
        email: empleado.email ?? "",
        fechaIngreso: empleado.fechaIngreso,
        activo: empleado.activo,
      });
    } else if (open && !empleado) {
      setForm(emptyForm);
      setError(null);
    }
  }, [empleado, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setAndShowError = (msg: string) => {
    setError(msg);
    showError(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones rápidas
    if (!isEditMode && !form.numEmpleado.trim()) {
      return setAndShowError("El número de empleado es obligatorio.");
    }
    if (!form.nombres.trim()) {
      return setAndShowError("El nombre es obligatorio.");
    }
    if (!form.apellidoPaterno.trim()) {
      return setAndShowError("El apellido paterno es obligatorio.");
    }
    if (!form.fechaIngreso) {
      return setAndShowError("La fecha de ingreso es obligatoria.");
    }

    try {
      setSaving(true);

      if (isEditMode && empleado) {
        const payload: EmpleadoUpdateRequest = {
          nombres: form.nombres.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: (form.apellidoMaterno ?? "").trim() || undefined,
          telefono: (form.telefono ?? "").trim() || undefined,
          email: (form.email ?? "").trim() || undefined,
          fechaIngreso: form.fechaIngreso,
          activo: form.activo,
        };
        await updateEmpleado(empleado.id, payload);
      } else {
        const payload: EmpleadoCreateRequest = {
          numEmpleado: form.numEmpleado.trim(),
          nombres: form.nombres.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: (form.apellidoMaterno ?? "").trim() || undefined,
          telefono: (form.telefono ?? "").trim() || undefined,
          email: (form.email ?? "").trim() || undefined,
          fechaIngreso: form.fechaIngreso,
        };
        await crearEmpleado(payload);
      }

      setSaving(false);
      onSaved(); // el padre recarga y muestra éxito
      onClose();
    } catch (err: any) {
      console.error("Error al guardar empleado:", err);
      setSaving(false);

      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Ocurrió un error al guardar el empleado.";

      setAndShowError(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditMode ? "Editar empleado" : "Nuevo empleado"}
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Número de empleado */}
            {!isEditMode ? (
              <TextField
                label="Número de empleado"
                name="numEmpleado"
                value={form.numEmpleado}
                onChange={handleChange}
                required
                size="small"
              />
            ) : (
              <TextField
                label="Número de empleado"
                value={form.numEmpleado}
                size="small"
                disabled
              />
            )}

            <TextField
              label="Nombres"
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              required
              size="small"
            />

            <TextField
              label="Apellido paterno"
              name="apellidoPaterno"
              value={form.apellidoPaterno}
              onChange={handleChange}
              required
              size="small"
            />

            <TextField
              label="Apellido materno"
              name="apellidoMaterno"
              value={form.apellidoMaterno}
              onChange={handleChange}
              size="small"
            />

            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              size="small"
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              size="small"
            />

            <TextField
              label="Fecha de ingreso"
              name="fechaIngreso"
              type="date"
              value={form.fechaIngreso}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
              }
              label="Activo"
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving
              ? "Guardando..."
              : isEditMode
              ? "Guardar cambios"
              : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
