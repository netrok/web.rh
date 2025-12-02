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
  Divider,
} from "@mui/material";
import {
  createEmpleado,
  updateEmpleado,
  type Empleado,
  type EmpleadoCreateRequest,
  type EmpleadoUpdateRequest,
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

  // básicos
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  curp: string;
  rfc: string;
  nss: string;
  foto: string;

  // FKs (como texto, luego convertimos a número)
  departamentoId: string;
  puestoId: string;
  turnoId: string;
  horarioId: string;
  supervisorId: string;

  // domicilio
  calle: string;
  numExt: string;
  numInt: string;
  colonia: string;
  municipio: string;
  estado: string;
  cp: string;
  nacionalidad: string;
  lugarNacimiento: string;

  // escolaridad / médico
  escolaridad: string;
  tipoSangre: string;

  // contacto emergencia
  contactoNombre: string;
  contactoTelefono: string;
  contactoParentesco: string;

  // bancario / nómina
  banco: string;
  cuentaBancaria: string;
  clabe: string;
  salarioBase: string; // num como texto
  tipoContrato: string;
  tipoJornada: string;
  fechaBaja: string; // yyyy-MM-dd
  motivoBaja: string;

  // IMSS / INFONAVIT / FONACOT
  imssRegPatronal: string;
  infonavitNumero: string;
  infonavitDescuentoTipo: string;
  infonavitDescuentoValor: string; // num como texto
  fonacotNumero: string;

  // licencia
  licenciaNumero: string;
  licenciaTipo: string;
  licenciaVigencia: string; // yyyy-MM-dd
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

  fechaNacimiento: "",
  genero: "",
  estadoCivil: "",
  curp: "",
  rfc: "",
  nss: "",
  foto: "",

  departamentoId: "",
  puestoId: "",
  turnoId: "",
  horarioId: "",
  supervisorId: "",

  calle: "",
  numExt: "",
  numInt: "",
  colonia: "",
  municipio: "",
  estado: "",
  cp: "",
  nacionalidad: "",
  lugarNacimiento: "",

  escolaridad: "",
  tipoSangre: "",

  contactoNombre: "",
  contactoTelefono: "",
  contactoParentesco: "",

  banco: "",
  cuentaBancaria: "",
  clabe: "",
  salarioBase: "",
  tipoContrato: "",
  tipoJornada: "",
  fechaBaja: "",
  motivoBaja: "",

  imssRegPatronal: "",
  infonavitNumero: "",
  infonavitDescuentoTipo: "",
  infonavitDescuentoValor: "",
  fonacotNumero: "",

  licenciaNumero: "",
  licenciaTipo: "",
  licenciaVigencia: "",
};

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
};

const toNullableString = (value: string): string | null =>
  value.trim() === "" ? null : value.trim();

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

        fechaNacimiento: empleado.fechaNacimiento
          ? empleado.fechaNacimiento.substring(0, 10)
          : "",
        genero: empleado.genero ?? "",
        estadoCivil: empleado.estadoCivil ?? "",
        curp: empleado.curp ?? "",
        rfc: empleado.rfc ?? "",
        nss: empleado.nss ?? "",
        foto: empleado.foto ?? "",

        departamentoId:
          empleado.departamentoId != null ? String(empleado.departamentoId) : "",
        puestoId: empleado.puestoId != null ? String(empleado.puestoId) : "",
        turnoId: empleado.turnoId != null ? String(empleado.turnoId) : "",
        horarioId: empleado.horarioId != null ? String(empleado.horarioId) : "",
        supervisorId:
          empleado.supervisorId != null ? String(empleado.supervisorId) : "",

        calle: empleado.calle ?? "",
        numExt: empleado.numExt ?? "",
        numInt: empleado.numInt ?? "",
        colonia: empleado.colonia ?? "",
        municipio: empleado.municipio ?? "",
        estado: empleado.estado ?? "",
        cp: empleado.cp ?? "",
        nacionalidad: empleado.nacionalidad ?? "",
        lugarNacimiento: empleado.lugarNacimiento ?? "",

        escolaridad: empleado.escolaridad ?? "",
        tipoSangre: empleado.tipoSangre ?? "",

        contactoNombre: empleado.contactoNombre ?? "",
        contactoTelefono: empleado.contactoTelefono ?? "",
        contactoParentesco: empleado.contactoParentesco ?? "",

        banco: empleado.banco ?? "",
        cuentaBancaria: empleado.cuentaBancaria ?? "",
        clabe: empleado.clabe ?? "",
        salarioBase:
          empleado.salarioBase != null ? String(empleado.salarioBase) : "",
        tipoContrato: empleado.tipoContrato ?? "",
        tipoJornada: empleado.tipoJornada ?? "",
        fechaBaja: empleado.fechaBaja
          ? empleado.fechaBaja.substring(0, 10)
          : "",
        motivoBaja: empleado.motivoBaja ?? "",

        imssRegPatronal: empleado.imssRegPatronal ?? "",
        infonavitNumero: empleado.infonavitNumero ?? "",
        infonavitDescuentoTipo: empleado.infonavitDescuentoTipo ?? "",
        infonavitDescuentoValor:
          empleado.infonavitDescuentoValor != null
            ? String(empleado.infonavitDescuentoValor)
            : "",
        fonacotNumero: empleado.fonacotNumero ?? "",

        licenciaNumero: empleado.licenciaNumero ?? "",
        licenciaTipo: empleado.licenciaTipo ?? "",
        licenciaVigencia: empleado.licenciaVigencia
          ? empleado.licenciaVigencia.substring(0, 10)
          : "",
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

    if (form.curp && form.curp.trim().length > 0 && form.curp.trim().length < 18) {
      newErrors.curp = "La CURP debe tener 18 caracteres";
    }
    if (form.rfc && form.rfc.trim().length > 0 && form.rfc.trim().length < 12) {
      newErrors.rfc = "RFC demasiado corto";
    }

    // salarioBase / infonavitDescuentoValor numéricos si vienen
    if (form.salarioBase.trim() !== "" && Number.isNaN(Number(form.salarioBase))) {
      newErrors.salarioBase = "Salario base debe ser numérico";
    }
    if (
      form.infonavitDescuentoValor.trim() !== "" &&
      Number.isNaN(Number(form.infonavitDescuentoValor))
    ) {
      newErrors.infonavitDescuentoValor = "Descuento Infonavit debe ser numérico";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setSubmitError(null);

    try {
      const payload: EmpleadoCreateRequest | EmpleadoUpdateRequest = {
        numEmpleado: form.numEmpleado.trim(),
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: toNullableString(form.apellidoMaterno),
        telefono: toNullableString(form.telefono),
        email: toNullableString(form.email),
        fechaIngreso: form.fechaIngreso,
        activo: form.activo,

        fechaNacimiento: toNullableString(form.fechaNacimiento),
        genero: toNullableString(form.genero),
        estadoCivil: toNullableString(form.estadoCivil),
        curp: toNullableString(form.curp),
        rfc: toNullableString(form.rfc),
        nss: toNullableString(form.nss),
        foto: toNullableString(form.foto),

        departamentoId: toNullableNumber(form.departamentoId),
        puestoId: toNullableNumber(form.puestoId),
        turnoId: toNullableNumber(form.turnoId),
        horarioId: toNullableNumber(form.horarioId),
        supervisorId: toNullableNumber(form.supervisorId),

        calle: toNullableString(form.calle),
        numExt: toNullableString(form.numExt),
        numInt: toNullableString(form.numInt),
        colonia: toNullableString(form.colonia),
        municipio: toNullableString(form.municipio),
        estado: toNullableString(form.estado),
        cp: toNullableString(form.cp),
        nacionalidad: toNullableString(form.nacionalidad),
        lugarNacimiento: toNullableString(form.lugarNacimiento),

        escolaridad: toNullableString(form.escolaridad),
        tipoSangre: toNullableString(form.tipoSangre),

        contactoNombre: toNullableString(form.contactoNombre),
        contactoTelefono: toNullableString(form.contactoTelefono),
        contactoParentesco: toNullableString(form.contactoParentesco),

        banco: toNullableString(form.banco),
        cuentaBancaria: toNullableString(form.cuentaBancaria),
        clabe: toNullableString(form.clabe),
        salarioBase: toNullableNumber(form.salarioBase),
        tipoContrato: toNullableString(form.tipoContrato),
        tipoJornada: toNullableString(form.tipoJornada),
        fechaBaja: toNullableString(form.fechaBaja),
        motivoBaja: toNullableString(form.motivoBaja),

        imssRegPatronal: toNullableString(form.imssRegPatronal),
        infonavitNumero: toNullableString(form.infonavitNumero),
        infonavitDescuentoTipo: toNullableString(form.infonavitDescuentoTipo),
        infonavitDescuentoValor: toNullableNumber(
          form.infonavitDescuentoValor
        ),
        fonacotNumero: toNullableString(form.fonacotNumero),

        licenciaNumero: toNullableString(form.licenciaNumero),
        licenciaTipo: toNullableString(form.licenciaTipo),
        licenciaVigencia: toNullableString(form.licenciaVigencia),
      };

      if (esEdicion && empleado) {
        await updateEmpleado(empleado.id, payload as EmpleadoUpdateRequest);
      } else {
        await createEmpleado(payload as EmpleadoCreateRequest);
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
    if (saving) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
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
          {/* ===== Datos básicos ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Datos básicos
          </Typography>

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

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Datos personales ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Datos personales
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange("fechaNacimiento")}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors.fechaNacimiento}
              helperText={errors.fechaNacimiento}
            />
            <TextField
              label="Género"
              value={form.genero}
              onChange={handleChange("genero")}
              fullWidth
              size="small"
              error={!!errors.genero}
              helperText={errors.genero}
            />
            <TextField
              label="Estado civil"
              value={form.estadoCivil}
              onChange={handleChange("estadoCivil")}
              fullWidth
              size="small"
              error={!!errors.estadoCivil}
              helperText={errors.estadoCivil}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="CURP"
              value={form.curp}
              onChange={handleChange("curp")}
              fullWidth
              size="small"
              error={!!errors.curp}
              helperText={errors.curp}
            />
            <TextField
              label="RFC"
              value={form.rfc}
              onChange={handleChange("rfc")}
              fullWidth
              size="small"
              error={!!errors.rfc}
              helperText={errors.rfc}
            />
            <TextField
              label="NSS"
              value={form.nss}
              onChange={handleChange("nss")}
              fullWidth
              size="small"
              error={!!errors.nss}
              helperText={errors.nss}
            />
          </Stack>

          <TextField
            label="Foto (ruta/URL)"
            value={form.foto}
            onChange={handleChange("foto")}
            fullWidth
            size="small"
            error={!!errors.foto}
            helperText={errors.foto}
          />

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Domicilio ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Domicilio
          </Typography>

          <TextField
            label="Calle"
            value={form.calle}
            onChange={handleChange("calle")}
            fullWidth
            size="small"
            error={!!errors.calle}
            helperText={errors.calle}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Num. ext."
              value={form.numExt}
              onChange={handleChange("numExt")}
              fullWidth
              size="small"
            />
            <TextField
              label="Num. int."
              value={form.numInt}
              onChange={handleChange("numInt")}
              fullWidth
              size="small"
            />
            <TextField
              label="Colonia"
              value={form.colonia}
              onChange={handleChange("colonia")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Municipio"
              value={form.municipio}
              onChange={handleChange("municipio")}
              fullWidth
              size="small"
            />
            <TextField
              label="Estado"
              value={form.estado}
              onChange={handleChange("estado")}
              fullWidth
              size="small"
            />
            <TextField
              label="CP"
              value={form.cp}
              onChange={handleChange("cp")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Nacionalidad"
              value={form.nacionalidad}
              onChange={handleChange("nacionalidad")}
              fullWidth
              size="small"
            />
            <TextField
              label="Lugar de nacimiento"
              value={form.lugarNacimiento}
              onChange={handleChange("lugarNacimiento")}
              fullWidth
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Datos laborales (FK simples) ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Datos laborales
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Departamento ID"
              value={form.departamentoId}
              onChange={handleChange("departamentoId")}
              fullWidth
              size="small"
            />
            <TextField
              label="Puesto ID"
              value={form.puestoId}
              onChange={handleChange("puestoId")}
              fullWidth
              size="small"
            />
            <TextField
              label="Turno ID"
              value={form.turnoId}
              onChange={handleChange("turnoId")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Horario ID"
              value={form.horarioId}
              onChange={handleChange("horarioId")}
              fullWidth
              size="small"
            />
            <TextField
              label="Supervisor ID"
              value={form.supervisorId}
              onChange={handleChange("supervisorId")}
              fullWidth
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Escolaridad / Contacto / Médico ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Escolaridad y contacto de emergencia
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Escolaridad"
              value={form.escolaridad}
              onChange={handleChange("escolaridad")}
              fullWidth
              size="small"
            />
            <TextField
              label="Tipo de sangre"
              value={form.tipoSangre}
              onChange={handleChange("tipoSangre")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Nombre contacto"
              value={form.contactoNombre}
              onChange={handleChange("contactoNombre")}
              fullWidth
              size="small"
            />
            <TextField
              label="Teléfono contacto"
              value={form.contactoTelefono}
              onChange={handleChange("contactoTelefono")}
              fullWidth
              size="small"
            />
            <TextField
              label="Parentesco"
              value={form.contactoParentesco}
              onChange={handleChange("contactoParentesco")}
              fullWidth
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Bancario / Nómina ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Datos bancarios y nómina
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Banco"
              value={form.banco}
              onChange={handleChange("banco")}
              fullWidth
              size="small"
            />
            <TextField
              label="Cuenta bancaria"
              value={form.cuentaBancaria}
              onChange={handleChange("cuentaBancaria")}
              fullWidth
              size="small"
            />
            <TextField
              label="CLABE"
              value={form.clabe}
              onChange={handleChange("clabe")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Salario base"
              value={form.salarioBase}
              onChange={handleChange("salarioBase")}
              fullWidth
              size="small"
              error={!!errors.salarioBase}
              helperText={errors.salarioBase}
            />
            <TextField
              label="Tipo de contrato"
              value={form.tipoContrato}
              onChange={handleChange("tipoContrato")}
              fullWidth
              size="small"
            />
            <TextField
              label="Tipo de jornada"
              value={form.tipoJornada}
              onChange={handleChange("tipoJornada")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Fecha baja"
              type="date"
              value={form.fechaBaja}
              onChange={handleChange("fechaBaja")}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Motivo baja"
              value={form.motivoBaja}
              onChange={handleChange("motivoBaja")}
              fullWidth
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ===== IMSS / INFONAVIT / FONACOT ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            IMSS / INFONAVIT / FONACOT
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="IMSS reg. patronal"
              value={form.imssRegPatronal}
              onChange={handleChange("imssRegPatronal")}
              fullWidth
              size="small"
            />
            <TextField
              label="Núm. Infonavit"
              value={form.infonavitNumero}
              onChange={handleChange("infonavitNumero")}
              fullWidth
              size="small"
            />
            <TextField
              label="Tipo desc. Infonavit"
              value={form.infonavitDescuentoTipo}
              onChange={handleChange("infonavitDescuentoTipo")}
              fullWidth
              size="small"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Valor desc. Infonavit"
              value={form.infonavitDescuentoValor}
              onChange={handleChange("infonavitDescuentoValor")}
              fullWidth
              size="small"
              error={!!errors.infonavitDescuentoValor}
              helperText={errors.infonavitDescuentoValor}
            />
            <TextField
              label="Núm. Fonacot"
              value={form.fonacotNumero}
              onChange={handleChange("fonacotNumero")}
              fullWidth
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ===== Licencia ===== */}
          <Typography variant="subtitle2" color="text.secondary">
            Licencia
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Núm. licencia"
              value={form.licenciaNumero}
              onChange={handleChange("licenciaNumero")}
              fullWidth
              size="small"
            />
            <TextField
              label="Tipo licencia"
              value={form.licenciaTipo}
              onChange={handleChange("licenciaTipo")}
              fullWidth
              size="small"
            />
            <TextField
              label="Vigencia licencia"
              type="date"
              value={form.licenciaVigencia}
              onChange={handleChange("licenciaVigencia")}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
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
