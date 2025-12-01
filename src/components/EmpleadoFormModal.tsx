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
  Switch,
  Typography,
} from "@mui/material";
import {
  createEmpleado,
  updateEmpleado,
  type Empleado,
} from "../api/empleadosApi";

export interface EmpleadoFormModalProps {
  open: boolean;
  onClose: () => void;
  empleado: Empleado | null;
  onSaved: () => void; // se llama después de guardar correctamente
}

type EmpleadoFormState = {
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  fechaIngreso: string; // yyyy-MM-dd
  activo: boolean;
};

type EmpleadoFormErrors = Partial<Record<keyof EmpleadoFormState, string>>;

const EMPTY_FORM: EmpleadoFormState = {
  numEmpleado: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  email: "",
  fechaIngreso: "",
  activo: true,
};

const EmpleadoFormModal: React.FC<EmpleadoFormModalProps> = ({
  open,
  onClose,
  empleado,
  onSaved,
}) => {
  const [form, setForm] = useState<EmpleadoFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<EmpleadoFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const esEdicion = !!empleado;

  // Cargar datos cuando se abre o cambia "empleado"
  useEffect(() => {
    if (empleado) {
      setForm({
        numEmpleado: empleado.numEmpleado ?? "",
        nombres: empleado.nombres ?? "",
        apellidoPaterno: empleado.apellidoPaterno ?? "",
        apellidoMaterno: empleado.apellidoMaterno ?? "",
        telefono: empleado.telefono ?? "",
        email: empleado.email ?? "",
        fechaIngreso: empleado.fechaIngreso
          ? empleado.fechaIngreso.substring(0, 10)
          : "",
        activo: empleado.activo,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setSubmitError(null);
  }, [empleado, open]);

  const handleChange =
    (field: keyof EmpleadoFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "activo" ? event.target.checked : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      // limpiar error en cuanto el usuario edita
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  // Validaciones básicas
  const validate = (): boolean => {
    const newErrors: EmpleadoFormErrors = {};

    if (!form.numEmpleado.trim()) {
      newErrors.numEmpleado = "El número de empleado es obligatorio";
    }

    if (!form.nombres.trim()) {
      newErrors.nombres = "Los nombres son obligatorios";
    }

    if (!form.apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = "El apellido paterno es obligatorio";
    }

    // hacemos obligatoria la fecha de ingreso (tiene sentido en RH)
    if (!form.fechaIngreso) {
      newErrors.fechaIngreso = "La fecha de ingreso es obligatoria";
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        newErrors.email = "Correo electrónico no válido";
      }
    }

    if (form.telefono.trim()) {
      const telSoloDigitos = form.telefono.replace(/\D/g, "");
      if (telSoloDigitos.length < 8) {
        newErrors.telefono = "Teléfono demasiado corto";
      }
    }

    if (form.fechaIngreso) {
      const hoy = new Date();
      const fi = new Date(form.fechaIngreso);
      hoy.setHours(0, 0, 0, 0);
      fi.setHours(0, 0, 0, 0);
      if (fi > hoy) {
        newErrors.fechaIngreso = "La fecha de ingreso no puede ser futura";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const payload = {
        numEmpleado: form.numEmpleado.trim(),
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),

        // opcionales: string | undefined
        apellidoMaterno: form.apellidoMaterno.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,

        // requerida en tus tipos: siempre string (usamos "" si por algo viniera vacía,
        // aunque la validación ya evita eso)
        fechaIngreso: form.fechaIngreso || "",

        activo: form.activo,
      };

      if (esEdicion && empleado) {
        await updateEmpleado(empleado.id, payload);
      } else {
        await createEmpleado(payload);
      }

      await onSaved();
    } catch (err) {
      console.error(err);
      setSubmitError("Ocurrió un error al guardar el empleado.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return; // evitar cerrar mientras guarda
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        {esEdicion ? "Editar empleado" : "Nuevo empleado"}
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
        )}

        <Stack spacing={2} mt={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Num. empleado"
              value={form.numEmpleado}
              onChange={handleChange("numEmpleado")}
              fullWidth
              size="small"
              required
              error={!!errors.numEmpleado}
              helperText={errors.numEmpleado}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.activo}
                  onChange={handleChange("activo")}
                  size="small"
                />
              }
              label="Activo"
              sx={{ ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0.5 } }}
            />
          </Stack>

          <TextField
            label="Nombres"
            value={form.nombres}
            onChange={handleChange("nombres")}
            fullWidth
            size="small"
            required
            error={!!errors.nombres}
            helperText={errors.nombres}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Apellido paterno"
              value={form.apellidoPaterno}
              onChange={handleChange("apellidoPaterno")}
              fullWidth
              size="small"
              required
              error={!!errors.apellidoPaterno}
              helperText={errors.apellidoPaterno}
            />
            <TextField
              label="Apellido materno"
              value={form.apellidoMaterno}
              onChange={handleChange("apellidoMaterno")}
              fullWidth
              size="small"
              error={!!errors.apellidoMaterno}
              helperText={errors.apellidoMaterno}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Teléfono"
              value={form.telefono}
              onChange={handleChange("telefono")}
              fullWidth
              size="small"
              error={!!errors.telefono}
              helperText={errors.telefono}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              fullWidth
              size="small"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Stack>

          <TextField
            label="Fecha de ingreso"
            type="date"
            value={form.fechaIngreso}
            onChange={handleChange("fechaIngreso")}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors.fechaIngreso}
            helperText={errors.fechaIngreso}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmpleadoFormModal;
