// src/components/EmpleadoViewDialog.tsx
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type { Empleado } from "../api/empleadosApi";
import apiClient from "../api/apiClient";

type EmpleadoViewDialogProps = {
  open: boolean;
  onClose: () => void;
  empleado: Empleado | null;
};

export function EmpleadoViewDialog({
  open,
  onClose,
  empleado,
}: EmpleadoViewDialogProps) {
  if (!empleado) return null;

  const handleVerFichaPdf = async () => {
  if (!empleado) return;

  try {
    const response = await apiClient.get(
      `/api/empleados/${empleado.id}/ficha.pdf`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error: any) {
    console.error("Error al abrir ficha PDF del empleado", error);

    // feedback rápido para ti
    const status = error?.response?.status;
    const msgBackend =
      error?.response?.data?.message || error?.message || "Error desconocido";

    window.alert(
      `No se pudo generar la ficha PDF (status ${status ?? "?"}).\n` +
        `Detalle: ${msgBackend}`
    );
  }
};


  const nombreCompleto = `${empleado.nombres} ${empleado.apellidoPaterno} ${
    empleado.apellidoMaterno ?? ""
  }`.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle del empleado</DialogTitle>

      <DialogContent dividers>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems={{ xs: "stretch", md: "flex-start" }}
        >
          {/* Foto + datos principales */}
          <Stack
            spacing={2}
            alignItems="center"
            sx={{ minWidth: { md: 220 }, mb: { xs: 2, md: 0 } }}
          >
            <Avatar
              src={empleado.fotoUrl ?? undefined}
              sx={{ width: 120, height: 120, fontSize: 32 }}
            >
              {empleado.nombres?.charAt(0)}
              {empleado.apellidoPaterno?.charAt(0)}
            </Avatar>

            <Typography variant="subtitle1" fontWeight={600} align="center">
              {nombreCompleto}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Núm. empleado: {empleado.numEmpleado}
            </Typography>

            <Typography
              variant="caption"
              color={empleado.activo ? "success.main" : "error.main"}
            >
              {empleado.activo ? "Activo" : "Inactivo"}
            </Typography>
          </Stack>

          {/* Datos detallados */}
          <Stack spacing={2} flex={1}>
            {/* Datos generales */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Datos generales
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Puesto
                  </Typography>
                  <Typography variant="body2">
                    {empleado.puesto ?? "—"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Departamento
                  </Typography>
                  <Typography variant="body2">
                    {empleado.departamento ?? "—"}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha de ingreso
                  </Typography>
                  <Typography variant="body2">
                    {empleado.fechaIngreso ?? "—"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Supervisor
                  </Typography>
                  <Typography variant="body2">
                    {empleado.supervisorNombre ?? "—"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Contacto */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Datos de contacto
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body2">
                    {empleado.telefono ?? "—"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Correo electrónico
                  </Typography>
                  <Typography variant="body2">
                    {empleado.email ?? "—"}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dirección
                </Typography>
                <Typography variant="body2">
                  {empleado.direccionCompleta ?? "—"}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Fiscales / seguridad social */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Datos fiscales y de seguridad social
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    CURP
                  </Typography>
                  <Typography variant="body2">
                    {empleado.curp ?? "—"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    RFC
                  </Typography>
                  <Typography variant="body2">
                    {empleado.rfc ?? "—"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    NSS
                  </Typography>
                  <Typography variant="body2">
                    {empleado.nss ?? "—"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<PictureAsPdfIcon />}
          variant="outlined"
          onClick={handleVerFichaPdf}
        >
          Ver ficha PDF
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
