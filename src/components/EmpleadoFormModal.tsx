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
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import {
  createEmpleado,
  updateEmpleado,
  uploadEmpleadoFoto,
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
  // básicos
  numEmpleado: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  fechaIngreso: string; // yyyy-MM-dd
  activo: boolean;

  // datos personales
  fechaNacimiento: string; // yyyy-MM-dd
  genero: string;
  estadoCivil: string;
  curp: string;
  rfc: string;
  nss: string;
  foto: string; // nombre/URL de la foto

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

  // médicos / escolaridad
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
  salarioBase: string; // string en el form
  tipoContrato: string;
  tipoJornada: string;

  // baja
  fechaBaja: string; // yyyy-MM-dd
  motivoBaja: string;

  // IMSS / INFONAVIT / FONACOT
  imssRegPatronal: string;
  infonavitNumero: string;
  infonavitDescuentoTipo: string;
  infonavitDescuentoValor: string; // string en form
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
  const [tabIndex, setTabIndex] = useState(0);

  // archivo físico de foto
  const [fotoFile, setFotoFile] = useState<File | null>(null);

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
          empleado.salarioBase !== null && empleado.salarioBase !== undefined
            ? String(empleado.salarioBase)
            : "",
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
          empleado.infonavitDescuentoValor !== null &&
          empleado.infonavitDescuentoValor !== undefined
            ? String(empleado.infonavitDescuentoValor)
            : "",
        fonacotNumero: empleado.fonacotNumero ?? "",

        licenciaNumero: empleado.licenciaNumero ?? "",
        licenciaTipo: empleado.licenciaTipo ?? "",
        licenciaVigencia: empleado.licenciaVigencia
          ? empleado.licenciaVigencia.substring(0, 10)
          : "",
      });
      setFotoFile(null);
    } else {
      setForm(EMPTY_FORM);
      setFotoFile(null);
    }
    setErrors({});
    setSubmitError(null);
    setTabIndex(0);
  }, [empleado, open]);

  const handleChange =
    (field: keyof EmpleadoFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "activo" ? event.target.checked : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const handleFotoFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setFotoFile(file);
    if (file) {
      setForm((prev) => ({ ...prev, foto: file.name }));
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
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

    if (form.salarioBase.trim()) {
      const n = Number(form.salarioBase.trim());
      if (Number.isNaN(n)) {
        newErrors.salarioBase = "Salario base debe ser numérico";
      }
    }
    if (form.infonavitDescuentoValor.trim()) {
      const n = Number(form.infonavitDescuentoValor.trim());
      if (Number.isNaN(n)) {
        newErrors.infonavitDescuentoValor =
          "Valor de descuento debe ser numérico";
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
      const salarioBaseStr = form.salarioBase.trim();
      const infonavitDescStr = form.infonavitDescuentoValor.trim();

      const salarioBaseNumber =
        salarioBaseStr !== "" && !Number.isNaN(Number(salarioBaseStr))
          ? Number(salarioBaseStr)
          : null;

      const infonavitDescNumber =
        infonavitDescStr !== "" && !Number.isNaN(Number(infonavitDescStr))
          ? Number(infonavitDescStr)
          : null;

      const basePayload: EmpleadoCreateRequest = {
        numEmpleado: form.numEmpleado.trim(),
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || null,
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        fechaIngreso: form.fechaIngreso,
        activo: form.activo,

        fechaNacimiento: form.fechaNacimiento || null,
        genero: form.genero.trim() || null,
        estadoCivil: form.estadoCivil.trim() || null,
        curp: form.curp.trim() || null,
        rfc: form.rfc.trim() || null,
        nss: form.nss.trim() || null,
        foto: form.foto.trim() || null,

        calle: form.calle.trim() || null,
        numExt: form.numExt.trim() || null,
        numInt: form.numInt.trim() || null,
        colonia: form.colonia.trim() || null,
        municipio: form.municipio.trim() || null,
        estado: form.estado.trim() || null,
        cp: form.cp.trim() || null,
        nacionalidad: form.nacionalidad.trim() || null,
        lugarNacimiento: form.lugarNacimiento.trim() || null,

        escolaridad: form.escolaridad.trim() || null,
        tipoSangre: form.tipoSangre.trim() || null,

        contactoNombre: form.contactoNombre.trim() || null,
        contactoTelefono: form.contactoTelefono.trim() || null,
        contactoParentesco: form.contactoParentesco.trim() || null,

        banco: form.banco.trim() || null,
        cuentaBancaria: form.cuentaBancaria.trim() || null,
        clabe: form.clabe.trim() || null,
        salarioBase: salarioBaseNumber,
        tipoContrato: form.tipoContrato.trim() || null,
        tipoJornada: form.tipoJornada.trim() || null,
        fechaBaja: form.fechaBaja || null,
        motivoBaja: form.motivoBaja.trim() || null,

        imssRegPatronal: form.imssRegPatronal.trim() || null,
        infonavitNumero: form.infonavitNumero.trim() || null,
        infonavitDescuentoTipo:
          form.infonavitDescuentoTipo.trim() || null,
        infonavitDescuentoValor: infonavitDescNumber,
        fonacotNumero: form.fonacotNumero.trim() || null,

        licenciaNumero: form.licenciaNumero.trim() || null,
        licenciaTipo: form.licenciaTipo.trim() || null,
        licenciaVigencia: form.licenciaVigencia || null,
      };

      let saved: Empleado;

      if (esEdicion && empleado) {
        const updatePayload: EmpleadoUpdateRequest = {
          ...basePayload,
          activo: form.activo,
        };
        saved = await updateEmpleado(empleado.id, updatePayload);
      } else {
        const createPayload: EmpleadoCreateRequest = {
          ...basePayload,
          activo: form.activo,
        };
        saved = await createEmpleado(createPayload);
      }

      // Subida de foto separada: si falla, no se revierte el guardado
      if (fotoFile && saved.id) {
        try {
          await uploadEmpleadoFoto(saved.id, fotoFile);
        } catch (err) {
          console.error("Error al subir foto:", err);
          setSubmitError(
            "El empleado se guardó, pero hubo un error al subir la foto."
          );
        }
      }

      await onSaved();
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      setSubmitError("Ocurrió un error al guardar los datos del empleado.");
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

        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="Datos básicos" />
          <Tab label="Datos personales" />
          <Tab label="Domicilio" />
          <Tab label="Nómina / Seguridad social" />
          <Tab label="Licencias / Baja" />
        </Tabs>

        {/* TAB 0: Datos básicos */}
        {tabIndex === 0 && (
          <Box>
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
          </Box>
        )}

        {/* TAB 1: Datos personales */}
        {tabIndex === 1 && (
          <Box>
            <Stack spacing={2} mt={1}>
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
                label="Foto (URL / nombre archivo)"
                value={form.foto}
                onChange={handleChange("foto")}
                fullWidth
                size="small"
                error={!!errors.foto}
                helperText={errors.foto}
              />

              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{ alignSelf: "flex-start" }}
              >
                Seleccionar archivo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFotoFileChange}
                />
              </Button>
              {fotoFile && (
                <Typography variant="body2" color="text.secondary">
                  Archivo seleccionado: {fotoFile.name}
                </Typography>
              )}

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Escolaridad"
                  value={form.escolaridad}
                  onChange={handleChange("escolaridad")}
                  fullWidth
                  size="small"
                  error={!!errors.escolaridad}
                  helperText={errors.escolaridad}
                />
                <TextField
                  label="Tipo de sangre"
                  value={form.tipoSangre}
                  onChange={handleChange("tipoSangre")}
                  fullWidth
                  size="small"
                  error={!!errors.tipoSangre}
                  helperText={errors.tipoSangre}
                />
              </Stack>

              <Typography variant="subtitle2" color="text.secondary">
                Contacto de emergencia
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Nombre"
                  value={form.contactoNombre}
                  onChange={handleChange("contactoNombre")}
                  fullWidth
                  size="small"
                  error={!!errors.contactoNombre}
                  helperText={errors.contactoNombre}
                />
                <TextField
                  label="Teléfono"
                  value={form.contactoTelefono}
                  onChange={handleChange("contactoTelefono")}
                  fullWidth
                  size="small"
                  error={!!errors.contactoTelefono}
                  helperText={errors.contactoTelefono}
                />
                <TextField
                  label="Parentesco"
                  value={form.contactoParentesco}
                  onChange={handleChange("contactoParentesco")}
                  fullWidth
                  size="small"
                  error={!!errors.contactoParentesco}
                  helperText={errors.contactoParentesco}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        {/* TAB 2: Domicilio */}
        {tabIndex === 2 && (
          <Box>
            <Stack spacing={2} mt={1}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Calle"
                  value={form.calle}
                  onChange={handleChange("calle")}
                  fullWidth
                  size="small"
                  error={!!errors.calle}
                  helperText={errors.calle}
                />
                <TextField
                  label="Num. exterior"
                  value={form.numExt}
                  onChange={handleChange("numExt")}
                  fullWidth
                  size="small"
                  error={!!errors.numExt}
                  helperText={errors.numExt}
                />
                <TextField
                  label="Num. interior"
                  value={form.numInt}
                  onChange={handleChange("numInt")}
                  fullWidth
                  size="small"
                  error={!!errors.numInt}
                  helperText={errors.numInt}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Colonia"
                  value={form.colonia}
                  onChange={handleChange("colonia")}
                  fullWidth
                  size="small"
                  error={!!errors.colonia}
                  helperText={errors.colonia}
                />
                <TextField
                  label="Municipio"
                  value={form.municipio}
                  onChange={handleChange("municipio")}
                  fullWidth
                  size="small"
                  error={!!errors.municipio}
                  helperText={errors.municipio}
                />
                <TextField
                  label="Estado"
                  value={form.estado}
                  onChange={handleChange("estado")}
                  fullWidth
                  size="small"
                  error={!!errors.estado}
                  helperText={errors.estado}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="C.P."
                  value={form.cp}
                  onChange={handleChange("cp")}
                  fullWidth
                  size="small"
                  error={!!errors.cp}
                  helperText={errors.cp}
                />
                <TextField
                  label="Nacionalidad"
                  value={form.nacionalidad}
                  onChange={handleChange("nacionalidad")}
                  fullWidth
                  size="small"
                  error={!!errors.nacionalidad}
                  helperText={errors.nacionalidad}
                />
                <TextField
                  label="Lugar de nacimiento"
                  value={form.lugarNacimiento}
                  onChange={handleChange("lugarNacimiento")}
                  fullWidth
                  size="small"
                  error={!!errors.lugarNacimiento}
                  helperText={errors.lugarNacimiento}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        {/* TAB 3: Nómina / Seguridad social */}
        {tabIndex === 3 && (
          <Box>
            <Stack spacing={2} mt={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Datos bancarios / nómina
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Banco"
                  value={form.banco}
                  onChange={handleChange("banco")}
                  fullWidth
                  size="small"
                  error={!!errors.banco}
                  helperText={errors.banco}
                />
                <TextField
                  label="Cuenta bancaria"
                  value={form.cuentaBancaria}
                  onChange={handleChange("cuentaBancaria")}
                  fullWidth
                  size="small"
                  error={!!errors.cuentaBancaria}
                  helperText={errors.cuentaBancaria}
                />
                <TextField
                  label="CLABE"
                  value={form.clabe}
                  onChange={handleChange("clabe")}
                  fullWidth
                  size="small"
                  error={!!errors.clabe}
                  helperText={errors.clabe}
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
                  error={!!errors.tipoContrato}
                  helperText={errors.tipoContrato}
                />
                <TextField
                  label="Tipo de jornada"
                  value={form.tipoJornada}
                  onChange={handleChange("tipoJornada")}
                  fullWidth
                  size="small"
                  error={!!errors.tipoJornada}
                  helperText={errors.tipoJornada}
                />
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Seguridad social
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="IMSS reg. patronal"
                  value={form.imssRegPatronal}
                  onChange={handleChange("imssRegPatronal")}
                  fullWidth
                  size="small"
                  error={!!errors.imssRegPatronal}
                  helperText={errors.imssRegPatronal}
                />
                <TextField
                  label="INFONAVIT número"
                  value={form.infonavitNumero}
                  onChange={handleChange("infonavitNumero")}
                  fullWidth
                  size="small"
                  error={!!errors.infonavitNumero}
                  helperText={errors.infonavitNumero}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="INFONAVIT tipo descuento"
                  value={form.infonavitDescuentoTipo}
                  onChange={handleChange("infonavitDescuentoTipo")}
                  fullWidth
                  size="small"
                  error={!!errors.infonavitDescuentoTipo}
                  helperText={errors.infonavitDescuentoTipo}
                />
                <TextField
                  label="INFONAVIT valor descuento"
                  value={form.infonavitDescuentoValor}
                  onChange={handleChange("infonavitDescuentoValor")}
                  fullWidth
                  size="small"
                  error={!!errors.infonavitDescuentoValor}
                  helperText={errors.infonavitDescuentoValor}
                />
                <TextField
                  label="FONACOT número"
                  value={form.fonacotNumero}
                  onChange={handleChange("fonacotNumero")}
                  fullWidth
                  size="small"
                  error={!!errors.fonacotNumero}
                  helperText={errors.fonacotNumero}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        {/* TAB 4: Licencias / Baja */}
        {tabIndex === 4 && (
          <Box>
            <Stack spacing={2} mt={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Licencia de conducir
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Número de licencia"
                  value={form.licenciaNumero}
                  onChange={handleChange("licenciaNumero")}
                  fullWidth
                  size="small"
                  error={!!errors.licenciaNumero}
                  helperText={errors.licenciaNumero}
                />
                <TextField
                  label="Tipo de licencia"
                  value={form.licenciaTipo}
                  onChange={handleChange("licenciaTipo")}
                  fullWidth
                  size="small"
                  error={!!errors.licenciaTipo}
                  helperText={errors.licenciaTipo}
                />
                <TextField
                  label="Vigencia licencia"
                  type="date"
                  value={form.licenciaVigencia}
                  onChange={handleChange("licenciaVigencia")}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.licenciaVigencia}
                  helperText={errors.licenciaVigencia}
                />
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Baja
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Fecha de baja"
                  type="date"
                  value={form.fechaBaja}
                  onChange={handleChange("fechaBaja")}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fechaBaja}
                  helperText={errors.fechaBaja}
                />
                <TextField
                  label="Motivo de baja"
                  value={form.motivoBaja}
                  onChange={handleChange("motivoBaja")}
                  fullWidth
                  size="small"
                  error={!!errors.motivoBaja}
                  helperText={errors.motivoBaja}
                />
              </Stack>
            </Stack>
          </Box>
        )}
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
