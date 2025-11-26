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

// Estado del formulario (todo string + activo)
type FormState = {
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  fechaIngreso: string; // yyyy-MM-dd
  activo: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type FormTouched = Partial<Record<keyof FormState, boolean>>;

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

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

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
      setErrors({});
      setTouched({});
      setError(null);
    } else if (open && !empleado) {
      setForm(emptyForm);
      setErrors({});
      setTouched({});
      setError(null);
    }
  }, [empleado, open]);

  const validateField = (
    field: keyof FormState,
    value: unknown
  ): string | undefined => {
    const str = (value ?? "").toString().trim();

    switch (field) {
      case "numEmpleado":
        if (!isEditMode) {
          if (!str) return "El número de empleado es obligatorio.";
          if (!/^\d+$/.test(str)) {
            return "El número de empleado solo debe contener dígitos.";
          }
        }
        return;

      case "nombres":
        if (!str) return "El nombre es obligatorio.";
        if (str.length < 2) return "El nombre es demasiado corto.";
        return;

      case "apellidoPaterno":
        if (!str) return "El apellido paterno es obligatorio.";
        return;

      case "apellidoMaterno":
        // Opcional, pero puedes exigir mínimo si se llena
        if (str && str.length < 2) {
          return "El apellido materno es demasiado corto.";
        }
        return;

      case "telefono":
        if (!str) return;
        if (!/^\d{10}$/.test(str)) {
          return "El teléfono debe tener 10 dígitos.";
        }
        return;

      case "email":
        if (!str) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
          return "El correo no tiene un formato válido.";
        }
        return;

      case "fechaIngreso":
        if (!str) return "La fecha de ingreso es obligatoria.";
        // Aquí podrías validar que no sea futura, etc.
        return;

      default:
        return;
    }
  };

  const runValidation = (field: keyof FormState, value: unknown) => {
    const errorMsg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const field = name as keyof FormState;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [field]: newValue as any,
    }));

    if (touched[field]) {
      runValidation(field, newValue);
    }
  };

  const handleBlur = (field: keyof FormState) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runValidation(field, form[field]);
  };

  const setAndShowError = (msg: string) => {
    setError(msg);
    showError(msg);
  };

  const validateForm = (): boolean => {
    const fieldsToValidate: (keyof FormState)[] = isEditMode
      ? [
          "nombres",
          "apellidoPaterno",
          "apellidoMaterno",
          "telefono",
          "email",
          "fechaIngreso",
        ]
      : [
          "numEmpleado",
          "nombres",
          "apellidoPaterno",
          "apellidoMaterno",
          "telefono",
          "email",
          "fechaIngreso",
        ];

    const newErrors: FormErrors = {};
    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, form[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    const newTouched: FormTouched = {};
    fieldsToValidate.forEach((field) => {
      newTouched[field] = true;
    });

    setErrors(newErrors);
    setTouched((prev) => ({ ...prev, ...newTouched }));

    const hasError = Object.values(newErrors).some((e) => !!e);
    if (hasError) {
      setAndShowError("Corrige los campos marcados en rojo.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && empleado) {
        const payload: EmpleadoUpdateRequest = {
          nombres: form.nombres.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim() || undefined,
          telefono: form.telefono.trim() || undefined,
          email: form.email.trim() || undefined,
          fechaIngreso: form.fechaIngreso,
          activo: form.activo,
        };
        await updateEmpleado(empleado.id, payload);
      } else {
        const payload: EmpleadoCreateRequest = {
          numEmpleado: form.numEmpleado.trim(),
          nombres: form.nombres.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim() || undefined,
          telefono: form.telefono.trim() || undefined,
          email: form.email.trim() || undefined,
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
                onBlur={handleBlur("numEmpleado")}
                required
                size="small"
                error={!!errors.numEmpleado}
                helperText={errors.numEmpleado}
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
              onBlur={handleBlur("nombres")}
              required
              size="small"
              error={!!errors.nombres}
              helperText={errors.nombres}
            />

            <TextField
              label="Apellido paterno"
              name="apellidoPaterno"
              value={form.apellidoPaterno}
              onChange={handleChange}
              onBlur={handleBlur("apellidoPaterno")}
              required
              size="small"
              error={!!errors.apellidoPaterno}
              helperText={errors.apellidoPaterno}
            />

            <TextField
              label="Apellido materno"
              name="apellidoMaterno"
              value={form.apellidoMaterno}
              onChange={handleChange}
              onBlur={handleBlur("apellidoMaterno")}
              size="small"
              error={!!errors.apellidoMaterno}
              helperText={errors.apellidoMaterno}
            />

            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur("telefono")}
              size="small"
              inputProps={{ inputMode: "tel", maxLength: 10 }}
              error={!!errors.telefono}
              helperText={errors.telefono}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur("email")}
              size="small"
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Fecha de ingreso"
              name="fechaIngreso"
              type="date"
              value={form.fechaIngreso}
              onChange={handleChange}
              onBlur={handleBlur("fechaIngreso")}
              size="small"
              InputLabelProps={{ shrink: true }}
              required
              error={!!errors.fechaIngreso}
              helperText={errors.fechaIngreso}
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

export default EmpleadoFormModal;
