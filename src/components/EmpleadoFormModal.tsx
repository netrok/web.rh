// src/components/EmpleadoFormModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  createEmpleado,
  updateEmpleado,
  type Empleado,
  type EmpleadoCreateRequest,
  type EmpleadoUpdateRequest,
} from "../api/empleadosApi";

interface EmpleadoFormModalProps {
  open: boolean;
  onClose: () => void;
  empleado: Empleado | null;
  onSaved: () => void;
}

type FormErrors = {
  numEmpleado?: string;
  nombres?: string;
  apellidoPaterno?: string;
  fechaIngreso?: string;
  email?: string;
};

const EmpleadoFormModal: React.FC<EmpleadoFormModalProps> = ({
  open,
  onClose,
  empleado,
  onSaved,
}) => {
  const isEdit = Boolean(empleado);

  const [numEmpleado, setNumEmpleado] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (empleado) {
      setNumEmpleado(empleado.numEmpleado);
      setNombres(empleado.nombres);
      setApellidoPaterno(empleado.apellidoPaterno);
      setApellidoMaterno(empleado.apellidoMaterno ?? "");
      setTelefono(empleado.telefono ?? "");
      setEmail(empleado.email ?? "");
      setFechaIngreso(empleado.fechaIngreso);
      setActivo(empleado.activo);
    } else {
      setNumEmpleado("");
      setNombres("");
      setApellidoPaterno("");
      setApellidoMaterno("");
      setTelefono("");
      setEmail("");
      setFechaIngreso(new Date().toISOString().slice(0, 10));
      setActivo(true);
    }
    setError(null);
    setErrors({});
  }, [empleado, open]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isEdit && !numEmpleado.trim()) {
      newErrors.numEmpleado = "El número de empleado es obligatorio.";
    }

    if (!nombres.trim()) {
      newErrors.nombres = "El nombre es obligatorio.";
    }

    if (!apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = "El apellido paterno es obligatorio.";
    }

    if (!fechaIngreso) {
      newErrors.fechaIngreso = "La fecha de ingreso es obligatoria.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Ingresa un email válido.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEdit && empleado) {
        const payload: EmpleadoUpdateRequest = {
          nombres,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || undefined,
          telefono: telefono || undefined,
          email: email || undefined,
          fechaIngreso,
          activo,
        };
        await updateEmpleado(empleado.id, payload);
      } else {
        const payload: EmpleadoCreateRequest = {
          numEmpleado,
          nombres,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || undefined,
          telefono: telefono || undefined,
          email: email || undefined,
          fechaIngreso,
        };
        await createEmpleado(payload);
      }

      onSaved();
    } catch (err) {
      console.error(err);
      setError("Error al guardar el empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Editar empleado" : "Nuevo empleado"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            {!isEdit && (
              <TextField
                label="Número de empleado"
                size="small"
                fullWidth
                required
                value={numEmpleado}
                onChange={(e) => setNumEmpleado(e.target.value)}
                error={Boolean(errors.numEmpleado)}
                helperText={errors.numEmpleado}
              />
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nombres"
                size="small"
                fullWidth
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                error={Boolean(errors.nombres)}
                helperText={errors.nombres}
              />
              <TextField
                label="Apellido paterno"
                size="small"
                fullWidth
                required
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                error={Boolean(errors.apellidoPaterno)}
                helperText={errors.apellidoPaterno}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Apellido materno"
                size="small"
                fullWidth
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
              />
              <TextField
                label="Teléfono"
                size="small"
                fullWidth
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Email"
                size="small"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
              <TextField
                label="Fecha de ingreso"
                size="small"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                error={Boolean(errors.fechaIngreso)}
                helperText={errors.fechaIngreso}
              />
            </Stack>

            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                  />
                }
                label="Activo"
              />
            )}

            {error && (
              <span style={{ color: "#d32f2f", fontSize: 12 }}>{error}</span>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {isEdit ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmpleadoFormModal;
